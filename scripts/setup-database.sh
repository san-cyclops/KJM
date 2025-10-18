#!/bin/bash

# Database Setup Script for AWS RDS
# This script will initialize the database with required tables and data

echo "🗄️ Setting up KJM Admin Database on AWS RDS..."
echo "=================================================="

# Database connection parameters
DB_HOST="masjid.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="NewSecurePassword123!"
DB_NAME="masjid"

echo "📡 Testing database connection..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" || {
    echo "❌ Cannot connect to database. Please check:"
    echo "1. RDS instance is running"
    echo "2. Security groups allow connections"
    echo "3. Database credentials are correct"
    exit 1
}

echo "✅ Database connection successful!"

echo "🔧 Creating database schema..."

# Create the database if it doesn't exist
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" << 'EOFDB'

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS masjid;
USE masjid;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create personal_info table with all 23 fields
CREATE TABLE IF NOT EXISTS personal_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    full_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    mobile VARCHAR(20),
    identity_card VARCHAR(50),
    civil_status ENUM('single', 'married', 'divorced', 'widowed'),
    spouse_name VARCHAR(255),
    children_count INT DEFAULT 0,
    residence_type VARCHAR(100),
    profession VARCHAR(100),
    special_need_child_name VARCHAR(255),
    special_need_child_age INT,
    special_need_child_school VARCHAR(255),
    special_need_details TEXT,
    non_related_people_count INT DEFAULT 0,
    non_related_people_details TEXT,
    sandha_member BOOLEAN DEFAULT FALSE,
    sandha_amount DECIMAL(10,2),
    donation_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    personal_info_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    age INT,
    occupation VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (personal_info_id) REFERENCES personal_info(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@kjm.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user1', 'user1@kjm.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Insert sample personal info data
INSERT IGNORE INTO personal_info (
    id, date, full_name, address_line1, city, mobile, identity_card, 
    civil_status, profession, created_at
) VALUES 
(1, '2025-01-15', 'Ahmed Ibrahim', '123 Main Street', 'Mumbai', '+91-9876543210', 'ID123456789', 'married', 'Teacher', NOW()),
(2, '2025-01-16', 'Fatima Ali', '456 Park Road', 'Delhi', '+91-9876543211', 'ID987654321', 'single', 'Engineer', NOW());

-- Insert sample family members
INSERT IGNORE INTO family_members (
    id, personal_info_id, name, relationship, age, occupation
) VALUES 
(1, 1, 'Aisha Ibrahim', 'Wife', 28, 'Doctor'),
(2, 1, 'Omar Ibrahim', 'Son', 5, 'Student');

EOFDB

echo "✅ Database schema created successfully!"

echo "📊 Verifying database setup..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOFVERIFY'
SELECT 'Users table:' as Info;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Personal Info table:' as Info;
SELECT COUNT(*) as personal_info_count FROM personal_info;

SELECT 'Family Members table:' as Info;
SELECT COUNT(*) as family_members_count FROM family_members;

SELECT 'Tables in database:' as Info;
SHOW TABLES;
EOFVERIFY

echo ""
echo "=================================================="
echo "🎉 Database setup completed successfully!"
echo "=================================================="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Tables created: users, personal_info, family_members"
echo "Sample data inserted for testing"
echo "=================================================="