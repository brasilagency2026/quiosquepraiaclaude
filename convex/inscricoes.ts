// convex/inscricoes.ts
import { mutation, query, action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { assertSuperAdmin } from "./auth";
import { internal } from "./_generated/api";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO"
];

// ── Pública — gestionnaire soumet sa demande ──────────
export const solicitar = mutation({
  args: {
    nomGestor: v.string(),
    nomKiosque: v.string(),
    ville: v.string(),
    etat: v.string(),
    email: v.string(),
    whatsapp: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier email déjà existant
    const existing = await ctx.db
      .query("inscricoes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("Este email já está cadastrado.");

    // Générer un slug propre
    const slug = args.nomKiosque
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 40)
      + "-" + args.ville.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 20)
      + "-" + args.etat.toLowerCase();

    const id = await ctx.db.insert("inscricoes", {
      nomGestor: args.nomGestor,
      nomKiosque: args.nomKiosque,
      ville: args.ville,
      etat: args.etat,
      email: args.email,
      whatsapp: args.whatsapp,
      clerkUserId: args.clerkUserId,
      statut: "pendente",
      slug,
      criadoEm: Date.now(),
    });

    // Envoyer emails (async)
    await ctx.scheduler.runAfter(0, internal.inscricoes.enviarEmails, {
      inscricaoId: id,
    });

    return { id, slug };
  },
});

// ── Super Admin — lister les inscriptions ────────────
export const listar = query({
  args: { statut: v.optional(v.string()) },
  handler: async (ctx, { statut }) => {
    await assertSuperAdmin(ctx);
    const todas = await ctx.db.query("inscricoes").order("desc").collect();
    if (statut) return todas.filter(i => i.statut === statut);
    return todas;
  },
});

// ── Super Admin — approuver ──────────────────────────
export const aprovar = action({
  args: { inscricaoId: v.id("inscricoes") },
  handler: async (ctx, { inscricaoId }) => {
    await ctx.runMutation(internal.inscricoes.aprovarMutation, { inscricaoId });
  },
});

export const aprovarMutation = internalMutation({
  args: { inscricaoId: v.id("inscricoes") },
  handler: async (ctx, { inscricaoId }) => {
    const insc = await ctx.db.get(inscricaoId);
    if (!insc) throw new Error("Inscrição não encontrada");
    if (insc.statut !== "pendente") throw new Error("Já processada");

    // Générer slug unique
    let slug = insc.slug!;
    const existing = await ctx.db
      .query("kiosques")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) slug = slug + "-" + Date.now().toString().slice(-4);

    // Créer le kiosque
    const kiosqueId = await ctx.db.insert("kiosques", {
      slug,
      nom: insc.nomKiosque,
      ville: insc.ville,
      etat: insc.etat,
      actif: true,
      creePar: "superadmin",
    });

    // Catégories par défaut
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

    // Parasols par défaut (12)
    for (let i = 1; i <= 12; i++) {
      await ctx.db.insert("parasols", {
        kiosqueId,
        numero: `GS-${String(i).padStart(2, "0")}`,
        actif: true,
      });
    }

    // Créer l'utilisateur gestionnaire si on a son clerkUserId
    if (insc.clerkUserId) {
      await ctx.db.insert("usuarios", {
        kiosqueId,
        nom: insc.nomGestor,
        role: "gestor" as any,
        actif: true,
        clerkUserId: insc.clerkUserId,
      });
    }

    // Mettre à jour l'inscription
    await ctx.db.patch(inscricaoId, {
      statut: "aprovado",
      kiosqueId,
      slug,
      processadoEm: Date.now(),
    });

    // Envoyer email de confirmation au gestionnaire
    await ctx.scheduler.runAfter(0, internal.inscricoes.enviarEmailAprovacao, {
      email: insc.email,
      nomGestor: insc.nomGestor,
      nomKiosque: insc.nomKiosque,
      slug,
    });
  },
});

