const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { redirectIfAuthenticated } = require("../middleware/auth");

// Home route - redirect to login
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Login page
router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login", {
    title: "Login",
    error: null,
  });
});

// Login form submission
router.post("/login", redirectIfAuthenticated, async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, passwordProvided: !!password });

    if (!username || !password) {
      console.log("Missing username or password");
      return res.render("login", {
        title: "Login",
        error: "Please enter both username and password",
      });
    }

    // Get user from database
    const user = await User.getUserByUsername(username);
    console.log("User found:", !!user);

    if (!user) {
      console.log("User not found in database");
      return res.render("login", {
        title: "Login",
        error: "Invalid username or password",
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return res.render("login", {
        title: "Login",
        error: "Invalid username or password",
      });
    }

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    console.log("Session created with user:", req.session.user.username);
    console.log("Session ID:", req.sessionID);

    // Force session save and then redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("login", {
          title: "Login",
          error: "Session error occurred during login",
        });
      }

      console.log("Session saved successfully. Session ID:", req.sessionID);
      console.log("User in session after save:", req.session.user?.username);

      // Small delay to ensure session is persisted
      setTimeout(() => {
        console.log("Redirecting to dashboard for:", user.username);
        res.redirect("/admin/dashboard");
      }, 100);
    });
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      title: "Login",
      error: "An error occurred during login",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
