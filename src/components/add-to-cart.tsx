"use client"

import { useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { FLAVORS } from "@/config/flavors"
import { ADDONS, startingPrice, type Product } from "@/config/menu"
import { cart } from "@/lib/cart"
import { brl } from "@/lib/order"

export function AddToCart({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const available = startingPrice(product) !== null

  if (!available) {
    return (
      <Button disabled aria-label={`${product.name}: consultar preço na loja`}>
        <PlusIcon /> Selecionar
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label={`Selecionar ${product.name}`}>
          <PlusIcon /> Selecionar
        </Button>
      </DialogTrigger>
      {/* conteúdo desmonta ao fechar, então o formulário reinicia a cada abertura */}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <ProductForm product={product} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ProductForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const firstSize = product.sizes?.find((s) => s.price !== null)
  const [sizeId, setSizeId] = useState(firstSize?.id ?? "")
  const [addonIds, setAddonIds] = useState<string[]>([])
  const [flavors, setFlavors] = useState<string[]>([])
  const [freeFlavor, setFreeFlavor] = useState("")
  const [note, setNote] = useState("")
  const [qty, setQty] = useState(1)

  const size = product.sizes?.find((s) => s.id === sizeId)
  const addons = ADDONS.filter((a) => addonIds.includes(a.id))
  const unitPrice = (size ? size.price! : product.price!) + addons.reduce((s, a) => s + a.price!, 0)
  const choice = product.flavors
  const list = choice && choice.source !== "livre" ? FLAVORS[choice.source] : null
  const missingFlavor = list !== null && flavors.length === 0

  function toggle<T>(arr: T[], v: T) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  }

  function submit() {
    if (missingFlavor) return
    cart.add({
      name: size ? `${product.name} ${size.label}` : product.name,
      flavors: choice?.source === "livre" ? (freeFlavor.trim() ? [freeFlavor.trim()] : []) : flavors,
      addons: addons.map((a) => a.name),
      note,
      unitPrice,
      qty,
    })
    toast.success(`${qty}x ${product.name} no carrinho!`)
    onDone()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{product.name}</DialogTitle>
        <DialogDescription>{product.description ?? "Personalize seu pedido."}</DialogDescription>
      </DialogHeader>

      {product.sizes && (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-heading font-semibold">Tamanho</legend>
          <RadioGroup value={sizeId} onValueChange={setSizeId}>
            {product.sizes.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-muted">
                <RadioGroupItem value={s.id} id={`size-${s.id}`} disabled={s.price === null} />
                <Label htmlFor={`size-${s.id}`} className="flex-1">{s.label}</Label>
                {s.price === null ? <Badge variant="outline">Consultar</Badge> : <span className="text-sm font-semibold">{brl(s.price)}</span>}
              </div>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {list && choice && (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-heading font-semibold">
            {choice.label ?? (choice.max === 1 ? "Sabor" : `Sabores (até ${choice.max})`)}
          </legend>
          {choice.max === 1 ? (
            <RadioGroup value={flavors[0] ?? ""} onValueChange={(v) => setFlavors([v])} className="grid grid-cols-2 gap-2">
              {list.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <RadioGroupItem value={f} id={`flavor-${f}`} />
                  <Label htmlFor={`flavor-${f}`}>{f}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {list.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Checkbox
                    id={`flavor-${f}`}
                    checked={flavors.includes(f)}
                    disabled={!flavors.includes(f) && flavors.length >= choice.max}
                    onCheckedChange={() => setFlavors(toggle(flavors, f))}
                  />
                  <Label htmlFor={`flavor-${f}`}>{f}</Label>
                </div>
              ))}
            </div>
          )}
          {missingFlavor && <p className="text-xs text-muted-foreground">Escolha uma opção.</p>}
        </fieldset>
      )}

      {choice?.source === "livre" && (
        <div className="space-y-2">
          <Label htmlFor="free-flavor">Sabores</Label>
          <Textarea id="free-flavor" value={freeFlavor} onChange={(e) => setFreeFlavor(e.target.value)} placeholder="Escreva os sabores que você quer" />
        </div>
      )}

      {product.addons && (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-heading font-semibold">Adicionais</legend>
          {ADDONS.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <Checkbox
                id={`addon-${a.id}`}
                checked={addonIds.includes(a.id)}
                disabled={a.price === null}
                onCheckedChange={() => setAddonIds(toggle(addonIds, a.id))}
              />
              <Label htmlFor={`addon-${a.id}`} className="flex-1">{a.name}</Label>
              {a.price === null ? <Badge variant="outline">Consultar</Badge> : <span className="text-sm">+ {brl(a.price)}</span>}
            </div>
          ))}
        </fieldset>
      )}

      {product.note !== false && (
        <div className="space-y-2">
          <Label htmlFor="item-note">Observação</Label>
          <Textarea id="item-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: sem granola, caprichar na calda..." />
        </div>
      )}

      <Separator />

      <DialogFooter className="flex-row items-center justify-between gap-3 sm:justify-between">
        <div className="flex items-center gap-2" role="group" aria-label="Quantidade">
          <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir quantidade" disabled={qty <= 1}>
            <MinusIcon />
          </Button>
          <span className="w-6 text-center font-semibold" aria-live="polite">{qty}</span>
          <Button variant="outline" size="icon" onClick={() => setQty(qty + 1)} aria-label="Aumentar quantidade">
            <PlusIcon />
          </Button>
        </div>
        <Button onClick={submit} disabled={missingFlavor} className="flex-1 sm:flex-none" size="lg">
          Adicionar {brl(unitPrice * qty)}
        </Button>
      </DialogFooter>
    </>
  )
}
