module.exports = {
  apps: [
    {
      name: "kjm-admin",
      script: "app.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DB_HOST: "masjid.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com",
        DB_PORT: 3306,
        DB_NAME: "masjid",
        DB_USER: "root",
        DB_PASSWORD: "NewSecurePassword123!",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
