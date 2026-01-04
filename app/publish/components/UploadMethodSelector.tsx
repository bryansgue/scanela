"use client";

import { Upload, Link as LinkIcon, FileText } from "lucide-react";
import Panel from "../../components/Panel";

type UploadMethod = "media" | "url" | "text";

export default function UploadMethodSelector({
  current,
  onChange,
}: {
  current: UploadMethod;
  onChange: (method: UploadMethod) => void;
}) {
  const methods: { id: UploadMethod; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: "media",
      label: "Subir Archivo",
      icon: <Upload size={24} />,
      description: "Sube una imagen o video",
    },
    {
      id: "url",
      label: "URL del Media",
      icon: <LinkIcon size={24} />,
      description: "Usa un enlace externo",
    },
    {
      id: "text",
      label: "Solo Texto",
      icon: <FileText size={24} />,
      description: "Publicación de texto",
    },
  ];

  return (
    <Panel>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Método de Publicación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={`
              p-6 rounded-lg border-2 transition text-left
              ${
                current === method.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <div
              className={`${
                current === method.id ? "text-blue-600" : "text-gray-600"
              } mb-2`}
            >
              {method.icon}
            </div>
            <p className={`font-semibold ${current === method.id ? "text-blue-900" : "text-gray-900"}`}>
              {method.label}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {method.description}
            </p>
          </button>
        ))}
      </div>
    </Panel>
  );
}
