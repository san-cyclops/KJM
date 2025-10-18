const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PersonalInfo = require("../models/PersonalInfo");
const FamilyMember = require("../models/FamilyMember");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Apply authentication middleware to all admin routes
router.use(requireAuth);

// Dashboard
router.get("/dashboard", (req, res) => {
  console.log("Admin dashboard accessed by:", req.session.user?.username);

  // Render dashboard content
  const dashboardContent = `
    <!-- Content Header -->
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Dashboard</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                        <li class="breadcrumb-item active">Dashboard</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <!-- Main content -->
    <section class="content">
        <div class="container-fluid">
            <!-- Info boxes -->
            <div class="row">
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="info-box">
                        <span class="info-box-icon bg-info">
                            <i class="fas fa-cog"></i>
                        </span>
                        <div class="info-box-content">
                            <span class="info-box-text">System Status</span>
                            <span class="info-box-number">
                                <i class="fas fa-check-circle text-success"></i>
                                Online
                            </span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                    <div class="info-box">
                        <span class="info-box-icon bg-success">
                            <i class="fas fa-database"></i>
                        </span>
                        <div class="info-box-content">
                            <span class="info-box-text">Database</span>
                            <span class="info-box-number">
                                <i class="fas fa-check-circle text-success"></i>
                                Connected
                            </span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                    <div class="info-box">
                        <span class="info-box-icon bg-warning">
                            <i class="fas fa-user-shield"></i>
                        </span>
                        <div class="info-box-content">
                            <span class="info-box-text">Your Role</span>
                            <span class="info-box-number">
                                <span class="badge bg-${
                                  req.session.user.role === "admin"
                                    ? "primary"
                                    : "secondary"
                                }">
                                    ${req.session.user.role.toUpperCase()}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                    <div class="info-box">
                        <span class="info-box-icon bg-danger">
                            <i class="fas fa-clock"></i>
                        </span>
                        <div class="info-box-content">
                            <span class="info-box-text">Session</span>
                            <span class="info-box-number" id="sessionTime">
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  `;

  res.render("admin/layout", {
    title: "Admin Dashboard",
    user: req.session.user,
    body: dashboardContent,
  });
}); // Users management - List all users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.getAllUsers();

    const usersContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">User Management</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item active">Users</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              ${
                req.session.success
                  ? `
                  <div class="alert alert-success alert-dismissible">
                      <button type="button" class="close" data-dismiss="alert">&times;</button>
                      <i class="fas fa-check"></i> ${req.session.success}
                  </div>
              `
                  : ""
              }
              
              ${
                req.session.error
                  ? `
                  <div class="alert alert-danger alert-dismissible">
                      <button type="button" class="close" data-dismiss="alert">&times;</button>
                      <i class="fas fa-exclamation-triangle"></i> ${req.session.error}
                  </div>
              `
                  : ""
              }

              <div class="card">
                  <div class="card-header">
                      <h3 class="card-title">
                          <i class="fas fa-users me-1"></i>
                          Users List
                      </h3>
                      <div class="card-tools">
                          <a href="/admin/users/create" class="btn btn-primary btn-sm">
                              <i class="fas fa-plus"></i>
                              Add New User
                          </a>
                      </div>
                  </div>
                  <div class="card-body table-responsive p-0">
                      <table class="table table-hover text-nowrap table-bordered">
                          <thead style="background-color: #343a40; color: white;">
                              <tr>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">ID</th>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Username</th>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Email</th>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Role</th>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Created</th>
                                  <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${users
                                .map(
                                  (userItem) => `
                                  <tr>
                                      <td>${userItem.id}</td>
                                      <td>
                                          <strong>${userItem.username}</strong>
                                          ${
                                            userItem.id === req.session.user.id
                                              ? '<span class="badge badge-info ml-1">You</span>'
                                              : ""
                                          }
                                      </td>
                                      <td>${userItem.email}</td>
                                      <td>
                                          <span class="badge badge-${
                                            userItem.role === "admin"
                                              ? "primary"
                                              : "secondary"
                                          }">
                                              ${userItem.role.toUpperCase()}
                                          </span>
                                      </td>
                                      <td>
                                          <small class="text-muted">${new Date(
                                            userItem.created_at
                                          ).toLocaleDateString()}</small>
                                      </td>
                                      <td>
                                          <div class="btn-group">
                                              <a href="/admin/users/${
                                                userItem.id
                                              }/edit" class="btn btn-default btn-sm" title="Edit User">
                                                  <i class="fas fa-edit"></i>
                                              </a>
                                              ${
                                                userItem.id !==
                                                req.session.user.id
                                                  ? `
                                                  <button type="button" class="btn btn-danger btn-sm" onclick="confirmDelete(${userItem.id}, '${userItem.username}')" title="Delete User">
                                                      <i class="fas fa-trash"></i>
                                                  </button>
                                              `
                                                  : ""
                                              }
                                          </div>
                                      </td>
                                  </tr>
                              `
                                )
                                .join("")}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </section>

      <!-- Delete Modal -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h4 class="modal-title">
                          <i class="fas fa-exclamation-triangle text-warning"></i>
                          Confirm Delete
                      </h4>
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                  </div>
                  <div class="modal-body">
                      <p>Are you sure you want to delete user <strong id="deleteUsername"></strong>?</p>
                      <p class="text-danger"><small>This action cannot be undone.</small></p>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                      <form id="deleteForm" method="POST" style="display: inline;">
                          <input type="hidden" name="_method" value="DELETE">
                          <button type="submit" class="btn btn-danger">
                              <i class="fas fa-trash"></i> Delete User
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      </div>

      <script>
      function confirmDelete(userId, username) {
          document.getElementById('deleteUsername').textContent = username;
          document.getElementById('deleteForm').action = '/admin/users/' + userId;
          $('#deleteModal').modal('show');
      }
      </script>
    `;

    res.render("admin/layout", {
      title: "User Management",
      user: req.session.user,
      body: usersContent,
    });

    // Clear session messages
    delete req.session.success;
    delete req.session.error;
  } catch (error) {
    console.error("Error fetching users:", error);
    const errorContent = `
      <div class="content-header">
          <div class="container-fluid">
              <h1 class="m-0">User Management</h1>
          </div>
      </div>
      <section class="content">
          <div class="container-fluid">
              <div class="alert alert-danger">
                  <h4><i class="fas fa-ban"></i> Error!</h4>
                  Error loading users: ${error.message}
              </div>
          </div>
      </section>
    `;

    res.render("admin/layout", {
      title: "User Management",
      user: req.session.user,
      body: errorContent,
    });
  }
});

// Show create user form
router.get("/users/create", requireAdmin, (req, res) => {
  res.render("admin/user-form", {
    title: "Create User",
    user: req.session.user,
    formUser: null,
    isEdit: false,
    error: null,
  });
});

// Create user
router.post("/users", requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.render("admin/user-form", {
        title: "Create User",
        user: req.session.user,
        formUser: req.body,
        isEdit: false,
        error: "All fields are required",
      });
    }

    await User.createUser({ username, email, password, role });
    req.session.success = "User created successfully";
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error creating user:", error);
    let errorMessage = "Error creating user";

    if (error.code === "ER_DUP_ENTRY") {
      errorMessage = "Username or email already exists";
    }

    res.render("admin/user-form", {
      title: "Create User",
      user: req.session.user,
      formUser: req.body,
      isEdit: false,
      error: errorMessage,
    });
  }
});

// Show edit user form
router.get("/users/:id/edit", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const userToEdit = await User.getUserById(userId);

    if (!userToEdit) {
      req.session.error = "User not found";
      return res.redirect("/admin/users");
    }

    res.render("admin/user-form", {
      title: "Edit User",
      user: req.session.user,
      formUser: userToEdit,
      isEdit: true,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching user for edit:", error);
    req.session.error = "Error loading user";
    res.redirect("/admin/users");
  }
});

// Update user
router.put("/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, role, password } = req.body;

    if (!username || !email) {
      const userToEdit = await User.getUserById(userId);
      return res.render("admin/user-form", {
        title: "Edit User",
        user: req.session.user,
        formUser: { ...userToEdit, ...req.body },
        isEdit: true,
        error: "Username and email are required",
      });
    }

    // Update user basic info
    const updated = await User.updateUser(userId, { username, email, role });

    if (!updated) {
      req.session.error = "User not found or not updated";
      return res.redirect("/admin/users");
    }

    // Update password if provided
    if (password && password.trim() !== "") {
      await User.updateUserPassword(userId, password);
    }

    req.session.success = "User updated successfully";
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error updating user:", error);
    let errorMessage = "Error updating user";

    if (error.code === "ER_DUP_ENTRY") {
      errorMessage = "Username or email already exists";
    }

    try {
      const userToEdit = await User.getUserById(req.params.id);
      res.render("admin/user-form", {
        title: "Edit User",
        user: req.session.user,
        formUser: { ...userToEdit, ...req.body },
        isEdit: true,
        error: errorMessage,
      });
    } catch {
      req.session.error = errorMessage;
      res.redirect("/admin/users");
    }
  }
});

// Delete user
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (parseInt(userId) === req.session.user.id) {
      req.session.error = "You cannot delete your own account";
      return res.redirect("/admin/users");
    }

    const deleted = await User.deleteUser(userId);

    if (deleted) {
      req.session.success = "User deleted successfully";
    } else {
      req.session.error = "User not found or not deleted";
    }

    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    req.session.error = "Error deleting user";
    res.redirect("/admin/users");
  }
});

// Personal Info Routes

// List all personal info entries
router.get("/personal-info", async (req, res) => {
  console.log("Personal info list accessed by:", req.session.user?.username);

  try {
    const personalInfoList = await PersonalInfo.getAll();

    const personalInfoContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">Personal Information Management</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item active">Personal Info</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header">
                              <h3 class="card-title">Personal Information Records</h3>
                              <div class="card-tools">
                                  <a href="/admin/personal-info/create" class="btn btn-primary btn-sm">
                                      <i class="fas fa-plus"></i> Add New Record
                                  </a>
                              </div>
                          </div>
                          <div class="card-body">
                              ${
                                req.session.error
                                  ? `<div class="alert alert-danger">${req.session.error}</div>`
                                  : ""
                              }
                              ${
                                req.session.success
                                  ? `<div class="alert alert-success">${req.session.success}</div>`
                                  : ""
                              }
                              
                              <div class="table-responsive">
                                  <table class="table table-bordered table-striped table-hover">
                                      <thead style="background-color: #343a40; color: white;">
                                          <tr>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Date</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Full Name</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Address</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Mobile</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Identity Card</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Civil Status</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Profession</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;" width="150">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${personalInfoList
                                            .map(
                                              (info) => `
                                              <tr>
                                                  <td>${new Date(
                                                    info.date
                                                  ).toLocaleDateString()}</td>
                                                  <td>${info.full_name}</td>
                                                  <td>
                                                      ${[
                                                        info.permanent_address_no,
                                                        info.permanent_address_street,
                                                        info.permanent_address_area,
                                                        info.permanent_address_city,
                                                      ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                  </td>
                                                  <td>${
                                                    info.mobile_number || "N/A"
                                                  }</td>
                                                  <td>${
                                                    info.identity_card_number ||
                                                    "N/A"
                                                  }</td>
                                                  <td>
                                                      <span class="badge ${
                                                        info.civil_status ===
                                                        "Married"
                                                          ? "bg-success"
                                                          : info.civil_status ===
                                                            "Single"
                                                          ? "bg-primary"
                                                          : "bg-secondary"
                                                      }">
                                                          ${info.civil_status}
                                                      </span>
                                                  </td>
                                                  <td>${
                                                    info.profession || "N/A"
                                                  }</td>
                                                  <td>
                                                      <div class="btn-group btn-group-sm" role="group">
                                                          <a href="/admin/personal-info/${
                                                            info.id
                                                          }/family-members" class="btn btn-info btn-sm" title="Manage Family Members">
                                                              <i class="fas fa-users"></i>
                                                          </a>
                                                          <a href="/admin/personal-info/edit/${
                                                            info.id
                                                          }" class="btn btn-warning btn-sm" title="Edit">
                                                              <i class="fas fa-edit"></i>
                                                          </a>
                                                          <form style="display: inline;" method="POST" action="/admin/personal-info/delete/${
                                                            info.id
                                                          }?_method=DELETE" 
                                                                onsubmit="return confirm('Are you sure you want to delete this record?')">
                                                              <button type="submit" class="btn btn-danger btn-sm" title="Delete">
                                                                  <i class="fas fa-trash"></i>
                                                              </button>
                                                          </form>
                                                      </div>
                                                  </td>
                                              </tr>
                                          `
                                            )
                                            .join("")}
                                          ${
                                            personalInfoList.length === 0
                                              ? '<tr><td colspan="8" class="text-center">No records found</td></tr>'
                                              : ""
                                          }
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    `;

    // Clear session messages
    delete req.session.error;
    delete req.session.success;

    res.render("admin/layout", {
      title: "Personal Information",
      user: req.session.user,
      body: personalInfoContent,
    });
  } catch (error) {
    console.error("Error fetching personal info:", error);
    req.session.error = "Error fetching personal information";
    res.redirect("/admin/dashboard");
  }
});

