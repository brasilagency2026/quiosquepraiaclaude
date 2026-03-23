// convex/pagamentos.ts
// Gestion des credentials de paiement par quiosque (MercadoPago + Stripe)

import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getKiosqueDoGestor } from "./auth";
import { encrypt, decrypt, maskKey } from "./encryption";

// ═══════════════════════════════════════════════════════
// QUERIES PUBLIQUES
// ═══════════════════════════════════════════════════════

// Retourne UNIQUEMENT la clé publique + provider au frontend
export const getConfigPagamento = query({
  args: { kiosqueSlug: v.string() },
  handler: async (ctx, { kiosqueSlug }) => {
    const kiosque = await ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", kiosqueSlug))
      .first();

    if (!kiosque?.pagamento?.configurado) {
      return { configurado: false };
    }

    const p = kiosque.pagamento;
    return {
      configurado: true,
      provider: p.provider,
      // JAMAIS les clés secrètes — seulement la publique
      publicKey:
        p.provider === "mercadopago" ? p.mp_public_key : p.stripe_publishable_key,
      testadoEm: p.testado_em,
    };
  },
});

// Pour le gestor — affiche les infos masquées de sa config
export const getConfigGestor = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const usuario = await ctx.db
      .query("usuarios")
      .withIndex("by_clerk", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    if (!usuario) return null;

    const kiosque = await ctx.db.get(usuario.kiosqueId);
    if (!kiosque?.pagamento?.configurado) return { configurado: false };

    const p = kiosque.pagamento;
    return {
      configurado: true,
      provider: p.provider,
      // Clés masquées pour affichage uniquement
      publicKeyMask:
        p.provider === "mercadopago"
          ? maskKey(p.mp_public_key ?? "")
          : maskKey(p.stripe_publishable_key ?? ""),
      secretKeyMask: "••••••••••••••••••••",
      testadoEm: p.testado_em,
    };
  },
});

// ═══════════════════════════════════════════════════════
// MUTATIONS — Configuration par le Gestor
// ═══════════════════════════════════════════════════════

export const configurarMercadoPago = mutation({
  args: {
    mp_public_key: v.string(),
    mp_access_token: v.string(),
  },
  handler: async (ctx, args) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);

    // Validation format
    const validPub =
      args.mp_public_key.startsWith("APP_USR-") ||
      args.mp_public_key.startsWith("TEST-");
    const validSecret =
      args.mp_access_token.startsWith("APP_USR-") ||
      args.mp_access_token.startsWith("TEST-");

    if (!validPub) throw new Error("Public Key MercadoPago inválida (deve começar com APP_USR- ou TEST-)");
    if (!validSecret) throw new Error("Access Token MercadoPago inválido (deve começar com APP_USR- ou TEST-)");

    // Chiffrer le token secret
    const tokenEnc = await encrypt(args.mp_access_token);

    await ctx.db.patch(kiosque._id, {
      pagamento: {
        provider: "mercadopago",
        mp_public_key: args.mp_public_key,
        mp_access_token_enc: tokenEnc,
        configurado: true,
      },
    });

    return { ok: true };
  },
});

export const configurarStripe = mutation({
  args: {
    stripe_publishable_key: v.string(),
    stripe_secret_key: v.string(),
  },
  handler: async (ctx, args) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);

    if (!args.stripe_publishable_key.startsWith("pk_"))
      throw new Error("Publishable Key Stripe inválida (deve começar com pk_)");
    if (!args.stripe_secret_key.startsWith("sk_"))
      throw new Error("Secret Key Stripe inválida (deve começar com sk_)");

    const keyEnc = await encrypt(args.stripe_secret_key);

    await ctx.db.patch(kiosque._id, {
      pagamento: {
        provider: "stripe",
        stripe_publishable_key: args.stripe_publishable_key,
        stripe_secret_key_enc: keyEnc,
        configurado: true,
      },
    });

    return { ok: true };
  },
});

export const removerConfigPagamento = mutation({
  handler: async (ctx) => {
    const { kiosque } = await getKiosqueDoGestor(ctx);
    await ctx.db.patch(kiosque._id, { pagamento: undefined });
    return { ok: true };
  },
});

// ═══════════════════════════════════════════════════════
// ACTIONS — Appels API serveur (accès aux clés déchiffrées)
// ═══════════════════════════════════════════════════════

