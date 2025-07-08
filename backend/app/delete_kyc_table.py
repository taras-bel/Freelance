import sqlite3

DB_PATH = 'backend/app/db.sqlite3'

def drop_kyc_requests_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS kyc_requests;')
    conn.commit()
    conn.close()
    print('Table kyc_requests deleted (if existed).')

if __name__ == '__main__':
    drop_kyc_requests_table() 