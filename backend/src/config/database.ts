import mongoose from "mongoose";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import dotenv from "dotenv";

dotenv.config();

// MongoDB Connection
export const connectMongo = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes("<usuario>")) {
    console.warn("⚠️  MongoDB URI não configurada corretamente. Ignorando conexão com Mongo.");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado ao MongoDB Atlas");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
  }
};

// SQLite Connection
let sqliteDb: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const connectSQLite = async () => {
  try {
    sqliteDb = await open({
      filename: process.env.SQLITE_PATH || "./database.sqlite",
      driver: sqlite3.Database,
    });

    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        cep TEXT NOT NULL,
        logradouro TEXT,
        complemento TEXT,
        bairro TEXT,
        localidade TEXT,
        uf TEXT,
        ibge TEXT,
        gia TEXT,
        ddd TEXT,
        siafi TEXT
      )
    `);

    try {
      await sqliteDb.exec("ALTER TABLE addresses ADD COLUMN nome TEXT NOT NULL DEFAULT ''");
      await sqliteDb.exec("ALTER TABLE addresses ADD COLUMN email TEXT NOT NULL DEFAULT ''");
    } catch(e) {
      // Columns likely already exist
    }

    console.log("✅ Conectado ao SQLite local");
  } catch (error) {
    console.error("❌ Erro ao conectar ao SQLite:", error);
  }
};

export const getSQLiteDb = () => {
  if (!sqliteDb) {
    throw new Error("SQLite database not initialized");
  }
  return sqliteDb;
};
