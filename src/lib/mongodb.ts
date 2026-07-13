import mongoose from "mongoose";

type MongooseConnection = typeof mongoose | null;

declare global {
  var mongooseConn: MongooseConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    return null;
  }

  if (globalThis.mongooseConn) {
    return globalThis.mongooseConn;
  }

  globalThis.mongooseConn = await mongoose.connect(MONGODB_URI);
  return globalThis.mongooseConn;
}
