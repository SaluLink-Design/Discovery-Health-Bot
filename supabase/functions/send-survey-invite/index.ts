import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SURVEY_URL = "https://tally.so/r/n0D6Yq";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, surveyUrl = DEFAULT_SURVEY_URL } = await req.json();
    const trimmedEmail = String(email ?? "").trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return new Response(
        JSON.stringify({ ok: false, sent: false, reason: "invalid_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({ ok: false, sent: false, reason: "email_not_configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const fromEmail = Deno.env.get("SURVEY_FROM_EMAIL")?.trim() ?? "SaluLink <onboarding@resend.dev>";
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [trimmedEmail],
        subject: "SaluLink — optional feedback survey",
        html: `
          <p>Thank you for trying SaluLink.</p>
          <p>We'd love your optional feedback on our medical aid literacy MVP.
          Survey responses are anonymised — no name or ID number is required.</p>
          <p><a href="${surveyUrl}">Open the survey</a></p>
          <p>It should only take a few minutes. You can skip any question.</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error("Resend error:", resendResponse.status, detail);
      return new Response(
        JSON.stringify({ ok: false, sent: false, reason: "resend_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, sent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("send-survey-invite error:", error);
    return new Response(
      JSON.stringify({ ok: false, sent: false, reason: "server_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
