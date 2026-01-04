"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/dashboard";
  };

  const loginWithGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NODE_ENV === "production"
            ? "https://tudominio.com/dashboard"
            : "http://localhost:3000/dashboard",
      },
    });

    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-6">

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200
        "
      >
        <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Syncuenta
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Inicia sesión para acceder a tu panel
        </p>

        {error && (
          <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full border border-gray-300 rounded-xl p-3 
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            required
          />

          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full border border-gray-300 rounded-xl p-3 
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-blue-600 text-white rounded-xl p-3 font-semibold
              hover:bg-blue-700 transition 
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-white border border-gray-300 p-3 rounded-xl shadow-sm 
                     hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 font-medium transition"
        >
          <img src="/google.svg" className="w-5 h-5" />
          Iniciar sesión con Google
        </button>

        {/* REGISTER */}
        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
