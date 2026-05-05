import psycopg2

conn = psycopg2.connect(host='127.0.0.1', port=5433, user='postgres', dbname='postgres')
conn.set_session(autocommit=True)
cur = conn.cursor()
cur.execute("CREATE USER admin WITH PASSWORD 'admin123' CREATEDB")
cur.execute('CREATE DATABASE movie_picker OWNER admin')
print('Done')
conn.close()