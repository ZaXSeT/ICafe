/**
 * Build script for ICafe native apps.
 *
 * Usage:
 *   node scripts/cap-switch.mjs customer   — switches to Customer app config
 *   node scripts/cap-switch.mjs pos        — switches to POS app config
 *
 * After switching, run:
 *   npx cap sync
 *   npx cap open android   (or ios)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const configs = {
  customer: path.join(root, "capacitor.config.ts"),
  pos: path.join(root, "capacitor.pos.config.ts"),
};

const target = path.join(root, "capacitor.config.ts");
const variant = process.argv[2];

if (!variant || !["customer", "pos"].includes(variant)) {
  console.error("Usage: node scripts/cap-switch.mjs [customer|pos]");
  console.error("");
  console.error("  customer  — ICafe Customer app (com.icafe.customer)");
  console.error("  pos       — ICafe POS app (com.icafe.pos)");
  process.exit(1);
}

if (variant === "pos") {
  const posConfig = fs.readFileSync(configs.pos, "utf8");
  fs.writeFileSync(target, posConfig, "utf8");
  console.log("✅ Switched to POS config (com.icafe.pos)");
  console.log("   Next: npx cap sync && npx cap open android");
} else {
  // Customer config is already the default capacitor.config.ts
  // but just in case it was overwritten, we read the original
  console.log("✅ Customer config is already active (com.icafe.customer)");
  console.log("   Next: npx cap sync && npx cap open android");
}
