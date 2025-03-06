const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create a Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Set to true for SQL query logs
});

sequelize.authenticate()
    .then(() => console.log("Connected to MySQL Server using Sequelize"))
    .catch(err => console.error("MySQL connection error:", err));

module.exports = sequelize;
