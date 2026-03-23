import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries temps réel ───────────────────────────────

export const getPedidosActifs = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const todos = await ctx.db
      .query("pedidos")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .order("asc")
      .collect();
    return todos.filter((p) =>
      ["pago", "cozinha", "pronto"].includes(p.statut)
    );
  },
});

export const getPedidosProntos = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const todos = await ctx.db
      .query("pedidos")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .collect();
    return todos.filter((p) => p.statut === "pronto");
  },
});

export const getHistorico = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const hoje = new Date().setHours(0, 0, 0, 0);
    const todos = await ctx.db
      .query("pedidos")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .order("desc")
      .collect();
    return todos.filter((p) => p.criadoEm >= hoje).slice(0, 50);
  },
});

export const getEstatisticas = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const hoje = new Date().setHours(0, 0, 0, 0);
    const pedidos = await ctx.db
      .query("pedidos")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .collect();
    const pedidosHoje = pedidos.filter(
      (p) => p.criadoEm >= hoje && p.statut !== "cancelado"
    );
    const faturamento = pedidosHoje.reduce(
      (s, p) => s + p.total - p.totalRembourse,
      0
    );
    const ticketMedio =
      pedidosHoje.length > 0 ? faturamento / pedidosHoje.length : 0;
    return {
      totalHoje: pedidosHoje.length,
      faturamentoHoje: faturamento,
      ticketMedio,
      pendentes: pedidos.filter((p) => p.statut === "pago").length,
      emPreparo: pedidos.filter((p) => p.statut === "cozinha").length,
      prontos: pedidos.filter((p) => p.statut === "pronto").length,
    };
  },
});

// ── Mutations ────────────────────────────────────────

export const criar = mutation({
  args: {
    kiosqueId: v.id("kiosques"),
    parasolNumero: v.string(),
    items: v.array(
      v.object({
        itemId: v.string(),
        nom: v.string(),
        emoji: v.string(),
        qty: v.number(),
        prixUnit: v.number(),
      })
    ),
    total: v.number(),
    pagamentoId: v.optional(v.string()),
    metodoPagamento: v.optional(v.string()),
    observacao: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const hoje = new Date().setHours(0, 0, 0, 0);
    const pedidosHoje = await ctx.db
      .query("pedidos")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", args.kiosqueId))
      .collect();
    const numero =
      pedidosHoje.filter((p) => p.criadoEm >= hoje).length + 1;

    return ctx.db.insert("pedidos", {
      kiosqueId: args.kiosqueId,
      parasolNumero: args.parasolNumero,
      numero,
      items: args.items.map((i) => ({ ...i, annule: false })),
      total: args.total,
      totalRembourse: 0,
      statut: "pago",
      pagamentoId: args.pagamentoId,
      metodoPagamento: args.metodoPagamento,
      observacao: args.observacao,
      criadoEm: Date.now(),
    });
  },
});

export const atualizarStatut = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    statut: v.union(
      v.literal("cozinha"),
      v.literal("pronto"),
      v.literal("entregue")
    ),
  },
  handler: async (ctx, { pedidoId, statut }) => {
    await ctx.db.patch(pedidoId, { statut });
  },
});

export const annulerItems = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    itemsAnnulesIndex: v.array(v.number()),
    motivo: v.string(),
    nota: v.optional(v.string()),
  },
  handler: async (ctx, { pedidoId, itemsAnnulesIndex, motivo, nota }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("Pedido não encontrado");

    const newItems = pedido.items.map((item, i) => ({
      ...item,
      annule: itemsAnnulesIndex.includes(i) ? true : item.annule,
    }));

    const totalRembourse = newItems
      .filter((i) => i.annule)
      .reduce((s, i) => s + i.prixUnit * i.qty, 0);

    const tousAnnules = newItems.every((i) => i.annule);
    const newStatut = tousAnnules ? "cancelado" : "parcial";

    await ctx.db.patch(pedidoId, {
      items: newItems,
      totalRembourse,
      statut: newStatut as any,
      motivoCancelamento: motivo,
      notaCancelamento: nota,
    });

    // Créer notification pour le gestor
    await ctx.db.insert("notifications", {
      kiosqueId: pedido.kiosqueId,
      type: tousAnnules ? "cancelamento_total" : "cancelamento_parcial",
      pedidoId,
      pedidoNumero: pedido.numero,
      parasolNumero: pedido.parasolNumero,
      montant: totalRembourse,
      motivo,
      lue: false,
      criadoEm: Date.now(),
    });

    return { tousAnnules, totalRembourse, newStatut };
  },
});

export const acompanharPedido = query({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    return ctx.db.get(pedidoId);
  },
});
