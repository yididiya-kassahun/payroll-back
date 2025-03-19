const express = require("express");
const sequelize = require("./config/database");
const Admin = require("./models/Admin");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const reportRoutes = require("./routes/reportRoute");
const setupSwagger = require("./config/swaggerConfig");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRoutes);    
app.use("/api/v1",employeeRoutes);
app.use("/api/v1", payrollRoutes);
app.use("/api/v1", reportRoutes);

// const corsOptions = {
//   origin: "http://example.com",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));

setupSwagger(app);

// Handle unmatched routes
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

const PORT = 4000; // process.env.PORT

// connection and sync
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
