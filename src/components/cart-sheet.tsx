"use client"

import { useState } from "react"
import { ChevronRightIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { STORE } from "@/config/store"
import { cart, useCart } from "@/lib/cart"
import { brl, buildMessage, isDeliveryDay, parseMoney, totals, whatsappUrl, type Checkout } from "@/lib/order"

type Errors = Partial<Record<"name" | "address" | "change", string>>

export function CartSheet() {
  const items = useCart()
  const [open, setOpen] = useState(false)
  // checado ao abrir o carrinho (evento), não no render, para não depender da data no prerender
  const [deliveryToday, setDeliveryToday] = useState(false)
  const [form, setForm] = useState({ name: "", type: "", address: "", payment: "pix", change: "", notes: "" })
  const [errors, setErrors] = useState<Errors>({})
  const count = items.reduce((n, i) => n + i.qty, 0)
  const type: Checkout["type"] = deliveryToday && form.type === "entrega" ? "entrega" : "retirada"
  const { subtotal, fee, total } = totals(items, type, STORE.delivery)
  const missingForFree = STORE.delivery.freeFrom - subtotal

  function onOpenChange(next: boolean) {
    if (next) {
      const today = isDeliveryDay(STORE.delivery)
      setDeliveryToday(today)
      if (today && !form.type) setForm((f) => ({ ...f, type: "entrega" }))
    }
    setOpen(next)
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const field = (k: keyof typeof form) => ({
    id: `checkout-${k}`,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k)(e.target.value),
    "aria-invalid": k in errors || undefined,
    "aria-describedby": k in errors ? `checkout-${k}-error` : undefined,
  })

  function send() {
    const change = form.change.trim() ? parseMoney(form.change) : null
    const e: Errors = {}
    if (!form.name.trim()) e.name = "Informe seu nome."
    if (type === "entrega" && !form.address.trim()) e.address = "Informe o endereço completo para entrega."
    if (form.payment === "dinheiro" && form.change.trim() && (change === null || change < total))
      e.change = `Informe um valor igual ou maior que ${brl(total)}.`
    setErrors(e)
    if (Object.keys(e).length) return toast.error("Confira os campos destacados.")

    const checkout: Checkout = { ...form, type, payment: form.payment as Checkout["payment"], change }
    const url = whatsappUrl(STORE.whatsapp, buildMessage(STORE.name, items, checkout, STORE.delivery))
    window.open(url, "_blank", "noopener")
    // pedido saiu: esvazia o carrinho (e o localStorage). O link fica no toast caso o WhatsApp não abra.
    cart.clear()
    setForm((f) => ({ ...f, change: "", notes: "" }))
    setOpen(false)
    toast.success("Pedido enviado para o WhatsApp!", {
      description: "É só confirmar o envio na conversa.",
      duration: 15000,
      action: { label: "Reenviar", onClick: () => window.open(url, "_blank", "noopener") },
    })
  }

  return (
    <>
    {/* barra fixa "Finalizar pedido" quando há itens; deixa o canto direito livre para o botão do WhatsApp */}
    {count > 0 && !open && (
      <Button
        size="lg"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-4 left-4 right-22 z-30 h-14 justify-between rounded-full px-5 text-base shadow-xl sm:right-auto sm:w-96"
      >
        <span className="flex items-center gap-2">
          <ShoppingBagIcon className="size-5" aria-hidden />
          Finalizar pedido
          <Badge className="bg-accent text-accent-foreground">{count}</Badge>
        </span>
        <span className="flex items-center gap-1 font-heading font-semibold">
          {brl(subtotal)} <ChevronRightIcon className="size-5" aria-hidden />
        </span>
      </Button>
    )}
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="lg" className="relative rounded-full" aria-label={`Abrir carrinho, ${count} ${count === 1 ? "item" : "itens"}`}>
          <ShoppingBagIcon />
          <span className="hidden sm:inline">Carrinho</span>
          {count > 0 && (
            <Badge className="absolute -top-2 -right-2 min-w-5 bg-accent text-accent-foreground" aria-hidden>
              {count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">Seu pedido</SheetTitle>
          <SheetDescription>Revise os itens e envie pelo WhatsApp.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 px-4 pb-4">
            {items.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                <span className="mb-2 block text-5xl" aria-hidden>🍨</span>
                Seu carrinho está vazio.
              </p>
            ) : (
              <>
                <ul className="space-y-3" aria-label="Itens do carrinho">
                  {items.map((i) => (
                    <li key={i.id} className="rounded-xl border bg-card p-3">
                      <div className="flex justify-between gap-2">
                        <p className="font-heading font-semibold">
                          {i.name}
                          {i.flavors.length > 0 && <span className="font-sans font-normal"> ({i.flavors.join(", ")})</span>}
                        </p>
                        <span className="font-semibold whitespace-nowrap">{brl(i.unitPrice * i.qty)}</span>
                      </div>
                      {i.addons.length > 0 && <p className="text-xs text-muted-foreground">+ {i.addons.join(", ")}</p>}
                      {i.note && <p className="text-xs text-muted-foreground">Obs: {i.note}</p>}
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="outline" size="icon-sm" onClick={() => cart.setQty(i.id, i.qty - 1)} aria-label={`Diminuir ${i.name}`}>
                          <MinusIcon />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                        <Button variant="outline" size="icon-sm" onClick={() => cart.setQty(i.id, i.qty + 1)} aria-label={`Aumentar ${i.name}`}>
                          <PlusIcon />
                        </Button>
                        <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => cart.remove(i.id)}>
                          <Trash2Icon /> Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <Separator />

                <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); send() }} id="checkout">
                  <h3 className="text-lg font-semibold">Seus dados</h3>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-name">Nome *</Label>
                    <Input {...field("name")} autoComplete="name" />
                    <FieldError id="checkout-name-error" msg={errors.name} />
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-medium">Tipo de pedido</legend>
                    <RadioGroup value={type} onValueChange={set("type")} className="grid grid-cols-2 gap-2" aria-describedby="delivery-info">
                      {[["entrega", "Entrega"], ["retirada", "Retirada"]].map(([v, l]) => (
                        <div key={v} className="flex items-center gap-2 rounded-lg border p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-muted has-disabled:opacity-60">
                          <RadioGroupItem value={v} id={`type-${v}`} disabled={v === "entrega" && !deliveryToday} />
                          <Label htmlFor={`type-${v}`}>{l}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <p id="delivery-info" className="text-xs text-muted-foreground">
                      {deliveryToday
                        ? `Entrega grátis a partir de ${brl(STORE.delivery.freeFrom)}. Abaixo disso, taxa de ${brl(STORE.delivery.fee)}.`
                        : `${STORE.delivery.label}. Hoje, só retirada na loja.`}
                    </p>
                  </fieldset>

                  {type === "entrega" && (
                    <div className="space-y-2">
                      <Label htmlFor="checkout-address">Endereço completo *</Label>
                      <Textarea {...field("address")} autoComplete="street-address" placeholder="Rua, número, bairro e referência" />
                      <FieldError id="checkout-address-error" msg={errors.address} />
                    </div>
                  )}

                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-medium">Forma de pagamento</legend>
                    <RadioGroup value={form.payment} onValueChange={set("payment")} className="grid grid-cols-3 gap-2">
                      {[["pix", "Pix"], ["dinheiro", "Dinheiro"], ["cartao", "Cartão"]].map(([v, l]) => (
                        <div key={v} className="flex items-center gap-2 rounded-lg border p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-muted">
                          <RadioGroupItem value={v} id={`pay-${v}`} />
                          <Label htmlFor={`pay-${v}`}>{l}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </fieldset>

                  {form.payment === "dinheiro" && (
                    <div className="space-y-2">
                      <Label htmlFor="checkout-change">Troco para quanto?</Label>
                      <Input {...field("change")} inputMode="decimal" placeholder="Ex.: 100 (deixe vazio se não precisar)" />
                      <FieldError id="checkout-change-error" msg={errors.change} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="checkout-notes">Observações gerais</Label>
                    <Textarea {...field("notes")} placeholder="Algo mais que devemos saber?" />
                  </div>
                </form>
              </>
            )}
          </div>
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="border-t bg-muted/60">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
              {type === "entrega" && <div className="flex justify-between"><dt>Taxa de entrega</dt><dd>{fee ? brl(fee) : "Grátis"}</dd></div>}
              {type === "entrega" && fee > 0 && (
                <p className="text-xs font-semibold text-primary">Faltam {brl(missingForFree)} para a entrega grátis!</p>
              )}
              <div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd data-testid="cart-total">{brl(total)}</dd></div>
            </dl>
            <Button type="submit" form="checkout" size="lg" className="h-12 bg-whatsapp text-base text-whatsapp-foreground hover:bg-whatsapp/90">
              Enviar pedido pelo WhatsApp
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
    </>
  )
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} role="alert" className="text-sm font-medium text-destructive">{msg}</p> : null
}
