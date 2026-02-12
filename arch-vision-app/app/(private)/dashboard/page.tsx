import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { ReportsTable } from '@/components/dashboard/reports-table'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  const { data: reports } = await supabase
    .from('reports')
    .select('id, image_url, ai_model, status, created_at')
    .order('created_at', { ascending: false })

  const allReports = reports || []

  const signedReports = await Promise.all(
    allReports.map(async (report) => {
      const { data } = await supabase.storage
        .from('diagrams')
        .createSignedUrl(report.image_url, 3600)
      return { ...report, signedUrl: data?.signedUrl }
    })
  )

  const lastAnalysisDate = allReports.length > 0 ? allReports[0].created_at : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Gerencie suas análises de segurança
          </p>
        </div>
        <Link href="/analyze">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Nova Análise
          </Button>
        </Link>
      </div>

      <StatsCards
        credits={profile?.credits ?? 0}
        totalAnalyses={allReports.length}
        lastAnalysisDate={lastAnalysisDate}
      />

      {allReports.length > 0 ? (
        <ReportsTable reports={signedReports} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
          <PlusCircle className="h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma análise ainda</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Execute sua primeira análise STRIDE
          </p>
          <Link href="/analyze" className="mt-4">
            <Button>Analisar Meu Diagrama</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
