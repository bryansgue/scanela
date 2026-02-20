#!/usr/bin/env node

/**
 * Script para obtener el Webhook Secret de Paddle usando la API
 * Uso: node scripts/get-paddle-webhook-secret.js
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Carga variables de .env.local
dotenv.config({ path: ".env.local" });

const apiKey = process.env.PADDLE_SDBX_API_KEY;
const environment = process.env.PADDLE_ENVIRONMENT || "sandbox";

if (!apiKey) {
  console.error("❌ Error: PADDLE_SDBX_API_KEY no está definido en .env.local");
  process.exit(1);
}

const apiBase =
  environment === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

async function getWebhookSecret() {
  try {
    console.log(`\n🔍 Buscando webhook secret en ${environment}...`);
    console.log(`📡 Llamando a: ${apiBase}/notification-settings\n`);

    const response = await fetch(`${apiBase}/notification-settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error ${response.status}:`, error);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.error("❌ No se encontraron notification settings");
      process.exit(1);
    }

    const settings = data.data[0];
    const secret = settings.secrets?.[0]?.secret;

    if (!secret) {
      console.error("❌ No se encontró el webhook secret en los settings");
      console.log("📋 Data completa:", JSON.stringify(settings, null, 2));
      process.exit(1);
    }

    console.log("✅ Webhook Secret encontrado:\n");
    console.log(`   ${secret}\n`);
    console.log("📋 Agrégalo a .env.local como:");
    console.log(`   PADDLE_WEBHOOK_SECRET=${secret}\n`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

getWebhookSecret();
