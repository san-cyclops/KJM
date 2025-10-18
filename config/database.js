const mysql = require("mysql2");

// Database configuration - uses environment variables for production
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Mihinula@123",
  database: process.env.DB_NAME || "kjm_admin_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based pool
const promisePool = pool.promise();

// Function to create database if it doesn't exist
const createDatabase = async () => {
  try {
    const connection = mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection
      .promise()
      .execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database ${dbConfig.database} created or already exists`);
    connection.end();
  } catch (error) {
    console.error("Error creating database:", error);
  }
};

// Function to create users table
const createUsersTable = async () => {
  try {
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

    await promisePool.execute(createTableQuery);
    console.log("Users table created or already exists");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

// Function to insert sample users
const insertSampleUsers = async () => {
  try {
    const bcrypt = require("bcryptjs");

    // Check if admin user already exists
    const [existingUsers] = await promisePool.execute(
      "SELECT id FROM users WHERE username = ?",
      ["admin"]
    );

    if (existingUsers.length === 0) {
      // Hash passwords
      const adminPassword = await bcrypt.hash("admin123", 10);
      const userPassword = await bcrypt.hash("user123", 10);

      const insertQuery = `
                INSERT INTO users (username, email, password, role) VALUES 
                ('admin', 'admin@example.com', ?, 'admin'),
                ('user1', 'user1@example.com', ?, 'user')
            `;

      await promisePool.execute(insertQuery, [adminPassword, userPassword]);
      console.log("Sample users created successfully");
      console.log("Admin credentials: username=admin, password=admin123");
      console.log("User credentials: username=user1, password=user123");
    } else {
      console.log("Sample users already exist");
    }
  } catch (error) {
    console.error("Error inserting sample users:", error);
  }
};

// Function to create personal_info table
const createPersonalInfoTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS personal_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        permanent_address_no VARCHAR(50),
        permanent_address_street VARCHAR(255),
        permanent_address_area VARCHAR(255),
        permanent_address_city VARCHAR(255),
        mobile_number VARCHAR(20),
        identity_card_number VARCHAR(50) UNIQUE,
        whatsapp_number VARCHAR(20),
        civil_status ENUM('Single', 'Married', 'Widowed', 'Divorced') DEFAULT 'Single',
        residence ENUM('Own', 'Rent') DEFAULT 'Own',
        residence_owner_name VARCHAR(255),
        residence_owner_mobile VARCHAR(20),
        profession VARCHAR(255),
        special_need_child_details TEXT,
        no_of_non_related_people INT DEFAULT 0,
        nrp1_full_name VARCHAR(255),
        nrp1_nic_number VARCHAR(50),
        nrp1_address TEXT,
        nrp1_purpose_of_staying VARCHAR(255),
        sandha_membership_amount DECIMAL(10, 2) DEFAULT 0.00,
        paying_sandha_other_masjidh ENUM('Yes', 'No') DEFAULT 'No',
        other_masjidh_sandha_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await promisePool.execute(createTableQuery);
    console.log("Personal info table created or already exists");

    // Add new columns if they don't exist (for existing tables)
    const alterQueries = [
      `ALTER TABLE personal_info ADD COLUMN special_need_child_details TEXT`,
      `ALTER TABLE personal_info ADD COLUMN no_of_non_related_people INT DEFAULT 0`,
      `ALTER TABLE personal_info ADD COLUMN nrp1_full_name VARCHAR(255)`,
      `ALTER TABLE personal_info ADD COLUMN nrp1_nic_number VARCHAR(50)`,
      `ALTER TABLE personal_info ADD COLUMN nrp1_address TEXT`,
      `ALTER TABLE personal_info ADD COLUMN nrp1_purpose_of_staying VARCHAR(255)`,
      `ALTER TABLE personal_info ADD COLUMN sandha_membership_amount DECIMAL(10, 2) DEFAULT 0.00`,
      `ALTER TABLE personal_info ADD COLUMN paying_sandha_other_masjidh ENUM('Yes', 'No') DEFAULT 'No'`,
      `ALTER TABLE personal_info ADD COLUMN other_masjidh_sandha_details TEXT`,
    ];

    for (const query of alterQueries) {
      try {
        await promisePool.execute(query);
      } catch (error) {
        // Ignore errors for columns that already exist
        if (error.message.includes("Duplicate column name")) {
          // Column already exists, ignore
        } else {
          console.log("Note: Column may already exist or other minor issue");
        }
      }
    }
    console.log("Personal info table structure updated");
  } catch (error) {
    console.error("Error creating personal info table:", error);
  }
};

// Function to insert sample personal info data
const insertSamplePersonalInfo = async () => {
  try {
    // Check if sample data already exists
    const [existingData] = await promisePool.execute(
      "SELECT id FROM personal_info WHERE identity_card_number = ?",
      ["199330002675"]
    );

    if (existingData.length === 0) {
      const insertQuery = `
        INSERT INTO personal_info (
          date, full_name, permanent_address_no, permanent_address_street, 
          permanent_address_area, permanent_address_city, mobile_number, 
          identity_card_number, whatsapp_number, civil_status, residence, 
          residence_owner_name, residence_owner_mobile, profession,
          special_need_child_details, no_of_non_related_people, nrp1_full_name,
          nrp1_nic_number, nrp1_address, nrp1_purpose_of_staying,
          sandha_membership_amount, paying_sandha_other_masjidh, other_masjidh_sandha_details
        ) VALUES (
          '2024-12-27', 'Omar Ghani', '1/3', 'Unambuwa Road', 
          'Kahatapitiya', 'Gampola', '0770040066', 
          '199330002675', '0770040066', 'Married', 'Own', 
          'Omar', '0770040066', 'IT Project Manager',
          'N/A', 0, 'N/A', 'N/A', 'N/A', 'N/A',
          300.00, 'No', 'N/A'
        )
      `;

      await promisePool.execute(insertQuery);
      console.log("Sample personal info data created successfully");
    } else {
      console.log("Sample personal info data already exists");
    }
  } catch (error) {
    console.error("Error inserting sample personal info data:", error);
  }
};

// Function to create family_members table
const createFamilyMembersTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS family_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        personal_info_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        relationship ENUM('Wife', 'Husband', 'Child', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other') NOT NULL,
        date_of_birth DATE,
        school_name VARCHAR(255),
        grade VARCHAR(50),
        quran_madrasa VARCHAR(255),
        occupation VARCHAR(255),
        contact_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (personal_info_id) REFERENCES personal_info(id) ON DELETE CASCADE
      )
    `;

    await promisePool.execute(createTableQuery);
    console.log("Family members table created or already exists");
  } catch (error) {
    console.error("Error creating family members table:", error);
  }
};

