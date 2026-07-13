import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { orderId, reference } = await req.json();

    if (!reference || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing reference or orderId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Verify with Paystack using SECRET KEY ──
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (
      !paystackData.status ||
      paystackData.data?.status !== "success"
    ) {
      return new Response(
        JSON.stringify({ error: "Payment not verified by Paystack" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Mark order paid in Supabase ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("orders")
      .update({
        status:            "paid",
        payment_reference: reference,
      })
      .eq("id", orderId);

    if (error) {
      return new Response(
        JSON.stringify({ error: `DB update failed: ${error.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});