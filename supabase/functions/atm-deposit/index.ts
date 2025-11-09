import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StartCashInRequest {
  action: 'STARTCASHIN';
  amount: number;
  atmId: string;
  userPhone: string;
}

interface CashInsertedRequest {
  action: 'CASHINSERTED';
  transactionId: string;
}

interface ConfirmedRequest {
  action: 'CONFIRMED';
  transactionId: string;
  totalCash: number;
  userPhone: string;
}

interface RefundRequest {
  action: 'REFUND';
  transactionId: string;
}

interface CancelRequest {
  action: 'CANCEL';
  transactionId: string;
}

type DepositRequest = StartCashInRequest | CashInsertedRequest | ConfirmedRequest | RefundRequest | CancelRequest;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: DepositRequest = await req.json();
    console.log('ATM Deposit request:', request);

    switch (request.action) {
      case 'STARTCASHIN': {
        // Start new deposit transaction
        const transactionId = crypto.randomUUID();
        console.log(`Starting cash-in transaction: ${transactionId} for amount: ${request.amount}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            transactionId,
            message: 'Shutter opened. Please insert cash.',
            status: 'READY_FOR_CASH'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'CASHINSERTED': {
        // Simulate cash counting - in real scenario, this would query ATM hardware
        // For now, return a simulated total based on time
        const totalCash = Math.floor(Math.random() * 1000) + 100;
        
        console.log(`Cash inserted for transaction: ${request.transactionId}, total: ${totalCash}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            total_cash: totalCash.toString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'CONFIRMED': {
        // Store transaction in database
        const { error } = await supabase.from('transactions').insert({
          user_phone: request.userPhone,
          transaction_type: 'deposit',
          amount: request.totalCash,
          status: 'completed',
          reference_number: request.transactionId,
          description: 'ATM Cash Deposit'
        });

        if (error) {
          console.error('Error storing transaction:', error);
          throw error;
        }

        console.log(`Transaction confirmed: ${request.transactionId}, amount: ${request.totalCash}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Cash stored successfully and added to account'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'REFUND': {
        console.log(`Refund initiated for transaction: ${request.transactionId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Cash refunded successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      case 'CANCEL': {
        console.log(`Transaction cancelled: ${request.transactionId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Transaction cancelled'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in ATM deposit:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
