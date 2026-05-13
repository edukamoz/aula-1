# Mobile ViaCEP - Frontend (CRM de Clientes)

Este é o aplicativo React Native (Expo) que serve como interface para o nosso sistema de Gerenciamento de Clientes. Ele foi estruturado para fornecer uma experiência fluida, permitindo o cadastro de usuários e endereços usando a integração com o ViaCEP e suportando a persistência dinâmica de dados.

## Funcionalidades Principais

- **Integração com API Backend:** Comunica-se com nossa API Node.js para operações de CRUD.
- **Busca de CEP Automática:** Ao digitar o CEP na tela de cadastro, o app consome a API do ViaCEP e preenche o endereço automaticamente.
- **Seleção Dinâmica de Banco de Dados:** Através da aba "Ajustes", o usuário pode alternar em tempo real se deseja salvar os dados localmente no **SQLite** ou na nuvem no **MongoDB Atlas**. O app injeta essa preferência na requisição usando o cabeçalho `X-Database-Type`.
- **Ações Rápidas (Mapa):** Os cards de clientes possuem um atalho que abre o aplicativo de mapas nativo do celular traçando uma rota direta para o endereço do cliente.
- **Armazenamento de Preferências:** Utiliza o `expo-sqlite` para armazenar de forma persistente a configuração do banco de dados escolhido pelo usuário.

## Estrutura do App

- `src/components/`: Componentes reutilizáveis de UI (Inputs, Modais, Selects).
- `src/constants/`: Definições globais de estilização (Temas, Cores em Dark Mode, Sombras).
- `src/navigation/`: Configuração das rotas e do menu flutuante inferior (Bottom Tabs).
- `src/screens/`: As telas principais do aplicativo (Lista de Clientes, Novo Cadastro, Ajustes).
- `src/services/api.ts`: Camada de comunicação `axios` com a API do Backend.
- `src/utils/`: Funções utilitárias como máscaras, validações e o mecanismo de persistência de configuração local.

## Como Configurar e Rodar

### Pré-requisitos
- Node.js instalado.
- O **Backend** do projeto precisa estar rodando na sua máquina (porta 3000) para que o aplicativo consiga salvar e buscar os dados.

### Instalação

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

### Executando o Aplicativo

Para rodar o projeto, dependendo de como você deseja visualizar:

- **No Emulador Android (já configurado):**
  ```bash
  npm run android
  ```
  *(Nota: A `api.ts` está configurada para usar o IP `http://10.0.2.2:3000` nativo do emulador para acessar a API na máquina hospedeira).*

- **No Expo Go (Celular Físico):**
  ```bash
  npm start
  ```
  *(Nota: Se for rodar em celular físico, você precisará alterar a `BASE_URL` no arquivo `src/services/api.ts` para o IP da sua rede local (Wi-Fi), por exemplo `http://192.168.1.15:3000`).*

## Observações
O aplicativo possui um design nativo focado no Dark Mode ("Professional Minimalism") focado na usabilidade, garantindo que o usuário consiga de maneira rápida consultar os dados de uma base relacional ou não relacional de forma totalmente transparente.
