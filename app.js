const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import Sequelize connection and models
// const sequelize = require("./db");
// const { User, LeadSample } = require("./models/associations");



// Sync MySQL models before starting the server
// sequelize.sync({ alter: true }) 
//     .then(() => console.log("✅ MySQL Database synced successfully!"))
//     .catch(err => console.error("❌ Error syncing MySQL database:", err));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session setup
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not defined in the .env file");
}

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to `true` if using HTTPS
}));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public", {
    etag: false,
    lastModified: false,
    cacheControl: false
}));

// Import and use routes
const userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start the server after Sequelize syncs
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
