from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user , roles_required
from backend.models import Quiz ,Score ,Chapter, Subject, User, Question, db
from datetime import datetime
cache = app.cache

api = Api(prefix='/api') 

# ============================ FIELD SERIALIZATION ============================

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'roles': fields.String,
    'fullname': fields.String,
    'qualification': fields.String,
    'dob': fields.String,
    'active': fields.Boolean,
}

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
}

question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'subject_id': fields.Integer,
    'chapter_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer,
}

quiz_fields = {
    'id': fields.Integer,
    'subject_id': fields.Integer,
    'chapter_id': fields.Integer,
    'quiz_title': fields.String,
    'number_of_questions': fields.Integer,
    'date_of_quiz': fields.String,
    'time_duration': fields.String,
    'questions': fields.List(fields.Nested(question_fields))  
}

chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'quizzes': fields.List(fields.Nested(quiz_fields))  
}


score_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'quiz_id': fields.Integer,
    'time_stamp_of_attempt': fields.DateTime,
    'total_scored': fields.Integer,
    'score_gain': fields.Integer,
    'time_spent_minutes': fields.Integer,
    'time_spent_remaining_seconds': fields.Integer,

}

# ============================ USER DASHBOARD ============================

class UserDashboard(Resource):
    @auth_required('token')
    def get(self):
        search_query = request.args.get('search_query', '')
        subjects = Subject.query.filter(
            (Subject.id.ilike(f"%{search_query}%")) |
            (Subject.name.ilike(f"%{search_query}%"))
        ).all()
        scores = Score.query.filter(
            (Score.id.ilike(f"%{search_query}%")) |
            (Score.quiz_id.ilike(f"%{search_query}%"))
        ).all()
        return jsonify({
            "scores": [
                {"id": score.id, "quiz_id": score.quiz_id, "total_scored": score.total_scored}
                for score in scores
            ],
            "subjects": [
                {"id": subject.id, "name": subject.name, "description": subject.description}
                for subject in subjects
            ],
        })

# ============================ ADMIN DASHBOARD ============================

