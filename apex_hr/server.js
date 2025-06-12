const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const winston = require("winston");
const cors = require("cors");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/adminapexRoutes")
const newsRoutes = require("./routes/newsRoutes")
const useraccountRounts = require("./routes/useraccountRounts")
const authRoutes = require("./routes/authRoutes");
const otpRoutes = require('./routes/otpRoutes'); 

const employeeRoutes = require('./routes/employeeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');


// Load environment variables
dotenv.config();

// Connect to database
const db = require("./config/db"); // ✅ เชื่อมฐานข้อมูล

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes); //หน้าข่าว
app.use("/api/useraccount", useraccountRounts); // เช็คuser
app.use("/api/auth", authRoutes); //แจกโทคเคน
app.use("/api/otp", otpRoutes);
app.use('/public', express.static('public')); 
app.use('/api/employee', employeeRoutes);
app.use('/api/upload', uploadRoutes);





// Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});
