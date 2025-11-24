// scripts/checkEnvUsage.js
const fs = require("fs");
const path = require("path");

const root = path.resolve("./");
const envFile = path.join(root, ".env.local");
const envContent = fs.readFileSync(envFile, "utf8");

const definedVars = envContent
  .split("\n")
  .filter((line) => line.startsWith("NEXT_PUBLIC_"))
  .map((line) => line.split("=")[0].trim());

const usedVars = new Set();

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(filePath, "utf8");
      for (const envVar of definedVars) {
        if (content.includes(envVar)) usedVars.add(envVar);
      }
    }
  }
}

scanDir(path.join(root, "src"));

const unusedVars = definedVars.filter((v) => !usedVars.has(v));

console.log("🔍 Environment variables check:\n");
console.log("✅ Used variables:", [...usedVars].join(", ") || "None");
console.log("⚠️ Possibly unused variables:", unusedVars.join(", ") || "None");

if (unusedVars.length > 0) {
  console.log("\n💡 Tip: Remove or verify these in `.env.local`");
}
