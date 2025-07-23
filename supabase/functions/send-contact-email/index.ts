import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  type: 'support' | 'feature';
  name: string;
  email: string;
  subject: string;
  issueType?: string;
  featureTitle?: string;
  priority?: string;
  useCase?: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ContactEmailRequest = await req.json();
    console.log("Received email request:", { type: requestData.type, subject: requestData.subject });

    let emailHtml = "";
    let emailSubject = "";

    if (requestData.type === 'support') {
      emailSubject = `Support Request: ${requestData.subject}`;
      emailHtml = `
        <h2>🎮 New Support Request from GameNight</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${requestData.name}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Issue Type:</strong> ${requestData.issueType}</p>
          <p><strong>Subject:</strong> ${requestData.subject}</p>
        </div>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #e74c3c; margin: 20px 0;">
          <h3>Issue Description</h3>
          <p style="white-space: pre-wrap;">${requestData.description}</p>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Reply directly to this email to respond to ${requestData.name} at ${requestData.email}
        </p>
      `;
    } else if (requestData.type === 'feature') {
      emailSubject = `Feature Suggestion: ${requestData.featureTitle}`;
      emailHtml = `
        <h2>💡 New Feature Suggestion from GameNight</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> ${requestData.name}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Feature Title:</strong> ${requestData.featureTitle}</p>
          <p><strong>Priority Level:</strong> ${requestData.priority}</p>
        </div>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
          <h3>Use Case</h3>
          <p style="white-space: pre-wrap;">${requestData.useCase}</p>
        </div>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #27ae60; margin: 20px 0;">
          <h3>Detailed Description</h3>
          <p style="white-space: pre-wrap;">${requestData.description}</p>
        </div>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Reply directly to this email to respond to ${requestData.name} at ${requestData.email}
        </p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "GameNight Contact <onboarding@resend.dev>",
      to: ["danielle.stefko@gmail.com"],
      replyTo: requestData.email,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);