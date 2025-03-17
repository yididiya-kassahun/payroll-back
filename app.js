const express = require("express");
const sequelize = require("./config/database");
const Admin = require("./models/Admin");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const reportRoutes = require("./routes/reportRoute");

const authenticateJWT = require("./middleware/authMiddleware");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRoutes);    
app.use(employeeRoutes);
app.use(payrollRoutes);
app.use(reportRoutes);

// const corsOptions = {
//   origin: "http://example.com",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));

// Handle unmatched routes
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

const PORT = 4000; // process.env.PORT

// Test database connection and sync the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    return sequelize.sync({ alter: true }); // Use { force: true } in development only to drop and recreate tables
  })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => console.error("Database connection or sync error:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
