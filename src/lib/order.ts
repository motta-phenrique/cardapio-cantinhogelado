// Lógica pura de pedido (sem React), coberta por order.test.ts.

export type CartItem = {
  id: string
  /** nome exibido, ex.: "Açaí 500ml" */
  name: string
  flavors: string[]
  addons: string[]
  note: string
  /** centavos, já com adicionais */
  unitPrice: number
  qty: number
}

export type Checkout = {
  name: string
  type: "entrega" | "retirada"
  address: string
  payment: "pix" | "dinheiro" | "cartao"
  /** troco para (centavos) ou null */
  change: number | null
  notes: string
}

const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
// Intl usa espaço não separável depois do "R$"; trocamos por espaço comum.
export const brl = (cents: number) => fmt.format(cents / 100).replace(/\s/g, " ")

/** "100", "100,50", "R$ 1.000,00" → centavos; null se inválido. */
export function parseMoney(input: string): number | null {
  const clean = input.replace(/[^\d,]/g, "").replace(",", ".")
  const n = Number(clean)
  return clean && Number.isFinite(n) ? Math.round(n * 100) : null
}

/** days: dia da semana (0 = domingo) → hora a partir da qual aceita entrega */
export type Delivery = { fee: number; freeFrom: number; days: Record<number, number> }

export function totals(items: CartItem[], type: Checkout["type"], d: Delivery) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const fee = type === "entrega" && subtotal < d.freeFrom ? d.fee : 0
  return { subtotal, fee, total: subtotal + fee }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const nowBR = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", hourCycle: "h23", timeZone: "America/Sao_Paulo" })

/** Agora (no horário de Brasília) aceita entrega? */
export function isDeliveryDay(d: Delivery, now = new Date()) {
  const parts = nowBR.formatToParts(now)
  const part = (t: string) => parts.find((p) => p.type === t)!.value
  const from = d.days[WEEKDAYS.indexOf(part("weekday"))]
  return from !== undefined && Number(part("hour")) >= from
}

const PAYMENT = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão" }

export function buildMessage(storeName: string, items: CartItem[], c: Checkout, d: Delivery): string {
  const { subtotal, fee, total } = totals(items, c.type, d)
  const lines = [`*NOVO PEDIDO - ${storeName}* 🍦`, "", `*Cliente:* ${c.name.trim()}`]
  lines.push(`*Tipo:* ${c.type === "entrega" ? "Entrega" : "Retirada"}`)
  if (c.type === "entrega") lines.push(`*Endereço:* ${c.address.trim()}`)
  lines.push("", "*Itens:*")
  for (const i of items) {
    const flavors = i.flavors.length ? ` (${i.flavors.join(", ")})` : ""
    lines.push(`${i.qty}x ${i.name}${flavors} - ${brl(i.unitPrice * i.qty)}`)
    if (i.addons.length) lines.push(`   + ${i.addons.join(", ")}`)
    if (i.note.trim()) lines.push(`   Obs: ${i.note.trim()}`)
  }
  lines.push("", `*Subtotal:* ${brl(subtotal)}`)
  if (c.type === "entrega") lines.push(`*Taxa de entrega:* ${brl(fee)}`)
  lines.push(`*Total:* ${brl(total)}`, "")
  let payment = PAYMENT[c.payment]
  if (c.payment === "dinheiro") payment += c.change ? ` (troco para ${brl(c.change)})` : " (sem troco)"
  lines.push(`*Pagamento:* ${payment}`)
  if (c.notes.trim()) lines.push(`*Observações:* ${c.notes.trim()}`)
  return lines.join("\n")
}

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`
