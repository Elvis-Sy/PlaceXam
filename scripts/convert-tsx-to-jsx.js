// Usage: node scripts/convert-tsx-to-jsx.js
const fs = require("fs").promises;
const path = require("path");

const root = path.resolve(__dirname, "..", "frontend", "src", "components");
const targets = ["ui", "layout"]; // dossiers à convertir (relatifs à src/components)

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full);
    else if (e.isFile() && full.endsWith(".tsx")) await convert(full);
  }
}

function removeInterfaces(src) {
  // supprime blocs "export interface X { ... }" ou "interface X { ... }" (heuristique simple)
  return src.replace(/(?:export\s+)?interface\s+\w+\s*{[^}]*}/gms, "");
}

function removeTypeImports(src) {
  // import type { Foo } from '...'; -> import { Foo } from '...';
  return src.replace(/import\s+type\s+([^\n]+)\n/g, "import $1\n");
}

function removeAsserts(src) {
  // supprime " as Type" assertions
  return src.replace(/\s+as\s+[\w\<\>\[\]\s\|,&\.]+/g, "");
}

function removeReturnTypesAndAnnotations(src) {
  // supprime les annotations de paramètres simples et les retours de fonction ": Type"
  // Ceci est heuristique — peut supprimer des choses inattendues. Relire manuellement.
  // remove ": Type" before , ) ; => 
  src = src.replace(/: ?(?:React\.)?[A-Za-z0-9_<>\[\]\{\}\s\|,&]+(?=[,\)\};])/g, "");
  // remove return type for arrow functions: ) : Type => )
  src = src.replace(/\)\s*:\s*[A-Za-z0-9_<>\[\]\s\|,&]+(\s*=>)/g, ")$1");
  // remove ": JSX.Element" or ": React.ReactElement" etc
  src = src.replace(/:\s*(?:JSX\.Element|React\.ReactElement|ReactNode|any|void)\b/g, "");
  return src;
}

function removeGenericsOnFC(src) {
  // supprime <Props> dans React.FC<Props> ou function Component<T>()
  src = src.replace(/React\.FC<[^>]+>/g, "React.FC");
  src = src.replace(/([A-Za-z0-9_]+)\s*<\s*[^>]+>\s*(\(|=>)/g, "$1 $2");
  return src;
}

async function convert(file) {
  try {
    const rel = path.relative(root, file);
    const parts = rel.split(path.sep);
    if (!targets.includes(parts[0])) return; // ne convertir que les dossiers ciblés

    const content = await fs.readFile(file, "utf8");
    let out = content;

    out = removeTypeImports(out);
    out = removeInterfaces(out);
    out = removeAsserts(out);
    out = removeReturnTypesAndAnnotations(out);
    out = removeGenericsOnFC(out);

    // remove "Props" generic in function declarations like function Foo(props: Props)
    // (we already removed the ": Props" part above)
    // ensure JSX import exists? keep as-is.

    const newPath = file.replace(/\.tsx$/, ".jsx");
    await fs.writeFile(newPath, out, "utf8");
    console.log("Converted:", path.relative(root, newPath));
  } catch (err) {
    console.error("Error converting", file, err);
  }
}

(async () => {
  for (const t of targets) {
    const dir = path.join(root, t);
    try {
      await walk(dir);
    } catch (e) {
      console.warn("Skipped", dir, e.message);
    }
  }
  console.log("Conversion terminée. Relis les .jsx générés avant de supprimer les .tsx.");
})();