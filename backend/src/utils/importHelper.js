import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";

// Suppression du fichier après utilisation
const safeUnlink = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Impossible de supprimer le fichier:", filePath, err.message);
  }
};

// Détecte automatiquement le séparateur d'un CSV
const detectSeparator = (filePath) => {
  const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0];
  if (firstLine.includes(";")) return ";";
  return ",";
};

/**
 * Parse un fichier CSV ou Excel et retourne un tableau d'objets
**/
export const parseFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) return reject(new Error("Aucun fichier fourni"));
    const ext = filePath.split(".").pop().toLowerCase();

    if (ext === "csv") {
      const separator = detectSeparator(filePath);
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csv({ 
            separator,
            mapHeaders: ({ header }) => header.replace(/^\ufeff/, "").trim() // supprime BOM UTF-8 
        }))
        .on("data", (row) => results.push(row))
        .on("end", () => {
          safeUnlink(filePath);
          resolve(results);
        })
        .on("error", (err) => {
          safeUnlink(filePath);
          reject(err);
        });
    } else if (["xlsx", "xls"].includes(ext)) {
      try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        safeUnlink(filePath);
        resolve(data);
      } catch (err) {
        safeUnlink(filePath);
        reject(err);
      }
    } else {
      reject(new Error("Format de fichier non supporté"));
    }
  });
};
