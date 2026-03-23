import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

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
