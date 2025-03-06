const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // Import Sequelize instance

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
    },
    status: {
        type: DataTypes.ENUM("pending", "Assign"),
        defaultValue: "pending",
    },
    assign: {
        type: DataTypes.STRING,
        defaultValue: "Not assigned",
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    tableName: "users", // Table name in MySQL
});

// Sync model with database
sequelize.sync()
    .then(() => console.log("User table created (if not exists)"))
    .catch(err => console.error("Error syncing table:", err));

module.exports = User;
