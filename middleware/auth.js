// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  console.log("Auth middleware check:", {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    path: req.path,
    url: req.url,
    user: req.session?.user?.username,
  });

  if (req.session && req.session.user) {
    console.log("Auth successful for:", req.session.user.username);
    return next();
  } else {
    console.log("Auth failed, redirecting to login");
    return res.redirect("/login");
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  } else {
    return res.status(403).render("error", {
      title: "Access Denied",
      message: "You do not have permission to access this page.",
      error: { status: 403 },
    });
  }
};

// Middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect("/admin/dashboard");
  }
  return next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  redirectIfAuthenticated,
};
