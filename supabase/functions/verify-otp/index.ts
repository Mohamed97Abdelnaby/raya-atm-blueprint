import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp }: VerifyOTPRequest = await req.json();

    console.log('Verifying OTP for phone:', phone);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find registration by phone
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !registration) {
      console.error('Registration not found:', fetchError);
      throw new Error('Registration not found');
    }

    // Verify OTP
    if (registration.otp !== otp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid OTP' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update registration as verified
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ otp_verified: true })
      .eq('id', registration.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to verify OTP');
    }

    console.log('OTP verified successfully for:', phone);

    return new Response(
      JSON.stringify({ success: true, message: 'OTP verified successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
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
