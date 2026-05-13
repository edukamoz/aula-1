import axios from "axios";
import { Platform } from "react-native";
import { globalDbType } from "../screens/SettingsScreen";
import { getPreference } from "../utils/storage";

// 10.0.2.2 é o IP do localhost da máquina hospedeira quando rodando no Emulador Android
// Se for rodar no iOS ou Web, 'localhost' ou '127.0.0.1' funciona normalmente.
// Se for celular físico, precisaria ser o IP da rede (ex: 192.168.1.5)
const BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor para injetar o tipo de banco de dados escolhido
api.interceptors.request.use(async (config) => {
  let dbType = globalDbType;
  try {
    const saved = await getPreference("@db_type");
    if (saved) dbType = saved;
  } catch (e) {
    // Silencia erro e usa fallback
  }
  
  config.headers["X-Database-Type"] = dbType;
  return config;
});

// Tipos para a API
export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

export interface ClientData extends AddressData {
  id?: string;
  nome: string;
  email: string;
}

// Funções da API
export const getClients = async (): Promise<ClientData[]> => {
  const response = await api.get("/addresses");
  return response.data;
};

export const getClientById = async (id: string): Promise<ClientData> => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

export const createClient = async (client: Omit<ClientData, "id">): Promise<ClientData> => {
  const response = await api.post("/addresses", client);
  return response.data;
};

export const updateClient = async (id: string, client: Partial<ClientData>): Promise<ClientData> => {
  const response = await api.put(`/addresses/${id}`, client);
  return response.data;
};

export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};
