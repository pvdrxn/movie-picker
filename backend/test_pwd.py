import psycopg2

passwords = ["postgres", "password", "admin", ""]

for pwd in passwords:
    try:
        conn = psycopg2.connect(
            host='127.0.0.1',
            port=5433,
            user='postgres',
            password=pwd,
            dbname='postgres'
        )
        print(f'Password works: {pwd}')
        conn.close()
        break
    except Exception as e:
        print(f'{pwd}: Failed')