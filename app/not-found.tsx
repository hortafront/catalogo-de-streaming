import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="py-16 text-center">
      <h1 className="cartaz text-4xl leading-none sm:text-5xl">
        Página não encontrada
      </h1>
      <p className="mt-2 text-texto-suave">
        O filme ou a página que você procura não existe.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}
