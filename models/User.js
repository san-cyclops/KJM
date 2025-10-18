const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // Get all users
  static async getAllUsers() {
    try {
      const [rows] = await pool.execute(
        "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get user by username for authentication
  static async getUserByUsername(username) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async createUser(userData) {
    try {
      const { username, email, password, role = "user" } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, role]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async updateUser(id, userData) {
    try {
      const { username, email, role } = userData;

      const [result] = await pool.execute(
        "UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [username, email, role, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update user password
  static async updateUserPassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const [result] = await pool.execute(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