// Create personal info form
router.get("/personal-info/create", (req, res) => {
  const createFormContent = `
    <!-- Content Header -->
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Add Personal Information</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                        <li class="breadcrumb-item"><a href="/admin/personal-info">Personal Info</a></li>
                        <li class="breadcrumb-item active">Add New</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <!-- Main content -->
    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">New Personal Information Record</h3>
                        </div>
                        <form method="POST" action="/admin/personal-info/create">
                            <div class="card-body">
                                ${
                                  req.session.error
                                    ? `<div class="alert alert-danger">${req.session.error}</div>`
                                    : ""
                                }
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="date" class="form-label">Date <span class="text-danger">*</span></label>
                                            <input type="date" class="form-control" id="date" name="date" 
                                                   value="${
                                                     new Date()
                                                       .toISOString()
                                                       .split("T")[0]
                                                   }" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="full_name" class="form-label">Full Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" id="full_name" name="full_name" required>
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Permanent Address</h5>
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label for="permanent_address_no" class="form-label">House No</label>
                                            <input type="text" class="form-control" id="permanent_address_no" name="permanent_address_no">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label for="permanent_address_street" class="form-label">Street</label>
                                            <input type="text" class="form-control" id="permanent_address_street" name="permanent_address_street">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label for="permanent_address_area" class="form-label">Area</label>
                                            <input type="text" class="form-control" id="permanent_address_area" name="permanent_address_area">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="mb-3">
                                            <label for="permanent_address_city" class="form-label">City</label>
                                            <input type="text" class="form-control" id="permanent_address_city" name="permanent_address_city">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="mobile_number" class="form-label">Mobile Number</label>
                                            <input type="tel" class="form-control" id="mobile_number" name="mobile_number">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="identity_card_number" class="form-label">Identity Card Number</label>
                                            <input type="text" class="form-control" id="identity_card_number" name="identity_card_number">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="whatsapp_number" class="form-label">WhatsApp Number</label>
                                            <input type="tel" class="form-control" id="whatsapp_number" name="whatsapp_number">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="civil_status" class="form-label">Civil Status</label>
                                            <select class="form-control" id="civil_status" name="civil_status">
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Widowed">Widowed</option>
                                                <option value="Divorced">Divorced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="residence" class="form-label">Residence</label>
                                            <select class="form-control" id="residence" name="residence">
                                                <option value="Own">Own</option>
                                                <option value="Rent">Rent</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="profession" class="form-label">Profession</label>
                                            <input type="text" class="form-control" id="profession" name="profession">
                                        </div>
                                    </div>
                                </div>

                                <div id="residence-owner-fields" class="row" style="display: none;">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="residence_owner_name" class="form-label">Residence Owner Name</label>
                                            <input type="text" class="form-control" id="residence_owner_name" name="residence_owner_name">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="residence_owner_mobile" class="form-label">Residence Owner Mobile</label>
                                            <input type="tel" class="form-control" id="residence_owner_mobile" name="residence_owner_mobile">
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Additional Information</h5>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label for="special_need_child_details" class="form-label">Details about special need child (if applicable)</label>
                                            <textarea class="form-control" id="special_need_child_details" name="special_need_child_details" rows="2" placeholder="N/A if not applicable"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Non-Related People Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="no_of_non_related_people" class="form-label">No of non-related people</label>
                                            <input type="number" class="form-control" id="no_of_non_related_people" name="no_of_non_related_people" min="0" value="0">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="nrp1_full_name" class="form-label">NRP 1 Full Name</label>
                                            <input type="text" class="form-control" id="nrp1_full_name" name="nrp1_full_name" placeholder="N/A if not applicable">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="nrp1_nic_number" class="form-label">NRP1 NIC Number</label>
                                            <input type="text" class="form-control" id="nrp1_nic_number" name="nrp1_nic_number" placeholder="N/A if not applicable">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="nrp1_purpose_of_staying" class="form-label">NRP1 Purpose of Staying</label>
                                            <input type="text" class="form-control" id="nrp1_purpose_of_staying" name="nrp1_purpose_of_staying" placeholder="N/A if not applicable">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label for="nrp1_address" class="form-label">NRP1 Address</label>
                                            <textarea class="form-control" id="nrp1_address" name="nrp1_address" rows="2" placeholder="N/A if not applicable"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Sandha/Donation Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="sandha_membership_amount" class="form-label">Sandha/Membership Amount</label>
                                            <div class="input-group">
                                                <span class="input-group-text">Rs.</span>
                                                <input type="number" class="form-control" id="sandha_membership_amount" name="sandha_membership_amount" step="0.01" min="0" value="300.00">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="paying_sandha_other_masjidh" class="form-label">Are you paying Sandha or Donation to any other masjidh</label>
                                            <select class="form-control" id="paying_sandha_other_masjidh" name="paying_sandha_other_masjidh">
                                                <option value="No">No</option>
                                                <option value="Yes">Yes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label for="other_masjidh_sandha_details" class="form-label">Details of Sandha for any other masjidhs</label>
                                            <textarea class="form-control" id="other_masjidh_sandha_details" name="other_masjidh_sandha_details" rows="3" placeholder="N/A if not applicable"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Record
                                </button>
                                <a href="/admin/personal-info" class="btn btn-secondary">
                                    <i class="fas fa-times"></i> Cancel
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Show/hide residence owner fields based on residence type
        document.getElementById('residence').addEventListener('change', function() {
            const ownerFields = document.getElementById('residence-owner-fields');
            if (this.value === 'Rent') {
                ownerFields.style.display = 'flex';
                document.getElementById('residence_owner_name').required = true;
            } else {
                ownerFields.style.display = 'none';
                document.getElementById('residence_owner_name').required = false;
                document.getElementById('residence_owner_name').value = '';
                document.getElementById('residence_owner_mobile').value = '';
            }
        });
    </script>
  `;

  // Clear session error
  delete req.session.error;

  res.render("admin/layout", {
    title: "Add Personal Information",
    user: req.session.user,
    body: createFormContent,
  });
});

