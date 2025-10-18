const { pool } = require("./config/database");
const bcrypt = require("bcryptjs");

async function testLogin() {
  try {
    console.log("Testing database connection...");

    // Test database connection
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      ["admin"]
    );
    console.log("Admin user found:", !!rows[0]);

    if (rows[0]) {
      console.log("User details:", {
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email,
        role: rows[0].role,
        hasPassword: !!rows[0].password,
      });

      // Test password verification
      const testPassword = "admin123";
      const isValid = await bcrypt.compare(testPassword, rows[0].password);
      console.log('Password test with "admin123":', isValid);
    }

    // Test with user1
    const [userRows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      ["user1"]
    );
    console.log("User1 found:", !!userRows[0]);

    if (userRows[0]) {
      const isValidUser = await bcrypt.compare("user123", userRows[0].password);
      console.log('Password test for user1 with "user123":', isValidUser);
    }

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testLogin();
