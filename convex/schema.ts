import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  kiosques: defineTable({
    slug: v.string(),
    nom: v.string(),
    ville: v.string(),
    etat: v.string(),
    clerkOrgId: v.optional(v.string()),
    actif: v.boolean(),
    creePar: v.optional(v.string()),
    // Config paiement — clés secrètes chiffrées AES-256
    pagamento: v.optional(v.object({
      provider: v.union(v.literal("mercadopago"), v.literal("stripe")),
      // MercadoPago
      mp_public_key: v.optional(v.string()),
      mp_access_token_enc: v.optional(v.string()),   // chiffré
      // Stripe
      stripe_publishable_key: v.optional(v.string()),
      stripe_secret_key_enc: v.optional(v.string()), // chiffré
      // Status
      configurado: v.boolean(),
      testado_em: v.optional(v.number()),
    })),
  }).index("by_slug", ["slug"]),

  categories: defineTable({
    kiosqueId: v.id("kiosques"),
    nom: v.string(),
    emoji: v.string(),
    slug: v.string(),
    ordre: v.number(),
    actif: v.boolean(),
  }).index("by_kiosque", ["kiosqueId"]),

  items: defineTable({
    kiosqueId: v.id("kiosques"),
    categorieId: v.id("categories"),
    nom: v.string(),
    description: v.string(),
    prix: v.number(),
    emoji: v.string(),
    disponible: v.boolean(),
  })
    .index("by_kiosque", ["kiosqueId"])
    .index("by_categorie", ["categorieId"]),

  parasols: defineTable({
    kiosqueId: v.id("kiosques"),
    numero: v.string(),
    actif: v.boolean(),
    liberadoEm: v.optional(v.number()),
  }).index("by_kiosque", ["kiosqueId"]),

  pedidos: defineTable({
    kiosqueId: v.id("kiosques"),
    parasolNumero: v.string(),
    numero: v.number(),
    items: v.array(v.object({
      itemId: v.string(),
      nom: v.string(),
      emoji: v.string(),
      qty: v.number(),
      prixUnit: v.number(),
      annule: v.boolean(),
    })),
    total: v.number(),
    totalRembourse: v.number(),
    statut: v.union(
      v.literal("pago"),
      v.literal("cozinha"),
      v.literal("pronto"),
      v.literal("entregue"),
      v.literal("cancelado"),
      v.literal("parcial"),
    ),
    pagamentoId: v.optional(v.string()),
    metodoPagamento: v.optional(v.string()),
    observacao: v.optional(v.string()),
    motivoCancelamento: v.optional(v.string()),
    notaCancelamento: v.optional(v.string()),
    garcomNom: v.optional(v.string()),
    entregueEm: v.optional(v.number()),
    criadoEm: v.number(),
  })
    .index("by_kiosque", ["kiosqueId"])
    .index("by_kiosque_statut", ["kiosqueId", "statut"]),

  usuarios: defineTable({
    kiosqueId: v.id("kiosques"),
    clerkUserId: v.optional(v.string()),
    nom: v.string(),
    telephone: v.optional(v.string()),
    role: v.union(
      v.literal("superadmin"),
      v.literal("gestor"),
      v.literal("cozinha"),
      v.literal("caixa"),
      v.literal("garcom"),
    ),
    pinHash: v.optional(v.string()),
    actif: v.boolean(),
    derniereConexao: v.optional(v.number()),
  })
    .index("by_kiosque", ["kiosqueId"])
    .index("by_clerk", ["clerkUserId"]),

  sessoesPIN: defineTable({
    usuarioId: v.id("usuarios"),
    kiosqueId: v.id("kiosques"),
    token: v.string(),
    expiraEm: v.number(),
    dispositivo: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_usuario", ["usuarioId"]),

  notifications: defineTable({
    kiosqueId: v.id("kiosques"),
    type: v.union(
      v.literal("cancelamento_total"),
      v.literal("cancelamento_parcial"),
      v.literal("reembolso_solicitado"),
    ),
    pedidoId: v.id("pedidos"),
    pedidoNumero: v.number(),
    parasolNumero: v.string(),
    montant: v.number(),
    motivo: v.optional(v.string()),
    lue: v.boolean(),
    criadoEm: v.number(),
  })
    .index("by_kiosque", ["kiosqueId"])
    .index("by_kiosque_lue", ["kiosqueId", "lue"]),

});
