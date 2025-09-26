import sqlite3
import random
from faker import Faker

fake = Faker()

def create_database():
    conn = sqlite3.connect('analytics.db')
    c = conn.cursor()

    # Drop tables if they exist to start fresh
    c.execute('DROP TABLE IF EXISTS tbl_01_users')
    c.execute('DROP TABLE IF EXISTS transaction_log_final')
    c.execute('DROP TABLE IF EXISTS prod_master')

    # Create tbl_01_users
    c.execute('''
        CREATE TABLE tbl_01_users (
            user_id INTEGER PRIMARY KEY,
            c3 TEXT, -- email
            signup_dt TEXT,
            last_login_region TEXT
        )
    ''')

    # Create transaction_log_final
    c.execute('''
        CREATE TABLE transaction_log_final (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            val TEXT, -- price
            dt TEXT -- date
        )
    ''')

    # Create prod_master
    c.execute('''
        CREATE TABLE prod_master (
            p_id INTEGER PRIMARY KEY,
            name TEXT,
            category TEXT
        )
    ''')

    # Populate data
    users = []
    for i in range(1, 101):
        region = random.choice(['north america', 'Europe', 'APAC', 'LATAM', None, 'North America'])
        date_format = random.choice(['%Y-%m-%d', '%m/%d/%Y', '%B %d, %Y'])
        users.append((i, fake.email(), fake.date_time_this_year().strftime(date_format), region))
    c.executemany('INSERT INTO tbl_01_users VALUES (?, ?, ?, ?)', users)

    products = [
        (1, 'Quantum Laptop', 'Electronics'), (2, 'Stellar Smartphone', 'Electronics'),
        (3, 'Cosmic Coffee Maker', 'Home Goods'), (4, 'Galaxy T-Shirt', 'Apparel'),
        (5, 'Nebula Notebook', 'Office'), (6, 'Fusion Blender', 'Home Goods')
    ]
    c.executemany('INSERT INTO prod_master VALUES (?, ?, ?)', products)

    transactions = []
    for _ in range(300):
        user_id = random.randint(1, 100)
        product_id = random.randint(1, 6)
        price = f"${random.uniform(20, 1000):,.2f}" if random.random() > 0.1 else f"{random.uniform(20, 1000):.2f}"
        date_format = random.choice(['%Y-%m-%d %H:%M:%S', 'ISO8601', '%d-%m-%Y'])
        if date_format == 'ISO8601':
            dt = fake.date_time_this_year().isoformat()
        else:
            dt = fake.date_time_this_year().strftime(date_format)
        transactions.append((user_id, product_id, price, dt))
    c.executemany('INSERT INTO transaction_log_final (user_id, product_id, val, dt) VALUES (?, ?, ?, ?)', transactions)

    conn.commit()
    conn.close()
    print("✅ Database `analytics.db` created successfully with messy data.")

if __name__ == '__main__':
    create_database()