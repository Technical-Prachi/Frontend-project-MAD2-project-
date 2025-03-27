from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password
from datetime import datetime

dob_value = datetime.strptime("2000-01-01", "%Y-%m-%d").date()
with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name = 'admin', description = 'superuser')
    userdatastore.find_or_create_role(name = 'user', description = 'general user')

    if (not userdatastore.find_user(email = 'admin@gmail.com')):
        userdatastore.create_user(
        username="admin",
        email="admin@gmail.com",
        password="pass",
        fullname="Admin User",  # Add a valid fullname
        qualification="N/A",
        dob=dob_value,  # Add a dummy date (YYYY-MM-DD)
        roles=['admin']
    )

    if (not userdatastore.find_user(email = 'user01@study.iitm.ac.in')):
       userdatastore.create_user(
       username="user01",
       email="user01@study.iitm.ac.in",
       password=hash_password('pass'),
       fullname="User One",  # Add a valid fullname
       qualification="N/A",
       dob=dob_value,
       roles=['user']
    )

    db.session.commit() 