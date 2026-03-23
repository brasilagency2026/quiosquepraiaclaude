import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertSuperAdmin, getKiosqueDoGestor } from "./auth";

// ── Super Admin ──────────────────────────────────────

export const listarTodos = query({
  handler: async (ctx) => {
    await assertSuperAdmin(ctx);
    return ctx.db.query("kiosques").collect();
  },
});

export const criar = mutation({
  args: {
    slug: v.string(),
    nom: v.string(),
    ville: v.string(),
    etat: v.string(),
    emailGestor: v.string(),
    nomGestor: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await assertSuperAdmin(ctx);

    // Verificar slug único
    const existing = await ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("Slug já existe");

    const kiosqueId = await ctx.db.insert("kiosques", {
      slug: args.slug,
      nom: args.nom,
      ville: args.ville,
      etat: args.etat,
      actif: true,
      creePar: identity.subject,
    });

    // Categorias padrão
    const cats = [
      { nom: "Bebidas", emoji: "🍺", slug: "bebidas", ordre: 1 },
      { nom: "Frutos do Mar", emoji: "🦐", slug: "frutos", ordre: 2 },
      { nom: "Petiscos", emoji: "🍟", slug: "petiscos", ordre: 3 },
      { nom: "Porções", emoji: "🍖", slug: "porcoes", ordre: 4 },
      { nom: "Sobremesas", emoji: "🍨", slug: "sobremesas", ordre: 5 },
    ];
    for (const cat of cats) {
      await ctx.db.insert("categories", { kiosqueId, ...cat, actif: true });
    }

    // Parasols padrão (12)
    for (let i = 1; i <= 12; i++) {
      await ctx.db.insert("parasols", {
        kiosqueId,
        numero: `GS-${String(i).padStart(2, "0")}`,
        actif: true,
      });
    }

    return kiosqueId;
  },
});

export const suspender = mutation({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    await assertSuperAdmin(ctx);
    await ctx.db.patch(kiosqueId, { actif: false });
  },
});

export const reativar = mutation({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    await assertSuperAdmin(ctx);
    await ctx.db.patch(kiosqueId, { actif: true });
  },
});

// ── Public ───────────────────────────────────────────

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getMenuComplet = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const kiosque = await ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!kiosque || !kiosque.actif) return null;

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();

    const items = await ctx.db
      .query("items")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .collect();

    const parasols = await ctx.db
      .query("parasols")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect();

    return {
      kiosque,
      categories: categories.sort((a, b) => a.ordre - b.ordre),
      items,
      parasols,
    };
  },
});

// ── Gestor ───────────────────────────────────────────

export const atualizarMercadoPago = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    await ctx.db.patch(kiosque._id, { mercadopagoToken: token });
  },
});
