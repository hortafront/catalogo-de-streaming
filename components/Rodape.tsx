export function Rodape() {
  return (
    <footer className="mt-12 border-t border-borda">
      <div className="mx-auto max-w-7xl space-y-1 px-4 py-6 text-sm text-texto-suave">
        <p>
          Este produto usa a API do{" "}
          <a
            href="https://www.themoviedb.org/"
            className="underline"
            rel="noreferrer"
            target="_blank"
          >
            TMDB
          </a>
          , mas não é endossado nem certificado pelo TMDB.
        </p>
        <p>
          Dados de disponibilidade nos streamings fornecidos pelo{" "}
          <a
            href="https://www.justwatch.com/br"
            className="underline"
            rel="noreferrer"
            target="_blank"
          >
            JustWatch
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
