const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const vendorPath = path.join(root, "src", "data", "GemVendorData.js");
let text = fs.readFileSync(vendorPath, "utf8");

// Map of gem english name -> roles to remove
const removeMap = {
  "Ancestral Call Support": ["Marauder"],
  "Chance to Bleed Support": ["Marauder"],
  "Momentum Support": ["Marauder"],
  "Ruthless Support": ["Marauder"],
  "Volley Support": ["Marauder"],
  "Combustion Support": ["Ranger", "Scion"],
  "Increased Critical Strikes Support": ["Duelist"],
  "Infernal Legion Support": ["Shadow", "Scion"],
  "Ballista Totem Support": ["Templar"],
  "Trap Support": ["Templar"],
};

for (const [eng, roles] of Object.entries(removeMap)) {
  const re = new RegExp(
    `(\\"${eng}\\"\\s*:\\s*\\{[^\n]*classes:\\s*\\[)([^\\]]*)(\\])`,
    "m",
  );
  const m = text.match(re);
  if (!m) {
    console.warn("Entry not found for", eng);
    continue;
  }
  const prefix = m[1];
  const cls = m[2];
  const suffix = m[3];
  const classes = cls
    .split(",")
    .map((s) => s.replace(/['"\s]/g, ""))
    .filter(Boolean);
  const newClasses = classes.filter((c) => !roles.includes(c));
  const newClsText = newClasses.map((c) => `"${c}"`).join(", ");
  text = text.replace(re, `${prefix}${newClsText}${suffix}`);
}

fs.writeFileSync(vendorPath, text, "utf8");
console.log("Removed unexpected roles and updated", vendorPath);
