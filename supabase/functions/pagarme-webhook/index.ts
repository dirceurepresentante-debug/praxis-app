import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

serve(async (req) => {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    // Verifica assinatura do webhook (opcional mas recomendado)
    const secret = Deno.env.get('PAGARME_WEBHOOK_SECRET')
    if (secret) {
      const sig = req.headers.get('x-hub-signature') || ''
      const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      )
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
      const expected = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2,'0')).join('')
      if (sig !== expected) return new Response('Unauthorized', { status: 401 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const type = event.type  // ex: "charge.paid", "charge.payment_failed", "subscription.canceled"
    const subscriptionId = event.data?.subscription?.id || event.data?.id

    if (!subscriptionId) return new Response('ok', { status: 200 })

    let novoStatus: string | null = null

    if (type === 'charge.paid')           novoStatus = 'ativo'
    if (type === 'charge.payment_failed') novoStatus = 'inadimplente'
    if (type === 'subscription.canceled') novoStatus = 'cancelado'

    if (novoStatus) {
      const { error } = await supabase.from('profissionais')
        .update({ status: novoStatus })
        .eq('pagarme_subscription_id', subscriptionId)

      if (error) console.error('Supabase update error:', error.message)
      else console.log(`[webhook] ${type} → status=${novoStatus} para subscription ${subscriptionId}`)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('error', { status: 500 })
  }
})
