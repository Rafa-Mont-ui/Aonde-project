// Shared by the Museums collection (admin options) and the app (labels/icons).
export const accessibilityOptions = [
  { value: "rampa", label: "Rampa ou acesso sem degraus" },
  { value: "elevador", label: "Elevador" },
  { value: "banheiro", label: "Banheiro adaptado" },
  { value: "vaga-pcd", label: "Vaga para PcD" },
  { value: "libras", label: "Atendimento em Libras" },
  { value: "audiodescricao", label: "Audiodescrição" },
  { value: "piso-tatil", label: "Piso tátil" },
  { value: "recursos-tateis", label: "Recursos táteis no acervo" },
  { value: "cadeira-de-rodas", label: "Cadeira de rodas para empréstimo" },
] as const

export type AccessibilityFeature = (typeof accessibilityOptions)[number]["value"]

export function accessibilityLabel(value: string) {
  return accessibilityOptions.find((option) => option.value === value)?.label ?? value
}
