// scripts/patch-jest-esm.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nodeModules = path.join(root, "node_modules");
const jestConfigPath = path.join(root, "jest.config.js");

function isESM(pkgPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg.type === "module" || (pkg.exports && typeof pkg.exports === "object");
  } catch {
    return false;
  }
}

function findESMDeps() {
  const deps = [];
  for (const dir of fs.readdirSync(nodeModules)) {
    if (dir.startsWith(".")) continue;

    // Scoped packages (@rainbow-me/rainbowkit)
    if (dir.startsWith("@")) {
      const scopedPath = path.join(nodeModules, dir);
      for (const sub of fs.readdirSync(scopedPath)) {
        const pkgPath = path.join(scopedPath, sub, "package.json");
        if (fs.existsSync(pkgPath) && isESM(pkgPath)) {
          deps.push(`${dir}/${sub}`);
        }
      }
    } else {
      const pkgPath = path.join(nodeModules, dir, "package.json");
      if (fs.existsSync(pkgPath) && isESM(pkgPath)) {
        deps.push(dir);
      }
    }
  }
  return deps;
}

function patchJestConfig() {
  const esmDeps = findESMDeps();
  console.log("🔎 Detected ESM deps:", esmDeps);

  if (!fs.existsSync(jestConfigPath)) {
    console.error("❌ jest.config.js not found");
    process.exit(1);
  }

  let config = fs.readFileSync(jestConfigPath, "utf-8");

  // Regex replace transformIgnorePatterns
  const newPattern = `transformIgnorePatterns: [\n    "node_modules/(?!(?:${esmDeps.join(
    "|"
  )})/)",\n  ],`;

  if (config.includes("transformIgnorePatterns")) {
    config = config.replace(
      /transformIgnorePatterns:[\s\S]*?\],/,
      newPattern
    );
  } else {
    // inject before moduleFileExtensions
    config = config.replace(
      /moduleFileExtensions:/,
      `${newPattern}\n\n  moduleFileExtensions:`
    );
  }

  fs.writeFileSync(jestConfigPath, config, "utf-8");
  console.log("✅ jest.config.js patched with latest ESM deps.");
}

patchJestConfig();
