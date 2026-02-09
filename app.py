from flask import Flask,render_template,send_from_directory,session, request, redirect, flash, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
from dotenv import load_dotenv
import uuid
import requests
import os
import os

load_dotenv()

url_alias = os.getenv('URL_ALIAS')
if url_alias is not None and url_alias != '':
    app = Flask(__name__, static_url_path=f"/{url_alias}/static")
else:
    app = Flask(__name__)
    
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['file_upload_api'] = os.getenv('FILE_UPLOAD_API')
db = SQLAlchemy(app)

@app.context_processor
def inject_globals():
    return {
        'app_name': os.getenv('APP_NAME'),
        'developer': os.getenv('DEVELOPER'),
        'cf_page': os.getenv('CF_PAGE'),
        'eis_page': os.getenv('EIS_PAGE'),
        'url_alias': url_alias
    }

#------------------
# Model Location 
#------------------

class Location(db.Model):
    __tablename__ = 'tblLocations'
    LocationCode = db.Column(db.String(50), nullable=False)
    LocationId = db.Column(db.Integer, primary_key=True)
    LocationName = db.Column(db.String(150), nullable=False)
    LocationType = db.Column(db.String(50))
    LocationUUID = db.Column(db.String(100))
    ParentLocationId = db.Column(db.Integer)
    ValidityFrom = db.Column(db.DateTime)
    ValidityTo = db.Column(db.DateTime, default=None)
    wCodeId = db.Column(db.Integer)
    def __repr__(self):
        return f"<Locations {self.LocationName}>"


@app.route("/")
# def hello_world():
#     return "<p>Hello, World!</p>"
def index():
    user_data = {"name": "Gemini User", "role": "Admin"}
    locations = Location.query.filter_by(ParentLocationId=None, LocationType='R').all()
    form_data= session.pop('form_data', None)
    error= session.pop('error', None)
    message= session.pop('message', None)
    print(locations)
    return render_template('index.html', context=user_data)

# This helps Flask find the JS/CSS files Vite generates
@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('static/dist/assets', path)

if __name__ == "__main__":
    app.run(debug=True,port=8000)