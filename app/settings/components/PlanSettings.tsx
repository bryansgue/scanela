"use client";

import Section from "./Section";

export default function PlanSettings() {
  return (
    <Section title="Plan y facturación">
      <p className="text-gray-600 mb-4">
        Gestiona tu plan, métodos de pago y facturas.
      </p>

      <div className="bg-gray-50 border rounded-xl p-5 max-w-lg">

        <p className="font-semibold text-lg">Plan actual:</p>
        <p className="text-blue-600 text-xl font-bold mt-1">Pro (mensual)</p>

        <button className="
          mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg
          font-semibold hover:bg-purple-700 shadow
        ">
          Cambiar plan
        </button>

        <hr className="my-6" />

        <button className="text-blue-600 font-medium hover:underline">
          Ver historial de facturas →
        </button>
      </div>
    </Section>
  );
}
