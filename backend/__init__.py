from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from config import Config

# Initialize app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app) # This will allow your React frontend to make requests to the backend

# # Import models and routes after extension initialization to avoid circular imports
# from models import *
# from routes import *

# A simple route to confirm the app is running
@app.route('/')
def home():
    return "Trakker backend is running!"

if __name__ == '__main__':
    app.run(port=5555, debug=True)