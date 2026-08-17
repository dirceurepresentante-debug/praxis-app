import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { profissional_id, nome, email } = await req.json()

    const apiKey   = Deno.env.get('PAGARME_API_KEY')!
    const planId   = Deno.env.get('PAGARME_PLAN_ID')!
    const auth     = btoa(`${apiKey}:`)
    const headers  = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
    const base     = 'https://api.pagar.me/core/v5'

    // 1. Cria cliente no Pagar.me
    const custRes = await fetch(`${base}/customers`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: nome, email, type: 'individual', country: 'BR' })
    })
    const customer = await custRes.json()
    if (!customer.id) throw new Error(`Pagar.me customer error: ${JSON.stringify(customer)}`)

    // 2. Cria assinatura
    const subRes = await fetch(`${base}/subscriptions`, {
      method: 'POST', headers,
      body: JSON.stringify({
        plan_id: planId,
        customer_id: customer.id,
        payment_method: 'credit_card',
        metadata: { profissional_id },
      })
    })
    const subscription = await subRes.json()
    if (!subscription.id) throw new Error(`Pagar.me subscription error: ${JSON.stringify(subscription)}`)

    // 3. Atualiza profissional no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    await supabase.from('profissionais').update({
      pagarme_customer_id:     customer.id,
      pagarme_subscription_id: subscription.id,
      status: 'pendente',
    }).eq('id', profissional_id)

    // URL de checkout — Pagar.me retorna em checkouts[0].payment_url ou link similar
    const checkoutUrl =
      subscription.checkouts?.[0]?.payment_url ||
      subscription.checkout_url ||
      `https://checkout.pagar.me/${subscription.id}`

    return new Response(JSON.stringify({ checkout_url: checkoutUrl }), {
      headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }
})
