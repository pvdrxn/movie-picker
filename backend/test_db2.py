import psycopg2

# Try connecting without any password (trust auth or peer)
try:
    conn = psycopg2.connect(
        host='127.0.0.1',
        port=5433,
        user='postgres',
        dbname='postgres'
    )
    print('Connected without password!')
    conn.close()
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')

# Try with empty password
try:
    conn = psycopg2.connect(
        host='127.0.0.1',
        port=5433,
        user='postgres',
        password='',
        dbname='postgres'
    )
    print('Connected with empty password!')
    conn.close()
except Exception as e:
    print(f'Empty password error: {type(e).__name__}: {e}')