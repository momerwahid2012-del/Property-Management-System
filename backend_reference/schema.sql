
-- Property & Rental Management System (PRMS) Schema

CREATE DATABASE IF NOT EXISTS prms_db;
USE prms_db;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
    can_add_payments BOOLEAN DEFAULT TRUE,
    can_add_expenses BOOLEAN DEFAULT TRUE,
    can_add_tenants BOOLEAN DEFAULT TRUE,
    can_edit_records BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    INDEX (name)
);

-- Units Table
CREATE TABLE units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    unit_number VARCHAR(20) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    max_tenants INT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    INDEX (unit_number)
);

-- Tenants Table
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    move_in_date DATE NOT NULL,
    unit_id INT NOT NULL,
    status ENUM('active', 'left') DEFAULT 'active',
    FOREIGN KEY (unit_id) REFERENCES units(id),
    INDEX (status)
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    unit_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    is_corrected BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Expenses Table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    category ENUM('maintenance', 'electricity', 'water', 'other') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Initial Admin (pass: admin)
INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@prms.com', 'pbkdf2:sha256:260000$...', 'ADMIN');
