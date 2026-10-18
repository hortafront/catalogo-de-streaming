// Só caminhos deste site: "//x.com" e "/\x.com" o navegador trata como outro
// domínio, então o ?voltar= viraria um redirecionamento para fora.
export function caminhoSeguro(valor: string | null | undefined): string {
  if (!valor || valor[0] !== "/") return "/";
  if (valor[1] === "/" || valor[1] === "\\") return "/";
  return valor;
}

export function linkEntrar(caminho: string): string {
  return `/entrar?voltar=${encodeURIComponent(caminho)}`;
}
