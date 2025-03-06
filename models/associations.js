const User = require("./userModel");
const Sample = require("./leadSampleModel");

// Define associations here
User.hasMany(Sample, { foreignKey: "created_by", as: "leadSamples" });
Sample.belongsTo(User, { foreignKey: "created_by", as: "userDetails" });

module.exports = { User, Sample };
