import { BikeIcon, ClockIcon, MessageCircleIcon } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MENU } from "@/config/menu"
import { STORE } from "@/config/store"
import { brl, whatsappUrl } from "@/lib/order"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-6 pb-28">
        <section className="mb-6 rounded-3xl bg-acai p-5 text-acai-foreground shadow-lg">
          <h1 className="text-3xl font-bold">
            Bateu aquela vontade? <span aria-hidden>🍧</span>
          </h1>
          <p className="mt-1">Escolha seus favoritos e envie o pedido direto no nosso WhatsApp.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-accent-foreground">
              <ClockIcon className="size-4" aria-hidden /> {STORE.hours}
            </p>
            <p className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-1">
              <BikeIcon className="size-4" aria-hidden /> {STORE.delivery.label} · grátis a partir de {brl(STORE.delivery.freeFrom)}
            </p>
          </div>
        </section>

        <Tabs defaultValue={MENU[0].id}>
          <ScrollArea className="-mx-4 px-4 pb-2">
            <TabsList className="flex w-max gap-2 bg-transparent p-0 group-data-horizontal/tabs:h-auto">
              {MENU.map((c) => (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="h-10 flex-none rounded-full border after:hidden border-border bg-card px-4 font-heading text-base text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span aria-hidden>{c.emoji}</span> {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {MENU.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <h2 className="sr-only">{c.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.products.map((p) => (
                  <ProductCard key={p.id} product={p} emoji={c.emoji} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Button asChild size="lg" className="fixed right-4 bottom-4 z-30 size-14 rounded-full bg-whatsapp text-whatsapp-foreground shadow-xl hover:bg-whatsapp/90 sm:w-auto sm:px-5">
        <a href={whatsappUrl(STORE.whatsapp, "Olá! Tenho uma dúvida sobre o cardápio.")} target="_blank" rel="noopener noreferrer">
          <MessageCircleIcon className="size-6" aria-hidden /> <span className="max-sm:sr-only">Falar no WhatsApp</span>
        </a>
      </Button>
    </>
  )
}
