import { describe, expect, it } from "vitest";
import { lerAba } from "./abas";

describe("lerAba", () => {
  it.each(["catalogo", "quero-assistir", "assistidos"] as const)(
    "aceita %s",
    (aba) => expect(lerAba(aba)).toBe(aba),
  );
  it.each([undefined, "", "xyz", ["assistidos", "x"]])(
    "%s vira catalogo",
    (valor) => expect(lerAba(valor)).toBe("catalogo"),
  );
});
