import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listar = query({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_kiosque", (q) => q.eq("kiosqueId", kiosqueId))
      .order("desc")
      .take(20);
  },
});

export const marcarLida = mutation({
  args: { notifId: v.id("notifications") },
  handler: async (ctx, { notifId }) => {
    await ctx.db.patch(notifId, { lue: true });
  },
});

export const marcarTodasLidas = mutation({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_kiosque_lue", (q) =>
        q.eq("kiosqueId", kiosqueId).eq("lue", false)
      )
      .collect();
    for (const n of notifs) {
      await ctx.db.patch(n._id, { lue: true });
    }
  },
});
