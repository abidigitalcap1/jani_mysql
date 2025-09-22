# Jani Pakwan Center - Dashboard

This is a comprehensive dashboard for managing the operations of a catering business. It allows for tracking orders, customers, expenses, income, and supply party ledgers. The application has been built with a React frontend and a powerful PHP/MySQL backend, making it suitable for self-hosting on a standard VPS.

## Features

- **Dashboard:** At-a-glance overview of today's sales, orders, pending amounts, and expenses.
- **New Order Management:** Create detailed orders with custom items for new or existing customers.
- **Customer History:** View a complete history of all customers, including total orders, spending, and pending balances.
- **Expense Tracking:** Log and categorize all business expenses.
- **Income Management:** Track payments against pending orders.
- **Supply Party Ledger:** Manage accounts for suppliers, tracking bills and payments.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** PHP
- **Database:** MySQL

---

## Deployment Instructions

Follow these steps to deploy the application on your own Virtual Private Server (VPS).

### Prerequisites

- A VPS running a Linux distribution (e.g., Ubuntu).
- A web server (Apache or Nginx).
- PHP installed (version 7.4 or newer is recommended).
- A MySQL or MariaDB database server.
- phpMyAdmin or another database management tool.
- The `pdo_mysql` PHP extension must be enabled.

---

### Step 1: Set Up the Database

1.  Log in to **phpMyAdmin**.
2.  Create a new database. You can name it `jani_pakwan_center` or any name you prefer.
3.  Select the newly created database.
4.  Click on the **"Import"** tab.
5.  Upload the `schema.sql` file provided in this project and execute the import. This will create all the necessary tables.

### Step 2: Create Your Admin User

For security, you must create a user to log in to the application.

1.  Open the **"SQL"** tab in phpMyAdmin.
2.  Run the following command. **IMPORTANT:** Change the email and password to your own secure credentials.

```sql
-- The password 'password' is securely hashed in this command.
-- To use a different password, you must generate a new PHP password hash.
INSERT INTO `users` (`email`, `password_hash`) VALUES
('admin@example.com', '$2y$10$g/flp9mJAmL3k9p8C5bB..sFXde7TBF8A5sM8U4oHKAj3swnOU/z6');
```

This will create a user with:
- **Email:** `admin@example.com`
- **Password:** `password`

### Step 3: Upload Application Files

Upload all the files from this project (including `index.html`, `api.php`, etc.) to the web root directory on your server (e.g., `/var/www/html/`).

### Step 4: Configure the Database Connection

1.  On your server, open the `db.php` file in a text editor.
2.  Update the database credentials to match the ones you created in Step 1.

```php
// db.php

$host = 'localhost';        // Usually 'localhost'
$dbname = 'shami_nanola'; // The database name you created
$username = 'shami_nanola'; // Your MySQL username
$password = 'SkipHire@8182'; // Your MySQL password
```

### Step 5: Launch the Application

You're all set! Open your web browser and navigate to your server's IP address or domain name. You should see the login screen for the Jani Pakwan Center dashboard. Use the credentials you created in Step 2 to sign in.
