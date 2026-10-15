import Image from "next/image"
import { CartSheet } from "@/components/cart-sheet"
import { STORE } from "@/config/store"

// [x, comprimento] de cada gota da calda
const DRIPS = [[30, 26], [95, 18], [150, 36], [230, 22], [300, 32], [370, 16], [440, 38], [520, 24], [590, 30], [660, 18], [730, 36], [810, 22], [880, 30], [950, 16], [1020, 34], [1100, 24], [1165, 30]]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      {/* calda de chocolate escorrendo */}
      <svg viewBox="0 0 1200 40" preserveAspectRatio="xMidYMin slice" className="block h-6 w-full text-secondary" aria-hidden>
        <g fill="currentColor">
          <rect width="1200" height="10" />
          {DRIPS.map(([x, h]) => (
            <rect key={x} x={x} y="0" width="18" height={h} rx="9" />
          ))}
        </g>
      </svg>
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pb-3">
        <Image src="/images/logo.png" alt="" width={56} height={56} priority className="size-14 rounded-full ring-2 ring-white/70" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-2xl leading-none font-bold tracking-tight drop-shadow-sm">{STORE.name}</p>
          <p className="truncate text-sm font-semibold">{STORE.slogan}</p>
        </div>
        <CartSheet />
      </div>
    </header>
  )
}
