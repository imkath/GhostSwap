import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost, Calendar, Share2, Shuffle, Heart, Shield, Zap, Users, Star } from "lucide-react"

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GhostSwap',
  description: 'Organiza tu Amigo Secreto o intercambio de regalos online gratis con sorteos automáticos y listas de deseos.',
  url: 'https://ghostswap-phi.vercel.app',
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Ghost className="w-6 h-6" />
            <span>GhostSwap</span>
          </div>
          <Link href="/login">
            <Button variant="ghost" className="font-medium hover:text-indigo-600 hover:bg-indigo-50">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
            <Star className="w-3.5 h-3.5" />
            Sorteos invisibles, regalos inolvidables
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Organiza el <span className="text-indigo-600">Amigo Secreto</span> más genial con GhostSwap
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Crea tu grupo de intercambio de regalos, comparte el link con tus amigos y deja que la magia del sorteo haga el resto.
            ¡Así de simple!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50"
              >
                Crear mi grupo
              </Button>
            </Link>
            <Link href="/join" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Unirme a un grupo
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="pt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Grupos creados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Ghost className="w-4 h-4" />
              <span>100% Gratis</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">¿Cómo funciona el Amigo Secreto?</h2>
              <p className="text-slate-500 text-lg">Tres pasos simples para tu intercambio de regalos perfecto</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-2 rotate-3 hover:rotate-6 transition-transform">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">1. Crea tu sala</h3>
                <p className="text-slate-600 leading-relaxed">
                  Define la fecha del intercambio, el presupuesto máximo y las reglas del juego.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 -rotate-3 hover:-rotate-6 transition-transform">
                  <Share2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">2. Comparte el link</h3>
                <p className="text-slate-600 leading-relaxed">
                  Envía el enlace a tus amigos. Ellos se unen, crean su perfil y agregan sus deseos.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-2 rotate-3 hover:rotate-6 transition-transform">
                  <Shuffle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">3. El Sorteo Secreto</h3>
                <p className="text-slate-600 leading-relaxed">
                  Un clic y listo. Cada quien descubre su Amigo Secreto. Sin repeticiones, sin errores.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">¿Por qué GhostSwap para tu Secret Santa?</h2>
              <p className="text-slate-500">Hecho con cariño para que disfrutes la experiencia</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Totalmente gratis</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sin costos ocultos, sin versiones premium. Funcionalidad completa para todos.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Tu privacidad importa</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  No vendemos ni compartimos tus datos. Tu información está segura.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Sin spam</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Solo notificaciones esenciales. Nada de correos innecesarios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              ¿Listos para el intercambio de regalos?
            </h2>
            <p className="text-slate-500 mb-6">
              En menos de un minuto tendrás tu grupo de Amigo Secreto listo. ¡Solo falta que invites a tus amigos!
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50"
              >
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm bg-white border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} GhostSwap - Amigo Secreto e Intercambio de Regalos</p>
      </footer>
    </div>
  )
}