// Create personal info POST
router.post("/personal-info/create", async (req, res) => {
  try {
    const personalInfoData = {
      date: req.body.date,
      full_name: req.body.full_name,
      permanent_address_no: req.body.permanent_address_no || null,
      permanent_address_street: req.body.permanent_address_street || null,
      permanent_address_area: req.body.permanent_address_area || null,
      permanent_address_city: req.body.permanent_address_city || null,
      mobile_number: req.body.mobile_number || null,
      identity_card_number: req.body.identity_card_number || null,
      whatsapp_number: req.body.whatsapp_number || null,
      civil_status: req.body.civil_status || "Single",
      residence: req.body.residence || "Own",
      residence_owner_name: req.body.residence_owner_name || null,
      residence_owner_mobile: req.body.residence_owner_mobile || null,
      profession: req.body.profession || null,
      special_need_child_details: req.body.special_need_child_details || "N/A",
      no_of_non_related_people: req.body.no_of_non_related_people || 0,
      nrp1_full_name: req.body.nrp1_full_name || "N/A",
      nrp1_nic_number: req.body.nrp1_nic_number || "N/A",
      nrp1_address: req.body.nrp1_address || "N/A",
      nrp1_purpose_of_staying: req.body.nrp1_purpose_of_staying || "N/A",
      sandha_membership_amount: req.body.sandha_membership_amount || 0.0,
      paying_sandha_other_masjidh: req.body.paying_sandha_other_masjidh || "No",
      other_masjidh_sandha_details:
        req.body.other_masjidh_sandha_details || "N/A",
    };

    // Check if identity card already exists
    if (personalInfoData.identity_card_number) {
      const existingRecord = await PersonalInfo.findByIdentityCard(
        personalInfoData.identity_card_number
      );
      if (existingRecord) {
        req.session.error = "Identity card number already exists";
        return res.redirect("/admin/personal-info/create");
      }
    }

    const newId = await PersonalInfo.create(personalInfoData);

    if (newId) {
      req.session.success = "Personal information record created successfully";
      res.redirect("/admin/personal-info");
    } else {
      req.session.error = "Failed to create personal information record";
      res.redirect("/admin/personal-info/create");
    }
  } catch (error) {
    console.error("Error creating personal info:", error);
    req.session.error = "Error creating personal information record";
    res.redirect("/admin/personal-info/create");
  }
});

