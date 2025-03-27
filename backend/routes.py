from flask import Flask, jsonify, request, render_template,send_from_directory, redirect, url_for
from flask_security import hash_password, verify_password,auth_required
from backend.models import db
from flask import current_app as app
from datetime import datetime
from backend.celery.tasks import add , create_csv
from celery.result import AsyncResult
import os
datastore = app.security.datastore
cache = app.cache


# ===================== SERVE VUE APP FOR ALL ROUTES =====================
@app.route('/')
def home():
    return render_template('index.html')



@app.route("/celery")
def celery():
    task = add.delay(10, 20)
    return {'task_id': task.id}

@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        csv_filename = result.result  
        directory = os.path.abspath('./backend/celery/user-downloads')

        file_path = os.path.join(directory, csv_filename)
        if not os.path.exists(file_path):
            return jsonify({'message': 'File not found'}), 404

        return send_from_directory(directory=directory, path=csv_filename, as_attachment=True)
    else:
        return jsonify({'message': 'Task not ready'}), 202 


@auth_required('token') 
@app.route('/create-csv' , methods=['POST'])
def createCSV():
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    task = create_csv.delay(user_id)
    return jsonify({'task_id': task.id}), 200



@app.get('/cache')
@cache.cached(timeout=5)
def cache_time():
    return {'time': str(datetime.now())}

@app.get('/protected')
@auth_required('token')
def protected():
    return '<h1> only accessible by auth user</h1>'

# ===================== LOGIN ROUTE =====================  

@app.route('/login', methods=['POST'])  
def login():
    if request.content_type != 'application/json':
        return jsonify({"Message": "Content-Type must be application/json"}), 400

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"Message": "Email and Password required"}), 400
    
    user = datastore.find_user(email=email) 
    if not user:
            return jsonify({"Message": "User not found"}), 404

    if verify_password(password, user.password):
            return jsonify({
                'token': user.get_auth_token(),
                'email': user.email,
                'role': user.roles[0].name if user.roles else "No Role",
                'user_id': user.id
            }), 200
    else:
            return jsonify({"Message": "Incorrect password"}), 400

    

# ===================== REGISTER ROUTE =====================
@app.route('/register', methods=['POST'])
def register():
    if request.content_type != 'application/json':
        return jsonify({"Message": "Content-Type must be application/json"}), 400

    try:
        data = request.get_json()
        username = data.get("username")
        fullname = data.get("fullname")
        email = data.get("email")
        password = data.get("password")
        qualification = data.get("qualification")
        dob = data.get("dob")
        role_name = data.get("role")

        if not username or not fullname or not email or not password or not qualification or not role_name:
            return jsonify({"Message": "All fields are required"}), 400

        try:
            dob = datetime.strptime(dob, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"Message": "Invalid date format for 'dob'. Expected format: YYYY-MM-DD"}), 400

        existing_user = datastore.find_user(email=email)
        if existing_user:
            return jsonify({"Message": "User already exists"}), 400

        role = datastore.find_or_create_role(name=role_name)
        user = datastore.create_user(
            username=username,
            fullname=fullname,
            email=email,
            password=hash_password(password),
            qualification=qualification,
            dob=dob,
            roles=[role],  
            active=True
        )
        db.session.commit()
        return jsonify({"Message": "User registered successfully"}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"Message": "Error creating user", "Error": str(e)}), 500
