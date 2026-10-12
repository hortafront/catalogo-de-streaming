import type { ReactNode } from "react";

const CLASSES_GRADE =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function GradeFilmes({ children }: { children: ReactNode }) {
  return <ul className={CLASSES_GRADE}>{children}</ul>;
}

export function EsqueletosFilmes({ quantidade = 12 }: { quantidade?: number }) {
  return (
    <div className={CLASSES_GRADE} aria-hidden="true">
      {Array.from({ length: quantidade }, (_, indice) => (
        <div key={indice}>
          <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-borda" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-borda" />
          <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-borda" />
        </div>
      ))}
    </div>
  );
}
