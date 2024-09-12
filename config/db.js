// import 'dotenv/config'
import mongoose from "mongoose"

const dbConnect = async () => {
  const MONGO_DB_URI = process.env.MONGO_DB_URI

  try {
    mongoose.connection.on('connected', () => console.log('connected'));
    mongoose.connection.on('open', () => console.log('open'));
    mongoose.connection.on('disconnected', () => console.log('disconnected'));
    mongoose.connection.on('reconnected', () => console.log('reconnected'));
    mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
    mongoose.connection.on('close', () => console.log('close'));
    mongoose.connection.on('error', err => console.log(err));

    await mongoose.connect(MONGO_DB_URI, {
      dbName: process.env.MONGO_DB_NAME
    });
  } catch(err) {
    console.log('******** ERROR DE CONEXION ********', err);
  }
}

export default dbConnect