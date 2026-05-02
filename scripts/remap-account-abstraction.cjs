const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const scopeDir = path.join(projectRoot, "node_modules", "@account-abstraction");
const contractsDir = path.join(scopeDir, "contracts");
const soladyScopeDir = path.join(projectRoot, "node_modules", "@solady");
const soladySrcDir = path.join(projectRoot, "node_modules", "solady", "src");

function ensurePackage(packagePath, targetPath) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing target for remapping: ${targetPath}`);
  }

  fs.rmSync(packagePath, { recursive: true, force: true });
  fs.mkdirSync(packagePath, { recursive: true });
  fs.writeFileSync(
    path.join(packagePath, "package.json"),
    JSON.stringify({ name: `@${path.basename(path.dirname(packagePath))}/${path.basename(packagePath)}`, version: "0.0.0", private: true }, null, 2)
  );

  for (const file of fs.readdirSync(targetPath)) {
    if (file.endsWith(".sol")) {
      fs.symlinkSync(path.join(targetPath, file), path.join(packagePath, file));
    }
  }
}

fs.mkdirSync(scopeDir, { recursive: true });
ensurePackage(path.join(scopeDir, "core"), path.join(contractsDir, "core"));
ensurePackage(path.join(scopeDir, "interfaces"), path.join(contractsDir, "interfaces"));

fs.mkdirSync(soladyScopeDir, { recursive: true });
ensurePackage(path.join(soladyScopeDir, "utils"), path.join(soladySrcDir, "utils"));
ensurePackage(path.join(soladyScopeDir, "tokens"), path.join(soladySrcDir, "tokens"));

console.log("Installed Hardhat remappings for @account-abstraction/* and @solady/*");
