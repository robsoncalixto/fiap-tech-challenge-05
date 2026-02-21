import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ToastContainer } from '@/components/ui/toast'
import { Shield } from 'lucide-react'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('credits, full_name, avatar_url, tier, subscription_ends_at, updated_at')
    .eq('id', user.id)
    .single()

  if (profile) {
    // T067: Auto-downgrade expired Pro subscriptions
    if (
      profile.tier === 'pro' &&
      profile.subscription_ends_at &&
      new Date(profile.subscription_ends_at) < new Date()
    ) {
      await supabase
        .from('users')
        .update({
          tier: 'starter',
          stripe_subscription_id: null,
          subscription_ends_at: null,
        })
        .eq('id', user.id)
      profile.tier = 'starter'
      profile.subscription_ends_at = null
    }

    // T066: Starter monthly credit replenishment (30-day check via DB)
    if (profile.tier === 'starter' && profile.credits === 0) {
      // eslint-disable-next-line react-hooks/purity -- server-side data check, not render output
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('id', user.id)
        .lt('updated_at', thirtyDaysAgo)
      if (count && count > 0) {
        await supabase
          .from('users')
          .update({ credits: 1 })
          .eq('id', user.id)
        profile.credits = 1
      }
    }
  }

  const credits = profile?.credits ?? 0
  const userName = profile?.full_name ?? user.email ?? null
  const avatarUrl = profile?.avatar_url ?? null

  return (
    <div className="flex h-screen">
      <Sidebar credits={credits} userName={userName} avatarUrl={avatarUrl} />

      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <header className="relative z-10 flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-bold">Arch Vision</span>
          </div>
          <MobileMenu credits={credits} userName={userName} />
          <div className="ml-auto flex items-center">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
