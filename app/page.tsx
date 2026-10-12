import { Destaque } from "@/components/Destaque";
import { FileiraFilmes } from "@/components/FileiraFilmes";
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

export default function Pagina() {
  return (
    <>
      <h1 className="sr-only">Catálogo de Streaming</h1>
      <Destaque />
      {FILEIRAS.map(({ titulo, filtros }) => (
        <FileiraFilmes key={titulo} titulo={titulo} filtros={filtros} />
      ))}
    </>
  );
}
