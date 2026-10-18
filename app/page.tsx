import { Suspense } from "react";
import { AbasInicio } from "@/components/AbasInicio";
import { Destaque } from "@/components/Destaque";
import { FileiraFilmes } from "@/components/FileiraFilmes";
import { EsqueletosFilmes } from "@/components/GradeFilmes";
import { ListaMarcada } from "@/components/ListaMarcada";
import { lerAba } from "@/lib/abas";
import type { Filtros } from "@/lib/tipos";

// Os números em `generos` são os ids de gênero do TMDB.
const FILEIRAS: { titulo: string; filtros: Partial<Filtros> }[] = [
  { titulo: "Em alta no streaming", filtros: {} },
  { titulo: "Mais bem avaliados", filtros: { ordem: "nota" } },
  // A nota mínima tira da frente os lançamentos que quase ninguém viu.
  { titulo: "Lançamentos recentes", filtros: { ordem: "lancamento", notaMin: 6 } },
  { titulo: "Ação", filtros: { generos: [28] } },
  { titulo: "Comédia", filtros: { generos: [35] } },
  { titulo: "Suspense", filtros: { generos: [53] } },
  { titulo: "Animação", filtros: { generos: [16] } },
  { titulo: "Ficção científica", filtros: { generos: [878] } },
];

type Props = PageProps<"/">;

async function Conteudo({ searchParams }: Pick<Props, "searchParams">) {
  const aba = lerAba((await searchParams).aba);

  return (
    <>
      <AbasInicio atual={aba} />
      <div role="tabpanel" id="painel-inicio" aria-labelledby={`aba-${aba}`}>
        {aba === "catalogo" ? (
          <>
            <Destaque />
            {FILEIRAS.map(({ titulo, filtros }) => (
              <FileiraFilmes key={titulo} titulo={titulo} filtros={filtros} />
            ))}
          </>
        ) : (
          <ListaMarcada
            estado={aba === "quero-assistir" ? "quero_assistir" : "assistido"}
            aba={aba}
          />
        )}
      </div>
    </>
  );
}

export default function Pagina({ searchParams }: Props) {
  return (
    <>
      <h1 className="sr-only">Catálogo de Streaming</h1>
      {/* A aba vem da URL, que só existe na requisição. */}
      <Suspense fallback={<EsqueletosFilmes />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}
