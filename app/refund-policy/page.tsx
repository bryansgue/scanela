'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function RefundPolicyPage() {
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
          <h1 className="text-5xl font-bold text-white">Política de Reembolsos</h1>
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
            <h2 className="text-2xl font-bold text-white">1. Política General de Reembolsos</h2>
            <p>
              En Scanela, queremos que esté completamente satisfecho con nuestros servicios. Esta Política de Reembolsos explica cuándo y cómo puede solicitar un reembolso de sus pagos.
            </p>
            <p>
              Ofrecemos un período de prueba de 7 días con reembolso garantizado si no está satisfecho con nuestros servicios.
            </p>
          </section>

          {/* Período de reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">2. Período de Reembolso de 7 Días</h2>
            <p>
              Si se suscribe a cualquiera de nuestros planes pagos (Scanela Menú), tiene <strong>7 días calendarios</strong> desde la fecha de compra para solicitar un reembolso completo sin hacer preguntas.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Condiciones:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>El reembolso se aplica solo a la primera factura/suscripción</li>
              <li>Debe solicitar el reembolso dentro de 7 días desde la fecha de cargo inicial</li>
              <li>No se requiere justificación especial</li>
              <li>No se aplica a renovaciones automáticas después de los primeros 7 días</li>
            </ul>
          </section>

          {/* Reembolsos después de 7 días */}
          <section>
            <h2 className="text-2xl font-bold text-white">3. Reembolsos Después de 7 Días</h2>
            <p>
              Después del período de 7 días, evaluamos solicitudes de reembolso caso por caso según las siguientes circunstancias:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Circunstancias Elegibles:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Error técnico:</strong> Si experimentó un problema técnico que impidió usar los servicios adecuadamente</li>
              <li><strong>Servicio no disponible:</strong> Si el servicio no estuvo disponible por más de 24 horas consecutivas</li>
              <li><strong>Cargos duplicados:</strong> Si se le cobró dos veces por la misma suscripción</li>
              <li><strong>Cambio de política:</strong> Si cambiamos significativamente las características del plan sin previo aviso</li>
              <li><strong>Circunstancias especiales:</strong> Otros casos justificados evaluados individualmente</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Circunstancias NO Elegibles:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Cambio de opinión después de usar activamente los servicios</li>
              <li>No usar los servicios después de la compra</li>
              <li>Insatisfacción con resultados de ventas o tráfico del menú</li>
              <li>Dificultades personales o financieras (a menos que haya error de nuestra parte)</li>
              <li>Solicitudes presentadas después de 30 días desde la compra</li>
            </ul>
          </section>

          {/* Cómo solicitar reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">4. Cómo Solicitar un Reembolso</h2>
            <p>
              Para solicitar un reembolso, por favor contáctenos con la siguiente información:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información Requerida:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Email de la cuenta Scanela</li>
              <li>Fecha de la compra o transacción</li>
              <li>ID de transacción o número de factura (si disponible)</li>
              <li>Motivo del reembolso</li>
              <li>Cualquier detalle adicional que apoye su solicitud</li>
            </ul>

            <p className="mt-4">
              Envíe su solicitud a: <span className="text-indigo-400 font-semibold">refunds@scanela.com</span>
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Procesamos solicitudes de reembolso dentro de 5 a 10 días hábiles.
            </p>
          </section>

          {/* Tiempo de procesamiento */}
          <section>
            <h2 className="text-2xl font-bold text-white">5. Tiempo de Procesamiento y Reembolso</h2>
            <p>
              Una vez aprobado su reembolso:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Tiempo de Procesamiento:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Revisión de solicitud:</strong> 3 a 5 días hábiles</li>
              <li><strong>Aprobación o rechazo:</strong> Notificación por email</li>
              <li><strong>Procesamiento del reembolso:</strong> 5 a 10 días hábiles después de la aprobación</li>
              <li><strong>Aparición en su cuenta bancaria:</strong> 3 a 5 días bancarios adicionales (varía según su banco)</li>
            </ul>

            <p className="mt-4">
              El tiempo total desde la solicitud hasta el reembolso visible puede ser de 2 a 3 semanas.
            </p>
          </section>

          {/* Métodos de reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">6. Método de Reembolso</h2>
            <p>
              Los reembolsos se procesan a través del mismo método de pago original:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Reembolsos por Método:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Tarjeta de crédito/débito:</strong> Aparece como crédito en su extracto bancario</li>
              <li><strong>PayPal:</strong> Reembolso a su billetera de PayPal</li>
              <li><strong>Transferencia bancaria:</strong> Reembolso a la cuenta bancaria registrada</li>
              <li><strong>Billeteras digitales:</strong> Reembolso al método original</li>
            </ul>

            <p className="mt-4">
              <strong>Nota:</strong> No emitimos reembolsos en efectivo ni en diferentes métodos de pago al original.
            </p>
          </section>

          {/* Cancelación de suscripción */}
          <section>
            <h2 className="text-2xl font-bold text-white">7. Cancelación vs. Reembolso</h2>
            <p>
              Es importante entender la diferencia entre cancelación y reembolso:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Cancelación:</h3>
            <p>
              Detiene futuras renovaciones de su suscripción. Se puede hacer en cualquier momento desde la configuración de su cuenta. Si cancela, su plan permanece activo hasta el final del período pagado.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Reembolso:</h3>
            <p>
              Devuelve dinero de un pago ya procesado. Solo está disponible bajo las condiciones mencionadas en esta política.
            </p>

            <p className="mt-4">
              <strong>Si simplemente desea cancelar su plan sin reembolso, puede hacerlo desde la sección "Billing" en su panel.</strong>
            </p>
          </section>

          {/* Excepciones */}
          <section>
            <h2 className="text-2xl font-bold text-white">8. Excepciones y Casos Especiales</h2>
            <p>
              Aunque nuestras políticas son claras, reconocemos que hay excepciones. Evaluamos solicitudes especiales considerando:
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li>Historial del cliente con Scanela</li>
              <li>Razones documentadas para la solicitud</li>
              <li>Buena fe en el trato con nuestra plataforma</li>
              <li>Circunstancias atenuantes</li>
            </ul>

            <p className="mt-4">
              Si cree que su caso merece consideración especial, por favor explíquelo en detalle cuando presente su solicitud.
            </p>
          </section>

          {/* Cambios en planes */}
          <section>
            <h2 className="text-2xl font-bold text-white">9. Cambios de Plan</h2>
            <p>
              Si cambia de plan durante un período de suscripción:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Actualización (Free → Menú):</h3>
            <p>
              Se le cobra la diferencia prorrateada entre los dos planes. No hay reembolso.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Degradación (Menú → Free):</h3>
            <p>
              Su suscripción se cancela inmediatamente. Recibe crédito por los días restantes del mes actual, aplicable a una futura suscripción (válido por 3 meses).
            </p>
          </section>

          {/* Cargos recurrentes */}
          <section>
            <h2 className="text-2xl font-bold text-white">10. Cargos Recurrentes y Cancelación Automática</h2>
            <p>
              Las suscripciones se renuevan automáticamente en la misma fecha cada mes o año, según su plan.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Prevención de Cargos Involuntarios:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Recibe recordatorio 7 días antes de la renovación</li>
              <li>Puede cancelar en cualquier momento desde su panel</li>
              <li>La cancelación evita futuros cargos pero no reembolsa el período actual</li>
            </ul>

            <p className="mt-4">
              Si se le cobró después de cancelar, contáctenos inmediatamente para investigar.
            </p>
          </section>

          {/* Disputas de facturación */}
          <section>
            <h2 className="text-2xl font-bold text-white">11. Disputas de Facturación</h2>
            <p>
              Si ve un cargo en su cuenta que no reconoce:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Pasos a Seguir:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contáctenos primero en <span className="text-indigo-400">billing@scanela.com</span></li>
              <li>Proporcione detalles del cargo cuestionado</li>
              <li>Investigaremos dentro de 5 días hábiles</li>
              <li>Si es nuestro error, procesaremos un reembolso inmediato</li>
            </ol>

            <p className="mt-4">
              <strong>No abra una disputa con su banco sin contactarnos primero.</strong> Esto puede complicar la resolución. Trabajaremos con usted directamente para resolver cualquier problema.
            </p>
          </section>

          {/* Restricciones de reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">12. Restricciones y Limitaciones</h2>
            <p>
              Nos reservamos el derecho de denegar reembolsos en los siguientes casos:
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li>Violación de nuestros Términos de Servicio</li>
              <li>Uso fraudulento o abuso del servicio</li>
              <li>Actividades ilegales en la plataforma</li>
              <li>Múltiples solicitudes de reembolso del mismo cliente (patrón de abuso)</li>
              <li>Solicitud presentada más de 30 días después de la compra</li>
              <li>Uso extenso del servicio después de la compra</li>
            </ul>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-white">13. Contáctenos</h2>
            <p>
              Si tiene preguntas sobre esta Política de Reembolsos o desea solicitar un reembolso:
            </p>

            <div className="mt-4 rounded-lg bg-slate-800/50 p-6 border border-slate-700">
              <p className="font-semibold text-slate-100">Scanela - Equipo de Reembolsos</p>
              <p className="mt-2">Email: <span className="text-indigo-400">refunds@scanela.com</span></p>
              <p>Billing: <span className="text-indigo-400">billing@scanela.com</span></p>
              <p className="mt-4">Sitio web: <span className="text-indigo-400">www.scanela.com</span></p>
              <p className="mt-4 text-sm text-slate-400">
                Respondemos a solicitudes dentro de 3 a 5 días hábiles.
              </p>
            </div>
          </section>

          {/* Cambios a la política */}
          <section>
            <h2 className="text-2xl font-bold text-white">14. Cambios a Esta Política</h2>
            <p>
              Podemos actualizar esta Política de Reembolsos periódicamente. Los cambios significativos serán notificados por email con al menos 30 días de anticipación.
            </p>
            <p className="mt-4">
              Si tiene una solicitud de reembolso pendiente, se aplicará la política vigente en el momento de su compra.
            </p>
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
