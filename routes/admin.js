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

                                <h5 class="mt-4 mb-3">Address Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="address_line1" class="form-label">Address Line 1</label>
                                            <input type="text" class="form-control" id="address_line1" name="address_line1">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="address_line2" class="form-label">Address Line 2</label>
                                            <input type="text" class="form-control" id="address_line2" name="address_line2">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="city" class="form-label">City</label>
                                            <input type="text" class="form-control" id="city" name="city">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="postal_code" class="form-label">Postal Code</label>
                                            <input type="text" class="form-control" id="postal_code" name="postal_code">
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Contact Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="mobile" class="form-label">Mobile Number</label>
                                            <input type="tel" class="form-control" id="mobile" name="mobile">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="identity_card" class="form-label">Identity Card Number</label>
                                            <input type="text" class="form-control" id="identity_card" name="identity_card">
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Personal Details</h5>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="civil_status" class="form-label">Civil Status</label>
                                            <select class="form-control" id="civil_status" name="civil_status">
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="widowed">Widowed</option>
                                                <option value="divorced">Divorced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="spouse_name" class="form-label">Spouse Name</label>
                                            <input type="text" class="form-control" id="spouse_name" name="spouse_name">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="children_count" class="form-label">Number of Children</label>
                                            <input type="number" class="form-control" id="children_count" name="children_count" min="0" value="0">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="residence_type" class="form-label">Residence Type</label>
                                            <input type="text" class="form-control" id="residence_type" name="residence_type">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="profession" class="form-label">Profession</label>
                                            <input type="text" class="form-control" id="profession" name="profession">
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Special Need Child Information</h5>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="special_need_child_name" class="form-label">Child Name</label>
                                            <input type="text" class="form-control" id="special_need_child_name" name="special_need_child_name">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="special_need_child_age" class="form-label">Child Age</label>
                                            <input type="number" class="form-control" id="special_need_child_age" name="special_need_child_age" min="0">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="special_need_child_school" class="form-label">School</label>
                                            <input type="text" class="form-control" id="special_need_child_school" name="special_need_child_school">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label for="special_need_details" class="form-label">Special Need Details</label>
                                            <textarea class="form-control" id="special_need_details" name="special_need_details" rows="2"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Non-Related People Information</h5>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="non_related_people_count" class="form-label">Number of Non-Related People</label>
                                            <input type="number" class="form-control" id="non_related_people_count" name="non_related_people_count" min="0" value="0">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="non_related_people_details" class="form-label">Details</label>
                                            <textarea class="form-control" id="non_related_people_details" name="non_related_people_details" rows="2"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <h5 class="mt-4 mb-3">Sandha/Donation Information</h5>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="sandha_member" class="form-label">Sandha Member</label>
                                            <select class="form-control" id="sandha_member" name="sandha_member">
                                                <option value="0">No</option>
                                                <option value="1">Yes</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="sandha_amount" class="form-label">Sandha Amount</label>
                                            <div class="input-group">
                                                <span class="input-group-text">Rs.</span>
                                                <input type="number" class="form-control" id="sandha_amount" name="sandha_amount" step="0.01" min="0">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="donation_amount" class="form-label">Donation Amount</label>
                                            <div class="input-group">
                                                <span class="input-group-text">Rs.</span>
                                                <input type="number" class="form-control" id="donation_amount" name="donation_amount" step="0.01" min="0">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="mb-3">
                                            <label for="notes" class="form-label">Notes</label>
                                            <textarea class="form-control" id="notes" name="notes" rows="3"></textarea>
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
      address_line1: req.body.address_line1 || null,
      address_line2: req.body.address_line2 || null,
      city: req.body.city || null,
      postal_code: req.body.postal_code || null,
      mobile: req.body.mobile || null,
      identity_card: req.body.identity_card || null,
      civil_status: req.body.civil_status || "single",
      spouse_name: req.body.spouse_name || null,
      children_count: req.body.children_count || 0,
      residence_type: req.body.residence_type || null,
      profession: req.body.profession || null,
      special_need_child_name: req.body.special_need_child_name || null,
      special_need_child_age: req.body.special_need_child_age || null,
      special_need_child_school: req.body.special_need_child_school || null,
      special_need_details: req.body.special_need_details || null,
      non_related_people_count: req.body.non_related_people_count || 0,
      non_related_people_details: req.body.non_related_people_details || null,
      sandha_member: req.body.sandha_member ? 1 : 0,
      sandha_amount: req.body.sandha_amount || null,
      donation_amount: req.body.donation_amount || null,
      notes: req.body.notes || null,
    };

    // Check if identity card already exists
    if (personalInfoData.identity_card) {
      const existingRecord = await PersonalInfo.findByIdentityCard(
        personalInfoData.identity_card
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

                                  <h5 class="mt-4 mb-3">Address Information</h5>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="address_line1" class="form-label">Address Line 1</label>
                                              <input type="text" class="form-control" id="address_line1" name="address_line1"
                                                     value="${
                                                       personalInfo.address_line1 ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="address_line2" class="form-label">Address Line 2</label>
                                              <input type="text" class="form-control" id="address_line2" name="address_line2"
                                                     value="${
                                                       personalInfo.address_line2 ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="city" class="form-label">City</label>
                                              <input type="text" class="form-control" id="city" name="city"
                                                     value="${
                                                       personalInfo.city || ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="postal_code" class="form-label">Postal Code</label>
                                              <input type="text" class="form-control" id="postal_code" name="postal_code"
                                                     value="${
                                                       personalInfo.postal_code ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Contact Information</h5>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="mobile" class="form-label">Mobile Number</label>
                                              <input type="tel" class="form-control" id="mobile" name="mobile"
                                                     value="${
                                                       personalInfo.mobile || ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="identity_card" class="form-label">Identity Card Number</label>
                                              <input type="text" class="form-control" id="identity_card" name="identity_card"
                                                     value="${
                                                       personalInfo.identity_card ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Personal Details</h5>
                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="civil_status" class="form-label">Civil Status</label>
                                              <select class="form-control" id="civil_status" name="civil_status">
                                                  <option value="single" ${
                                                    personalInfo.civil_status ===
                                                    "single"
                                                      ? "selected"
                                                      : ""
                                                  }>Single</option>
                                                  <option value="married" ${
                                                    personalInfo.civil_status ===
                                                    "married"
                                                      ? "selected"
                                                      : ""
                                                  }>Married</option>
                                                  <option value="widowed" ${
                                                    personalInfo.civil_status ===
                                                    "widowed"
                                                      ? "selected"
                                                      : ""
                                                  }>Widowed</option>
                                                  <option value="divorced" ${
                                                    personalInfo.civil_status ===
                                                    "divorced"
                                                      ? "selected"
                                                      : ""
                                                  }>Divorced</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="spouse_name" class="form-label">Spouse Name</label>
                                              <input type="text" class="form-control" id="spouse_name" name="spouse_name"
                                                     value="${
                                                       personalInfo.spouse_name ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="children_count" class="form-label">Number of Children</label>
                                              <input type="number" class="form-control" id="children_count" name="children_count" min="0"
                                                     value="${
                                                       personalInfo.children_count ||
                                                       0
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="residence_type" class="form-label">Residence Type</label>
                                              <input type="text" class="form-control" id="residence_type" name="residence_type"
                                                     value="${
                                                       personalInfo.residence_type ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
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

                                  <h5 class="mt-4 mb-3">Special Need Child Information</h5>
                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="special_need_child_name" class="form-label">Child Name</label>
                                              <input type="text" class="form-control" id="special_need_child_name" name="special_need_child_name"
                                                     value="${
                                                       personalInfo.special_need_child_name ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="special_need_child_age" class="form-label">Child Age</label>
                                              <input type="number" class="form-control" id="special_need_child_age" name="special_need_child_age" min="0"
                                                     value="${
                                                       personalInfo.special_need_child_age ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="special_need_child_school" class="form-label">School</label>
                                              <input type="text" class="form-control" id="special_need_child_school" name="special_need_child_school"
                                                     value="${
                                                       personalInfo.special_need_child_school ||
                                                       ""
                                                     }">
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="special_need_details" class="form-label">Special Need Details</label>
                                              <textarea class="form-control" id="special_need_details" name="special_need_details" rows="2">${
                                                personalInfo.special_need_details ||
                                                ""
                                              }</textarea>
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Non-Related People Information</h5>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="non_related_people_count" class="form-label">Number of Non-Related People</label>
                                              <input type="number" class="form-control" id="non_related_people_count" name="non_related_people_count" min="0" value="${
                                                personalInfo.non_related_people_count ||
                                                0
                                              }">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="mb-3">
                                              <label for="non_related_people_details" class="form-label">Details</label>
                                              <textarea class="form-control" id="non_related_people_details" name="non_related_people_details" rows="2">${
                                                personalInfo.non_related_people_details ||
                                                ""
                                              }</textarea>
                                          </div>
                                      </div>
                                  </div>

                                  <h5 class="mt-4 mb-3">Sandha/Donation Information</h5>
                                  <div class="row">
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="sandha_member" class="form-label">Sandha Member</label>
                                              <select class="form-control" id="sandha_member" name="sandha_member">
                                                  <option value="0" ${
                                                    personalInfo.sandha_member ===
                                                    0
                                                      ? "selected"
                                                      : ""
                                                  }>No</option>
                                                  <option value="1" ${
                                                    personalInfo.sandha_member ===
                                                    1
                                                      ? "selected"
                                                      : ""
                                                  }>Yes</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="sandha_amount" class="form-label">Sandha Amount</label>
                                              <div class="input-group">
                                                  <span class="input-group-text">Rs.</span>
                                                  <input type="number" class="form-control" id="sandha_amount" name="sandha_amount" step="0.01" min="0" value="${
                                                    personalInfo.sandha_amount ||
                                                    ""
                                                  }">
                                              </div>
                                          </div>
                                      </div>
                                      <div class="col-md-4">
                                          <div class="mb-3">
                                              <label for="donation_amount" class="form-label">Donation Amount</label>
                                              <div class="input-group">
                                                  <span class="input-group-text">Rs.</span>
                                                  <input type="number" class="form-control" id="donation_amount" name="donation_amount" step="0.01" min="0" value="${
                                                    personalInfo.donation_amount ||
                                                    ""
                                                  }">
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  <div class="row">
                                      <div class="col-md-12">
                                          <div class="mb-3">
                                              <label for="notes" class="form-label">Notes</label>
                                              <textarea class="form-control" id="notes" name="notes" rows="3">${
                                                personalInfo.notes || ""
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
      address_line1: req.body.address_line1 || null,
      address_line2: req.body.address_line2 || null,
      city: req.body.city || null,
      postal_code: req.body.postal_code || null,
      mobile: req.body.mobile || null,
      identity_card: req.body.identity_card || null,
      civil_status: req.body.civil_status || "single",
      spouse_name: req.body.spouse_name || null,
      children_count: req.body.children_count || 0,
      residence_type: req.body.residence_type || null,
      profession: req.body.profession || null,
      special_need_child_name: req.body.special_need_child_name || null,
      special_need_child_age: req.body.special_need_child_age || null,
      special_need_child_school: req.body.special_need_child_school || null,
      special_need_details: req.body.special_need_details || null,
      non_related_people_count: req.body.non_related_people_count || 0,
      non_related_people_details: req.body.non_related_people_details || null,
      sandha_member: req.body.sandha_member ? 1 : 0,
      sandha_amount: req.body.sandha_amount || null,
      donation_amount: req.body.donation_amount || null,
      notes: req.body.notes || null,
    };

    // Check if identity card already exists (excluding current record)
    if (personalInfoData.identity_card) {
      const existingRecord = await PersonalInfo.findByIdentityCard(
        personalInfoData.identity_card
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
