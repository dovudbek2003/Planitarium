const mongoose = require('mongoose');

const connectDB = async ()=>{
  const connecting = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected to: ${connecting.connection.host}`.magenta)
}

module.exports = connectDB;