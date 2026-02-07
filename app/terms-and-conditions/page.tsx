'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4">
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold">Términos de Servicio</h1>
          <p className="text-slate-400 mt-2">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Aceptación de Términos</h2>
          <p className="text-slate-700 leading-relaxed">
            Al acceder y utilizar Scanela, aceptas estar vinculado por estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no puedes utilizar nuestro servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Descripción del Servicio</h2>
          <p className="text-slate-700 leading-relaxed">
            Scanela es una plataforma de menú digital que permite a restaurantes y negocios crear, compartir y gestionar menús a través de códigos QR. Ofrecemos diferentes planes con funcionalidades variadas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Cuenta de Usuario</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              <strong>3.1 Registro:</strong> Para utilizar Scanela, debes crear una cuenta proporcionando información precisa y completa.
            </p>
            <p>
              <strong>3.2 Responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
            </p>
            <p>
              <strong>3.3 Suspensión:</strong> Nos reservamos el derecho de suspender o cancelar tu cuenta si violas estos términos.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Planes y Pagos</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              <strong>4.1 Planes Disponibles:</strong> Ofrecemos planes Free, Menus y Ventas con precios y funcionalidades específicas.
            </p>
            <p>
              <strong>4.2 Facturación:</strong> Los cargos se realizan a través de nuestros procesadores de pago autorizados. Al seleccionar un plan de pago, autorizas el cobro recurrente.
            </p>
            <p>
              <strong>4.3 Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento. La cancelación entra en vigor al final del período de facturación actual.
            </p>
            <p>
              <strong>4.4 Reembolsos:</strong> No ofrecemos reembolsos por pagos ya realizados. Sin embargo, puedes cancelar tu suscripción en cualquier momento.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contenido del Usuario</h2>
          <div className="space-y-4 text-slate-700">
            <p>
              <strong>5.1 Propiedad:</strong> Retienes toda la propiedad de los contenidos (menús, imágenes, descripciones) que cargues en Scanela.
            </p>
            <p>
              <strong>5.2 Licencia:</strong> Al usar Scanela, nos otorgas una licencia para almacenar, procesar y mostrar tu contenido en relación con el servicio.
            </p>
            <p>
              <strong>5.3 Responsabilidad:</strong> Eres responsable de asegurar que tu contenido no infrinja derechos de terceros.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitación de Responsabilidad</h2>
          <p className="text-slate-700 leading-relaxed">
            Scanela se proporciona "tal cual". No nos hacemos responsables por daños indirectos, incidentales, especiales o consecuentes derivados del uso del servicio. Nuestra responsabilidad total no excede el monto pagado en los últimos 12 meses.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Prohibiciones</h2>
          <p className="text-slate-700 leading-relaxed mb-4">No puedes:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>Usar Scanela para actividades ilegales o no autorizadas</li>
            <li>Interferir con la operación del servicio</li>
            <li>Intentar acceder a cuentas de otros usuarios sin autorización</li>
            <li>Cargar contenido que sea ofensivo, ilegal o infrinja derechos de terceros</li>
            <li>Usar bots o scripts automatizados para acceder al servicio</li>
            <li>Reselling o compartir acceso a tu cuenta</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cambios en el Servicio</h2>
          <p className="text-slate-700 leading-relaxed">
            Nos reservamos el derecho de modificar, suspender o discontinuar Scanela (o cualquier parte del mismo) en cualquier momento, con o sin aviso previo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Privacidad</h2>
          <p className="text-slate-700 leading-relaxed">
            Tu uso de Scanela está sujeto a nuestra Política de Privacidad. Por favor, revísala para entender nuestras prácticas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contacto</h2>
          <p className="text-slate-700 leading-relaxed">
            Si tienes preguntas sobre estos términos, contacta a{' '}
            <a href="mailto:soporte@scanela.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
              soporte@scanela.com
            </a>
          </p>
        </section>

        <div className="border-t pt-8 mt-8">
          <p className="text-sm text-slate-600">
            © 2024 Scanela. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
