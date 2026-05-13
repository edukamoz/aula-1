import axios from "axios";
import { Address } from "../types/Address";

export class ViaCepService {
  static async getAddressByCep(cep: string): Promise<Omit<Address, "id"> | null> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (response.data.erro) {
        return null;
      }

      return {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        localidade: response.data.localidade,
        uf: response.data.uf,
        ibge: response.data.ibge,
        gia: response.data.gia,
        ddd: response.data.ddd,
        siafi: response.data.siafi,
      };
    } catch (error) {
      console.error("Erro na API ViaCEP:", error);
      return null;
    }
  }
}
