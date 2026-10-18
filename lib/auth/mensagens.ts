const MENSAGENS: Record<string, string> = {
  invalid_credentials: "Email ou senha incorretos.",
  user_already_exists: "Esse email já tem conta.",
  email_exists: "Esse email já tem conta.",
  weak_password: "A senha precisa ter pelo menos 6 caracteres.",
};

export function mensagemErroAuth(
  erro: { code?: string } | null | undefined,
): string {
  const codigo = erro?.code;
  return codigo && Object.hasOwn(MENSAGENS, codigo)
    ? MENSAGENS[codigo]
    : "Não foi possível entrar agora. Tente de novo.";
}
