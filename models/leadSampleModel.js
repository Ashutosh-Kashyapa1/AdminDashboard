const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // Import database connection

const LeadSample = sequelize.define("LeadSample", {
    user_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sheet_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    short_description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    semrush_global_rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    semrush_visits_latest_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    num_investors: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    funding_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    num_exits: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    num_funding_rounds: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_funding_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_funding_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    num_acquisitions: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    apptopia_total_apps: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    apptopia_total_downloads: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    contact_email: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    facebook: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    linkedin: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    twitter: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    num_investments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    num_lead_investments: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    num_lead_investors: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    listed_stock_symbol: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hub_tags: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    operating_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    founded_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    categories: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    founders: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    ipo_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    num_employees_enum: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    locations: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    growth_insight_description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    growth_insight_indicator: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    growth_insight_direction: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    growth_insight_confidence: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    investor_insight_description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    permalink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    url: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    tableName: "lead_samples", // Custom table name (optional)
});

// Sync model with MySQL database (creates table if not exists)
sequelize.sync()
    .then(() => console.log("LeadSample table created (if not exists)"))
    .catch(err => console.error("Error syncing table:", err));

module.exports = LeadSample;
