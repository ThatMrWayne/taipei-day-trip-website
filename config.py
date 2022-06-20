import os
from dotenv import load_dotenv

load_dotenv()
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_USER = os.getenv('MYSQL_USER')
JWT_SECRET=os.getenv('JWT_SECRET_KEY')
PARTNER_KEY=os.getenv('PARTNER_KEY')


class Config:
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    ENV = 'development'
    DEBUG = True
    JWT_SECRET_KEY = JWT_SECRET
    JWT_TOKEN_LOCATION = "headers"


class ProductionConfig(Config):
    JWT_SECRET_KEY = JWT_SECRET
    JWT_TOKEN_LOCATION = "headers"

