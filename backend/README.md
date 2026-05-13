# Backend API com ViaCEP, SQLite e MongoDB

Esta API foi desenvolvida em Node.js com Express e TypeScript. Ela fornece rotas para gerenciar endereços utilizando a API do ViaCEP para autocompletar os dados, com a flexibilidade de armazenar essas informações dinamicamente no **SQLite** ou **MongoDB**, de acordo com a preferência definida via `.env` ou via cabeçalho HTTP (Header).

## Pré-requisitos
- Node.js v18+ 
- NPM ou Yarn
- (Opcional) Cluster MongoDB Atlas (URL de Conexão)

## Instalação e Configuração

1. Entre na pasta `backend`:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:
```env
PORT=3000
DEFAULT_DB=sqlite
MONGO_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
SQLITE_PATH=./database.sqlite
```
*(Caso deseje usar apenas o SQLite localmente, a variável `MONGO_URI` pode ser ignorada. Ela emitirá apenas um aviso de que não pôde conectar ao Mongo).*

## Executando o Projeto

Para rodar a API em ambiente de desenvolvimento (com auto-reload via `ts-node-dev`):
```bash
npm run dev
```

A API estará disponível por padrão na porta `3000`.

## Rotas da API

### `POST /addresses`
Consulta o ViaCEP pelo CEP informado e cria um novo endereço no banco de dados escolhido.
- **Body JSON:**
```json
{
  "cep": "01001000"
}
```

### `GET /addresses`
Retorna todos os endereços salvos.

### `GET /addresses/:id`
Retorna um endereço específico.

### `PUT /addresses/:id`
Atualiza manualmente as informações de um endereço.
- **Body JSON** (envie apenas os campos que deseja alterar):
```json
{
  "complemento": "Apto 101"
}
```

### `DELETE /addresses/:id`
Remove um endereço específico.

## Alternando entre Bancos de Dados

O banco de dados padrão é definido pela variável `DEFAULT_DB` no `.env`.
Contudo, se você quiser forçar a operação (ler ou gravar) num banco diferente para uma requisição específica, basta enviar o cabeçalho `X-Database-Type`:

- **Exemplo forçando uso do Mongo:**
```bash
curl -H "X-Database-Type: mongo" -X GET http://localhost:3000/addresses
```
- **Exemplo forçando uso do SQLite:**
```bash
curl -H "X-Database-Type: sqlite" -X GET http://localhost:3000/addresses
```

Isso permite total flexibilidade arquitetural no consumo desta API.
