import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getKiosqueDoGestor } from "./auth";

// ── Categorias ───────────────────────────────────────

export const listarCategorias = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    return ctx.db
      .query("categories")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .filter((q) => q.eq(q.field("actif"), true))
      .collect()
      .then((cats) => cats.sort((a, b) => a.ordre - b.ordre));
  },
});

export const criarCategoria = mutation({
  args: {
    nom: v.string(),
    emoji: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const existentes = await ctx.db
      .query("categories")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .collect();
    const ordre = existentes.length + 1;
    return ctx.db.insert("categories", {
      kiosqueId: kiosque._id,
      nom: args.nom,
      emoji: args.emoji,
      slug: args.slug,
      ordre,
      actif: true,
    });
  },
});

export const editarCategoria = mutation({
  args: {
    categorieId: v.id("categories"),
    nom: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, { categorieId, nom, emoji }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const cat = await ctx.db.get(categorieId);
    if (!cat || cat.kiosqueId !== kiosque._id) throw new Error("Categoria não encontrada");
    await ctx.db.patch(categorieId, { nom, emoji });
  },
});

export const reordenarCategorias = mutation({
  args: { slugsOrdem: v.array(v.string()) },
  handler: async (ctx, { slugsOrdem }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const cats = await ctx.db
      .query("categories")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosque._id))
      .collect();
    for (const cat of cats) {
      const newOrdre = slugsOrdem.indexOf(cat.slug) + 1;
      if (newOrdre > 0) await ctx.db.patch(cat._id, { ordre: newOrdre });
    }
  },
});

export const excluirCategoria = mutation({
  args: { categorieId: v.id("categories") },
  handler: async (ctx, { categorieId }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const cat = await ctx.db.get(categorieId);
    if (!cat || cat.kiosqueId !== kiosque._id) throw new Error("Categoria não encontrada");
    // Verificar se tem items
    const items = await ctx.db
      .query("items")
      .withIndex("by_categorie", (q) => q.eq("categorieId", categorieId))
      .first();
    if (items) throw new Error("Mova os itens desta categoria primeiro");
    await ctx.db.patch(categorieId, { actif: false });
  },
});

// ── Items ────────────────────────────────────────────

export const listarItems = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    return ctx.db
      .query("items")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .collect();
  },
});

export const criarItem = mutation({
  args: {
    categorieId: v.id("categories"),
    nom: v.string(),
    description: v.string(),
    prix: v.number(),
    emoji: v.string(),
    sku: v.optional(v.string()),
    variacoes: v.optional(v.array(v.object({ nom: v.string(), prix: v.number() }))),
  },
  handler: async (ctx, args) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    return ctx.db.insert("items", {
      kiosqueId: kiosque._id,
      ...args,
      disponible: true,
    });
  },
});

export const editarItem = mutation({
  args: {
    itemId: v.id("items"),
    nom: v.optional(v.string()),
    description: v.optional(v.string()),
    prix: v.optional(v.number()),
    emoji: v.optional(v.string()),
    categorieId: v.optional(v.id("categories")),
    disponible: v.optional(v.boolean()),
    sku: v.optional(v.string()),
    variacoes: v.optional(v.array(v.object({ nom: v.string(), prix: v.number() }))),
  },
  handler: async (ctx, { itemId, ...updates }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const item = await ctx.db.get(itemId);
    if (!item || item.kiosqueId !== kiosque._id) throw new Error("Item não encontrado");
    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(itemId, patch);
  },
});

export const excluirItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const item = await ctx.db.get(itemId);
    if (!item || item.kiosqueId !== kiosque._id) throw new Error("Item não encontrado");
    await ctx.db.delete(itemId);
  },
});

export const toggleDisponivel = mutation({
  args: { itemId: v.id("items"), disponible: v.boolean() },
  handler: async (ctx, { itemId, disponible }) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    const item = await ctx.db.get(itemId);
    if (!item || item.kiosqueId !== kiosque._id) throw new Error("Item não encontrado");
    await ctx.db.patch(itemId, { disponible });
  },
});
