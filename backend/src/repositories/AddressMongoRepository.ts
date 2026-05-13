import { IAddressRepository } from "../interfaces/IAddressRepository";
import { Address } from "../types/Address";
import { AddressModel } from "../models/AddressModel";

export class AddressMongoRepository implements IAddressRepository {
  async create(address: Omit<Address, "id">): Promise<Address> {
    const newAddress = await AddressModel.create(address);
    return this.mapToAddress(newAddress);
  }

  async findAll(): Promise<Address[]> {
    const addresses = await AddressModel.find();
    return addresses.map(this.mapToAddress);
  }

  async findById(id: string): Promise<Address | null> {
    try {
      const address = await AddressModel.findById(id);
      return address ? this.mapToAddress(address) : null;
    } catch {
      return null;
    }
  }

  async update(id: string, address: Partial<Omit<Address, "id">>): Promise<Address | null> {
    try {
      const updatedAddress = await AddressModel.findByIdAndUpdate(id, address, { new: true });
      return updatedAddress ? this.mapToAddress(updatedAddress) : null;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await AddressModel.findByIdAndDelete(id);
      return result !== null;
    } catch {
      return false;
    }
  }

  private mapToAddress(doc: any): Address {
    return {
      id: doc._id.toString(),
      nome: doc.nome,
      email: doc.email,
      cep: doc.cep,
      logradouro: doc.logradouro,
      complemento: doc.complemento,
      bairro: doc.bairro,
      localidade: doc.localidade,
      uf: doc.uf,
      ibge: doc.ibge,
      gia: doc.gia,
      ddd: doc.ddd,
      siafi: doc.siafi,
    };
  }
}
