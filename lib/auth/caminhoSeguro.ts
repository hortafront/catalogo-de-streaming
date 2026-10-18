const BASE = "http://local.invalid";

// Só caminhos deste site. Em vez de olhar caractere por caractere, deixa o
// parser de URL decidir: ele descarta tab e quebra de linha e trata "\" como
// "/", então "/\t/x.com" e "/\x.com" virariam outro domínio.
export function caminhoSeguro(valor: string | null | undefined): string {
  if (!valor || valor[0] !== "/") return "/";
  try {
    const url = new URL(valor, BASE);
    if (url.origin !== BASE) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}

export function linkEntrar(caminho: string): string {
  return `/entrar?voltar=${encodeURIComponent(caminho)}`;
}
