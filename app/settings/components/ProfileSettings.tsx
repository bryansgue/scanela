"use client";

import Section from "./Section";

export default function ProfileSettings() {
  return (
    <Section title="Perfil">
      <p className="text-gray-600 mb-4">
  Actualiza tu nombre y correo asociado a Scanela.
      </p>

      <div className="flex flex-col gap-4 max-w-md">

        <div>
          <label className="font-medium">Nombre completo</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="font-medium">Correo electrónico</label>
          <input
            type="email"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="tuemail@ejemplo.com"
          />
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700">
          Guardar cambios
        </button>
      </div>
    </Section>
  );
}