// ── Super Admin — rejeter ────────────────────────────
export const rejeitar = mutation({
  args: { inscricaoId: v.id("inscricoes") },
  handler: async (ctx, { inscricaoId }) => {
    await assertSuperAdmin(ctx);
    await ctx.db.patch(inscricaoId, {
      statut: "rejeitado",
      processadoEm: Date.now(),
    });
  },
});

// ── Emails (actions internes) ────────────────────────

export const enviarEmails = internalAction({
  args: { inscricaoId: v.id("inscricoes") },
  handler: async (ctx, { inscricaoId }) => {
    const insc = await ctx.runQuery(internal.inscricoes.getById, { inscricaoId });
    if (!insc) return;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.log("RESEND_API_KEY não configurada — emails não enviados");
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL ?? "https://pay.quiosquepraia.com";
    const dataFormatada = new Date(insc.criadoEm).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    // Email ao super admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Quiosque Praia <noreply@quiosquepraia.com>",
        to: ["glwebagency2@gmail.com"],
        subject: `🏖️ Nova inscrição: ${insc.nomKiosque} — ${insc.nomGestor}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:16px">
            <h2 style="color:#0D2137">🏖️ Nova inscrição recebida</h2>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:8px;color:#64748b;width:140px">Gestor:</td><td style="padding:8px;font-weight:600">${insc.nomGestor}</td></tr>
              <tr style="background:#fff"><td style="padding:8px;color:#64748b">Quiosque:</td><td style="padding:8px;font-weight:600">${insc.nomKiosque}</td></tr>
              <tr><td style="padding:8px;color:#64748b">Cidade / Estado:</td><td style="padding:8px">${insc.ville} · ${insc.etat}</td></tr>
              <tr style="background:#fff"><td style="padding:8px;color:#64748b">Email:</td><td style="padding:8px"><a href="mailto:${insc.email}">${insc.email}</a></td></tr>
              <tr><td style="padding:8px;color:#64748b">Slug sugerido:</td><td style="padding:8px;font-family:monospace;font-size:13px">${insc.slug}</td></tr>
              <tr style="background:#fff"><td style="padding:8px;color:#64748b">Data:</td><td style="padding:8px">${dataFormatada}</td></tr>
            </table>
            <a href="${frontendUrl}/superadmin" style="display:inline-block;background:#00B4D8;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px">
              Abrir SuperAdmin →
            </a>
          </div>
        `,
      }),
    });

    // Email de confirmação ao gestionnaire
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Quiosque Praia <noreply@quiosquepraia.com>",
        to: [insc.email],
        subject: "Recebemos sua inscrição! 🏖️",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0D2137;border-radius:16px;color:white">
            <h1 style="color:#F5E6C8;font-size:28px;margin-bottom:8px">Olá, ${insc.nomGestor}! 👋</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;margin-bottom:24px">
              Recebemos sua inscrição para o quiosque <strong style="color:#00B4D8">${insc.nomKiosque}</strong>.
              Nossa equipe está analisando e em breve você receberá o link de acesso ao seu painel de administração.
            </p>
            <div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:24px">
              <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:12px">SEUS DADOS</div>
              <div style="margin-bottom:6px"><span style="color:rgba(255,255,255,0.5)">Quiosque:</span> <strong>${insc.nomKiosque}</strong></div>
              <div style="margin-bottom:6px"><span style="color:rgba(255,255,255,0.5)">Cidade:</span> ${insc.ville} · ${insc.etat}</div>
              <div><span style="color:rgba(255,255,255,0.5)">Email:</span> ${insc.email}</div>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px">
              Qualquer dúvida, responda este email. ☀️
            </p>
          </div>
        `,
      }),
    });
  },
});

export const enviarEmailAprovacao = internalAction({
  args: {
    email: v.string(),
    nomGestor: v.string(),
    nomKiosque: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    const frontendUrl = process.env.FRONTEND_URL ?? "https://pay.quiosquepraia.com";
    const adminUrl = `${frontendUrl}/admin/${args.slug}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Quiosque Praia <noreply@quiosquepraia.com>",
        to: [args.email],
        subject: `✅ Seu quiosque está pronto! — ${args.nomKiosque}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0D2137;border-radius:16px;color:white">
            <div style="font-size:48px;text-align:center;margin-bottom:16px">🎉</div>
            <h1 style="color:#06D6A0;text-align:center;font-size:26px;margin-bottom:8px">Quiosque aprovado!</h1>
            <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.6;margin-bottom:28px;text-align:center">
              Olá <strong>${args.nomGestor}</strong>, seu quiosque <strong style="color:#00B4D8">${args.nomKiosque}</strong> está pronto para usar!
            </p>
            <div style="text-align:center;margin-bottom:28px">
              <a href="${adminUrl}" style="display:inline-block;background:#06D6A0;color:#0D2137;padding:16px 32px;border-radius:14px;text-decoration:none;font-weight:800;font-size:16px">
                🏖️ Acessar meu painel admin
              </a>
            </div>
            <div style="background:rgba(255,255,255,0.07);border-radius:12px;padding:20px">
              <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:8px">LINK DO SEU PAINEL</div>
              <div style="font-family:monospace;font-size:14px;color:#48CAE4;word-break:break-all">${adminUrl}</div>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;text-align:center">
              No painel você pode: configurar o cardápio, conectar MercadoPago, gerar QR codes e muito mais.
            </p>
          </div>
        `,
      }),
    });
  },
});