// Edit personal info form
router.get("/personal-info/edit/:id", async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.getById(req.params.id);

    if (!personalInfo) {
      req.session.error = "Personal information record not found";
      return res.redirect("/admin/personal-info");
    }

    const editFormContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">Edit Personal Information</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info">Personal Info</a></li>
                          <li class="breadcrumb-item active">Edit</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header">
                              <h3 class="card-title">Edit Personal Information Record</h3>
                          </div>
                          <form method="POST" action="/admin/personal-info/edit/${
                            personalInfo.id
                          }?_method=PUT">
                              <div class="card-body">
                                  ${
                                    req.session.error
                                      ? `<div class="alert alert-danger">${req.session.error}</div>`
                                      : ""
                                  }
                                  
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="date" class="form-label">Date <span class="text-danger">*</span></label>
                                              <input type="date" class="form-control" id="date" name="date" 
                                                     value="${
                                                       personalInfo.date
                                                         ? new Date(
                                                             personalInfo.date
                                                           )
                                                             .toISOString()
                                                             .split("T")[0]
                                                         : ""
                                                     }" required>
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="full_name" class="form-label">Full Name <span class="text-danger">*</span></label>
                                              <input type="text" class="form-control" id="full_name" name="full_name" 
                                                     value="${
                                                       personalInfo.full_name ||
                                                       ""
                                                     }" required>
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Permanent Address</h5>
                                  <div class="row">
                                      <div class="col-md-3">
                                          <div class="mb-3">
                                              <label for="permanent_address_no" class="form-label">House No</label>
                                              <input type="text" class="form-control" id="permanent_address_no" name="permanent_address_no"
                                                     value="${
                                                       personalInfo.permanent_address_no ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-3">
                                          <div class="mb-3">
                                              <label for="permanent_address_street" class="form-label">Street</label>
                                              <input type="text" class="form-control" id="permanent_address_street" name="permanent_address_street"
                                                     value="${
                                                       personalInfo.permanent_address_street ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-3">
                                          <div class="mb-3">
                                              <label for="permanent_address_area" class="form-label">Area</label>
                                              <input type="text" class="form-control" id="permanent_address_area" name="permanent_address_area"
                                                     value="${
                                                       personalInfo.permanent_address_area ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-3">
                                          <div class="mb-3">
                                              <label for="permanent_address_city" class="form-label">City</label>
                                              <input type="text" class="form-control" id="permanent_address_city" name="permanent_address_city"
                                                     value="${
                                                       personalInfo.permanent_address_city ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="mobile_number" class="form-label">Mobile Number</label>
                                              <input type="tel" class="form-control" id="mobile_number" name="mobile_number"
                                                     value="${
                                                       personalInfo.mobile_number ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="identity_card_number" class="form-label">Identity Card Number</label>
                                              <input type="text" class="form-control" id="identity_card_number" name="identity_card_number"
                                                     value="${
                                                       personalInfo.identity_card_number ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="whatsapp_number" class="form-label">WhatsApp Number</label>
                                              <input type="tel" class="form-control" id="whatsapp_number" name="whatsapp_number"
                                                     value="${
                                                       personalInfo.whatsapp_number ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="civil_status" class="form-label">Civil Status</label>
                                              <select class="form-control" id="civil_status" name="civil_status">
                                                  <option value="Single" ${
                                                    personalInfo.civil_status ===
                                                    "Single"
                                                      ? "selected"
                                                      : ""
                                                  }>Single</option>
                                                  <option value="Married" ${
                                                    personalInfo.civil_status ===
                                                    "Married"
                                                      ? "selected"
                                                      : ""
                                                  }>Married</option>
                                                  <option value="Widowed" ${
                                                    personalInfo.civil_status ===
                                                    "Widowed"
                                                      ? "selected"
                                                      : ""
                                                  }>Widowed</option>
                                                  <option value="Divorced" ${
                                                    personalInfo.civil_status ===
                                                    "Divorced"
                                                      ? "selected"
                                                      : ""
                                                  }>Divorced</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="residence" class="form-label">Residence</label>
                                              <select class="form-control" id="residence" name="residence">
                                                  <option value="Own" ${
                                                    personalInfo.residence ===
                                                    "Own"
                                                      ? "selected"
                                                      : ""
                                                  }>Own</option>
                                                  <option value="Rent" ${
                                                    personalInfo.residence ===
                                                    "Rent"
                                                      ? "selected"
                                                      : ""
                                                  }>Rent</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="profession" class="form-label">Profession</label>
                                              <input type="text" class="form-control" id="profession" name="profession"
                                                     value="${
                                                       personalInfo.profession ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div id="residence-owner-fields" class="row" style="display: ${
                                    personalInfo.residence === "Rent"
                                      ? "flex"
                                      : "none"
                                  };">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="residence_owner_name" class="form-label">Residence Owner Name</label>
                                              <input type="text" class="form-control" id="residence_owner_name" name="residence_owner_name"
                                                     value="${
                                                       personalInfo.residence_owner_name ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="residence_owner_mobile" class="form-label">Residence Owner Mobile</label>
                                              <input type="tel" class="form-control" id="residence_owner_mobile" name="residence_owner_mobile"
                                                     value="${
                                                       personalInfo.residence_owner_mobile ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Additional Information</h5>
                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="special_need_child_details" class="form-label">Details about special need child (if applicable)</label>
                                              <textarea class="form-control" id="special_need_child_details" name="special_need_child_details" rows="2">${
                                                personalInfo.special_need_child_details ||
                                                ""
                                              }</textarea>
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Non-Related People Information</h5>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="no_of_non_related_people" class="form-label">No of non-related people</label>
                                              <input type="number" class="form-control" id="no_of_non_related_people" name="no_of_non_related_people" min="0" value="${
                                                personalInfo.no_of_non_related_people ||
                                                0
                                              }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="nrp1_full_name" class="form-label">NRP 1 Full Name</label>
                                              <input type="text" class="form-control" id="nrp1_full_name" name="nrp1_full_name" value="${
                                                personalInfo.nrp1_full_name ||
                                                ""
                                              }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="nrp1_nic_number" class="form-label">NRP1 NIC Number</label>
                                              <input type="text" class="form-control" id="nrp1_nic_number" name="nrp1_nic_number" value="${
                                                personalInfo.nrp1_nic_number ||
                                                ""
                                              }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="nrp1_purpose_of_staying" class="form-label">NRP1 Purpose of Staying</label>
                                              <input type="text" class="form-control" id="nrp1_purpose_of_staying" name="nrp1_purpose_of_staying" value="${
                                                personalInfo.nrp1_purpose_of_staying ||
                                                ""
                                              }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="nrp1_address" class="form-label">NRP1 Address</label>
                                              <textarea class="form-control" id="nrp1_address" name="nrp1_address" rows="2">${
                                                personalInfo.nrp1_address || ""
                                              }</textarea>
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Sandha/Donation Information</h5>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="sandha_membership_amount" class="form-label">Sandha/Membership Amount</label>
                                              <div class="input-group">
                                                  <span class="input-group-text">Rs.</span>
                                                  <input type="number" class="form-control" id="sandha_membership_amount" name="sandha_membership_amount" step="0.01" min="0" value="${
                                                    personalInfo.sandha_membership_amount ||
                                                    0
                                                  }">
                                              </div>
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="paying_sandha_other_masjidh" class="form-label">Are you paying Sandha or Donation to any other masjidh</label>
                                              <select class="form-control" id="paying_sandha_other_masjidh" name="paying_sandha_other_masjidh">
                                                  <option value="No" ${
                                                    personalInfo.paying_sandha_other_masjidh ===
                                                    "No"
                                                      ? "selected"
                                                      : ""
                                                  }>No</option>
                                                  <option value="Yes" ${
                                                    personalInfo.paying_sandha_other_masjidh ===
                                                    "Yes"
                                                      ? "selected"
                                                      : ""
                                                  }>Yes</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="other_masjidh_sandha_details" class="form-label">Details of Sandha for any other masjidhs</label>
                                              <textarea class="form-control" id="other_masjidh_sandha_details" name="other_masjidh_sandha_details" rows="3">${
                                                personalInfo.other_masjidh_sandha_details ||
                                                ""
                                              }</textarea>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div class="card-footer">
                                  <button type="submit" class="btn btn-primary">
                                      <i class="fas fa-save"></i> Update Record
                                  </button>
                                  <a href="/admin/personal-info" class="btn btn-secondary">
                                      <i class="fas fa-times"></i> Cancel
                                  </a>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <script>
          // Show/hide residence owner fields based on residence type
          document.getElementById('residence').addEventListener('change', function() {
              const ownerFields = document.getElementById('residence-owner-fields');
              if (this.value === 'Rent') {
                  ownerFields.style.display = 'flex';
                  document.getElementById('residence_owner_name').required = true;
              } else {
                  ownerFields.style.display = 'none';
                  document.getElementById('residence_owner_name').required = false;
                  document.getElementById('residence_owner_name').value = '';
                  document.getElementById('residence_owner_mobile').value = '';
              }
          });
      </script>
    `;

    // Clear session error
    delete req.session.error;

    res.render("admin/layout", {
      title: "Edit Personal Information",
      user: req.session.user,
      body: editFormContent,
    });
  } catch (error) {
    console.error("Error fetching personal info for edit:", error);
    req.session.error = "Error fetching personal information record";
    res.redirect("/admin/personal-info");
  }
});

// Update personal info PUT
router.put("/personal-info/edit/:id", async (req, res) => {
  try {
    const personalInfoData = {
      date: req.body.date,
      full_name: req.body.full_name,
      permanent_address_no: req.body.permanent_address_no || null,
      permanent_address_street: req.body.permanent_address_street || null,
      permanent_address_area: req.body.permanent_address_area || null,
      permanent_address_city: req.body.permanent_address_city || null,
      mobile_number: req.body.mobile_number || null,
      identity_card_number: req.body.identity_card_number || null,
      whatsapp_number: req.body.whatsapp_number || null,
      civil_status: req.body.civil_status || "Single",
      residence: req.body.residence || "Own",
      residence_owner_name: req.body.residence_owner_name || null,
      residence_owner_mobile: req.body.residence_owner_mobile || null,
      profession: req.body.profession || null,
      special_need_child_details: req.body.special_need_child_details || "N/A",
      no_of_non_related_people: req.body.no_of_non_related_people || 0,
      nrp1_full_name: req.body.nrp1_full_name || "N/A",
      nrp1_nic_number: req.body.nrp1_nic_number || "N/A",
      nrp1_address: req.body.nrp1_address || "N/A",
      nrp1_purpose_of_staying: req.body.nrp1_purpose_of_staying || "N/A",
      sandha_membership_amount: req.body.sandha_membership_amount || 0.0,
      paying_sandha_other_masjidh: req.body.paying_sandha_other_masjidh || "No",
      other_masjidh_sandha_details:
        req.body.other_masjidh_sandha_details || "N/A",
    };

    // Check if identity card already exists (excluding current record)
    if (personalInfoData.identity_card_number) {
      const existingRecord = await PersonalInfo.findByIdentityCard(
        personalInfoData.identity_card_number
      );
      if (existingRecord && existingRecord.id != req.params.id) {
        req.session.error = "Identity card number already exists";
        return res.redirect(`/admin/personal-info/edit/${req.params.id}`);
      }
    }

    const updated = await PersonalInfo.update(req.params.id, personalInfoData);

    if (updated) {
      req.session.success = "Personal information record updated successfully";
      res.redirect("/admin/personal-info");
    } else {
      req.session.error = "Failed to update personal information record";
      res.redirect(`/admin/personal-info/edit/${req.params.id}`);
    }
  } catch (error) {
    console.error("Error updating personal info:", error);
    req.session.error = "Error updating personal information record";
    res.redirect(`/admin/personal-info/edit/${req.params.id}`);
  }
});

// Delete personal info
router.delete("/personal-info/delete/:id", async (req, res) => {
  try {
    const deleted = await PersonalInfo.delete(req.params.id);

    if (deleted) {
      req.session.success = "Personal information record deleted successfully";
    } else {
      req.session.error =
        "Personal information record not found or not deleted";
    }

    res.redirect("/admin/personal-info");
  } catch (error) {
    console.error("Error deleting personal info:", error);
    req.session.error = "Error deleting personal information record";
    res.redirect("/admin/personal-info");
  }
});

// Family Members Routes

// List family members for a personal info record
router.get(
  "/personal-info/:personalInfoId/family-members",
  async (req, res) => {
    try {
      const personalInfo = await PersonalInfo.getById(
        req.params.personalInfoId
      );

      if (!personalInfo) {
        req.session.error = "Personal information record not found";
        return res.redirect("/admin/personal-info");
      }

      const familyMembers = await FamilyMember.getAllByPersonalInfoId(
        req.params.personalInfoId
      );

      const familyMembersContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">Family Members - ${
                        personalInfo.full_name
                      }</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info">Personal Info</a></li>
                          <li class="breadcrumb-item active">Family Members</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header">
                              <h3 class="card-title">Family Members for ${
                                personalInfo.full_name
                              }</h3>
                              <div class="card-tools">
                                  <a href="/admin/personal-info/${
                                    personalInfo.id
                                  }/family-members/create" class="btn btn-primary btn-sm">
                                      <i class="fas fa-plus"></i> Add Family Member
                                  </a>
                                  <a href="/admin/personal-info" class="btn btn-secondary btn-sm">
                                      <i class="fas fa-arrow-left"></i> Back to Personal Info
                                  </a>
                              </div>
                          </div>
                          <div class="card-body">
                              ${
                                req.session.error
                                  ? `<div class="alert alert-danger">${req.session.error}</div>`
                                  : ""
                              }
                              ${
                                req.session.success
                                  ? `<div class="alert alert-success">${req.session.success}</div>`
                                  : ""
                              }
                              
                              <div class="table-responsive">
                                  <table class="table table-bordered table-striped table-hover">
                                      <thead style="background-color: #343a40; color: white;">
                                          <tr>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Name</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Relationship</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Date of Birth</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">School/Education</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Occupation</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Contact</th>
                                              <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;" width="120">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${familyMembers
                                            .map(
                                              (member) => `
                                              <tr>
                                                  <td>${member.name}</td>
                                                  <td>
                                                      <span class="badge ${
                                                        member.relationship ===
                                                          "Wife" ||
                                                        member.relationship ===
                                                          "Husband"
                                                          ? "bg-success"
                                                          : member.relationship ===
                                                              "Child" ||
                                                            member.relationship ===
                                                              "Son" ||
                                                            member.relationship ===
                                                              "Daughter"
                                                          ? "bg-info"
                                                          : "bg-secondary"
                                                      }">
                                                          ${member.relationship}
                                                      </span>
                                                  </td>
                                                  <td>${
                                                    member.date_of_birth
                                                      ? new Date(
                                                          member.date_of_birth
                                                        ).toLocaleDateString()
                                                      : "N/A"
                                                  }</td>
                                                  <td>
                                                      ${
                                                        member.school_name &&
                                                        member.school_name !==
                                                          "N/A"
                                                          ? `${member.school_name}`
                                                          : ""
                                                      }
                                                      ${
                                                        member.grade &&
                                                        member.grade !== "N/A"
                                                          ? ` (${member.grade})`
                                                          : ""
                                                      }
                                                      ${
                                                        member.quran_madrasa &&
                                                        member.quran_madrasa !==
                                                          "N/A"
                                                          ? `<br><small class="text-muted">Quran: ${member.quran_madrasa}</small>`
                                                          : ""
                                                      }
                                                      ${
                                                        (!member.school_name ||
                                                          member.school_name ===
                                                            "N/A") &&
                                                        (!member.grade ||
                                                          member.grade ===
                                                            "N/A") &&
                                                        (!member.quran_madrasa ||
                                                          member.quran_madrasa ===
                                                            "N/A")
                                                          ? "N/A"
                                                          : ""
                                                      }
                                                  </td>
                                                  <td>${
                                                    member.occupation &&
                                                    member.occupation !== "N/A"
                                                      ? member.occupation
                                                      : "N/A"
                                                  }</td>
                                                  <td>${
                                                    member.contact_number ||
                                                    "N/A"
                                                  }</td>
                                                  <td>
                                                      <div class="btn-group btn-group-sm" role="group">
                                                          <a href="/admin/personal-info/${
                                                            personalInfo.id
                                                          }/family-members/edit/${
                                                member.id
                                              }" class="btn btn-warning btn-sm" title="Edit">
                                                              <i class="fas fa-edit"></i>
                                                          </a>
                                                          <form style="display: inline;" method="POST" action="/admin/personal-info/${
                                                            personalInfo.id
                                                          }/family-members/delete/${
                                                member.id
                                              }?_method=DELETE" 
                                                                onsubmit="return confirm('Are you sure you want to delete this family member?')">
                                                              <button type="submit" class="btn btn-danger btn-sm" title="Delete">
                                                                  <i class="fas fa-trash"></i>
                                                              </button>
                                                          </form>
                                                      </div>
                                                  </td>
                                              </tr>
                                          `
                                            )
                                            .join("")}
                                          ${
                                            familyMembers.length === 0
                                              ? '<tr><td colspan="7" class="text-center">No family members found</td></tr>'
                                              : ""
                                          }
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    `;

      // Clear session messages
      delete req.session.error;
      delete req.session.success;

      res.render("admin/layout", {
        title: "Family Members",
        user: req.session.user,
        body: familyMembersContent,
      });
    } catch (error) {
      console.error("Error fetching family members:", error);
      req.session.error = "Error fetching family members";
      res.redirect("/admin/personal-info");
    }
  }
);

