import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendOTPRequest {
  phone: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp }: SendOTPRequest = await req.json();

    console.log('Sending OTP to:', phone);

    const ultramsgToken = Deno.env.get('ULTRAMSG_TOKEN');
    const ultramsgInstanceId = Deno.env.get('ULTRAMSG_INSTANCE_ID');

    if (!ultramsgToken || !ultramsgInstanceId) {
      throw new Error('UltraMsg credentials not configured');
    }

    // Format phone number (remove any spaces or special characters)
    const formattedPhone = phone.replace(/\s+/g, '');

    // Send OTP via UltraMsg
    const formData = new URLSearchParams();
    formData.append('token', ultramsgToken);
    formData.append('to', formattedPhone);
    formData.append('body', `Your Raya IT ATM verification code is: ${otp}`);

    const ultramsgResponse = await fetch(
      `https://api.ultramsg.com/${ultramsgInstanceId}/messages/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const ultramsgData = await ultramsgResponse.json();
    console.log('UltraMsg response:', ultramsgData);

    if (!ultramsgResponse.ok) {
      throw new Error(`UltraMsg API error: ${JSON.stringify(ultramsgData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
