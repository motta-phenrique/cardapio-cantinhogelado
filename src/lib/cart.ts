import { useSyncExternalStore } from "react"
import type { CartItem } from "@/lib/order"

// Carrinho client-side persistido em localStorage, sem Provider.
// ponytail: guarda nome/preço no momento da compra; se o menu mudar, itens antigos mantêm o preço antigo.
const KEY = "cantinho-gelado:cart"
const EMPTY: CartItem[] = []
const listeners = new Set<() => void>()
let cache: CartItem[] | null = null

function read(): CartItem[] {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartItem[]
  } catch {
    cache = []
  }
  return cache
}

function write(items: CartItem[]) {
  cache = items
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const cart = {
  add: (item: Omit<CartItem, "id">) => write([...read(), { ...item, id: crypto.randomUUID() }]),
  setQty: (id: string, qty: number) =>
    write(qty < 1 ? read().filter((i) => i.id !== id) : read().map((i) => (i.id === id ? { ...i, qty } : i))),
  remove: (id: string) => write(read().filter((i) => i.id !== id)),
  clear: () => write([]),
}

export const useCart = () => useSyncExternalStore(subscribe, read, () => EMPTY)
