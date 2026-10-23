// pnpm test
import { test } from "node:test"
import assert from "node:assert/strict"
import { brl, buildMessage, isDeliveryDay, parseMoney, totals, whatsappUrl, type CartItem } from "./order.ts"

const items: CartItem[] = [
  { id: "a", name: "Açaí 500ml", flavors: [], addons: ["Ovomaltine", "Amendoim"], note: "sem granola", unitPrice: 2200 + 300 + 200, qty: 2 },
  { id: "b", name: "Cascão com 2 bolas", flavors: ["Chocolate", "Morango"], addons: [], note: "", unitPrice: 1200, qty: 1 },
]

const delivery = { fee: 500, freeFrom: 5000, days: { 5: 18, 6: 0, 0: 0 } }

test("totais e taxa de entrega", () => {
  assert.deepEqual(totals(items, "entrega", delivery), { subtotal: 6600, fee: 0, total: 6600 }) // >= R$ 50: grátis
  const small = [{ ...items[1], qty: 1 }] // R$ 12
  assert.deepEqual(totals(small, "entrega", delivery), { subtotal: 1200, fee: 500, total: 1700 })
  assert.equal(totals(small, "retirada", delivery).total, 1200)
  assert.equal(totals([{ ...items[1], unitPrice: 2500, qty: 2 }], "entrega", delivery).fee, 0) // exatamente R$ 50
})

test("dias de entrega no horário de Brasília", () => {
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-17T15:00:00-03:00")), true) // sábado
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-18T20:00:00-03:00")), true) // domingo
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-16T17:59:00-03:00")), false) // sexta antes das 18h
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-16T18:00:00-03:00")), true) // sexta 18h
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-15T20:00:00-03:00")), false) // quinta
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-17T00:30:00-03:00")), true) // sábado madrugada
  assert.equal(isDeliveryDay(delivery, new Date("2026-10-19T01:00:00Z")), true) // domingo 22h em Brasília, segunda em UTC
})

test("formatação e parse de dinheiro", () => {
  assert.equal(brl(6100), "R$ 61,00")
  assert.equal(parseMoney("100"), 10000)
  assert.equal(parseMoney("R$ 1.000,50"), 100050)
  assert.equal(parseMoney("abc"), null)
})

test("mensagem e link do WhatsApp", () => {
  const msg = buildMessage("Cantinho Gelado", items, {
    name: "Fulano", type: "entrega", address: "Rua X, 123 - Centro", payment: "dinheiro", change: 10000, notes: "",
  }, delivery)
  assert.equal(msg, [
    "*NOVO PEDIDO - Cantinho Gelado* 🍦", "",
    "*Cliente:* Fulano", "*Tipo:* Entrega", "*Endereço:* Rua X, 123 - Centro", "",
    "*Itens:*",
    "2x Açaí 500ml - R$ 54,00", "   + Ovomaltine, Amendoim", "   Obs: sem granola",
    "1x Cascão com 2 bolas (Chocolate, Morango) - R$ 12,00", "",
    "*Subtotal:* R$ 66,00", "*Taxa de entrega:* R$ 0,00", "*Total:* R$ 66,00", "",
    "*Pagamento:* Dinheiro (troco para R$ 100,00)",
  ].join("\n"))
  const url = whatsappUrl("5511999999999", msg)
  assert.ok(url.startsWith("https://wa.me/5511999999999?text="))
  assert.equal(decodeURIComponent(url.split("?text=")[1]), msg)
})
