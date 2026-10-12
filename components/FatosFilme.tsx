export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** Linha de ano, duração, gêneros e nota. Feita para ficar dentro do Palco. */
export function FatosFilme({
  ano,
  duracao = null,
  generos = [],
  nota,
}: {
  ano: number | null;
  duracao?: number | null;
  generos?: string[];
  nota: number | null;
}) {
  return (
    <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
      {ano !== null && <li>{ano}</li>}
      {duracao !== null && <li>{formatarDuracao(duracao)}</li>}
      {generos.map((genero) => (
        <li key={genero}>{genero}</li>
      ))}
      <li className="rounded-md bg-tela/15 px-2 py-0.5">
        {nota !== null ? (
          <>
            <span aria-hidden="true">★</span>
            <span className="sr-only">Nota</span> {nota.toFixed(1)}
          </>
        ) : (
          "Sem avaliações"
        )}
      </li>
    </ul>
  );
}
