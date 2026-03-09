/**
 * ⚠️  AVISO DE SEGURANÇA
 * Credenciais client-side são sempre visíveis no bundle do navegador.
 * Para autenticação verdadeiramente segura, use Lovable Cloud com
 * autenticação server-side e senhas com hash.
 *
 * Este arquivo centraliza as credenciais para facilitar a troca,
 * mas NÃO as oculta de quem inspecionar o bundle.
 */

export const AUTH_CONFIG = {
  username: "murillo",
  password: "changeme123",
  maxAttempts: 5,
  lockDurationMs: 10 * 60 * 1000, // 10 minutos
} as const;
