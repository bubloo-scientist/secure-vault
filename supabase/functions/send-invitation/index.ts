import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, inviteUrl } = await req.json();

    // In production, integrate with an email service (Resend, SendGrid, etc.)
    // For now, log the invitation details
    console.log(`Invitation email would be sent to: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Accept URL: ${inviteUrl}`);

    // Return success - the invitation is stored in the database
    // The accept URL is what matters for the flow
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation created for ${email}. Share this link: ${inviteUrl}`,
        inviteUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
