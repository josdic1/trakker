# app/__init__.py

from flask import Flask
from config import Config
from .extensions import db, migrate, ma, bcrypt, jwt, cors

def create_app(config_class=Config):
    """
    Application factory function.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app object
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # The 'with app.app_context()' is crucial.
    # It makes sure the application is ready before we import models and routes.
    with app.app_context():
        # Import models so Alembic can see them
        from . import models

        # Import and register the blueprint for routes
        from .routes import api_bp
        app.register_blueprint(api_bp)

    return app