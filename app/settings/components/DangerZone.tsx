"use client";

import Section from "./Section";

export default function DangerZone() {
  return (
    <Section title="Zona de peligro">
      <p className="text-gray-600 mb-4">
        Acciones destructivas. Procede con cuidado.
      </p>

      <div className="border border-red-300 bg-red-50 p-6 rounded-xl max-w-lg">
        <h4 className="text-red-600 font-bold text-lg">Eliminar cuenta</h4>
        <p className="text-red-600 text-sm mt-1">
          Esta acción es permanente y no se puede deshacer.
        </p>

        <button className="
          mt-4 bg-red-600 text-white px-6 py-2 rounded-lg
          font-semibold hover:bg-red-700 shadow
        ">
          Eliminar mi cuenta
        </button>
      </div>
    </Section>
  );
}
