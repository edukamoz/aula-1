# Full-Stack Mobile ViaCEP CRM

Este é um projeto Full-Stack moderno construído para gerenciar uma carteira de clientes, focado principalmente na integração inteligente de endereços. A aplicação permite cadastrar, visualizar, editar e remover clientes utilizando persistência dinâmica de dados.

## 🎯 Objetivos e Requisitos Atendidos

O sistema foi arquitetado para satisfazer os seguintes requisitos:
1. **Integração ViaCEP:** Uma busca inteligente onde, ao digitar um CEP no Frontend ou passar pela API do Backend, o endereço do cliente é validado e preenchido automaticamente pela [API do ViaCEP](https://viacep.com.br/).
2. **Armazenamento Híbrido Dinâmico:** Implementamos um recurso de escolha de banco de dados. Você tem o poder de persistir os dados numa base relacional **(SQLite)** ou numa base não-relacional **(MongoDB Atlas)** de forma totalmente transparente e segura.
3. **Seleção em Tempo Real:** O mecanismo de seleção de banco não requer reinicialização do servidor. Através de um "switch" no aplicativo (Aba Ajustes), o cabeçalho `X-Database-Type` é injetado nas requisições, dizendo à API qual repositório ela deve acionar no momento (Padrão de Projeto Strategy).
4. **Operações CRUD Completas:** Rotas construídas do zero para *Criar, Ler, Atualizar e Deletar* registros de clientes de maneira robusta.

---

## 🏗️ Estrutura do Repositório

O projeto foi dividido claramente em duas pastas para isolar o ambiente e evitar conflitos de dependências entre o Node.js puro e o framework Mobile:

### `/backend` (API em Node.js + Express)
O cérebro da operação. Recebe as requisições, faz a validação dos dados de endereço acessando a API do ViaCEP na camada de serviço e utiliza o *Factory Pattern* para invocar a classe que salvará os dados ou no SQLite local ou no cluster do MongoDB Atlas. Foi feito em TypeScript rígido.

### `/frontend` (React Native com Expo)
O aplicativo interativo que o usuário usa. Modulado como um CRM (Gerenciador de Clientes), possui um design moderno *Dark Mode* com menu flutuante (Tabs). O app chama o Backend de forma assíncrona com `axios` e apresenta recursos como "Abrir no Mapa", que traça a rota do endereço do cliente acionando o GPS/Mapas nativo do celular.

---

## 🚀 Como Executar o Projeto

Para visualizar a aplicação em seu ápice, os dois servidores (Backend e Frontend) precisam rodar simultaneamente.

### Passo 1: Iniciar o Backend
Abra um terminal na raiz e faça os seguintes comandos:
```bash
cd backend
npm install
```
Configure as variáveis de ambiente criando um arquivo `.env` dentro da pasta `backend/` contendo sua string de conexão (`MONGO_URI`). Veja as instruções no [README do Backend](./backend/README.md).
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
*(A API começará a rodar em `http://localhost:3000`)*

### Passo 2: Iniciar o Frontend
Com o backend rodando, abra uma **nova janela** do terminal na raiz e faça:
```bash
cd frontend
npm install
```
Inicie o aplicativo no Emulador Android:
```bash
npm run android
```
*(Se estiver usando um celular físico, use `npm start` e atualize o IP na configuração da API dentro de `src/services/api.ts`).*

---

## 💡 Princípios de Engenharia Aplicados

- **Pattern Strategy/Factory:** Usado no backend (`DatabaseFactory.ts`) para decidir em tempo de execução qual classe de Repositório (`AddressMongoRepository` ou `AddressSQLiteRepository`) salvará o novo cadastro do cliente, dependendo do *Header* HTTP enviado.
- **Isolamento de Responsabilidades:** O Controller nunca salva nada diretamente, ele delega ao repositório genérico.
- **In-Memory Fallback:** Se o ambiente nativo do Expo não permitir certas bibliotecas sem recompilação, a UI se protege instanciando conexões no próprio banco SQLite do aparelho para gravar configurações sem quebrar a tela.