// Tester la connexion au provider configuré
export const testarConexao = action({
  handler: async (ctx): Promise<{ ok: boolean; nome?: string; email?: string; error?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const kiosque = await ctx.runQuery(internal.pagamentos.getKiosqueComSegredos, {
      clerkId: identity.subject,
    });

    if (!kiosque?.pagamento?.configurado) {
      return { ok: false, error: "Pagamento não configurado" };
    }

    try {
      if (kiosque.pagamento.provider === "mercadopago") {
        const token = await decrypt(kiosque.pagamento.mp_access_token_enc!);
        const r = await fetch("https://api.mercadopago.com/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        if (data.id) {
          await ctx.runMutation(internal.pagamentos.marcarTestado, {
            kiosqueId: kiosque._id,
          });
          return { ok: true, nome: data.first_name, email: data.email };
        }
        return { ok: false, error: data.message || "Credenciais inválidas" };
      } else {
        const key = await decrypt(kiosque.pagamento.stripe_secret_key_enc!);
        const r = await fetch("https://api.stripe.com/v1/account", {
          headers: { Authorization: `Bearer ${key}` },
        });
        const data = await r.json();
        if (data.id) {
          await ctx.runMutation(internal.pagamentos.marcarTestado, {
            kiosqueId: kiosque._id,
          });
          return { ok: true, nome: data.business_profile?.name || data.id, email: data.email };
        }
        return { ok: false, error: data.error?.message || "Credenciais inválidas" };
      }
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },
});

// Créer une préférence de paiement MercadoPago ou Stripe
export const criarIntentPagamento = action({
  args: {
    kiosqueSlug: v.string(),
    montant: v.number(),
    pedidoId: v.string(),
    metodo: v.string(),
    descricao: v.string(),
  },
  handler: async (ctx, args) => {
    const kiosque = await ctx.runQuery(internal.pagamentos.getKiosqueComSegredosBySlug, {
      slug: args.kiosqueSlug,
    });

    if (!kiosque?.pagamento?.configurado) {
      throw new Error("Pagamento não configurado neste quiosque");
    }

    if (kiosque.pagamento.provider === "mercadopago") {
      return await criarPreferencaMP(kiosque, args);
    } else {
      return await criarIntentStripe(kiosque, args);
    }
  },
});

// ── MercadoPago ──────────────────────────────────────
async function criarPreferencaMP(kiosque: any, args: any) {
  const accessToken = await decrypt(kiosque.pagamento.mp_access_token_enc);

  const body: any = {
    items: [
      {
        id: args.pedidoId,
        title: args.descricao,
        quantity: 1,
        unit_price: args.montant,
        currency_id: "BRL",
      },
    ],
    external_reference: args.pedidoId,
    notification_url: `${process.env.CONVEX_SITE_URL}/webhook/mercadopago`,
    auto_return: "approved",
    back_urls: {
      success: `${process.env.FRONTEND_URL}`,
      failure: `${process.env.FRONTEND_URL}`,
    },
  };

  // Restreindre les méthodes selon le choix
  if (args.metodo === "pix") {
    body.payment_methods = {
      excluded_payment_types: [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "ticket" },
      ],
    };
  } else if (args.metodo === "credit") {
    body.payment_methods = {
      excluded_payment_types: [{ id: "bank_transfer" }],
      installments: 12,
    };
  } else if (args.metodo === "debit") {
    body.payment_methods = {
      excluded_payment_types: [
        { id: "bank_transfer" },
        { id: "credit_card" },
      ],
      installments: 1,
    };
  }

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!data.id) {
    throw new Error("Erro MercadoPago: " + JSON.stringify(data));
  }

  return {
    provider: "mercadopago",
    preferenceId: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
  };
}

// ── Stripe ───────────────────────────────────────────
async function criarIntentStripe(kiosque: any, args: any) {
  const secretKey = await decrypt(kiosque.pagamento.stripe_secret_key_enc);

  const params = new URLSearchParams();
  params.append("amount", String(Math.round(args.montant * 100)));
  params.append("currency", "brl");
  params.append("description", args.descricao);
  params.append("metadata[pedidoId]", args.pedidoId);
  params.append("metadata[kiosque]", kiosque.slug);

  if (args.metodo === "pix") {
    params.append("payment_method_types[]", "pix");
  } else {
    params.append("payment_method_types[]", "card");
  }

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error("Erro Stripe: " + data.error.message);
  }

  return {
    provider: "stripe",
    clientSecret: data.client_secret,
    paymentIntentId: data.id,
    amount: data.amount,
  };
}

// ═══════════════════════════════════════════════════════
// INTERNAL — accès aux secrets (jamais exposés publiquement)
// ═══════════════════════════════════════════════════════

export const getKiosqueComSegredos = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const usuario = await ctx.db
      .query("usuarios")
      .withIndex("by_clerk", (q) => q.eq("clerkUserId", clerkId))
      .first();
    if (!usuario) return null;
    return ctx.db.get(usuario.kiosqueId);
  },
});

export const getKiosqueComSegredosBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const marcarTestado = internalMutation({
  args: { kiosqueId: v.id("kiosques") },
  handler: async (ctx, { kiosqueId }) => {
    const kiosque = await ctx.db.get(kiosqueId);
    if (!kiosque?.pagamento) return;
    await ctx.db.patch(kiosqueId, {
      pagamento: { ...kiosque.pagamento, testado_em: Date.now() },
    });
  },
});
