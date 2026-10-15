import type { Metadata, Viewport } from "next"
import { Fredoka, Nunito } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { STORE } from "@/config/store"
import "./globals.css"

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" })

const description = `Cardápio digital da ${STORE.name}: açaí, milk shakes, sorvetes, picolés e potes. Monte seu pedido e envie pelo WhatsApp.`

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${STORE.name} | Cardápio e pedidos`,
  description,
  openGraph: {
    title: `${STORE.name} | ${STORE.slogan}`,
    description,
    siteName: STORE.name,
    locale: "pt_BR",
    type: "website",
  },
}

export const viewport: Viewport = { themeColor: "#e8457a" }

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </body>
    </html>
  )
}
