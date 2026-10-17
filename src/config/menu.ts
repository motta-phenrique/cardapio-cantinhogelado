// Preços em CENTAVOS (1600 = R$ 16,00). Use `null` para "Consultar":
// o item aparece no cardápio mas não pode ir ao carrinho.

export type Size = { id: string; label: string; price: number | null }

export type Addon = { id: string; name: string; price: number | null }

export type FlavorChoice = {
  /** "sorvete" e "milkshake" usam a lista de src/config/flavors.ts; "livre" é campo de texto opcional */
  source: "sorvete" | "milkshake" | "livre"
  /** quantos sabores o cliente pode escolher */
  max: number
}

export type Product = {
  id: string
  name: string
  description?: string
  /** caminho dentro de /public, ex.: "/images/webp/acai.webp". Se não existir, mostra o emoji da categoria */
  image?: string
  /** preço único (quando não há tamanhos) */
  price?: number | null
  sizes?: Size[]
  flavors?: FlavorChoice
  /** aceita a lista de ADDONS */
  addons?: boolean
  /** `false` esconde o campo "Observação" no pedido */
  note?: boolean
}

export type Category = {
  id: string
  name: string
  emoji: string
  products: Product[]
}

export const ADDONS: Addon[] = [
  { id: "ovomaltine", name: "Ovomaltine", price: 300 },
  { id: "nutella", name: "Nutella", price: null },
  { id: "creme-leitinho", name: "Creme de Leitinho", price: 450 },
  { id: "creme-avela", name: "Creme de Avelã", price: 450 },
  { id: "mais-fruta", name: "Mais fruta", price: 300 },
  { id: "granola", name: "Granola", price: 300 },
  { id: "amendoim", name: "Amendoim", price: 200 },
  { id: "creme-amendoim", name: "Creme de Amendoim", price: 300 },
]

export const MENU: Category[] = [
  {
    id: "acai",
    name: "Açaí",
    emoji: "🍇",
    products: [
      {
        id: "acai",
        name: "Açaí",
        description: "Açaí cremoso no copo. Monte do seu jeito com adicionais.",
        image: "/images/webp/acai.webp",
        addons: true,
        sizes: [
          { id: "300", label: "300ml", price: 1600 },
          { id: "400", label: "400ml", price: 1900 },
          { id: "500", label: "500ml", price: 2200 },
        ],
      },
    ],
  },
  {
    id: "milkshake-acai",
    name: "Milk Shake de Açaí",
    emoji: "🥤",
    products: [
      {
        id: "milkshake-acai",
        name: "Milk Shake de Açaí",
        description: "Batido na hora, bem geladinho.",
        image: "/images/webp/milkshake-acai.webp",
        addons: true,
        sizes: [
          { id: "300", label: "300ml", price: 1600 },
          { id: "400", label: "400ml", price: 1900 },
          { id: "500", label: "500ml", price: 2300 },
        ],
      },
    ],
  },
  {
    id: "sorvetes",
    name: "Sorvetes",
    emoji: "🍦",
    products: [
      { id: "casquinha-1", name: "Casquinha com 1 bola", image: "/images/webp/casquinha.webp", price: 600, flavors: { source: "sorvete", max: 1 } },
      { id: "cascao-1", name: "Cascão com 1 bola", image: "/images/webp/cascao-1-bola.webp", price: 800, flavors: { source: "sorvete", max: 1 } },
      { id: "cascao-2", name: "Cascão com 2 bolas", description: "Escolha até 2 sabores.", image: "/images/webp/cascao-2-bolas.webp", price: 1200, flavors: { source: "sorvete", max: 2 } },
    ],
  },
  {
    id: "milkshake",
    name: "Milk Shake",
    emoji: "🥛",
    products: [
      {
        id: "milkshake",
        name: "Milk Shake",
        description: "Escolha o sabor, o tamanho e os adicionais.",
        image: "/images/webp/milkshake.webp",
        flavors: { source: "milkshake", max: 1 },
        addons: true,
        sizes: [
          { id: "300", label: "300ml", price: 1500 },
          { id: "400", label: "400ml", price: 1700 },
          { id: "500", label: "500ml", price: 2100 },
        ],
      },
    ],
  },
  {
    id: "picoles",
    name: "Picolés",
    emoji: "🍡",
    products: [
      { id: "picole-frutas", name: "Picolé de Frutas", image: "/images/webp/picole-frutas.webp", price: 200, flavors: { source: "livre", max: 1 }, note: false },
      { id: "picole-leite", name: "Picolé de Leite", image: "/images/webp/picole-leite.webp", price: 300, flavors: { source: "livre", max: 1 }, note: false },
      { id: "picole-especial", name: "Picolé Especial", image: "/images/webp/picole-especial.webp", price: null, flavors: { source: "livre", max: 1 }, note: false },
      { id: "moreninha", name: "Moreninha", image: "/images/webp/moreninha.webp", price: 600, note: false },
    ],
  },
  {
    id: "potes",
    name: "Potes",
    emoji: "🧊",
    products: [
      { id: "pote-2l", name: "Pote de Sorvete 2L", description: "Para levar a família toda. Escreva os sabores que deseja.", image: "/images/webp/pote-2l.webp", price: 3990, flavors: { source: "livre", max: 1 }, note: false },
    ],
  },
]

/** Menor preço disponível do produto (null = nada disponível → "Consultar"). */
export function startingPrice(p: Product): number | null {
  const prices = (p.sizes?.map((s) => s.price) ?? [p.price ?? null]).filter((v): v is number => v !== null)
  return prices.length ? Math.min(...prices) : null
}
