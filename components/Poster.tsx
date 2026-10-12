import Image from "next/image";
import { urlImagem } from "@/lib/config";

const DIMENSOES = { w342: [342, 513], w500: [500, 750] } as const;

export function Poster({
  caminho,
  titulo,
  tamanho = "w342",
}: {
  caminho: string | null;
  titulo: string;
  tamanho?: keyof typeof DIMENSOES;
}) {
  const url = urlImagem(caminho, tamanho);
  if (!url) {
    return (
      <div className="grid aspect-[2/3] w-full place-items-center rounded-lg border border-borda bg-superficie p-3 text-center text-sm text-texto-suave">
        Sem pôster
      </div>
    );
  }
  const [largura, altura] = DIMENSOES[tamanho];
  // unoptimized: o TMDB já entrega o tamanho pedido, e isso poupa a cota de
  // otimização de imagens da Vercel.
  return (
    <Image
      src={url}
      alt={`Pôster de ${titulo}`}
      width={largura}
      height={altura}
      unoptimized
      className="aspect-[2/3] w-full rounded-lg bg-superficie object-cover"
    />
  );
}
