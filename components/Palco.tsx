import Image from "next/image";
import type { ReactNode } from "react";
import { urlImagem } from "@/lib/config";

const ALTURAS = {
  alto: "min-h-[min(76vh,44rem)]",
  medio: "min-h-[26rem]",
  baixo: "min-h-[16rem]",
};

/**
 * Cartão largo com uma imagem ao fundo: a cena de um filme (`fundo`) ou
 * qualquer outro `cenario`. O texto fica sobre a imagem, então as cores aqui
 * são fixas (sala e tela) e não acompanham o tema.
 */
export function Palco({
  fundo = null,
  cenario,
  tamanho = "medio",
  children,
}: {
  fundo?: string | null;
  cenario?: ReactNode;
  tamanho?: keyof typeof ALTURAS;
  children: ReactNode;
}) {
  const url = urlImagem(fundo, "w1280");

  return (
    <div
      className={`relative isolate flex overflow-hidden rounded-2xl bg-sala text-tela ${ALTURAS[tamanho]}`}
    >
      {url && (
        <Image
          key={url}
          src={url}
          alt=""
          width={1280}
          height={720}
          unoptimized
          priority
          className="absolute inset-0 -z-10 size-full animate-surgir object-cover object-[70%_20%]"
        />
      )}
      {cenario}
      {/* Escurece a esquerda e a base, onde o texto fica. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-sala via-sala/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-sala to-transparent"
      />
      <div className="flex w-full flex-col justify-end p-5 sm:p-8 lg:p-12">
        {children}
      </div>
    </div>
  );
}