// Create family member form
router.get(
  "/personal-info/:personalInfoId/family-members/create",
  async (req, res) => {
    try {
      const personalInfo = await PersonalInfo.getById(
        req.params.personalInfoId
      );

      if (!personalInfo) {
        req.session.error = "Personal information record not found";
        return res.redirect("/admin/personal-info");
      }

      const createFamilyMemberContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">Add Family Member</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info">Personal Info</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info/${
                            personalInfo.id
                          }/family-members">Family Members</a></li>
                          <li class="breadcrumb-item active">Add New</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header">
                              <h3 class="card-title">Add Family Member for ${
                                personalInfo.full_name
                              }</h3>
                          </div>
                          <form method="POST" action="/admin/personal-info/${
                            personalInfo.id
                          }/family-members/create">
                              <div class="card-body">
                                  ${
                                    req.session.error
                                      ? `<div class="alert alert-danger">${req.session.error}</div>`
                                      : ""
                                  }
                                  
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                                              <input type="text" class="form-control" id="name" name="name" required>
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="relationship" class="form-label">Relationship <span class="text-danger">*</span></label>
                                              <select class="form-control" id="relationship" name="relationship" required>
                                                  <option value="">Select Relationship</option>
                                                  <option value="Wife">Wife</option>
                                                  <option value="Husband">Husband</option>
                                                  <option value="Child">Child</option>
                                                  <option value="Son">Son</option>
                                                  <option value="Daughter">Daughter</option>
                                                  <option value="Father">Father</option>
                                                  <option value="Mother">Mother</option>
                                                  <option value="Brother">Brother</option>
                                                  <option value="Sister">Sister</option>
                                                  <option value="Other">Other</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="date_of_birth" class="form-label">Date of Birth</label>
                                              <input type="date" class="form-control" id="date_of_birth" name="date_of_birth">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="contact_number" class="form-label">Contact Number</label>
                                              <input type="tel" class="form-control" id="contact_number" name="contact_number">
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Education Details</h5>
                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="school_name" class="form-label">School Name</label>
                                              <input type="text" class="form-control" id="school_name" name="school_name" placeholder="N/A if not applicable">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="grade" class="form-label">Grade/Class</label>
                                              <input type="text" class="form-control" id="grade" name="grade" placeholder="N/A if not applicable">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="quran_madrasa" class="form-label">Quran Madrasa</label>
                                              <input type="text" class="form-control" id="quran_madrasa" name="quran_madrasa" placeholder="N/A if not applicable">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="occupation" class="form-label">Occupation</label>
                                              <input type="text" class="form-control" id="occupation" name="occupation" placeholder="N/A if not applicable">
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div class="card-footer">
                                  <button type="submit" class="btn btn-primary">
                                      <i class="fas fa-save"></i> Save Family Member
                                  </button>
                                  <a href="/admin/personal-info/${
                                    personalInfo.id
                                  }/family-members" class="btn btn-secondary">
                                      <i class="fas fa-times"></i> Cancel
                                  </a>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    `;

      // Clear session error
      delete req.session.error;

      res.render("admin/layout", {
        title: "Add Family Member",
        user: req.session.user,
        body: createFamilyMemberContent,
      });
    } catch (error) {
      console.error("Error loading create family member form:", error);
      req.session.error = "Error loading form";
      res.redirect("/admin/personal-info");
    }
  }
);

// Create family member POST
router.post(
  "/personal-info/:personalInfoId/family-members/create",
  async (req, res) => {
    try {
      const familyMemberData = {
        personal_info_id: req.params.personalInfoId,
        name: req.body.name,
        relationship: req.body.relationship,
        date_of_birth: req.body.date_of_birth || null,
        school_name: req.body.school_name || "N/A",
        grade: req.body.grade || "N/A",
        quran_madrasa: req.body.quran_madrasa || "N/A",
        occupation: req.body.occupation || "N/A",
        contact_number: req.body.contact_number || null,
      };

      const newId = await FamilyMember.create(familyMemberData);

      if (newId) {
        req.session.success = "Family member added successfully";
        res.redirect(
          `/admin/personal-info/${req.params.personalInfoId}/family-members`
        );
      } else {
        req.session.error = "Failed to add family member";
        res.redirect(
          `/admin/personal-info/${req.params.personalInfoId}/family-members/create`
        );
      }
    } catch (error) {
      console.error("Error creating family member:", error);
      req.session.error = "Error adding family member";
      res.redirect(
        `/admin/personal-info/${req.params.personalInfoId}/family-members/create`
      );
    }
  }
);

// Edit family member form
router.get(
  "/personal-info/:personalInfoId/family-members/edit/:id",
  async (req, res) => {
    try {
      const personalInfo = await PersonalInfo.getById(
        req.params.personalInfoId
      );
      const familyMember = await FamilyMember.getById(req.params.id);

      if (!personalInfo || !familyMember) {
        req.session.error = "Record not found";
        return res.redirect("/admin/personal-info");
      }

      const editFamilyMemberContent = `
      <!-- Content Header -->
      <div class="content-header">
          <div class="container-fluid">
              <div class="row mb-2">
                  <div class="col-sm-6">
                      <h1 class="m-0">Edit Family Member</h1>
                  </div>
                  <div class="col-sm-6">
                      <ol class="breadcrumb float-sm-right">
                          <li class="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info">Personal Info</a></li>
                          <li class="breadcrumb-item"><a href="/admin/personal-info/${
                            personalInfo.id
                          }/family-members">Family Members</a></li>
                          <li class="breadcrumb-item active">Edit</li>
                      </ol>
                  </div>
              </div>
          </div>
      </div>

      <!-- Main content -->
      <section class="content">
          <div class="container-fluid">
              <div class="row">
                  <div class="col-12">
                      <div class="card">
                          <div class="card-header">
                              <h3 class="card-title">Edit Family Member - ${
                                familyMember.name
                              }</h3>
                          </div>
                          <form method="POST" action="/admin/personal-info/${
                            personalInfo.id
                          }/family-members/edit/${familyMember.id}?_method=PUT">
                              <div class="card-body">
                                  ${
                                    req.session.error
                                      ? `<div class="alert alert-danger">${req.session.error}</div>`
                                      : ""
                                  }
                                  
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                                              <input type="text" class="form-control" id="name" name="name" value="${
                                                familyMember.name || ""
                                              }" required>
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="relationship" class="form-label">Relationship <span class="text-danger">*</span></label>
                                              <select class="form-control" id="relationship" name="relationship" required>
                                                  <option value="">Select Relationship</option>
                                                  <option value="Wife" ${
                                                    familyMember.relationship ===
                                                    "Wife"
                                                      ? "selected"
                                                      : ""
                                                  }>Wife</option>
                                                  <option value="Husband" ${
                                                    familyMember.relationship ===
                                                    "Husband"
                                                      ? "selected"
                                                      : ""
                                                  }>Husband</option>
                                                  <option value="Child" ${
                                                    familyMember.relationship ===
                                                    "Child"
                                                      ? "selected"
                                                      : ""
                                                  }>Child</option>
                                                  <option value="Son" ${
                                                    familyMember.relationship ===
                                                    "Son"
                                                      ? "selected"
                                                      : ""
                                                  }>Son</option>
                                                  <option value="Daughter" ${
                                                    familyMember.relationship ===
                                                    "Daughter"
                                                      ? "selected"
                                                      : ""
                                                  }>Daughter</option>
                                                  <option value="Father" ${
                                                    familyMember.relationship ===
                                                    "Father"
                                                      ? "selected"
                                                      : ""
                                                  }>Father</option>
                                                  <option value="Mother" ${
                                                    familyMember.relationship ===
                                                    "Mother"
                                                      ? "selected"
                                                      : ""
                                                  }>Mother</option>
                                                  <option value="Brother" ${
                                                    familyMember.relationship ===
                                                    "Brother"
                                                      ? "selected"
                                                      : ""
                                                  }>Brother</option>
                                                  <option value="Sister" ${
                                                    familyMember.relationship ===
                                                    "Sister"
                                                      ? "selected"
                                                      : ""
                                                  }>Sister</option>
                                                  <option value="Other" ${
                                                    familyMember.relationship ===
                                                    "Other"
                                                      ? "selected"
                                                      : ""
                                                  }>Other</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="date_of_birth" class="form-label">Date of Birth</label>
                                              <input type="date" class="form-control" id="date_of_birth" name="date_of_birth" 
                                                     value="${
                                                       familyMember.date_of_birth
                                                         ? new Date(
                                                             familyMember.date_of_birth
                                                           )
                                                             .toISOString()
                                                             .split("T")[0]
                                                         : ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="contact_number" class="form-label">Contact Number</label>
                                              <input type="tel" class="form-control" id="contact_number" name="contact_number" value="${
                                                familyMember.contact_number ||
                                                ""
                                              }">
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Education Details</h5>
                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="school_name" class="form-label">School Name</label>
                                              <input type="text" class="form-control" id="school_name" name="school_name" value="${
                                                familyMember.school_name || ""
                                              }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="grade" class="form-label">Grade/Class</label>
                                              <input type="text" class="form-control" id="grade" name="grade" value="${
                                                familyMember.grade || ""
                                              }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="quran_madrasa" class="form-label">Quran Madrasa</label>
                                              <input type="text" class="form-control" id="quran_madrasa" name="quran_madrasa" value="${
                                                familyMember.quran_madrasa || ""
                                              }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="occupation" class="form-label">Occupation</label>
                                              <input type="text" class="form-control" id="occupation" name="occupation" value="${
                                                familyMember.occupation || ""
                                              }">
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div class="card-footer">
                                  <button type="submit" class="btn btn-primary">
                                      <i class="fas fa-save"></i> Update Family Member
                                  </button>
                                  <a href="/admin/personal-info/${
                                    personalInfo.id
                                  }/family-members" class="btn btn-secondary">
                                      <i class="fas fa-times"></i> Cancel
                                  </a>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    `;

      // Clear session error
      delete req.session.error;

      res.render("admin/layout", {
        title: "Edit Family Member",
        user: req.session.user,
        body: editFamilyMemberContent,
      });
    } catch (error) {
      console.error("Error loading edit family member form:", error);
      req.session.error = "Error loading form";
      res.redirect("/admin/personal-info");
    }
  }
);

// Update family member PUT
router.put(
  "/personal-info/:personalInfoId/family-members/edit/:id",
  async (req, res) => {
    try {
      const familyMemberData = {
        name: req.body.name,
        relationship: req.body.relationship,
        date_of_birth: req.body.date_of_birth || null,
        school_name: req.body.school_name || "N/A",
        grade: req.body.grade || "N/A",
        quran_madrasa: req.body.quran_madrasa || "N/A",
        occupation: req.body.occupation || "N/A",
        contact_number: req.body.contact_number || null,
      };

      const updated = await FamilyMember.update(
        req.params.id,
        familyMemberData
      );

      if (updated) {
        req.session.success = "Family member updated successfully";
        res.redirect(
          `/admin/personal-info/${req.params.personalInfoId}/family-members`
        );
      } else {
        req.session.error = "Failed to update family member";
        res.redirect(
          `/admin/personal-info/${req.params.personalInfoId}/family-members/edit/${req.params.id}`
        );
      }
    } catch (error) {
      console.error("Error updating family member:", error);
      req.session.error = "Error updating family member";
      res.redirect(
        `/admin/personal-info/${req.params.personalInfoId}/family-members/edit/${req.params.id}`
      );
    }
  }
);

// Delete family member
router.delete(
  "/personal-info/:personalInfoId/family-members/delete/:id",
  async (req, res) => {
    try {
      const deleted = await FamilyMember.delete(req.params.id);

      if (deleted) {
        req.session.success = "Family member deleted successfully";
      } else {
        req.session.error = "Family member not found or not deleted";
      }

      res.redirect(
        `/admin/personal-info/${req.params.personalInfoId}/family-members`
      );
    } catch (error) {
      console.error("Error deleting family member:", error);
      req.session.error = "Error deleting family member";
      res.redirect(
        `/admin/personal-info/${req.params.personalInfoId}/family-members`
      );
    }
  }
);

module.exports = router;
