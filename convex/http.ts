import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// ── MercadoPago OAuth callback ────────────────────────
http.route({
  path: "/oauth/mp/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // kiosqueId encodé en base64
    const error = url.searchParams.get("error");

    const frontendUrl = process.env.FRONTEND_URL ?? "https://pay.quiosquepraia.com";

    if (error || !code || !state) {
      return Response.redirect(`${frontendUrl}/oauth/mp/error?msg=${error ?? "missing_code"}`);
    }

    try {
      const kiosqueId = atob(state);

      // Échanger le code contre un access token
      const appId = process.env.MP_APP_ID;
      const clientSecret = process.env.MP_CLIENT_SECRET;

      const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: appId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.CONVEX_SITE_URL}/oauth/mp/callback`,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("MP OAuth token error:", err);
        return Response.redirect(`${frontendUrl}/oauth/mp/error?msg=token_exchange_failed`);
      }

      const tokenData = await tokenRes.json();
      // tokenData: { access_token, token_type, expires_in, scope, user_id, refresh_token, public_key }

      await ctx.runAction(internal.pagamentos.saveOAuthMP, {
        kiosqueId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? "",
        publicKey: tokenData.public_key ?? "",
        userId: String(tokenData.user_id),
      });

      return Response.redirect(`${frontendUrl}/oauth/mp/success`);
    } catch (e) {
      console.error("MP OAuth callback error:", e);
      return Response.redirect(`${frontendUrl}/oauth/mp/error?msg=internal_error`);
    }
  }),
});

// ── MercadoPago webhook ───────────────────────────────
// Appelé par MercadoPago quand un paiement est approuvé/refusé
http.route({
  path: "/webhook/mercadopago",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      console.log("MP Webhook:", JSON.stringify(body));

      // MercadoPago envoie: { type: "payment", data: { id: "xxx" } }
      if (body.type === "payment" && body.data?.id) {
        const paymentId = String(body.data.id);

        // En production: vérifier la signature X-Signature
        // const signature = request.headers.get("x-signature");
        // await verifyMPSignature(signature, body);

        // Trouver le pedido par pagamentoId et mettre à jour statut
        // Pour l'instant on log — à implémenter avec la vraie logique
        console.log("Paiement MP confirmé:", paymentId);
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Webhook MP error:", e);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Stripe webhook ────────────────────────────────────
http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const sig = request.headers.get("stripe-signature");

      // En production: vérifier avec stripe.webhooks.constructEvent()
      // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

      const event = JSON.parse(body);
      console.log("Stripe Webhook:", event.type);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const pedidoId = paymentIntent.metadata?.pedidoId;
        console.log("Stripe paiement confirmé:", paymentIntent.id, "pedido:", pedidoId);
        // Mettre à jour le pedido en base
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Webhook Stripe error:", e);
      return new Response(JSON.stringify({ error: "Webhook error" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ── Health check ──────────────────────────────────────
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", app: "PraiaApp", version: "1.0.0" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }),
});

export default http;
