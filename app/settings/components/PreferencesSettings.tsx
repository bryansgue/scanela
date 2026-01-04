"use client";

import Section from "./Section";

export default function PreferencesSettings() {
  return (
    <Section title="Preferencias">
      <p className="text-gray-600 mb-4">
        Ajusta tu idioma, zona horaria y preferencias visuales.
      </p>

      <div className="max-w-md flex flex-col gap-4">

        <div>
          <label className="font-medium">Idioma</label>
          <select className="w-full border p-2 rounded-lg mt-1">
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Zona horaria</label>
          <select className="w-full border p-2 rounded-lg mt-1">
            <option>GMT-5 Quito / Bogotá</option>
            <option>GMT-3 Argentina</option>
            <option>GMT+1 España</option>
          </select>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700">
          Guardar preferencias
        </button>

      </div>
    </Section>
  );
}
