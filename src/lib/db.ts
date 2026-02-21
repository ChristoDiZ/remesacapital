import mongoose from "mongoose";

type MongooseGlobal = typeof globalThis & {
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const g = globalThis as MongooseGlobal;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está configurado en .env.local");
  return uri;
}

export async function connectDB() {
  if (g._mongoose?.conn) return g._mongoose.conn;

  if (!g._mongoose) g._mongoose = { conn: null, promise: null };

  if (!g._mongoose.promise) {
    const MONGODB_URI = getMongoUri(); // <- ahora es string seguro
    g._mongoose.promise = mongoose
      .connect(MONGODB_URI, { dbName: "remesacapital" })
      .then((m) => m);
  }

  g._mongoose.conn = await g._mongoose.promise;
  return g._mongoose.conn;
}