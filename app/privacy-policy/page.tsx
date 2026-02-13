'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-indigo-950/50 via-slate-950 to-purple-950/50 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-slate-200 mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-5xl font-bold text-white">Política de Privacidad</h1>
          <p className="mt-4 text-slate-400">
            Última actualización: {lastUpdate}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-white">1. Introducción</h2>
            <p>
              En Scanela ("nosotros", "nuestro" o "la plataforma"), respetamos la privacidad de nuestros usuarios ("usted" o "el usuario"). Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestro sitio web, aplicación móvil y servicios relacionados.
            </p>
            <p>
              Por favor lea atentamente esta política. Si no está de acuerdo con nuestras prácticas de privacidad, no use nuestros servicios.
            </p>
          </section>

          {/* Información que recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-white">2. Información que Recopilamos</h2>
            <p>Recopilamos información de varias formas:</p>
            
            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información de Registro</h3>
            <p>
              Cuando se registra en Scanela, solicitamos información como nombre, correo electrónico, número de teléfono, nombre del negocio y país de residencia.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información de Pago</h3>
            <p>
              Procesamos información de pago a través de proveedores de terceros (Stripe, LemonSqueezy, etc.). No almacenamos directamente números de tarjeta de crédito completos en nuestros servidores.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información del Menú</h3>
            <p>
              Los datos que sube a su menú (productos, precios, descripciones, imágenes) se almacenan en nuestros servidores para proporcionar el servicio. Esta información es controlada por usted y puede eliminarse en cualquier momento.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Datos de Uso</h3>
            <p>
              Recopilamos automáticamente cierta información sobre sus dispositivos y cómo interactúa con nuestros servicios, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Dirección IP y tipo de navegador</li>
              <li>Páginas visitadas y duración de la sesión</li>
              <li>Clics y acciones en la plataforma</li>
              <li>Información del dispositivo (sistema operativo, resolución)</li>
              <li>Ubicación aproximada (país/región)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Cookies y Tecnologías Similares</h3>
            <p>
              Usamos cookies, píxeles de seguimiento y tecnologías similares para mejorar su experiencia, recordar preferencias y analizar el uso de la plataforma.
            </p>
          </section>

          {/* Cómo usamos su información */}
          <section>
            <h2 className="text-2xl font-bold text-white">3. Cómo Usamos Su Información</h2>
            <p>Usamos la información recopilada para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar transacciones de pago y facturación</li>
              <li>Enviar actualizaciones, notificaciones y soporte técnico</li>
              <li>Personalizar su experiencia en la plataforma</li>
              <li>Analizar tendencias de uso y mejorar la funcionalidad</li>
              <li>Detectar y prevenir fraude y abuso</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
            </ul>
          </section>

          {/* Compartición de información */}
          <section>
            <h2 className="text-2xl font-bold text-white">4. Compartición de Información</h2>
            <p>
              No vendemos ni compartimos su información personal con terceros sin su consentimiento, excepto en los siguientes casos:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Proveedores de Servicios</h3>
            <p>
              Compartimos información con proveedores confiables que nos ayudan a operar la plataforma, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Procesadores de pago (Stripe, LemonSqueezy)</li>
              <li>Proveedores de hosting y almacenamiento en la nube (Vercel, Supabase)</li>
              <li>Servicios de análisis (Google Analytics)</li>
              <li>Proveedores de email y comunicaciones</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Cumplimiento Legal</h3>
            <p>
              Podemos divulgar información si se requiere por ley o si creemos de buena fe que la divulgación es necesaria para:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Cumplir con regulaciones, leyes o procedimientos legales</li>
              <li>Proteger nuestros derechos, privacidad o seguridad</li>
              <li>Proteger contra fraude o amenazas de seguridad</li>
              <li>Hacer cumplir nuestros términos de servicio</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Transferencia Comercial</h3>
            <p>
              En caso de fusión, venta de activos o quiebra de Scanela, su información podría transferirse como parte de esa transacción. Le notificaremos de cualquier cambio.
            </p>
          </section>

          {/* Seguridad de datos */}
          <section>
            <h2 className="text-2xl font-bold text-white">5. Seguridad de sus Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información contra acceso no autorizado, alteración o destrucción. Esto incluye:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Cifrado SSL/TLS para transmisión de datos</li>
              <li>Contraseñas encriptadas en la base de datos</li>
              <li>Autenticación de dos factores (2FA) disponible</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Acceso restringido a datos sensibles</li>
            </ul>
            <p className="mt-4">
              Sin embargo, ningún método de seguridad es 100% impenetrable. Aunque hacemos nuestro mejor esfuerzo para proteger su información, no podemos garantizar seguridad absoluta.
            </p>
          </section>

          {/* Sus derechos */}
          <section>
            <h2 className="text-2xl font-bold text-white">6. Sus Derechos de Privacidad</h2>
            <p>
              Dependiendo de su ubicación, puede tener los siguientes derechos:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Acceso y Portabilidad</h3>
            <p>
              Tiene derecho a acceder a sus datos personales y recibir una copia en formato legible.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Corrección y Eliminación</h3>
            <p>
              Puede solicitar que corrijamos datos inexactos o eliminemos su información personal (sujeto a obligaciones legales).
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Consentimiento y Opción</h3>
            <p>
              Puede retirar su consentimiento para ciertos tratamientos de datos. Puede optar por no recibir comunicaciones de marketing en cualquier momento.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Objeción</h3>
            <p>
              Puede objetar a ciertos tratamientos de sus datos, especialmente para marketing.
            </p>

            <p className="mt-4">
              Para ejercer estos derechos, contáctenos a través de los datos de contacto al final de esta política.
            </p>
          </section>

          {/* Retención de datos */}
          <section>
            <h2 className="text-2xl font-bold text-white">7. Retención de Datos</h2>
            <p>
              Retenemos sus datos personales mientras su cuenta esté activa y sean necesarios para proporcionar los servicios. Después de cerrar su cuenta, podemos retener ciertos datos durante:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>30 días para recuperación de cuenta accidental</li>
              <li>90 días para registros de transacciones (requisitos fiscales)</li>
              <li>Más tiempo si lo requiere la ley</li>
            </ul>
            <p className="mt-4">
              Puede solicitar la eliminación permanente de sus datos en cualquier momento, excepto cuando sea requerida su retención por ley.
            </p>
          </section>

          {/* Privacidad de menores */}
          <section>
            <h2 className="text-2xl font-bold text-white">8. Privacidad de Menores</h2>
            <p>
              Nuestros servicios están destinados a empresas y mayores de 18 años. No recopilamos intencionalmente información de menores de 13 años. Si descubrimos que hemos recopilado información de un menor sin consentimiento parental verificable, tomaremos medidas para eliminar esa información de inmediato.
            </p>
            <p className="mt-4">
              Si cree que hemos recopilado información de un menor, contáctenos inmediatamente.
            </p>
          </section>

          {/* Enlaces a terceros */}
          <section>
            <h2 className="text-2xl font-bold text-white">9. Enlaces a Terceros</h2>
            <p>
              Nuestra plataforma puede contener enlaces a sitios web y servicios de terceros. No somos responsables de las prácticas de privacidad de estos sitios. Le recomendamos leer sus políticas de privacidad antes de proporcionar información personal.
            </p>
          </section>

          {/* Cambios a esta política */}
          <section>
            <h2 className="text-2xl font-bold text-white">10. Cambios a Esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios significativos serán notificados por email o mediante un aviso destacado en la plataforma. Su uso continuado de Scanela después de los cambios constituye su aceptación de la política actualizada.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-white">11. Contáctenos</h2>
            <p>
              Si tiene preguntas, preocupaciones o desea ejercer sus derechos de privacidad, contáctenos a:
            </p>
            <div className="mt-4 rounded-lg bg-slate-800/50 p-6 border border-slate-700">
              <p className="font-semibold text-slate-100">Scanela</p>
              <p className="mt-2">Email: <span className="text-indigo-400">privacy@scanela.com</span></p>
              <p>Email de CEO: <span className="text-indigo-400">bryansgue@gmail.com</span></p>
              <p>Sitio web: <span className="text-indigo-400">www.scanela.com</span></p>
              <p className="mt-4 text-sm text-slate-400">
                Responderemos a solicitudes de privacidad dentro de 30 días.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-slate-950/50 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Scanela. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
