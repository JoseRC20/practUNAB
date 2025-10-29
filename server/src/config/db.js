const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

const mask = (u) => (u ? u.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+/, "$1***") : u);
console.log("Connecting using:", mask(MONGODB_URI));

if (!/^mongodb(\+srv)?:\/\//.test(MONGODB_URI || "")) {
  throw new Error('MONGODB_URI invalid. It must start with "mongodb://" or "mongodb+srv://".');
}

module.exports = async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB connected");
};