class AdminDashboard(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        search_query = request.args.get('search_query', '')

        users = User.query.filter(
            (User.username.ilike(f"%{search_query}%")) |
            (User.email.ilike(f"%{search_query}%")) |
            (User.fullname.ilike(f"%{search_query}%"))
        ).all()

        subjects = Subject.query.filter(
            (Subject.name.ilike(f"%{search_query}%")) |
            (Subject.description.ilike(f"%{search_query}%"))
        ).all()

        quizzes = Quiz.query.filter(
            (Quiz.quiz_title.ilike(f"%{search_query}%"))
        ).all()

        return jsonify({
            "users": [
                {"id": user.id, "username": user.username, "email": user.email, "roles": [role.name for role in user.roles] ,"fullname":user.fullname, "qualification": user.qualification, "dob": user.dob.strftime("%Y-%m-%d"), "active": user.active}
                for user in users
            ],
            "subjects": [
                {"id": subject.id, "name": subject.name, "description": subject.description}
                for subject in subjects
            ],
            "quizzes": [
                {"id": quiz.id, "quiz_title": quiz.quiz_title, "number_of_questions": quiz.number_of_questions}
                for quiz in quizzes
            ]
        })

# ===============================unblock aur block =============================

class ToggleUserStatusAPI(Resource):
    @auth_required('token')
    def post(self, user_id = None):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404  

    
        user.active = not user.active
        db.session.commit()

        return {"message": "User status updated", "active": user.active}, 200  

# ============================ SUBJECTS ============================

class SubjectAPI(Resource):
    @marshal_with(subject_fields)
    def get(self, subject_id=None):
        search_query = request.args.get('search_query', '')  

        if subject_id:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {"message": "Subject not found"}, 404
            return subject

        # Apply filtering if search query is provided
        if search_query:
            subjects = Subject.query.filter(
                (Subject.name.ilike(f"%{search_query}%")) |
                (Subject.description.ilike(f"%{search_query}%"))
            ).all()
        else:
            subjects = Subject.query.all()

        return subjects


    @auth_required('token')
    @marshal_with(subject_fields)
    def post(self):
        data = request.json
        new_subject = Subject(name=data['name'], description=data['description'])
        db.session.add(new_subject)
        db.session.commit()
        return new_subject, 201

    @auth_required('token')
    @marshal_with(subject_fields)
    def put(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        data = request.json
        subject.name = data['name']
        subject.description = data['description']
        db.session.commit()
        return subject
    
    @auth_required('token')
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        db.session.delete(subject)
        db.session.commit()
        return {"message": "Subject deleted"}, 200


# ============================ CHAPTERS ============================

class ChapterAPI(Resource):
    @marshal_with(chapter_fields)
    def get(self, chapter_id=None, subject_id=None):
        try:
            if chapter_id:
                chapter = Chapter.query.get(chapter_id)
                if not chapter:
                    return {"message": "Chapter not found"}, 404

                quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
                chapter.quizzes = quizzes if quizzes else []  
                return chapter, 200

            if subject_id:
                subject = Subject.query.get(subject_id)
                if not subject:
                    return {"message": "Subject not found"}, 404

                chapters = Chapter.query.filter_by(subject_id=subject_id).all()
                for chapter in chapters:
                    quizzes = Quiz.query.filter_by(chapter_id=chapter.id).all()
                    chapter.quizzes = quizzes if quizzes else []  
                return chapters, 200

            return {"message": "Invalid request"}, 400
        except Exception as e:
            print(f"Error fetching chapter: {str(e)}")  # Debugging log
            return {"message": "Internal server error"}, 500


    @auth_required('token')
    @marshal_with(chapter_fields)
    def post(self, subject_id): 
        data = request.get_json()
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        
        new_chapter = Chapter(
            name=data['name'],
            description=data['description'],
            subject_id=subject_id
        )
        db.session.add(new_chapter)
        db.session.commit()
        return new_chapter, 201
    
    @auth_required('token')
    @marshal_with(chapter_fields)
    def put(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404

        data = request.json

        if not data:
            return {"message": "Invalid request, JSON required"}, 400

        chapter.name = data.get("name", chapter.name)
        chapter.description = data.get("description", chapter.description)

        db.session.commit()
        return {"message": "Chapter updated successfully"}, 200
    
    
    @auth_required('token')
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404

        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted"}, 200

# ============================ QUIZZES ============================

class QuizAPI(Resource):
    @cache.memoize(timeout = 5)
    @marshal_with(quiz_fields)
    def get(self, subject_id=None, chapter_id=None, quiz_id=None,  question_id = None):
        try:
            if quiz_id:
                quiz = Quiz.query.get(quiz_id)
                if not quiz:
                    return {"message": "Quiz not found"}, 404
                questions = Question.query.filter_by(quiz_id=quiz_id).all()
                quiz.questions = questions if questions else []  
                return quiz, 200
            if chapter_id:
                chapter = Chapter.query.get(chapter_id)
                if not chapter:
                    return {"message": "Chapter not found"}, 404

                quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
                for quiz in quizzes:
                    questions = Question.query.filter_by(quiz_id=quiz.id).all()
                    quiz.questions = questions if questions else []  # ✅ Ensure it's always a list

                return quizzes, 200
            if subject_id:
                subject = Subject.query.get(subject_id)
                if not subject:
                    return {"message": "Subject not found"}, 404

                quizzes = Quiz.query.filter_by(subject_id=subject_id).all()
                for quiz in quizzes:
                    questions = Question.query.filter_by(quiz_id=quiz.id).all()
                    quiz.questions = questions if questions else []  # ✅ Ensure it's always a list

                return quizzes, 200
            return {"message": "Invalid request, subject_id and chapter_id required"}, 400
        except Exception as e:
            return {"message": "Internal server error", "error": str(e)}, 500

    @auth_required('token')
    @marshal_with(quiz_fields)
    def post(self, subject_id, chapter_id):
        # Check if Subject Exists
        subject = Subject.query.get(subject_id)
        if not subject:
            return jsonify({"message": "Subject not found", "quizzes": []}), 404

        # Check if Chapter Exists
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return jsonify({"message": "Chapter not found", "quizzes": []}), 404

        # Parse JSON Request Data
        data = request.get_json()

        # Handle Date Parsing for date_of_quiz
        date_str = data.get('date_of_quiz')
        if not date_str:
            return {"message": "Missing date_of_quiz"}, 400

        try:
            if len(date_str) == 16:  # Format "YYYY-MM-DDTHH:MM"
                date_of_quiz = datetime.strptime(date_str, '%Y-%m-%dT%H:%M')
            elif len(date_str) == 19:  # Format "YYYY-MM-DDTHH:MM:SS"
                date_of_quiz = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
            else:
                return {"message": "Invalid date format. Use 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'"}, 400
        except ValueError:
            return {"message": "Incorrect date format. Use 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'"}, 400

        # Create New Quiz Object
        new_quiz = Quiz(
            quiz_title=data['quiz_title'],
            number_of_questions=data['number_of_questions'],
            date_of_quiz=date_of_quiz,
            time_duration=data['time_duration'],
            subject_id=subject_id,
            chapter_id=chapter_id
        )

        # Save to Database
        db.session.add(new_quiz)
        db.session.commit()

        # Return Response
        return {
            'id': new_quiz.id,
            'subject_id': new_quiz.subject_id,
            'chapter_id': new_quiz.chapter_id,
            'quiz_title': new_quiz.quiz_title,
            'number_of_questions': new_quiz.number_of_questions,
            'date_of_quiz': new_quiz.date_of_quiz.strftime('%Y-%m-%dT%H:%M') if new_quiz.date_of_quiz else None,
            'time_duration': new_quiz.time_duration
        }, 201
    @auth_required('token')
    @marshal_with(quiz_fields)
    def put(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        data = request.get_json()
        quiz.quiz_title = data['quiz_title']
        quiz.number_of_questions = data['number_of_questions']
        quiz.date_of_quiz = datetime.strptime(data['date_of_quiz'].split('.')[0], '%Y-%m-%dT%H:%M:%S')
        quiz.time_duration = data['time_duration']
        db.session.commit()
        return quiz

    @auth_required('token')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted"}, 200

# ============================ QUESTIONS ============================
class QuestionAPI(Resource):
    @marshal_with(question_fields)
    def get(self, subject_id=None, chapter_id=None, quiz_id=None, question_id=None):
        if question_id:  # Fetch a single question
            question = Question.query.get(question_id)
            if not question:
                return {"message": "Question not found"}, 404
            return question, 200
        
        if not (subject_id and chapter_id and quiz_id):  # Ensure valid IDs
            return {"message": "Invalid request, subject_id, chapter_id, and quiz_id are required"}, 400

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return questions, 200


    @auth_required('token') 
    @marshal_with(question_fields)
    def post(self, subject_id, chapter_id, quiz_id):
     subject = Subject.query.get(subject_id)
     if not subject:
        return {"message": "Subject not found"}, 404

     chapter = Chapter.query.get(chapter_id)
     if not chapter:
        return {"message": "Chapter not found"}, 404

     quiz = Quiz.query.get(quiz_id)
     if not quiz:
        return {"message": "Quiz not found"}, 404

     data = request.get_json()

     new_question = Question(
        quiz_id=quiz_id,
        subject_id=subject_id,
        chapter_id=chapter_id,
        question_statement=data["question_statement"],
        option1=data["option1"],
        option2=data.get("option2"),  # Will be None if not provided
        option3=data.get("option3"),
        option4=data.get("option4"),
        correct_option=data["correct_option"]
     )

    
     db.session.add(new_question)
     db.session.commit()
     return new_question, 201


    @auth_required('token')
    @marshal_with(question_fields)
    def put(self, question_id):
     question = Question.query.get(question_id)
     if not question:
        return {"message": "Question not found"}, 404

     data = request.get_json()
     if not data:
        return {"message": "Invalid request, JSON required"}, 400

     try:
        question.question_statement = data.get("question_statement", question.question_statement)
        
        # Update only if option is not None
        if "option1" in data and data["option1"]:
            question.option1 = data["option1"]
        if "option2" in data:
            question.option2 = data["option2"]
        if "option3" in data:
            question.option3 = data["option3"]
        if "option4" in data:
            question.option4 = data["option4"]

        # Validate correct_option
        available_options = [opt for opt in [question.option1, question.option2, question.option3, question.option4] if opt]
        if not (1 <= question.correct_option <= len(available_options)):
            return {"message": "Invalid correct_option, should match given options"}, 400
        
        db.session.commit()
        return question, 200
     except Exception as e:
        db.session.rollback()
        return {"message": f"Error updating question: {str(e)}"}, 500


    @auth_required('token')
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        db.session.delete(question)
        db.session.commit()   
        return {"message": "Question deleted"}, 200

# ============================ SCORE API ENDPOINTS ============================

class ScoreAPI(Resource):
    @auth_required('token')
    def get(self, user_id, subject_id=None, chapter_id=None, quiz_id=None):
        if not user_id:
            return {"message": "User not found"}, 400

        scores = (
            Score.query
            .join(Quiz, Score.quiz_id == Quiz.id)
            .join(Chapter, Quiz.chapter_id == Chapter.id)
            .join(Subject, Chapter.subject_id == Subject.id)
            .filter(Score.user_id == user_id)
            .add_columns(
                Subject.name.label("subject_name"),
                Chapter.name.label("chapter_name"),
                Quiz.quiz_title.label("quiz_title")
            ).all()
        )

        score_list = []
        for score, subject_name, chapter_name, quiz_title in scores:
            score_data = {
                "id": score.id,
                "user_id": score.user_id,
                "quiz_id": score.quiz_id,
                "time_stamp_of_attempt": score.time_stamp_of_attempt.strftime('%Y-%m-%d %H:%M:%S'),

                "total_scored": score.total_scored,
                "score_gain": score.score_gain,
                "time_spent_minutes": score.time_spent_minutes,
                "time_spent_remaining_seconds": score.time_spent_remaining_seconds,

                "quiz": {
                    "subject": {"name": subject_name or "Unknown"},
                    "chapter": {"name": chapter_name or "Unknown"},
                    "quiz_title": quiz_title or "Unknown"
                }
            }
            score_list.append(score_data)

        print(" Final API Response:", score_list)  
        return score_list, 200  

    @auth_required('token')
    @marshal_with(score_fields)
    def post(self, user_id, subject_id, chapter_id, quiz_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        data = request.get_json()
        print("Received Data:", data)  

        new_score = Score(
            user_id=data["user_id"],
            quiz_id=data["quiz_id"],
            time_stamp_of_attempt=data.get('time_stamp_of_attempt', datetime.utcnow()), 
            total_scored=data["total_scored"],
            score_gain=data["score_gain"],
            time_spent_minutes=data["time_spent_minutes"],
            time_spent_remaining_seconds=data["time_spent_remaining_seconds"]
        )

        db.session.add(new_score)
        db.session.commit()
        print(" Score saved successfully!")  

        return new_score, 201



#============================= DELETE USER  ============================
class DeleteUserAPI(Resource):
    @auth_required('token')
    def delete(self, user_id):
        print(f"Received DELETE request for user_id: {user_id}")  
        user = User.query.get(user_id)

        if not user:
            print("User not found!") 
            return {"message": "User not found"}, 404
        
        try:
            db.session.delete(user)
            db.session.commit()
            print("User deleted successfully!")  
            return {"message": "User deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting user: {str(e)}")  
            return {"message": f"Error deleting user: {str(e)}"}, 500

#===================================CHARTS =============================
class SummaryAPI(Resource):
 @auth_required('token')
 def get(self):
    total_subjects = Subject.query.count()
    total_quizzes = Quiz.query.count()
    total_users = User.query.count()
    total_chapters = Chapter.query.count()

    scores = [score.total_scored for score in Score.query.all()]
    quiz_attempt_dates = [score.time_stamp_of_attempt.strftime('%Y-%m-%d') for score in Score.query.all()]

    attempted = Score.query.count()
    not_attempted = max(0, total_users - attempted)

    # Top 5 users with highest scores
    top_users = Score.query.order_by(Score.total_scored.desc()).limit(5).all()
    top_users_data = [{
        "name": User.query.get(user.user_id).fullname,
        "total_score": user.total_scored
    } for user in top_users]

    subjects = Subject.query.all()
    subject_popularity = [{
        "name": sub.name,
        "quiz_count": Quiz.query.filter_by(subject_id=sub.id).count()
    } for sub in subjects]

    avg_scores_per_subject = [{
        "name": sub.name,
        "avg_score": db.session.query(db.func.avg(Score.total_scored))
                      .join(Quiz).filter(Quiz.subject_id == sub.id).scalar() or 0
    } for sub in subjects]

    return jsonify({
        "total_subjects": total_subjects,
        "total_quizzes": total_quizzes,
        "total_users": total_users,
        "total_chapters": total_chapters,
        "quiz_attempt_distribution": [attempted, not_attempted],
        "scores": scores,
        "quiz_attempt_dates": quiz_attempt_dates,
        "top_users": top_users_data,
        "subject_popularity": subject_popularity,
        "avg_scores_per_subject": avg_scores_per_subject
    })



# ============================ REGISTER API ENDPOINTS ============================

api.add_resource(AdminDashboard, '/admin_dashboard')
api.add_resource(UserDashboard, '/user_dashboard')
api.add_resource(DeleteUserAPI, '/users/<int:user_id>')
api.add_resource(SubjectAPI, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(ChapterAPI, '/subjects/<int:subject_id>/chapters', '/chapters/<int:chapter_id>')
api.add_resource(QuizAPI, '/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes', '/quizzes/<int:quiz_id>')
api.add_resource(QuestionAPI, '/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>/questions', '/questions/<int:question_id>')
api.add_resource(ScoreAPI, "/scores/<int:user_id>", "/scores/<int:user_id>/<int:subject_id>/<int:chapter_id>/<int:quiz_id>")
api.add_resource(SummaryAPI , "/summary")
api.add_resource(ToggleUserStatusAPI,'/users/<int:user_id>/toggle_status')
if __name__ == '__main__':
    app.run(debug=True)
