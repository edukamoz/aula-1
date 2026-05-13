export interface Usuario {
  ID_US: number;
  NOME_US: string;
  EMAIL_US: string;
  CEP_US: string;
  LOGRADOURO_US: string;
  NUMERO_US: string;
  COMPLEMENTO_US: string;
  BAIRRO_US: string;
  CIDADE_US: string;
  UF_US: string;
  DATA_CADASTRO?: string;
}

export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero?: string;
}

export type NavigateToRegisterParams = {
  usuarioId?: number;
};

export type RootTabParamList = {
  Cadastro: undefined;
  Listagem: undefined;
};
