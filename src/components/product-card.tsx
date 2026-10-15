import fs from "node:fs"
import path from "node:path"
import Image from "next/image"
import { AddToCart } from "@/components/add-to-cart"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { startingPrice, type Product } from "@/config/menu"
import { brl } from "@/lib/order"

// Roda no servidor (build): se a imagem não existe em /public, cai no emoji.
const exists = (src?: string) => !!src && fs.existsSync(path.join(process.cwd(), "public", src))

export function ProductCard({ product, emoji }: { product: Product; emoji: string }) {
  const price = startingPrice(product)
  const hasSizes = (product.sizes?.length ?? 0) > 1

  return (
    <Card className="gap-3 pt-0 shadow-md shadow-primary/5 transition-shadow hover:shadow-lg">
      <div className="relative grid aspect-[4/3] place-items-center bg-gradient-to-br from-muted to-accent/40">
        {exists(product.image) ? (
          <Image src={product.image!} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <span className="text-7xl drop-shadow-sm" aria-hidden>{emoji}</span>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
        {product.description && <CardDescription>{product.description}</CardDescription>}
      </CardHeader>
      <CardFooter className="mt-auto justify-between gap-2 bg-transparent">
        {price === null ? (
          <Badge variant="outline" className="h-6 border-accent bg-accent/30 px-3 text-sm">Consultar</Badge>
        ) : (
          <p className="leading-tight">
            {hasSizes && <span className="block text-xs text-muted-foreground">a partir de</span>}
            <span className="font-heading text-xl font-semibold text-primary">{brl(price)}</span>
          </p>
        )}
        <AddToCart product={product} />
      </CardFooter>
    </Card>
  )
}
