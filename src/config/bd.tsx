import * as SQLite from "expo-sqlite";
import { Usuario } from "../../App";

async function Banco() {
  const bd = await SQLite.openDatabaseAsync("FatecV");
  console.log("Banco criado !!!");
  return bd;
}

async function createTable(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync(
      `PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS USUARIO(
            ID_US INTEGER PRIMARY KEY AUTOINCREMENT,
            NOME_US VARCHAR(100),
            EMAIL_US VARCHAR(100)
            )`,
    );
    console.log("Tabela CRIADA!!!");
  } catch (error) {
    console.log("Erro ao criar tabela", error);
  }
}

async function inserirUsuario(
  db: SQLite.SQLiteDatabase,
  nome: string,
  email: string,
) {
  try {
    await db.runAsync(
      "INSERT INTO USUARIO(NOME_US, EMAIL_US) VALUES(?,?)",
      nome,
      email,
    );
    console.log("Usuário inserido com sucesso");
  } catch (error) {
    console.log("Erro ao inserir usuário", error);
  }
}

// Exibir os dados
async function exibirUsuarios(db: SQLite.SQLiteDatabase) {
  try {
    const resultado = await db.getAllAsync("SELECT * FROM USUARIO");
    return resultado;
  } catch (e) {
    console.log("Erro ao exibir usuários", e);
  }
}

// Exibir usuario por ID;
async function exibirUsuarioPorId(
  db: SQLite.SQLiteDatabase,
  id: number,
): Promise<Usuario | undefined> {
  try {
    const resultado = (await db.getFirstAsync(
      "SELECT * FROM USUARIO WHERE ID_US = ?",
      id,
    )) as Usuario;
    console.log("Usuário encontrado");
    return resultado;
  } catch (e) {
    console.log("Erro ao exibir usuário", e);
  }
}

async function deletaUsuario(db: SQLite.SQLiteDatabase, id: number) {
  try {
    await db.runAsync("DELETE FROM USUARIO WHERE ID_US = ?", id);
    console.log("Usuário deletado com sucesso");
  } catch (e) {
    console.log("Erro ao deletar usuário", e);
  }
}

export {
  Banco,
  createTable,
  deletaUsuario,
  exibirUsuarioPorId,
  exibirUsuarios,
  inserirUsuario,
};
