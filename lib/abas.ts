export type Aba = "catalogo" | "quero-assistir" | "assistidos";

export const ABAS: readonly Aba[] = ["catalogo", "quero-assistir", "assistidos"];

export function lerAba(valor: string | string[] | undefined): Aba {
  return ABAS.find((aba) => aba === valor) ?? "catalogo";
}
