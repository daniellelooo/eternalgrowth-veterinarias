/**
 * Crea (o verifica) el usuario admin del panel usando la service role key.
 * Es un script standalone (no puede importar `server-only`), así que crea
 * el cliente Supabase inline.
 *
 * Uso: pnpm create-admin
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * ADMIN_EMAIL, ADMIN_PASSWORD.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno. " +
        "Corré este script con `pnpm create-admin` (carga .env.local automáticamente)."
    );
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el entorno.");
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    const alreadyExists =
      error.message.toLowerCase().includes("already been registered") ||
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists") ||
      error.code === "email_exists";

    if (alreadyExists) {
      console.log(`El usuario admin ${ADMIN_EMAIL} ya existe. Nada que hacer.`);
      return;
    }

    console.error("Error creando el usuario admin:", error.message);
    process.exit(1);
  }

  console.log(`Usuario admin creado: ${data.user?.email} (id: ${data.user?.id})`);
}

main();
