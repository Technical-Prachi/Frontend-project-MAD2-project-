from celery import shared_task
import time
from sqlalchemy import func
import pyexcel
import flask_excel
from datetime import datetime, timedelta
from backend.models import db,User, Quiz, Subject, Chapter ,Score
from backend.celery.mail_service import send_email
import logging
logger = logging.getLogger(__name__)

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x + y

@shared_task(bind=True, ignore_result=False)
def create_csv(self, user_id):
    try:
        
        quiz_attempts = (
            db.session.query(
                Score.id.label("score_id"),
                User.username.label("user_name"),
                Quiz.id.label("quiz_id"),
                Subject.name.label("subject_name"),
                Chapter.name.label("chapter_name"),
                Quiz.quiz_title,
                Quiz.date_of_quiz,
                Score.total_scored.label("total_score"),
                Score.score_gain.label("score_gain"),
                Score.time_spent_minutes.label("time_spent_minutes"),
                Score.time_spent_remaining_seconds.label("time_spent_seconds")
            )
            .join(User, User.id == Score.user_id)
            .join(Quiz, Quiz.id == Score.quiz_id)
            .join(Chapter, Chapter.id == Quiz.chapter_id)
            .join(Subject, Subject.id == Quiz.subject_id)
            .filter(Score.user_id == user_id)  
            .all()
        )

        if not quiz_attempts:
            return f"No quiz attempts found for user ID: {user_id}"

        
        quiz_data = [
            {
                "score_id": qa.score_id,
                "user_name": qa.user_name,
                "quiz_id": qa.quiz_id,
                "subject_name": qa.subject_name,
                "chapter_name": qa.chapter_name,
                "quiz_title": qa.quiz_title,
                "date_of_quiz": qa.date_of_quiz.strftime('%Y-%m-%d') if qa.date_of_quiz else None,
                "total_score": qa.total_score,
                "score_gain": qa.score_gain,
                "time_spent_minutes": qa.time_spent_minutes,
                "time_spent_seconds": qa.time_spent_seconds
            }
            for qa in quiz_attempts
        ]

        
        task_id = self.request.id
        filename = f'user_{user_id}_quiz_history_{task_id}.csv'
        file_path = f'./backend/celery/user-downloads/{filename}'

        csv_out = flask_excel.make_response_from_records(quiz_data, file_type="csv")

        with open(file_path, "wb") as file:
            file.write(csv_out.data)

        return filename

    except Exception as e:
        logger.error(f"Error in create_csv: {str(e)}")
        return str(e)

@shared_task(ignore_result=True)
def email_reminder(to, subject, content):
    try:
        send_email(to, subject, content)
        return f"Email sent to {to} with subject: {subject}"
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return str(e)

@shared_task(ignore_result=True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)

@shared_task(ignore_result=True)
def send_daily_quiz_reminders():
    logger.info("Running send_daily_quiz_reminders task...")  
    
    users = User.query.all()

    for user in users:
        recent_quizzes = Quiz.query.filter(
            Quiz.date_of_quiz >= datetime.now() - timedelta(days=7)
        ).all()

        attempted_quiz_ids = {quiz_id for (quiz_id,) in db.session.query(Score.quiz_id).filter(Score.user_id == user.id).all()}

        unattempted_quizzes = [quiz for quiz in recent_quizzes if quiz.id not in attempted_quiz_ids]

        if not unattempted_quizzes:
            continue  

        email_content = f"""
        <h1>Daily Reminder: Attempt Your Pending Quizzes!</h1>

        <p>Dear {user.username},</p>  
        <p>You have {len(unattempted_quizzes)} new quizzes waiting for you! Don't miss out on the chance to test your knowledge.</p> 
        <p><strong>Pending Quizzes:</strong></p>  
        <ul>
        {''.join([f"<li>{quiz.quiz_title} ({quiz.date_of_quiz.strftime('%Y-%m-%d')})</li>" for quiz in unattempted_quizzes])}
        </ul>
        <p>Keep learning and improving!</p>  
        <p>Best regards,<br>Quiz Master</p>  
        """

        logger.info(f"Sending email to {user.email}")  
        
        send_email(user.email, "Daily Quiz Reminder: Attempt Your Pending Quizzes!", email_content)

    logger.info("send_daily_quiz_reminders task completed.")
@shared_task(ignore_result=True)
def generate_monthly_report():
    users = User.query.all() 

    for user in users:
        quizzes_taken = Score.query.filter_by(user_id=user.id).count()
        avg_score = db.session.query(db.func.avg(Score.score_gain)).filter(Score.user_id == user.id).scalar() or 0
        max_score = db.session.query(func.max(Score.score_gain)).filter(Score.user_id == user.id).scalar() or 0
        min_score = db.session.query(func.min(Score.score_gain)).filter(Score.user_id == user.id).scalar() or 0
        # Best and weakest subjects
        subject_scores = (
            db.session.query(Subject.name, func.avg(Score.score_gain))
            .join(Quiz, Quiz.subject_id == Subject.id)
            .join(Score, Score.quiz_id == Quiz.id)
            .filter(Score.user_id == user.id)
            .group_by(Subject.name)
            .all()
        )

        if subject_scores:
            best_subject = max(subject_scores, key=lambda x: x[1])
            weakest_subject = min(subject_scores, key=lambda x: x[1])
        else:
            best_subject = ("N/A", 0)
            weakest_subject = ("N/A", 0)
        content = f"""
        <h1>Monthly Activity Report</h1>
        <p>Dear {user.username},</p>
        <p>Here’s your quiz performance summary for the past month:</p>
        <ul>
            <li>Quizzes Taken: {quizzes_taken}</li>
            <li>Average Score: {avg_score:.2f}</li>
            <li>Best Performing Subject: {best_subject}</li>
            <li>Weakest Subject: {weakest_subject}</li>
            <li>Highest Score in a Quiz: {max_score}</li>
            <li>Lowest Score in a Quiz: {min_score}</li>
        </ul>
        <p>Keep learning and improving!</p>  
        <br>  
        <p>Best regards,<br>Quiz Master</p>  
        """

        send_email(user.email, "Your Monthly Quiz Report", content) 