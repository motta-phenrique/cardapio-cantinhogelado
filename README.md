# Cantinho Gelado: cardápio digital

Cardápio online da sorveteria. O cliente monta o pedido e envia pelo WhatsApp da loja. Não tem banco de dados nem login.

Next.js 16 (App Router) · shadcn/ui · Tailwind CSS 4 · pnpm

## Rodar

```bash
pnpm install
cp .env.example .env.local   # e coloque o número do WhatsApp
pnpm dev                     # http://localhost:3000
```

Produção: `pnpm build && pnpm start`. Testes da lógica de preço e mensagem: `pnpm test`.

## Variáveis (`.env.local`)

| Variável | Exemplo | Para quê |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5511999999999` | Número que recebe os pedidos (55 + DDD + número, só dígitos) |
| `NEXT_PUBLIC_SITE_URL` | `https://cantinhogelado.com.br` | URL pública, usada na prévia do link (Open Graph) |

Depois de mudar o `.env.local`, reinicie o `pnpm dev` (ou rode o build de novo).

## Editar o cardápio

Tudo fica em `src/config/`:

- **`menu.ts`**: categorias, produtos, tamanhos e adicionais. **Os preços são em centavos**: `1600` = R$ 16,00.
  - `price: null` mostra **"Consultar"** e impede o item de ir para o carrinho. Quando você colocar um número, o item passa a funcionar sozinho.
  - Fotos: ficam em `public/images/webp/` (formato 4:3, ex.: 1200×900). O campo `image` aponta para o arquivo (ex.: `/images/webp/acai.webp`). Se a foto não existir, aparece o emoji da categoria. Depois de trocar uma foto, rode o build de novo.
- **`flavors.ts`**: lista de sabores de sorvete e de milk shake.
- **`store.ts`**: nome, slogan, horário de funcionamento e regras de entrega: taxa (`fee`), valor para frete grátis (`freeFrom`), ambos em centavos, e dias com entrega (`days`: 0 = domingo, 6 = sábado). Nos outros dias o carrinho só aceita retirada.

Cores e fontes: `src/app/globals.css` (variáveis do tema) e `src/app/layout.tsx`.
