import { Metadata } from "next"
import { LandingHeader } from "@/components/landing-header"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidad - GhostSwap",
  description: "Conoce cómo GhostSwap protege tu información personal y tus datos.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LandingHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-indigo-100">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Política de Privacidad</h1>
          </div>

          <p className="text-sm text-slate-500 mb-8">
            Última actualización: Noviembre 2025
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Información que Recopilamos</h2>
              <p className="text-slate-600 mb-4">
                GhostSwap recopila la siguiente información cuando utilizas nuestro servicio:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Información de la cuenta de Google:</strong> Nombre, dirección de correo electrónico y foto de perfil cuando inicias sesión con Google.</li>
                <li><strong>Datos del grupo:</strong> Nombres de grupos, fechas de intercambio, presupuestos y listas de deseos que creas.</li>
                <li><strong>Información de uso:</strong> Datos básicos sobre cómo interactúas con la aplicación.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Cómo Usamos tu Información</h2>
              <p className="text-slate-600 mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Crear y administrar tu cuenta de usuario</li>
                <li>Facilitar la creación de grupos y sorteos de Amigo Secreto</li>
                <li>Permitir que los miembros del grupo vean información relevante (nombres, listas de deseos)</li>
                <li>Mejorar y mantener el servicio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Compartición de Información</h2>
              <p className="text-slate-600 mb-4">
                <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines de marketing o publicidad.
              </p>
              <p className="text-slate-600 mb-4">
                Tu información puede ser compartida únicamente:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Con otros miembros del mismo grupo (nombre, email, lista de deseos)</li>
                <li>Con proveedores de servicios necesarios para operar la aplicación (Supabase, Vercel)</li>
                <li>Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Seguridad de los Datos</h2>
              <p className="text-slate-600">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal,
                incluyendo encriptación de datos en tránsito y en reposo, y control de acceso basado en roles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Retención de Datos</h2>
              <p className="text-slate-600">
                Mantenemos tu información mientras tu cuenta esté activa o mientras sea necesario para proporcionarte
                el servicio. Puedes solicitar la eliminación de tu cuenta y datos asociados en cualquier momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Tus Derechos</h2>
              <p className="text-slate-600 mb-4">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar información incorrecta</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Exportar tus datos en un formato portable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Uso de Google OAuth</h2>
              <p className="text-slate-600">
                GhostSwap utiliza Google OAuth para autenticación. Solo accedemos a la información básica de tu perfil
                (nombre, email y foto) necesaria para crear tu cuenta. No accedemos a tus contactos, calendario u otros
                datos de Google.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Cookies</h2>
              <p className="text-slate-600">
                Utilizamos cookies esenciales para mantener tu sesión iniciada y mejorar tu experiencia.
                No utilizamos cookies de seguimiento ni publicidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Cambios a esta Política</h2>
              <p className="text-slate-600">
                Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos
                publicando la nueva política en esta página con una fecha de actualización.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contacto</h2>
              <p className="text-slate-600">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos,
                puedes contactarnos a través del repositorio del proyecto.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
