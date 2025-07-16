O microsserviço fornece uma API para **validar**, **formatar**, **normalizar** documentos reais e **gerar** documentos brasileiros fictícios válidos (útil para ambientes de desenvolvimento), atualmente com suporte para **CPF** e **CNPJ**.  
A API é segura, leve, sem autenticação (ideal para uso interno ou restrito por firewall), e conta com proteção contra abusos como brute force e spam via `rate limiting`.

## Funcionalidades

- Validação de CPF e CNPJ com retorno do tipo e versão formatada
- Normalização (remoção de máscaras)
- Geração aleatória de CPF e CNPJ válidos
- Segurança básica (rate limit, CORS, headers)

## Endpoints disponíveis

| Método | Endpoint        | Descrição                            |
|--------|-----------------|---------------------------------------|
| POST   | `/validate`     | Valida um documento CPF ou CNPJ      |
| POST   | `/normalize`    | Remove a máscara de um documento     |
| GET    | `/generate/cpf` | Gera um CPF válido aleatório         |
| GET    | `/generate/cnpj`| Gera um CNPJ válido aleatório        |

## Segurança

- `helmet`: headers de proteção HTTP
- `cors`: controle de origem para requisições
- `express-rate-limit`: limite de requisições por IP

## Requisitos

- Node.js 14.x ou superior
- npm

## Licença

Este projeto é open-source e está disponível sob a licença MIT.

## Autor

Matheus Azeredo  
[GitHub](https://github.com/codebyazeredo) · [LinkedIn](https://www.linkedin.com/in/codebyazeredo)
