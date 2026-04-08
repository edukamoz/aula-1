import * as SQLite from "expo-sqlite";
import { Usuario } from "../types";

async function Banco() {
  const bd = await SQLite.openDatabaseAsync("FatecV");
  console.log("✅ Banco de dados aberto: FatecV");
  return bd;
}

async function createTable(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync("PRAGMA journal_mode = WAL;");
    console.log("📊 Verificando estrutura do banco...");

    // Verificar se a tabela existe
    const tableExists = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='USUARIO'",
    );

    if (!tableExists) {
      // Criar tabela nova
      console.log("📝 Criando tabela USUARIO com todos os campos...");
      await db.execAsync(`
        CREATE TABLE USUARIO(
          ID_US INTEGER PRIMARY KEY AUTOINCREMENT,
          NOME_US VARCHAR(100),
          EMAIL_US VARCHAR(100),
          CEP_US VARCHAR(9),
          LOGRADOURO_US VARCHAR(150),
          NUMERO_US VARCHAR(10),
          COMPLEMENTO_US VARCHAR(100),
          BAIRRO_US VARCHAR(100),
          CIDADE_US VARCHAR(100),
          UF_US VARCHAR(2),
          DATA_CADASTRO DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Tabela USUARIO criada com sucesso!");
    } else {
      // Tabela existe, verificar se tem todos os campos novos
      const columns = await db.getAllAsync("PRAGMA table_info(USUARIO)");
      const columnNames = (columns as any[]).map((col: any) => col.name);

      // Campos que precisam existir
      const requiredColumns = [
        "ID_US",
        "NOME_US",
        "EMAIL_US",
        "CEP_US",
        "LOGRADOURO_US",
        "NUMERO_US",
        "BAIRRO_US",
        "CIDADE_US",
        "UF_US",
      ];

      // Verificar quais campos faltam
      const missingColumns = requiredColumns.filter(
        (col) => !columnNames.includes(col),
      );

      // Se faltam campos, fazer migração
      if (missingColumns.length > 0) {
        console.log(
          "⚠️ Detectados campos faltando:",
          missingColumns.join(", "),
        );
        console.log("🔄 Iniciando migração da tabela...");
        await migrateTable(db);
      } else {
        console.log("✅ Tabela USUARIO já possui todos os campos!");
      }
    }
  } catch (error) {
    console.log("❌ Erro ao criar/verificar tabela", error);
  }
}

async function migrateTable(db: SQLite.SQLiteDatabase) {
  try {
    console.log("📦 Criando tabela temporária...");
    // Criar tabela temporária com os novos campos
    await db.execAsync(`
      CREATE TABLE USUARIO_NEW(
        ID_US INTEGER PRIMARY KEY AUTOINCREMENT,
        NOME_US VARCHAR(100),
        EMAIL_US VARCHAR(100),
        CEP_US VARCHAR(9),
        LOGRADOURO_US VARCHAR(150),
        NUMERO_US VARCHAR(10),
        COMPLEMENTO_US VARCHAR(100),
        BAIRRO_US VARCHAR(100),
        CIDADE_US VARCHAR(100),
        UF_US VARCHAR(2),
        DATA_CADASTRO DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("📋 Copiando dados existentes...");
    // Copiar dados antigos (apenas as colunas que existem)
    await db.execAsync(`
      INSERT INTO USUARIO_NEW(ID_US, NOME_US, EMAIL_US)
      SELECT ID_US, NOME_US, EMAIL_US FROM USUARIO;
    `);

    console.log("🗑️ Removendo tabela antiga...");
    // Dropar tabela antiga
    await db.execAsync("DROP TABLE USUARIO;");

    console.log("✏️ Renomeando tabela temporária...");
    // Renomear tabela nova
    await db.execAsync("ALTER TABLE USUARIO_NEW RENAME TO USUARIO;");

    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.log("❌ Erro ao realizar migração", error);
    throw error;
  }
}

async function inserirUsuario(
  db: SQLite.SQLiteDatabase,
  nome: string,
  email: string,
  cep: string,
  logradouro: string,
  numero: string,
  complemento: string,
  bairro: string,
  cidade: string,
  uf: string,
) {
  try {
    await db.runAsync(
      `INSERT INTO USUARIO(NOME_US, EMAIL_US, CEP_US, LOGRADOURO_US, NUMERO_US, COMPLEMENTO_US, BAIRRO_US, CIDADE_US, UF_US) 
       VALUES(?,?,?,?,?,?,?,?,?)`,
      nome,
      email,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
    );
    console.log("✅ Usuário inserido com sucesso:", nome);
    return true;
  } catch (error) {
    console.log("❌ Erro ao inserir usuário", error);
    return false;
  }
}

// Exibir os dados
async function exibirUsuarios(db: SQLite.SQLiteDatabase) {
  try {
    const resultado = await db.getAllAsync("SELECT * FROM USUARIO");
    console.log(`📋 ${resultado?.length || 0} usuário(s) encontrado(s)`);
    return resultado;
  } catch (e) {
    console.log("❌ Erro ao exibir usuários", e);
  }
}

// Exibir usuario por ID
async function exibirUsuarioPorId(
  db: SQLite.SQLiteDatabase,
  id: number,
): Promise<Usuario | undefined> {
  try {
    const resultado = (await db.getFirstAsync(
      "SELECT * FROM USUARIO WHERE ID_US = ?",
      id,
    )) as Usuario;
    if (resultado) {
      console.log("✅ Usuário encontrado:", resultado.NOME_US);
    }
    return resultado;
  } catch (e) {
    console.log("❌ Erro ao exibir usuário", e);
  }
}

async function deletaUsuario(db: SQLite.SQLiteDatabase, id: number) {
  try {
    await db.runAsync("DELETE FROM USUARIO WHERE ID_US = ?", id);
    console.log("✅ Usuário deletado com sucesso (ID:", id, ")");
    return true;
  } catch (e) {
    console.log("❌ Erro ao deletar usuário", e);
    return false;
  }
}

async function atualizarUsuario(
  db: SQLite.SQLiteDatabase,
  id: number,
  nome: string,
  email: string,
  cep: string,
  logradouro: string,
  numero: string,
  complemento: string,
  bairro: string,
  cidade: string,
  uf: string,
) {
  try {
    await db.runAsync(
      `UPDATE USUARIO 
       SET NOME_US=?, EMAIL_US=?, CEP_US=?, LOGRADOURO_US=?, NUMERO_US=?, COMPLEMENTO_US=?, BAIRRO_US=?, CIDADE_US=?, UF_US=? 
       WHERE ID_US=?`,
      nome,
      email,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      id,
    );
    console.log("✅ Usuário atualizado com sucesso:", nome);
    return true;
  } catch (e) {
    console.log("❌ Erro ao atualizar usuário", e);
    return false;
  }
}

// Função para resetar o banco (útil para testes/desenvolvimento)
async function resetDatabase(db: SQLite.SQLiteDatabase) {
  try {
    await db.execAsync("DROP TABLE IF EXISTS USUARIO;");
    await createTable(db);
    console.log("🔄 Banco de dados resetado com sucesso!");
    return true;
  } catch (error) {
    console.log("❌ Erro ao resetar banco", error);
    return false;
  }
}

export {
  atualizarUsuario,
  Banco,
  createTable,
  deletaUsuario,
  exibirUsuarioPorId,
  exibirUsuarios,
  inserirUsuario,
  resetDatabase,
};
