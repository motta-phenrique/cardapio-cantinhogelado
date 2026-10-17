export const STORE = {
  name: "Cantinho Gelado",
  slogan: "O sabor que refresca seu dia!",
  /** formato 55DDDNUMERO, só dígitos. Pode ser sobrescrito por NEXT_PUBLIC_WHATSAPP_NUMBER */
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5543999179636").replace(/\D/g, ""),
  hours: "Quarta a domingo, das 14h às 21h",
  delivery: {
    /** taxa em centavos, cobrada quando o subtotal fica abaixo de freeFrom */
    fee: 500,
    /** entrega grátis a partir deste subtotal (centavos) */
    freeFrom: 5000,
    /** dias com entrega (0 = domingo ... 6 = sábado); nos outros dias, só retirada */
    days: [6, 0],
    label: "Entregas aos sábados e domingos",
  },
}
