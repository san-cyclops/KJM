const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");
const { initializeDatabase } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: "kjm-admin-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: false, // Allow client access for debugging
      sameSite: "lax",
    },
    name: "kjm.session.id",
  })
);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Debug middleware
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.url} - Session user: ${
      req.session?.user?.username || "none"
    } - Session ID: ${req.sessionID || "none"}`
  );
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

app.use("/", authRoutes);
app.use("/admin", adminRoutes);

// Handle misdirected /dashboard requests
app.get("/dashboard", (req, res) => {
  console.log("Redirect from /dashboard to /admin/dashboard");
  res.redirect("/admin/dashboard");
});

// Test session route
app.get("/test-session", (req, res) => {
  if (!req.session.testCount) {
    req.session.testCount = 1;
  } else {
    req.session.testCount++;
  }
  res.json({
    sessionId: req.sessionID,
    testCount: req.session.testCount,
    hasUser: !!req.session.user,
    user: req.session.user?.username,
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Page Not Found" });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Initialize database
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
});