// Query interne
export const getById = internalQuery({
  args: { inscricaoId: v.id("inscricoes") },
  handler: async (ctx, { inscricaoId }) => {
    return ctx.db.get(inscricaoId);
  },
});

// ── Formulaire de contact depuis la landing ───────────
export const enviarContato = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const resendKey = process.env.RESEND_API_KEY;
    const frontendUrl = process.env.FRONTEND_URL ?? "https://pay.quiosquepraia.com";

    if (!resendKey) {
      console.log("RESEND_API_KEY não configurada");
      return { ok: true };
    }

    // Email au superadmin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Quiosque Praia <noreply@quiosquepraia.com>",
        to: ["glwebagency2@gmail.com"],
        subject: `📧 Novo interesse: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:16px">
            <h2 style="color:#0D2137">📧 Novo contato via landing page</h2>
            <p style="color:#64748b;font-size:16px;margin:16px 0">
              Uma pessoa demonstrou interesse no <strong>Quiosque Praia</strong>.
            </p>
            <div style="background:white;border-radius:12px;padding:16px;margin:20px 0;border-left:4px solid #00B4D8">
              <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
            </div>
            <a href="${frontendUrl}/superadmin" style="display:inline-block;background:#00B4D8;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">
              Abrir SuperAdmin →
            </a>
          </div>
        `,
      }),
    });

    // Email de confirmação ao interessado
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Quiosque Praia <noreply@quiosquepraia.com>",
        to: [email],
        subject: "Obrigado pelo interesse! 🏖️",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0D2137;border-radius:16px;color:white">
            <div style="font-size:48px;text-align:center;margin-bottom:16px">🏖️</div>
            <h1 style="color:#F5E6C8;text-align:center;font-size:24px;margin-bottom:16px">
              Recebemos seu contato!
            </h1>
            <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.7;text-align:center;margin-bottom:24px">
              Obrigado pelo interesse no <strong style="color:#00B4D8">Quiosque Praia</strong>.<br />
              Nossa equipe entrará em contato em breve no seu email<br />
              <strong style="color:#06D6A0">${email}</strong>
            </p>
            <div style="background:rgba(0,180,216,0.1);border:1px solid rgba(0,180,216,0.3);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
              <div style="color:#F5E6C8;font-size:14px;margin-bottom:8px">Enquanto isso, experimente nossa demo gratuita:</div>
              <a href="${frontendUrl}/demo" style="display:inline-block;background:#06D6A0;color:#0D2137;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
                🚀 Ver Demo ao Vivo
              </a>
            </div>
            <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center">
              Quiosque Praia · Sistema de pedidos para quiosques de praia
            </p>
          </div>
        `,
      }),
    });

    return { ok: true };
  },
});
