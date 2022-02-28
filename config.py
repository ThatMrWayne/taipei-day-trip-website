import os
from dotenv import load_dotenv

load_dotenv()
#由.env檔匯入mysql資料庫使用者與密碼
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
MYSQL_USER = os.getenv('MYSQL_USER')


class Config:
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    ENV = 'development'
    DEBUG = True
    #SECRET_KEY = KEY


class ProductionConfig(Config):
    DEBUG = False
    #SECRET_KEY = KEY

