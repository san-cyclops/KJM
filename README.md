# KJM Admin Application

A Node.js web application with login authentication, admin panel, and MySQL database integration.

## Features

- **User Authentication**: Secure login system with session management
- **Admin Dashboard**: Clean and responsive admin interface
- **User Management**: Complete CRUD operations for user accounts
- **Data Grid View**: Interactive table for viewing and managing users
- **Role-based Access**: Admin and User roles with appropriate permissions
- **MySQL Integration**: Full database connectivity with connection pooling
- **Responsive Design**: Bootstrap-based UI that works on all devices

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm package manager

## Database Configuration

The application connects to a local MySQL database with the following settings:

- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: Mihinula@123
- **Database**: kjm_admin_db (auto-created)

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Ensure MySQL is running** on localhost:3306 with the specified credentials

4. **Start the application**:

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and go to: `http://localhost:3000`

## Default User Credentials

The application creates sample users automatically:

### Admin User

- **Username**: admin
- **Password**: admin123
- **Role**: Admin (full access to user management)

### Regular User

- **Username**: user1
- **Password**: user123
- **Role**: User (limited access)

## Project Structure

```
KJM/
├── app.js                 # Main application entry point
├── package.json          # Dependencies and scripts
├── config/
│   └── database.js       # MySQL database configuration
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/
│   └── User.js          # User data model
├── routes/
│   ├── auth.js          # Authentication routes
│   └── admin.js         # Admin panel routes
├── views/
│   ├── login.ejs        # Login page template
│   ├── 404.ejs          # 404 error page
│   ├── error.ejs        # Generic error page
│   └── admin/
│       ├── dashboard.ejs # Admin dashboard
│       ├── users.ejs    # User management grid
│       └── user-form.ejs# User create/edit form
└── public/
    ├── css/
    │   └── style.css    # Custom styles
    └── js/
        └── app.js       # Client-side JavaScript
```

## Key Features

### Authentication System

- Session-based authentication
- Password hashing with bcrypt
- Role-based access control
- Automatic logout after 24 hours

### User Management (Admin Only)

- **Create**: Add new users with username, email, password, and role
- **Read**: View all users in a data grid with sorting
- **Update**: Edit user information and change passwords
- **Delete**: Remove users (except self-deletion prevention)

### Security Features

- Password hashing and verification
- Session management
- CSRF protection via method override
- Input validation and sanitization
- SQL injection prevention

### User Interface

- Responsive Bootstrap-based design
- Interactive data grid with action buttons
- Form validation with error messages
- Success/error notifications
- Mobile-friendly navigation

## API Endpoints

### Authentication

- `GET /` - Redirects to login
- `GET /login` - Login form
- `POST /login` - Process login
- `GET /logout` - Logout user

### Admin Panel (Requires Authentication)

- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - User management grid (Admin only)
- `GET /admin/users/create` - Create user form (Admin only)
- `POST /admin/users` - Create new user (Admin only)
- `GET /admin/users/:id/edit` - Edit user form (Admin only)
- `PUT /admin/users/:id` - Update user (Admin only)
- `DELETE /admin/users/:id` - Delete user (Admin only)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Features

1. Create routes in the `routes/` directory
2. Add models in the `models/` directory
3. Create views in the `views/` directory
4. Update navigation and permissions as needed

## Troubleshooting

### Database Connection Issues

- Ensure MySQL server is running
- Verify credentials match your MySQL setup
- Check if the database user has proper permissions

### Port Already in Use

- Change the PORT in app.js or set environment variable:
  ```bash
  PORT=3001 npm start
  ```

### Missing Dependencies

- Run `npm install` to reinstall packages
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Security Considerations

- Change default passwords in production
- Use environment variables for database credentials
- Enable HTTPS in production
- Implement rate limiting for login attempts
- Regular security updates for dependencies

## License

This project is open source and available under the MIT License.
