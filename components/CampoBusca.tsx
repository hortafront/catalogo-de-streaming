import Form from "next/form";

export function CampoBusca() {
  return (
    <Form action="/busca" role="search" className="flex min-w-0 flex-1 gap-2">
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
        className="min-w-0 flex-1 rounded-full border border-borda-forte bg-superficie px-4 py-2 placeholder:text-texto-suave"
      />
      <button
        type="submit"
        className="rounded-full bg-destaque px-4 py-2 font-medium text-sobre-destaque"
      >
        Buscar
      </button>
    </Form>
  );
}
