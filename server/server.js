const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root@123",
  database: "zynthor_it",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL Connected Successfully");
});

app.get("/", (req, res) => {
  res.send("Zynthor IT API Running");
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const sql = `
    INSERT INTO contacts (name, email, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      id: result.insertId,
    });
  });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});