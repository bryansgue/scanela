"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "../lib/supabase/client";
import { createInitialSubscription } from "../lib/supabase/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // ✅ CREAR SUSCRIPCIÓN INICIAL
    if (data.user?.id) {
      console.log("📝 Creando suscripción para:", data.user.id);
      await createInitialSubscription(data.user.id);
    }

    setMessage(
      "Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."
    );
  };

  const registerWithGoogle = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-200"
      >
        <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-900">
          Crear cuenta{" "}
          <span
            className="
              bg-gradient-to-r from-blue-600 to-purple-600
              text-transparent bg-clip-text
            "
          >
            Scanela
          </span>
        </h1>



        <p className="text-gray-500 text-center mb-6">
          Empieza gratis en menos de 1 minuto
        </p>

        {/* Mensajes */}
        {error && (
          <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
        )}
        {message && (
          <p className="text-green-600 mb-4 text-center font-medium">{message}</p>
        )}

        {/* -------- FORMULARIO NORMAL -------- */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Tu nombre completo"
            className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="
              bg-blue-600 text-white rounded-xl p-3 mt-2
              font-semibold shadow hover:bg-blue-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        {/* OR divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* -------- GOOGLE LOGIN -------- */}
        <button
          onClick={registerWithGoogle}
          disabled={oauthLoading}
          className="
            w-full flex items-center justify-center gap-3
            border border-gray-300 rounded-xl p-3 bg-white
            hover:bg-gray-100 shadow-sm transition
            font-medium text-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          {oauthLoading ? "Conectando..." : "Continuar con Google"}
        </button>

        {/* Login link */}
        <p className="mt-5 text-center text-gray-700">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
