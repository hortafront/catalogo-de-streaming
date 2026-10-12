import Form from "next/form";

export function CampoBusca() {
  return (
    <Form action="/busca" role="search" className="relative flex min-w-0 flex-1">
      <label htmlFor="campo-busca" className="sr-only">
        Buscar filme pelo nome
      </label>
      <input
        id="campo-busca"
        name="q"
        type="search"
        required
        maxLength={100}
        placeholder="Buscar filme"
        className="min-w-0 flex-1 rounded-full border border-borda bg-superficie py-2 pl-4 pr-11 placeholder:text-texto-suave"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-texto-suave hover:text-texto"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <circle
            cx="11"
            cy="11"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16.5 16.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </Form>
  );
}
