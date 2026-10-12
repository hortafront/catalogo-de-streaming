import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { Provedores } from "./provedores";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Catálogo de Streaming",
    template: "%s · Catálogo de Streaming",
  },
  description:
    "Os filmes disponíveis agora nos serviços de streaming do Brasil.",
};

// Aplica o tema salvo antes da primeira pintura, para a página não piscar.
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("catalogo:tema");if(t==="claro"||t==="escuro"){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-destaque focus:px-3 focus:py-2 focus:text-sobre-destaque"
        >
          Pular para o conteúdo
        </a>
        <Provedores>
          <Cabecalho />
          <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
            {children}
          </main>
          <Rodape />
        </Provedores>
      </body>
    </html>
  );
}
