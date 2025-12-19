// scripts/find-esm-deps.js
const fs = require("fs");
const path = require("path");

const nodeModules = path.join(__dirname, "../node_modules");

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

const esmDeps = findESMDeps();
console.log("🔎 Detected ESM deps:", esmDeps);

console.log(`
👉 Add this to jest.config.js:

transformIgnorePatterns: [
  "node_modules/(?!( ${esmDeps.join("|")} )/)",
],
`);
