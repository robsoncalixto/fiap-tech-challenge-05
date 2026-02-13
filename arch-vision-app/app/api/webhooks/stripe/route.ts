import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        console.log(`[stripe] checkout.session.completed — userId: ${userId}, subscription: ${session.subscription}, customer: ${session.customer}`)

        if (!userId) {
          console.error('[stripe] checkout.session.completed missing userId in metadata')
          break
        }

        if (!session.subscription) {
          console.error('[stripe] checkout.session.completed missing subscription')
          break
        }

        const { error } = await admin
          .from('users')
          .update({
            tier: 'pro',
            credits: 5,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_ends_at: null,
          })
          .eq('id', userId)

        if (error) {
          console.error('[stripe] Failed to upgrade user:', error.message, error.details)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        console.log(`[stripe] User ${userId} upgraded to pro`)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = (
          invoice.parent?.subscription_details?.subscription ?? null
        ) as string | null

        console.log(`[stripe] invoice.paid — customer: ${customerId}, subscription: ${subscriptionId}`)

        // Try to find user by stripe_customer_id
        let userId: string | null = null

        const { data: userByCustomer } = await admin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userByCustomer) {
          userId = userByCustomer.id
        } else if (subscriptionId) {
          // Fallback: look up by subscription ID in case checkout.session.completed already saved it
          const { data: userBySub } = await admin
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .single()
          if (userBySub) {
            userId = userBySub.id
          }
        }

        if (!userId) {
          // Last resort: retrieve the checkout session from Stripe to get userId from metadata
          if (subscriptionId) {
            const sessions = await stripe.checkout.sessions.list({
              subscription: subscriptionId,
              limit: 1,
            })
            const checkoutUserId = sessions.data[0]?.metadata?.userId
            if (checkoutUserId) {
              userId = checkoutUserId
              console.log(`[stripe] invoice.paid — resolved userId ${userId} via checkout session lookup`)
            }
          }
        }

        if (!userId) {
          console.error(`[stripe] invoice.paid — could not resolve user for customer ${customerId}`)
          break
        }

        const { error } = await admin
          .from('users')
          .update({ credits: 5 })
          .eq('id', userId)

        if (error) {
          console.error('[stripe] Failed to reset credits on invoice.paid:', error.message)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        console.log(`[stripe] Credits reset to 5 for user ${userId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`[stripe] customer.subscription.deleted — customer: ${customerId}`)

        const { data: user } = await admin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) {
          console.error(`[stripe] subscription.deleted — no user found for customer ${customerId}`)
          break
        }

        const endTimestamp = subscription.ended_at ?? subscription.cancel_at ?? Math.floor(Date.now() / 1000)
        const endsAt = new Date(endTimestamp * 1000).toISOString()

        const { error } = await admin
          .from('users')
          .update({ subscription_ends_at: endsAt })
          .eq('id', user.id)

        if (error) {
          console.error('[stripe] Failed to set subscription_ends_at:', error.message)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        console.log(`[stripe] Subscription ends at ${endsAt} for user ${user.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn(`[stripe] Payment failed for customer ${invoice.customer}`)
        break
      }

      default:
        console.log(`[stripe] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe] Webhook handler error for ${event.type}:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
