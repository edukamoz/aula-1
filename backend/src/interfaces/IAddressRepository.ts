import { Address } from "../types/Address";

export interface IAddressRepository {
  create(address: Omit<Address, "id">): Promise<Address>;
  findAll(): Promise<Address[]>;
  findById(id: string): Promise<Address | null>;
  update(id: string, address: Partial<Omit<Address, "id">>): Promise<Address | null>;
  delete(id: string): Promise<boolean>;
}
