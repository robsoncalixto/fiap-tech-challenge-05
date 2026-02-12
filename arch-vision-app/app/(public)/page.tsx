import { Hero } from '@/components/landing/hero'
import { SocialProof } from '@/components/landing/social-proof'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { HowItWorks } from '@/components/landing/how-it-works'
import { PricingCards } from '@/components/landing/pricing-cards'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <section id="features">
        <FeaturesGrid />
      </section>
      <HowItWorks />
      <section id="pricing">
        <PricingCards />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <Footer />
    </main>
  )
}
