import mongoose, { Schema, Document } from "mongoose";
import { Address } from "../types/Address";

export interface AddressDocument extends Document, Omit<Address, "id"> {}

const AddressSchema: Schema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  cep: { type: String, required: true },
  logradouro: { type: String },
  complemento: { type: String },
  bairro: { type: String },
  localidade: { type: String },
  uf: { type: String },
  ibge: { type: String },
  gia: { type: String },
  ddd: { type: String },
  siafi: { type: String },
});

export const AddressModel = mongoose.model<AddressDocument>("Address", AddressSchema);
