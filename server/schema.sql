-- Zynthor IT Database Schema
-- Compatible with MySQL 8.0+, TiDB Serverless, Aiven, and standard cloud MySQL providers

CREATE DATABASE IF NOT EXISTS zynthor_it;
USE zynthor_it;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  service VARCHAR(100) DEFAULT NULL,
  budget VARCHAR(50) DEFAULT NULL,
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50) DEFAULT 'contact',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