// Function to insert sample family members data
const insertSampleFamilyMembers = async () => {
  try {
    // Check if sample data already exists
    const [existingData] = await promisePool.execute(
      "SELECT id FROM family_members WHERE personal_info_id = 1 AND name = ?",
      ["Afla"]
    );

    if (existingData.length === 0) {
      const insertQueries = [
        `INSERT INTO family_members (
          personal_info_id, name, relationship, date_of_birth, 
          school_name, grade, quran_madrasa, occupation, contact_number
        ) VALUES (1, 'Afla', 'Wife', '1997-12-26', 'N/A', 'N/A', 'N/A', 'House Wife', '0770040066')`,

        `INSERT INTO family_members (
          personal_info_id, name, relationship, date_of_birth, 
          school_name, grade, quran_madrasa, occupation, contact_number
        ) VALUES (1, 'Saad', 'Child', '2025-07-27', 'N/A', 'N/A', 'N/A', 'N/A', '0770040066')`,
      ];

      for (const query of insertQueries) {
        await promisePool.execute(query);
      }
      console.log("Sample family members data created successfully");
    } else {
      console.log("Sample family members data already exists");
    }
  } catch (error) {
    console.error("Error inserting sample family members data:", error);
  }
};

// Initialize database
const initializeDatabase = async () => {
  await createDatabase();
  await createUsersTable();
  await insertSampleUsers();
  await createPersonalInfoTable();
  await insertSamplePersonalInfo();
  await createFamilyMembersTable();
  await insertSampleFamilyMembers();
};

module.exports = {
  pool: promisePool,
  promisePool,
  initializeDatabase,
};
