"use client";

import { useState, useRef } from "react";
import { Profile } from "../types/Profile";
import { NetworkAccount } from "../types/NetworkAccount";
import Panel from "../components/Panel";
import { Upload, Link as LinkIcon, FileText, Calendar, Send, CheckCircle2, AlertCircle } from "lucide-react";
import UploadMethodSelector from "./components/UploadMethodSelector";
import NetworkSelector from "./components/NetworkSelector";
import ScheduleSection from "./components/ScheduleSection";
import { usePosts } from "../hooks/usePosts";
import { useTemporaryUpload } from "../hooks/useTemporaryUpload";
import { savePublishedPost, simulatePublishUrls } from "../lib/supabase/published-posts";

type UploadMethod = "media" | "url" | "text";

export default function PublishForm({
  profile,
  networks,
  userId,
}: {
  profile: Profile;
  networks: NetworkAccount[];
  userId: string;
}) {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("media");
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addPost, uploadMedia } = usePosts(profile.id);
  const { upload: uploadTemporary, deleteFile, loading: uploadingTemporary, error: uploadError, temporaryMedia } = useTemporaryUpload(userId);

  // ===== FORM STATE =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 50MB.");
        return;
      }
      setMediaFile(file);
      setUploadSuccess(false); // Reset cuando cambias el archivo
    }
  };

  const handleUploadTemporary = async () => {
    if (!mediaFile) {
      alert("Debes seleccionar un archivo primero");
      return;
    }

    try {
      const result = await uploadTemporary(mediaFile);
      if (result) {
        setUploadSuccess(true); // Se mantiene hasta que cambies el archivo
      }
    } catch (err) {
      console.error("Error uploading:", err);
    }
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return "El título es requerido";
    if (!description.trim()) return "La descripción es requerida";

    if (uploadMethod === "media" && !mediaFile) {
      return "Debes seleccionar un archivo";
    }

    if (uploadMethod === "url" && !mediaUrl.trim()) {
      return "Debes ingresar una URL";
    }

    if (selectedNetworks.length === 0) {
      return "Debes seleccionar al menos una red social";
    }

    if (isScheduling) {
      if (!scheduleDate || !scheduleTime) {
        return "Debes seleccionar fecha y hora de programación";
      }
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        return "La fecha y hora deben ser en el futuro";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl_final: string | undefined;

      // Usar upload temporal para archivos multimedia
      if (uploadMethod === "media" && mediaFile) {
        const tempMedia = await uploadTemporary(mediaFile);
        if (tempMedia) {
          mediaUrl_final = tempMedia.publicUrl;
        } else {
          throw new Error("No se pudo subir el archivo temporal");
        }
      } else if (uploadMethod === "url") {
        mediaUrl_final = mediaUrl;
      }

      addPost(
        {
          userId,
          profileId: profile.id,
          title,
          description,
          uploadMethod,
          mediaUrl: mediaUrl_final,
          networks: selectedNetworks.map(networkId => {
            // Convertir ID de red a nombre de red
            const network = networks.find(n => n.id === networkId);
            return network?.network || networkId;
          }),
          scheduledFor: isScheduling ? `${scheduleDate}T${scheduleTime}` : undefined,
        },
        {
          onSuccess: async () => {
            // Obtener nombres de redes de los IDs seleccionados
            const networkNames = selectedNetworks.map(networkId => {
              const network = networks.find(n => n.id === networkId);
              return network?.network || networkId;
            });

            // Generar URLs simuladas para cada red seleccionada
            const postUrls = simulatePublishUrls(networkNames);

            // Guardar publicación en published_posts
            await savePublishedPost({
              user_id: userId,
              profile_id: profile.id,
              title,
              description,
              networks: networkNames,
              post_urls: postUrls,
              status: 'success',
            });

            alert(
              isScheduling
                ? "✅ Publicación programada correctamente"
                : "✅ Publicación realizada correctamente"
            );

            // Limpiar formulario
            setTitle("");
            setDescription("");
            setMediaFile(null);
            setMediaUrl("");
            setSelectedNetworks([]);
            setIsScheduling(false);
            setUploadSuccess(false);
          },
          onError: (err: Error) => {
            console.error("Error publishing:", err);
            alert("❌ Error al publicar");
          },
        }
      );
    } catch (err) {
      console.error("Error publishing:", err);
      alert("Error al publicar: " + (err instanceof Error ? err.message : "desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ===== UPLOAD METHOD SELECTOR ===== */}
      <UploadMethodSelector
        current={uploadMethod}
        onChange={setUploadMethod}
      />

      {/* ===== DYNAMIC CONTENT SECTION ===== */}
      <Panel className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Mi primer post"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/2000</p>
        </div>

        {/* ===== MEDIA FILE UPLOAD ===== */}
        {uploadMethod === "media" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Archivo Multimedia
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                {mediaFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      ✓ {mediaFile.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-blue-600 hover:underline">
                      Click para cambiar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto text-gray-400" size={32} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Click para subir o arrastra tu archivo
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, MP4 (máx 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Botón de subir archivo temporal */}
            {mediaFile && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleUploadTemporary}
                  disabled={uploadingTemporary || uploadSuccess}
                  className={`
                    w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2
                    transition
                    ${
                      uploadSuccess
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : uploadingTemporary
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  {uploadSuccess ? (
                    <>
                      <CheckCircle2 size={18} />
                      ✓ Archivo subido correctamente
                    </>
                  ) : uploadingTemporary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Subir archivo temporal
                    </>
                  )}
                </button>

                {/* Error */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-sm text-red-700">{uploadError}</p>
                  </div>
                )}

                {/* Success Info */}
                {temporaryMedia && uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium mb-2">✓ Archivo almacenado temporalmente</p>
                    <div className="space-y-1 text-xs text-green-600">
                      <p><span className="font-medium">Ruta:</span> {temporaryMedia.path}</p>
                      <p><span className="font-medium">Expira en:</span> 24 horas</p>
                      <p className="text-green-700 font-mono mt-2">
                        <a 
                          href={temporaryMedia.publicUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline break-all"
                        >
                          Ver archivo
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== MEDIA URL ===== */}
        {uploadMethod === "url" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL del Media
            </label>
            <div className="flex items-center gap-2">
              <LinkIcon className="text-gray-400" size={20} />
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* ===== TEXT ONLY ===== */}
        {uploadMethod === "text" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <FileText className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-800">
              Publicación solo de texto. Tu mensaje se compartirá en todas las redes seleccionadas.
            </p>
          </div>
        )}
      </Panel>

      {/* ===== NETWORK SELECTOR ===== */}
      <NetworkSelector
        networks={networks}
        selectedNetworks={selectedNetworks}
        onToggle={(networkId: string) => {
          setSelectedNetworks((prev) =>
            prev.includes(networkId)
              ? prev.filter((id) => id !== networkId)
              : [...prev, networkId]
          );
        }}
      />

      {/* ===== SCHEDULE SECTION ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="schedule"
            checked={isScheduling}
            onChange={(e) => setIsScheduling(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <label htmlFor="schedule" className="flex items-center gap-2 font-semibold text-gray-900 cursor-pointer">
            <Calendar size={20} />
            Programar publicación
          </label>
        </div>

        {isScheduling && (
          <ScheduleSection
            date={scheduleDate}
            time={scheduleTime}
            onDateChange={setScheduleDate}
            onTimeChange={setScheduleTime}
          />
        )}
      </div>

      {/* ===== SUBMIT BUTTON ===== */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2
            transition
            ${
              isSubmitting
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }
          `}
        >
          <Send size={20} />
          {isScheduling ? "Programar" : "Publicar ahora"}
        </button>
      </div>
    </form>
  );
}
