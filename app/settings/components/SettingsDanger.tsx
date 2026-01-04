"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, LogOut, Loader2 } from "lucide-react";
import Panel from "@/components/Panel";

export default function SettingsDanger() {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    try {
      // TODO: Implementar eliminación de cuenta
      // await deleteUserAccount();
      setTimeout(() => {
        alert("Cuenta eliminada correctamente");
        setDeleteLoading(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setDeleteLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!showCancelConfirm) {
      setShowCancelConfirm(true);
      return;
    }

    setCancelLoading(true);
    try {
      // TODO: Implementar cancelación de suscripción
      // await cancelSubscription();
      setTimeout(() => {
        alert("Suscripción cancelada correctamente");
        setCancelLoading(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">Acciones irreversibles</p>
          <p className="text-red-700 text-sm mt-1">
            Las acciones en esta sección no se pueden deshacer. Por favor, procede
            con cuidado.
          </p>
        </div>
      </div>

      {/* Cancelar Suscripción */}
      <Panel>
        <div className="border-b pb-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Cancelar Suscripción
          </h3>
          <p className="text-gray-600">
            Vuelve al plan Free y pierde acceso a las características Pro
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>¿Qué pasará?</strong>
            </p>
            <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
              <li>Perderás acceso a características Pro</li>
              <li>Se cancelarán los pagos futuros</li>
              <li>Podrás volver a suscribirte en cualquier momento</li>
              <li>Tu cuenta y datos se mantendrán</li>
            </ul>
          </div>

          {showCancelConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-semibold mb-3">
                ¿Estás completamente seguro?
              </p>
              <p className="text-red-700 text-sm mb-4">
                Tu suscripción se cancelará inmediatamente. No podrás acceder a
                funciones Pro después de confirmar.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelLoading && <Loader2 size={18} className="animate-spin" />}
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          )}

          {!showCancelConfirm && (
            <button
              onClick={handleCancelSubscription}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
            >
              <LogOut size={18} />
              Cancelar Suscripción
            </button>
          )}
        </div>
      </Panel>

      {/* Eliminar Cuenta */}
      <Panel>
        <div className="border-b pb-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Eliminar Cuenta Permanentemente
          </h3>
          <p className="text-gray-600">
            Elimina tu cuenta y todos tus datos asociados
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ ¡Advertencia!</strong>
            </p>
            <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>Tu cuenta será eliminada permanentemente</li>
              <li>Todos tus perfiles y datos serán borrados</li>
              <li>No podrás recuperar esta información</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </div>

          {showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-semibold mb-3">
                Esto eliminará tu cuenta para siempre
              </p>
              <p className="text-red-700 text-sm mb-4">
                Por favor, escribe <strong>ELIMINAR</strong> para confirmar:
              </p>
              <input
                type="text"
                placeholder="Escribe ELIMINAR para confirmar"
                className="w-full px-4 py-2 border border-red-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                id="deleteConfirmInput"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading && <Loader2 size={18} className="animate-spin" />}
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          )}

          {!showDeleteConfirm && (
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium transition-colors"
            >
              <Trash2 size={18} />
              Eliminar Cuenta Permanentemente
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
