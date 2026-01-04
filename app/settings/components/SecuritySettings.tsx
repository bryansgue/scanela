"use client";

import Section from "./Section";

export default function SecuritySettings() {
  return (
    <Section title="Seguridad">
      <p className="text-gray-600 mb-4">
        Cambia tu contraseña y revisa la actividad de tu cuenta.
      </p>

      <div className="flex flex-col gap-4 max-w-md">

        <div>
          <label className="font-medium">Contraseña actual</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className="font-medium">Nueva contraseña</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700">
          Actualizar contraseña
        </button>
      </div>
    </Section>
  );
}
