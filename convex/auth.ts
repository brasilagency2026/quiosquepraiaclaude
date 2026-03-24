import { QueryCtx, MutationCtx } from "./_generated/server";

export const SUPER_ADMIN_IDS: string[] = [
  "user_3BLniordP8ig9HQg4fuyate3g8N",
];

export async function assertSuperAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Não autenticado");
  if (!SUPER_ADMIN_IDS.includes(identity.subject))
    throw new Error("Acesso negado");
  return identity;
}

export async function getKiosqueDoGestor(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Não autenticado");

  const usuario = await ctx.db
    .query("usuarios")
    .withIndex("by_clerk", (q) => q.eq("clerkUserId", identity.subject))
    .first();

  if (!usuario) throw new Error("Usuário não encontrado");
  if (usuario.role !== "gestor" && !SUPER_ADMIN_IDS.includes(identity.subject)) {
    throw new Error("Acesso negado");
  }

  const kiosque = await ctx.db.get(usuario.kiosqueId);
  if (!kiosque) throw new Error("Quiosque não encontrado");
  if (!kiosque.actif) throw new Error("Quiosque inativo");

  return { usuario, kiosque };
}

export function hashPinSimple(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = (Math.imul(31, h) + pin.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0') + pin.length;
}

export function verifyPinSimple(pin: string, hash: string): boolean {
  return hashPinSimple(pin) === hash;
}
