/**
 * Static Checker for Next.js “output: export”
 * -------------------------------------------
 * Checks:
 *  - API Routes
 *  - Server Components
 *  - Server Actions
 *  - Dynamic Routes
 *  - next/headers, next/cookies, next/server usage
 *  - async server page without "use client"
 *  - possible persistence/backends (axios, fetch, db libs)
 */

const fs = require("fs");
const path = require("path");

// Terminal colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const ROOT = path.resolve(".");
const SRC = path.join(ROOT, "src");

console.log(`\n🔎 ${YELLOW}Running Static Export Compatibility Check...${RESET}\n`);

const errors = [];
const warnings = [];

// Utility to walk directories
function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

function checkFile(file) {
  // only analyze ts/tsx
  if (!file.endsWith(".tsx") && !file.endsWith(".ts")) return;

  const content = fs.readFileSync(file, "utf8");

  // ❌ 1. Server Actions
  if (content.includes('"use server"') || content.includes("'use server'")) {
    errors.push(`❌ Server Action found in: ${file}`);
  }

  // ❌ 2. next/headers, next/cookies, next/server
  const forbiddenImports = ["next/headers", "next/cookies", "next/server"];
  forbiddenImports.forEach((lib) => {
    if (content.includes(lib)) {
      errors.push(`❌ Forbidden import (${lib}) found in: ${file}`);
    }
  });

  // ❌ 3. API routes
  if (file.includes("/api/")) {
    errors.push(`❌ API Route detected (not allowed for static export): ${file}`);
  }

  // ❌ 4. Dynamic routes
  if (file.includes("[")) {
    errors.push(`❌ Dynamic Route detected: ${file}`);
  }

  // ⚠️ 5. Possible server component
  if (
    content.includes("export default async function") &&
    !content.includes('"use client"') &&
    !content.includes("'use client'")
  ) {
    warnings.push(`⚠️ Possible Server Component: ${file}`);
  }

  // ⚠️ 6. Potential persistence/storage (axios, fetch to external)
  if (content.includes("axios") || content.includes("Axios")) {
    warnings.push(`⚠️ axios usage found (check if external API used): ${file}`);
  }

  if (content.includes("fetch(") && content.includes("http")) {
    warnings.push(`⚠️ fetch to external URL: ${file}`);
  }

  // ⚠️ 7. DB library detection
  const dbKeywords = ["mongoose", "prisma", "mysql", "sqlite", "postgres"];
  dbKeywords.forEach((db) => {
    if (content.includes(db)) {
      errors.push(`❌ Database library detected (${db}) in: ${file}`);
    }
  });
}

// Run scanning
walk(SRC, checkFile);

// Output
console.log("\n========================================");
console.log("📊 Static Export Report");
console.log("========================================\n");

if (errors.length === 0) {
  console.log(`${GREEN}✅ No blocking issues found — your app is STATIC EXPORT READY!${RESET}`);
} else {
  console.log(`${RED}❌ Blocking issues:${RESET}`);
  errors.forEach((e) => console.log("   " + e));
}

if (warnings.length) {
  console.log(`\n${YELLOW}⚠️ Warnings (not blocking, but review recommended):${RESET}`);
  warnings.forEach((w) => console.log("   " + w));
}

console.log("\n========================================\n");

console.log(`${GREEN}✔ Done. Run with: ${RESET}node static-check.js\n`);




//node static-check.jsz