import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getKiosqueDoGestor, hashPinSimple, verifyPinSimple } from "./auth";

// ── Gestion du staff par le Gestor ───────────────────

export const listarFuncionarios = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    return ctx.db
      .query("usuarios")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();
  },
});

export const criarFuncionario = mutation({
  args: {
    nom: v.string(),
    telephone: v.optional(v.string()),
    role: v.union(
      v.literal("cozinha"),
      v.literal("caixa"),
      v.literal("garcom")
    ),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);

    if (args.pin.length !== 4 || !/^\d{4}$/.test(args.pin)) {
      throw new Error("PIN deve ter exatamente 4 dígitos");
    }

    const pinHash = hashPinSimple(args.pin);

    // Verificar PIN duplicado no mesmo quiosque
    const todos = await ctx.db
      .query("usuarios")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();

    const duplicado = todos.find(u => u.pinHash === pinHash);
    if (duplicado) {
      throw new Error(`PIN já está em uso por ${duplicado.nom}. Escolha um PIN diferente.`);
    }

    return ctx.db.insert("usuarios", {
      kiosqueId: kiosque._id,
      nom: args.nom,
      telephone: args.telephone,
      role: args.role,
      pinHash,
      actif: true,
    });
  },
});

export const alterarPIN = mutation({
  args: {
    usuarioId: v.id("usuarios"),
    novoPin: v.string(),
  },
  handler: async (ctx, { usuarioId, novoPin }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const usuario = await ctx.db.get(usuarioId);
    if (!usuario || usuario.kiosqueId !== kiosque._id) {
      throw new Error("Funcionário não encontrado");
    }
    if (!/^\d{4}$/.test(novoPin)) throw new Error("PIN inválido");

    const novoHash = hashPinSimple(novoPin);

    // Verificar duplicado (excluindo o próprio usuário)
    const todos = await ctx.db
      .query("usuarios")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();

    const duplicado = todos.find(u => u.pinHash === novoHash && u._id !== usuarioId);
    if (duplicado) {
      throw new Error(`PIN já está em uso por ${duplicado.nom}. Escolha um PIN diferente.`);
    }

    await ctx.db.patch(usuarioId, { pinHash: novoHash });
  },
});

export const desativarFuncionario = mutation({
  args: { usuarioId: v.id("usuarios") },
  handler: async (ctx, { usuarioId }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const usuario = await ctx.db.get(usuarioId);
    if (!usuario || usuario.kiosqueId !== kiosque._id) {
      throw new Error("Funcionário não encontrado");
    }
    await ctx.db.patch(usuarioId, { actif: false });
    // Revogar todas as sessões
    const sessoes = await ctx.db
      .query("sessoesPIN")
      .withIndex("by_usuario", (q) => q.eq("usuarioId", usuarioId))
      .collect();
    for (const s of sessoes) {
      await ctx.db.delete(s._id);
    }
  },
});

// ── Login PIN ────────────────────────────────────────

export const loginPIN = mutation({
  args: {
    kiosqueSlug: v.string(),
    pin: v.string(),
    dispositivo: v.optional(v.string()),
  },
  handler: async (ctx, { kiosqueSlug, pin, dispositivo }) => {
    const kiosque = await ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", kiosqueSlug))
      .first();
    if (!kiosque || !kiosque.actif) throw new Error("Quiosque não encontrado");

    const funcionarios = await ctx.db
      .query("usuarios")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();

    const usuario = funcionarios.find(
      (u) => u.pinHash && verifyPinSimple(pin, u.pinHash)
    );
    if (!usuario) throw new Error("PIN incorreto");

    // Criar sessão 8h
    const token = crypto.randomUUID();
    const expiraEm = Date.now() + 8 * 60 * 60 * 1000;

    await ctx.db.insert("sessoesPIN", {
      usuarioId: usuario._id,
      kiosqueId: kiosque._id,
      token,
      expiraEm,
      dispositivo: dispositivo ?? "desconhecido",
    });

    await ctx.db.patch(usuario._id, { derniereConexao: Date.now() });

    return {
      token,
      role: usuario.role,
      nom: usuario.nom,
      kiosqueSlug,
      expiraEm,
    };
  },
});

export const verificarSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessoesPIN")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!session || session.expiraEm < Date.now()) return null;

    const usuario = await ctx.db.get(session.usuarioId);
    const kiosque = await ctx.db.get(session.kiosqueId);
    if (!usuario?.actif || !kiosque?.actif) return null;

    return {
      role: usuario.role,
      nom: usuario.nom,
      kiosqueId: session.kiosqueId,
      kiosqueSlug: kiosque.slug,
      kiosqueNom: kiosque.nom,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessoesPIN")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

// ── Nettoyage sessions expirées (appelé par cron) ────

export const nettoyerSessions = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expires = await ctx.db
      .query("sessoesPIN")
      .collect();
    let count = 0;
    for (const s of expires) {
      if (s.expiraEm < now) {
        await ctx.db.delete(s._id);
        count++;
      }
    }
    return { deleted: count };
  },
});
