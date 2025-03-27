from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Date
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()  

# User Model
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    fullname = db.Column(db.String(120), nullable=True)
    qualification = db.Column(db.String(120), nullable=True)
    dob = db.Column(Date, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))
    quizzes_attempted = db.relationship('Score', backref='user', lazy=True, cascade="all, delete")

# Role Model
class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String, nullable=False)

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))  
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id', ondelete="CASCADE"))  

# Subject Model
class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade="all, delete")  

# Chapter Model
class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete="CASCADE"), nullable=False)  
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade="all, delete")  

# Quiz Model
class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete="CASCADE"), nullable=False)  
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id', ondelete="CASCADE"), nullable=False) 
    quiz_title = db.Column(db.String(120), nullable=False)
    number_of_questions = db.Column(db.Integer, nullable=False)
    date_of_quiz = db.Column(db.DateTime, default=datetime.utcnow)
    time_duration = db.Column(db.String(5), nullable=False)  # Format: HH:MM
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete")  

# Question Model
class Question(db.Model): 
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete="CASCADE"), nullable=False)  
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id', ondelete="CASCADE"), nullable=False)  
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete="CASCADE"), nullable=False)  
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(120), nullable=False)
    option2 = db.Column(db.String(120), nullable=True)
    option3 = db.Column(db.String(120), nullable=True)
    option4 = db.Column(db.String(120), nullable=True) 
    correct_option = db.Column(db.Integer, nullable=False)  # Store option number (1-4)

# Score Model
class Score(db.Model):
    __tablename__ = 'scores' 
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete="CASCADE"), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)  
    time_stamp_of_attempt = db.Column(db.DateTime, default=datetime.utcnow)
    total_scored = db.Column(db.Integer, nullable=False)
    score_gain = db.Column(db.Integer, nullable=False)
    time_spent_minutes = db.Column(db.Integer)
    time_spent_remaining_seconds = db.Column(db.Integer)
