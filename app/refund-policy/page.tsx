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
            <h2 className="text-2xl font-bold text-white">1. Derecho de Reembolso Garantizado</h2>
            <p>
              En Scanela, todos nuestros clientes tienen derecho a un reembolso completo dentro de <strong>14 días calendarios</strong> desde la fecha de su compra inicial. Este es un derecho garantizado sin excepciones ni condiciones especiales.
            </p>
            <p>
              Queremos que esté completamente satisfecho con nuestros servicios de menú digital. Si por cualquier razón no desea continuar con su suscripción, puede solicitar un reembolso completo durante este período de 14 días.
            </p>
          </section>

          {/* Período de reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">2. Ventana de Reembolso de 14 Días</h2>
            <p>
              Si se suscribe a cualquiera de nuestros planes pagos (Scanela Menú), tiene <strong>14 días calendarios</strong> desde la fecha de cargo inicial para solicitar un reembolso completo.
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Lo que cubre el reembolso:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>La compra completa de su suscripción inicial</li>
              <li>Todos los métodos de pago (tarjeta de crédito, débito, billeteras digitales)</li>
              <li>No requiere justificación ni razón específica</li>
              <li>Sin preguntas adicionales</li>
              <li>Procesamiento automático del reembolso</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información importante:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Este derecho aplica a la primera compra/suscripción</li>
              <li>El período comienza desde la fecha exacta del cargo</li>
              <li>El reembolso se procesa dentro de 5-10 días hábiles</li>
              <li>El dinero regresa a su método de pago original</li>
            </ul>
          </section>

          {/* Después de 14 días */}
          <section>
            <h2 className="text-2xl font-bold text-white">3. Después de 14 Días</h2>
            <p>
              Después de completarse el período de 14 días, ya no ofrece reembolsos automáticos. Sin embargo, evaluamos solicitudes especiales de buena fe en casos donde:
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li>Experimentó un error técnico que impidió usar el servicio</li>
              <li>El servicio no estuvo disponible por más de 24 horas</li>
              <li>Se procesó un cargo duplicado</li>
              <li>Cambiamos significativamente las características del plan sin previo aviso</li>
            </ul>

            <p className="mt-4">
              Para estos casos especiales, contáctenos directamente en <span className="text-indigo-400 font-semibold">support@scanela.com</span> o <span className="text-indigo-400 font-semibold">bryansgue@gmail.com</span>
            </p>
          </section>


          {/* Cómo solicitar reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">4. Cómo Solicitar un Reembolso</h2>
            <p>
              Para solicitar un reembolso dentro del período de 14 días, simplemente contáctenos con la siguiente información:
            </p>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Información a Proporcionar:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Email de la cuenta Scanela</li>
              <li>Fecha de la compra</li>
              <li>Número de factura o transacción (si disponible)</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-100 mt-4">Cómo Solicitar:</h3>
            <p>
              Envíe su solicitud de reembolso a: <span className="text-indigo-400 font-semibold">refunds@scanela.com</span> o <span className="text-indigo-400 font-semibold">bryansgue@gmail.com</span>
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Procesamos solicitudes de reembolso dentro de 5 a 10 días hábiles. El reembolso se acreditará a su método de pago original.
            </p>
          </section>


          {/* Tiempo de procesamiento */}
          <section>
            <h2 className="text-2xl font-bold text-white">5. Tiempo de Procesamiento del Reembolso</h2>
            <p>
              Una vez que recibamos su solicitud de reembolso:
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li><strong>Revisión:</strong> 1-2 días hábiles</li>
              <li><strong>Procesamiento:</strong> 5-10 días hábiles</li>
              <li><strong>Aparición en su cuenta:</strong> 3-5 días bancarios adicionales (varía según su banco)</li>
            </ul>

            <p className="mt-4">
              El tiempo total puede ser de 1 a 3 semanas dependiendo de su institución financiera.
            </p>
          </section>

          {/* Método de reembolso */}
          <section>
            <h2 className="text-2xl font-bold text-white">6. Método de Reembolso</h2>
            <p>
              Todos los reembolsos se procesan a través del mismo método de pago que utilizó para realizar la compra. No emitimos reembolsos en otro formato o método diferente.
            </p>
          </section>

          {/* Cancelación de suscripción */}
          <section>
            <h2 className="text-2xl font-bold text-white">7. Cancelación de Suscripción</h2>
            <p>
              Puede cancelar su suscripción en cualquier momento desde su panel de control. La cancelación detiene futuras renovaciones, pero no genera reembolso automático por el período actual. 
            </p>
            <p className="mt-4">
              Si desea un reembolso de su compra actual, hágalo dentro del período de 14 días.
            </p>
          </section>

          {/* Cargos y renovaciones */}
          <section>
            <h2 className="text-2xl font-bold text-white">8. Cargos Recurrentes</h2>
            <p>
              Las suscripciones se renuevan automáticamente en el mismo día cada mes o año según su plan. Recibirá recordatorios antes de cada renovación. Puede cancelar en cualquier momento para evitar futuros cargos.
            </p>
          </section>

          {/* Disputas */}
          <section>
            <h2 className="text-2xl font-bold text-white">9. Disputas de Facturación</h2>
            <p>
              Si ve un cargo que no reconoce o tiene problemas con su facturación, contáctenos inmediatamente en <span className="text-indigo-400 font-semibold">billing@scanela.com</span> o <span className="text-indigo-400 font-semibold">bryansgue@gmail.com</span> antes de abrir una disputa con su banco.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-white">10. Contáctenos</h2>
            <p>
              Para solicitar un reembolso o hacer preguntas sobre esta política:
            </p>

            <div className="mt-4 rounded-lg bg-slate-800/50 p-6 border border-slate-700">
              <p className="font-semibold text-slate-100">Equipo de Soporte de Scanela</p>
              <p className="mt-2">Email de Reembolsos: <span className="text-indigo-400">refunds@scanela.com</span></p>
              <p>Email de CEO: <span className="text-indigo-400">bryansgue@gmail.com</span></p>
              <p>Email de Facturación: <span className="text-indigo-400">billing@scanela.com</span></p>
              <p className="mt-4">Sitio web: <span className="text-indigo-400">www.scanela.com</span></p>
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
