import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'
import { BusinessCTA } from '@/components/business-cta'
import { AuroraBackground } from '@/components/aurora-background'
import { AnimatedFeatures } from '@/components/animated-features'
import { SectionAurora } from '@/components/section-aurora'
import { Ghost, Calendar, Share2, Shuffle, Users, Star } from 'lucide-react'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GhostSwap',
  description:
    'Organiza tu Amigo Secreto o intercambio de regalos online gratis con sorteos automáticos y listas de deseos.',
  url: 'https://ghostswap.kthcsk.me',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '1',
  },
  inLanguage: 'es',
  keywords: 'amigo secreto, secret santa, intercambio de regalos, sorteo navidad',
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona el Amigo Secreto en GhostSwap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Creas un grupo, compartes el link con tus amigos, y cuando todos se unan, realizas el sorteo automático. Cada persona ve solo a quién le tocó regalar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿GhostSwap es gratis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, GhostSwap es 100% gratis. No hay costos ocultos ni versiones premium.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas personas pueden participar en un grupo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se necesitan al menos 3 participantes para realizar el sorteo. No hay límite máximo de participantes.',
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingHeader />

      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="relative px-4 py-16 md:py-24" aria-labelledby="hero-title">
          {/* Aurora Background - full width */}
          <AuroraBackground />
          {/* Content overlay for readability */}
          <div className="pointer-events-none absolute inset-0 bg-slate-50/70" aria-hidden="true" />

          {/* Content with z-index to stay above background */}
          <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              Sorteos invisibles, regalos inolvidables
            </div>

            <h1
              id="hero-title"
              className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl"
            >
              Organiza el <span className="text-indigo-600">Amigo Secreto</span> más genial con
              GhostSwap
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600">
              Crea tu grupo de intercambio de regalos, comparte el link con tus amigos y deja que la
              magia del sorteo haga el resto. ¡Así de simple!
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full bg-indigo-600 text-base shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
                >
                  Crear mi grupo
                </Button>
              </Link>
              <Link href="/join" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-slate-300 bg-white text-base text-slate-700 hover:bg-slate-50"
                >
                  Unirme a un grupo
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex items-center justify-center gap-6 pt-6 text-sm text-slate-500"
              aria-label="Beneficios de GhostSwap"
            >
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Grupos creados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ghost className="h-4 w-4" aria-hidden="true" />
                <span>100% Gratis</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          className="border-y border-slate-200 bg-white py-20"
          aria-labelledby="how-it-works-title"
        >
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 id="how-it-works-title" className="mb-4 text-3xl font-bold text-slate-900">
                ¿Cómo funciona el Amigo Secreto?
              </h2>
              <p className="text-lg text-slate-500">
                Tres pasos simples para tu intercambio de regalos perfecto
              </p>
            </div>

            <ol className="mx-auto grid max-w-5xl list-none gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <li className="flex flex-col items-center space-y-4 text-center">
                <div
                  className="mb-2 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 transition-transform hover:rotate-6"
                  aria-hidden="true"
                >
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">1. Crea tu grupo</h3>
                <p className="leading-relaxed text-slate-600">
                  Define la fecha del intercambio, el presupuesto máximo y las reglas del juego.
                </p>
              </li>

              {/* Step 2 */}
              <li className="flex flex-col items-center space-y-4 text-center">
                <div
                  className="mb-2 flex h-16 w-16 -rotate-3 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-transform hover:-rotate-6"
                  aria-hidden="true"
                >
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">2. Comparte el link</h3>
                <p className="leading-relaxed text-slate-600">
                  Envía el enlace a tus amigos. Ellos se unen, crean su perfil y agregan sus deseos.
                </p>
              </li>

              {/* Step 3 */}
              <li className="flex flex-col items-center space-y-4 text-center">
                <div
                  className="mb-2 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 transition-transform hover:rotate-6"
                  aria-hidden="true"
                >
                  <Shuffle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">3. El Sorteo Secreto</h3>
                <p className="leading-relaxed text-slate-600">
                  Un clic y listo. Cada quien descubre su Amigo Secreto. Sin repeticiones, sin
                  errores.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Features + CTA Section with Aurora Background */}
        <section className="relative overflow-hidden px-4 py-16" aria-labelledby="features-title">
          <SectionAurora />

          <div className="relative z-10">
            {/* Features */}
            <div className="mx-auto mb-16 max-w-4xl">
              <div className="mb-12 text-center">
                <h2 id="features-title" className="mb-3 text-2xl font-bold text-slate-900">
                  ¿Por qué GhostSwap para tu Secret Santa?
                </h2>
                <p className="text-slate-600">Hecho con cariño para que disfrutes la experiencia</p>
              </div>

              <AnimatedFeatures />
            </div>

            {/* CTA Final */}
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                ¿Listos para el intercambio de regalos?
              </h2>
              <p className="mb-6 text-slate-600">
                En menos de un minuto tendrás tu grupo de Amigo Secreto listo. ¡Solo falta que
                invites a tus amigos!
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-12 bg-indigo-600 px-8 text-base shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
                >
                  Comenzar ahora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BusinessCTA />
      <Footer />
    </div>
  )
}
