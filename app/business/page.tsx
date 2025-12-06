import type { Metadata } from 'next'
import {
  Building2,
  Shield,
  Zap,
  Users,
  X,
  Check,
  Palette,
  Globe,
  Lock,
  Headphones,
  FileSpreadsheet,
  Ghost,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'
import { AuroraBackgroundBusiness } from '@/components/aurora-background-business'

export const metadata: Metadata = {
  title: 'GhostSwap para Empresas - Amigo Secreto Corporativo',
  description:
    'Organiza el Amigo Secreto de tu empresa con seguridad empresarial, tu marca y cero hojas de cálculo. La plataforma favorita de los equipos de RRHH y Cultura.',
}

const CONTACT_EMAIL = 'hello@kthcsk.me'

export default function BusinessPage() {
  const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=Cotización%20GhostSwap%20Corporativo&body=Hola%2C%20me%20interesa%20una%20versión%20corporativa%20de%20GhostSwap.%0A%0ANombre%20de%20la%20empresa%3A%20%0ANúmero%20aproximado%20de%20colaboradores%3A%20%0A%0AGracias!`

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero B2B */}
        <section className="relative border-b border-slate-200 px-4 py-20 md:py-28">
          <AuroraBackgroundBusiness variant={1} />
          <div className="pointer-events-none absolute inset-0 bg-white/40" />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <Building2 className="h-4 w-4" />
              GhostSwap para Empresas
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Organiza el Amigo Secreto de tu empresa{' '}
              <span className="text-indigo-600">sin fricción</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600">
              Seguridad empresarial, tu marca y cero hojas de cálculo. La plataforma favorita de los
              equipos de RRHH y Cultura.
            </p>

            <a href={mailtoLink}>
              <Button
                size="lg"
                className="h-14 bg-indigo-600 px-10 text-base shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
              >
                Cotizar para mi equipo
              </Button>
            </a>

            <p className="mt-4 text-sm text-slate-500">Respuesta en menos de 24 horas</p>
          </div>
        </section>

        {/* Comparativa */}
        <section className="border-b border-slate-200 bg-white py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">
                Deja atrás las hojas de cálculo
              </h2>
              <p className="text-lg text-slate-500">
                Compara el método tradicional con la solución moderna
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Excel Manual */}
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-700">Excel Manual</h3>
                    <p className="text-sm text-slate-500">El método antiguo</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3 w-3 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Inseguro</p>
                      <p className="text-sm text-slate-500">
                        Cualquiera puede ver quién le tocó a quién
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3 w-3 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Lento</p>
                      <p className="text-sm text-slate-500">
                        Recolectar datos y hacer el sorteo toma horas
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3 w-3 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Propenso a errores</p>
                      <p className="text-sm text-slate-500">
                        Alguien siempre se queda sin pareja o le toca a sí mismo
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* GhostSwap Corporate */}
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Ghost className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-700">GhostSwap Corporate</h3>
                    <p className="text-sm text-indigo-500">La solución moderna</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Encriptado</p>
                      <p className="text-sm text-slate-500">
                        Cada persona solo ve a su Amigo Secreto
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Automático</p>
                      <p className="text-sm text-slate-500">
                        Comparte un link y el sorteo se hace solo
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Soporte dedicado</p>
                      <p className="text-sm text-slate-500">Te ayudamos en cada paso del proceso</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="relative border-b border-slate-200 py-20">
          <AuroraBackgroundBusiness variant={2} />
          <div className="pointer-events-none absolute inset-0 bg-white/40" />
          <div className="relative z-10 container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">Planes para tu empresa</h2>
              <p className="text-lg text-slate-500">
                Elige el nivel de personalización que necesitas
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Team Branding */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-slate-300 hover:shadow-lg">
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">Team Branding</h3>
                  <p className="text-slate-500">Ideal para equipos que quieren identidad rápida</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-slate-900">$150.000</span>
                  <span className="text-slate-500"> / evento</span>
                </div>

                <ul className="mb-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Logo y colores corporativos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">
                      Subdominio exclusivo (empresa.ghostswap.app)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Restricción de correo (@empresa.com)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Hasta 100 colaboradores</span>
                  </li>
                </ul>

                <a href={mailtoLink} className="block">
                  <Button
                    variant="outline"
                    className="h-12 w-full border-slate-300 text-base hover:bg-slate-50"
                  >
                    Solicitar información
                  </Button>
                </a>
              </div>

              {/* Enterprise White-Label */}
              <div className="relative rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-lg">
                <div className="absolute -top-3 right-8">
                  <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                    RECOMENDADO
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900">Enterprise White-Label</h3>
                  <p className="text-slate-500">Control total, privacidad y dominio propio</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-bold text-slate-900">Consultar</span>
                  <span className="text-slate-500"> / evento</span>
                </div>

                <ul className="mb-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-600">Todo lo de Team Branding</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">
                      Tu propio dominio (navidad.tuempresa.com)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Base de datos aislada (mayor privacidad)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Headphones className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Soporte prioritario por WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-600">Reporte de participación post-evento</span>
                  </li>
                </ul>

                <a href={mailtoLink} className="block">
                  <Button className="h-12 w-full bg-indigo-600 text-base shadow-lg shadow-indigo-200/50 hover:bg-indigo-700">
                    Cotizar ahora
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-b border-slate-200 bg-white py-20">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">
                Por qué los equipos de RRHH nos eligen
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-6 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">Privacidad garantizada</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Datos encriptados y eliminados automáticamente 30 días después del evento.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-6 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">Implementación rápida</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  En 24 horas tienes tu instancia lista. Sin procesos largos de TI.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-6 transition-all hover:border-slate-300 hover:shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">Escalable</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Desde 10 hasta 500+ colaboradores sin problemas de rendimiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-20">
          <AuroraBackgroundBusiness variant={3} />
          <div className="pointer-events-none absolute inset-0 bg-white/40" />
          <div className="relative z-10 container mx-auto max-w-3xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900">Preguntas frecuentes</h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="factura">
                  <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline">
                    ¿Entregan factura?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    Sí, emitimos factura exenta o afecta según corresponda en Chile (SII) o Invoice
                    internacional para empresas fuera de Chile.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacidad">
                  <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline">
                    ¿Qué pasa con la privacidad de los datos?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    La instancia corporativa es completamente aislada. Los correos y nombres de los
                    participantes se eliminan automáticamente 30 días después del evento. Cumplimos
                    con las mejores prácticas de seguridad.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="capacidad">
                  <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline">
                    ¿Hasta cuántos empleados soporta?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    Hemos gestionado grupos desde 10 hasta 500 colaboradores sin problemas. Para
                    equipos más grandes, contáctanos para una solución personalizada.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              ¿Listo para organizar el Amigo Secreto de tu empresa?
            </h2>
            <p className="mb-8 text-slate-600">
              Escríbenos y te enviamos una propuesta personalizada en menos de 24 horas.
            </p>
            <a href={mailtoLink}>
              <Button
                size="lg"
                className="h-12 bg-indigo-600 px-8 text-base shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
              >
                Contactar ahora
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
