import * as SQLite from "expo-sqlite";

export async function getDbConfig(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("SettingsDB");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return db;
}

export async function savePreference(key: string, value: string): Promise<void> {
  try {
    const db = await getDbConfig();
    await db.runAsync(
      "INSERT OR REPLACE INTO Config (key, value) VALUES (?, ?)",
      key,
      value
    );
  } catch (e) {
    console.warn("Erro ao salvar preferencia no SQLite", e);
  }
}

export async function getPreference(key: string): Promise<string | null> {
  try {
    const db = await getDbConfig();
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM Config WHERE key = ?",
      key
    );
    return result ? result.value : null;
  } catch (e) {
    console.warn("Erro ao ler preferencia do SQLite", e);
    return null;
  }
}
