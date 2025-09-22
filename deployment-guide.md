# Jani Pakwan Center - VPS Deployment Guide

## Prerequisites

Your VPS should have:
- Apache/Nginx web server
- PHP 7.4+ with PDO MySQL extension
- MySQL 5.7+ or MariaDB 10.3+
- phpMyAdmin (optional but recommended)

## Step 1: Database Setup

### 1.1 Create Database
```sql
CREATE DATABASE jani_pakwan_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 Create Database User (Optional but recommended)
```sql
CREATE USER 'jani_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON jani_pakwan_center.* TO 'jani_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1.3 Import Schema
- Upload `schema.sql` to your server
- Import it via phpMyAdmin or command line:
```bash
mysql -u root -p jani_pakwan_center < schema.sql
```

## Step 2: Configure Database Connection

Edit `db.php` with your database credentials:

```php
$host = 'localhost';
$dbname = 'jani_pakwan_center';
$username = 'jani_user';  // or 'root'
$password = 'your_secure_password';
```

## Step 3: Upload Files

Upload all project files to your web root directory:
- `/var/www/html/` (Apache)
- `/usr/share/nginx/html/` (Nginx)

## Step 4: Set Permissions

```bash
# Make sure web server can read files
chmod -R 644 /path/to/your/website/*
chmod -R 755 /path/to/your/website/

# Make sure PHP can write sessions (if needed)
chmod 755 /var/lib/php/sessions
```

## Step 5: Web Server Configuration

### For Apache (.htaccess)
Create `.htaccess` in your web root:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Enable PHP
AddType application/x-httpd-php .php

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### For Nginx
Add to your server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

## Step 6: Test the Application

1. Visit your website URL
2. You should see the login page
3. Default credentials:
   - Email: `admin@example.com`
   - Password: `password`

## Step 7: Security Recommendations

### 7.1 Change Default Password
After first login, create a new admin user and delete the default one:

```sql
-- Create new admin user
INSERT INTO users (email, password_hash) VALUES 
('your_email@domain.com', '$2y$10$your_hashed_password');

-- Delete default user
DELETE FROM users WHERE email = 'admin@example.com';
```

### 7.2 Secure Database
- Use strong passwords
- Limit database user privileges
- Consider using SSL for database connections

### 7.3 File Permissions
```bash
# Restrict access to sensitive files
chmod 600 db.php
chmod 644 api.php
```

### 7.4 Enable HTTPS
- Install SSL certificate (Let's Encrypt recommended)
- Redirect HTTP to HTTPS

## Step 8: Backup Strategy

### Database Backup
```bash
# Create backup
mysqldump -u username -p jani_pakwan_center > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u username -p jani_pakwan_center < backup_20241201.sql
```

### File Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/your/website/
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check credentials in `db.php`
   - Verify MySQL service is running
   - Check firewall settings

2. **PHP Errors**
   - Enable error reporting in development
   - Check PHP error logs
   - Verify PDO MySQL extension is installed

3. **Permission Denied**
   - Check file permissions
   - Verify web server user ownership

4. **API Not Working**
   - Check web server configuration
   - Verify mod_rewrite is enabled (Apache)
   - Check PHP-FPM is running (Nginx)

### Enable Debug Mode (Development Only)
Add to `api.php` at the top:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Performance Optimization

1. **Enable PHP OPcache**
2. **Use MySQL query caching**
3. **Enable gzip compression**
4. **Set up proper caching headers**
5. **Consider using a CDN for static assets**

## Monitoring

- Set up log rotation for PHP and web server logs
- Monitor database performance
- Set up automated backups
- Monitor disk space and server resources