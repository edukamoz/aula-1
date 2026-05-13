import { IAddressRepository } from "../interfaces/IAddressRepository";
import { Address } from "../types/Address";
import { getSQLiteDb } from "../config/database";

export class AddressSQLiteRepository implements IAddressRepository {
  async create(address: Omit<Address, "id">): Promise<Address> {
    const db = getSQLiteDb();
    const result = await db.run(
      `INSERT INTO addresses (nome, email, cep, logradouro, complemento, bairro, localidade, uf, ibge, gia, ddd, siafi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        address.nome,
        address.email,
        address.cep,
        address.logradouro,
        address.complemento,
        address.bairro,
        address.localidade,
        address.uf,
        address.ibge,
        address.gia,
        address.ddd,
        address.siafi,
      ]
    );

    return { ...address, id: result.lastID?.toString() };
  }

  async findAll(): Promise<Address[]> {
    const db = getSQLiteDb();
    const addresses = await db.all("SELECT * FROM addresses");
    return addresses.map(this.mapToAddress);
  }

  async findById(id: string): Promise<Address | null> {
    const db = getSQLiteDb();
    const address = await db.get("SELECT * FROM addresses WHERE id = ?", [id]);
    return address ? this.mapToAddress(address) : null;
  }

  async update(id: string, address: Partial<Omit<Address, "id">>): Promise<Address | null> {
    const db = getSQLiteDb();
    const fields = Object.keys(address)
      .map((key) => `${key} = ?`)
      .join(", ");
    
    if (!fields) return this.findById(id);

    const values = Object.values(address);
    values.push(id);

    await db.run(`UPDATE addresses SET ${fields} WHERE id = ?`, values);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = getSQLiteDb();
    const result = await db.run("DELETE FROM addresses WHERE id = ?", [id]);
    return (result.changes ?? 0) > 0;
  }

  private mapToAddress(row: any): Address {
    return {
      id: row.id.toString(),
      nome: row.nome,
      email: row.email,
      cep: row.cep,
      logradouro: row.logradouro,
      complemento: row.complemento,
      bairro: row.bairro,
      localidade: row.localidade,
      uf: row.uf,
      ibge: row.ibge,
      gia: row.gia,
      ddd: row.ddd,
      siafi: row.siafi,
    };
  }
}
