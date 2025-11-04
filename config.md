# Configuração de Ambiente

Este projeto usa variáveis de ambiente para configurar a URL da API em diferentes ambientes.

## Arquivos de Configuração

### `.env.local` (Desenvolvimento Local)
Este arquivo é usado durante o desenvolvimento local e não deve ser commitado no git.

```env
VITE_API_URL=http://localhost:8080
```

### `.env.production` (Produção)
Este arquivo é usado quando o projeto é buildado para produção.

```env
VITE_API_URL=https://pg21wf8ude.execute-api.us-east-1.amazonaws.com/
```

### `.env.example`
Arquivo de exemplo que mostra quais variáveis de ambiente são necessárias.

## Como Usar

### Desenvolvimento Local

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. O arquivo `.env.local` já está configurado para usar `http://localhost:8080`

3. Execute o projeto:
   ```bash
   npm run dev
   ```

### Produção

O arquivo `.env.production` já está configurado com a URL de produção.

Quando você faz build para produção:
```bash
npm run build
```

O Vite automaticamente usa as variáveis de `.env.production`.

## Variáveis Disponíveis

- `VITE_API_URL`: URL base da API backend
  - Desenvolvimento: `http://localhost:8080`
  - Produção: `https://pg21wf8ude.execute-api.us-east-1.amazonaws.com/`

## Notas Importantes

- Arquivos `.env.local` são ignorados pelo git (não são commitados)
- Arquivos `.env.production` são commitados pois são necessários para o build de produção
- Variáveis de ambiente no Vite devem começar com `VITE_` para serem expostas ao código do cliente
- O arquivo `.env.local` tem prioridade sobre `.env.production` durante desenvolvimento

