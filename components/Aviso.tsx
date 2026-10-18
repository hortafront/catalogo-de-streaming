"use client";

import { useAviso } from "@/hooks/useAviso";

export function Aviso() {
  const texto = useAviso();

  // A região existe sempre: o leitor de tela só anuncia mudanças numa região
  // que já estava na página.
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      {texto && (
        <p className="rounded-full bg-texto px-5 py-3 font-medium text-fundo shadow-lg">
          {texto}
        </p>
      )}
    </div>
  );
}
