import psycopg2
import os

os.environ['PGCLIENTENCODING'] = 'UTF8'

try:
    conn = psycopg2.connect(
        host='127.0.0.1',
        port=5433,
        user='postgres',
        password='postgres',
        dbname='template1',
        client_encoding='UTF8'
    )
    print('Connected')
    conn.close()
except Exception as e:
    print(f'Error: {e}')