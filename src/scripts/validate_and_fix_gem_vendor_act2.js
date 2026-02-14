const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const gemNamePath = path.join(root, "src", "data", "GemNameMapping.js");
const vendorPath = path.join(root, "src", "data", "GemVendorData.js");

const gemNameText = fs.readFileSync(gemNamePath, "utf8");
const vendorText = fs.readFileSync(vendorPath, "utf8");

// Build korean -> english map
const entryRe = /"([^"]+)":\s*"([^"]+)"\s*,?/g;
const korToEng = {};
let m;
while ((m = entryRe.exec(gemNameText))) {
  const eng = m[1];
  const kor = m[2];
  korToEng[kor] = eng;
}

// User-provided Act 2 lists (Korean names without '보조' suffix unless provided)
const lists = {
  Marauder: [
    "근접 물리 피해",
    "공격 시 원소 피해",
    "물리 번개 전환",
    "강철 손아귀",
    "강철의 의지",
    "기절 시 인내 충전",
    "마무리 타격",
    "유혈 충동",
    "최대 생명력 시 피해",
    "근접 전투",
    "충격파",
    "격노",
    "잔혹",
    "일촉즉발",
    "가학증",
  ],
  Witch: [
    "시전 속도 증가",
    "치명타 시 권능 충전",
    "치명타 피해 증가",
    "효과 집중",
    "소환수 생명력",
    "소환수 속도",
    "덫 및 지뢰 피해",
    "냉기 화염 전환",
    "마무리 타격",
    "근접 물리 피해",
    "제어된 파괴",
    "원소 집중",
    "치명적인 상태 이상",
    "포식자",
    "삼위일체",
    "잔혹",
    "과충전",
    "신선한 고기",
    "가학증",
    "신성한 도깨비불",
    "역학 불안정성",
    "살아 있는 번개",
  ],
  Ranger: [
    "포악한 투사체",
    "공격 시 원소 피해",
    "치명타 피해 증가",
    "물리 번개 전환",
    "근접 물리 피해",
    "치명타 시 권능 충전",
    "덫 및 지뢰 피해",
    "근접 사격",
    "강철 손아귀",
    "마무리 타격",
    "유혈 충동",
    "치명적인 상태 이상",
    "근접 전투",
    "격노",
    "밤의 칼날",
    "삼위일체",
    "과충전",
    "가학증",
    "신성한 도깨비불",
  ],
  Duelist: [
    "유혈 충동",
    "포악한 투사체",
    "근접 사격",
    "근접 물리 피해",
    "공격 시 원소 피해",
    "기절 시 인내 충전",
    "물리 번개 전환",
    "강철 손아귀",
    "강철의 의지",
    "최대 생명력 시 피해",
    "마무리 타격",
    "치명적인 상태 이상",
    "근접 전투",
    "충격파",
    "격노",
    "삼위일체",
    "잔혹",
    "일촉즉발",
    "가학증",
  ],
  Shadow: [
    "시전 속도 증가",
    "효과 집중",
    "덫 및 지뢰 피해",
    "공격 시 원소 피해",
    "근접 물리 피해",
    "치명타 피해 증가",
    "냉기 화염 전환",
    "근접 사격",
    "마무리 타격",
    "치명타 시 권능 충전",
    "물리 번개 전환",
    "유혈 충동",
    "제어된 파괴",
    "원소 집중",
    "치명적인 상태 이상",
    "근접 전투",
    "격노",
    "밤의 칼날",
    "삼위일체",
    "과충전",
    "가학증",
    "신성한 도깨비불",
    "역학 불안정성",
  ],
  Templar: [
    "시전 속도 증가",
    "근접 물리 피해",
    "공격 시 원소 피해",
    "물리 번개 전환",
    "냉기 화염 전환",
    "마무리 타격",
    "강철 손아귀",
    "강철의 의지",
    "최대 생명력 시 피해",
    "기절 시 인내 충전",
    "유혈 충동",
    "효과 집중",
    "덫 및 지뢰 피해",
    "소환수 속도",
    "소환수 생명력",
    "제어된 파괴",
    "원소 집중",
    "치명적인 상태 이상",
    "근접 전투",
    "충격파",
    "격노",
    "포식자",
    "삼위일체",
    "잔혹",
    "과충전",
    "신선한 고기",
    "일촉즉발",
    "가학증",
    "신성한 도깨비불",
    "살아 있는 번개",
  ],
  Scion: [
    "치명타 피해 증가",
    "근접 물리 피해",
    "시전 속도 증가",
    "효과 집중",
    "냉기 화염 전환",
    "소환수 속도",
    "소환수 생명력",
    "공격 시 원소 피해",
    "유혈 충동",
    "마무리 타격",
    "근접 사격",
    "강철 손아귀",
    "강철의 의지",
    "최대 생명력 시 피해",
    "치명타 시 권능 충전",
    "기절 시 인내 충전",
    "포악한 투사체",
    "물리 번개 전환",
    "덫 및 지뢰 피해",
    "제어된 파괴",
    "원소 집중",
    "치명적인 상태 이상",
    "근접 전투",
    "충격파",
    "격노",
    "포식자",
    "밤의 칼날",
    "삼위일체",
    "잔혹",
    "신선한 고기",
    "일촉즉발",
    "가학증",
    "신성한 도깨비불",
    "역학 불안정성",
    "살아 있는 번개",
  ],
};

function findEnglish(kor) {
  const candidates = [kor + " 보조", kor];
  for (const c of candidates) {
    if (korToEng[c]) return korToEng[c];
  }
  // fallback exact match
  if (korToEng[kor]) return korToEng[kor];
  return null;
}

// Small synonyms for user-provided variants that don't match exact GemNameMapping entries
const SYNONYMS = {
  "유혈 충동": "Bloodlust Support",
};

function findEnglishWithSynonyms(kor) {
  const direct = findEnglish(kor);
  if (direct) return direct;
  if (SYNONYMS[kor]) return SYNONYMS[kor];
  // try substring match in korToEng values
  for (const k in korToEng) {
    if (k.includes(kor) || kor.includes(k)) return korToEng[k];
  }
  return null;
}

// Parse existing vendor file to preserve other acts
const act1Start = vendorText.indexOf("// Act 1");
const act2Start = vendorText.indexOf("// Act 2");
const act3Start = vendorText.indexOf("// Act 3");

const beforeAct2 = vendorText.substring(
  0,
  act2Start !== -1
    ? act2Start
    : act3Start !== -1
      ? act3Start
      : vendorText.length,
);
const afterAct2 =
  act3Start !== -1
    ? vendorText.substring(act3Start)
    : "\n// Act 3\n\n// Act 4\n";

// Build desired Act2 map
const desiredMap = {};
for (const role of Object.keys(lists)) {
  for (const kor of lists[role]) {
    const eng = findEnglishWithSynonyms(kor);
    if (!eng) {
      console.error("Missing mapping for", kor, "role", role);
      process.exit(1);
    }
    if (!desiredMap[eng]) desiredMap[eng] = new Set();
    desiredMap[eng].add(role);
  }
}

// Convert to sorted entries
const entries = Object.keys(desiredMap)
  .sort((a, b) => a.localeCompare(b))
  .map((eng) => ({ eng, classes: [...desiredMap[eng]].sort() }));

let newAct2 = "  // Act 2\n";
for (const e of entries) {
  const clsList = e.classes.map((c) => `"${c}"`).join(", ");
  newAct2 += `  "${e.eng}": { act: 2, classes: [${clsList}] },\n`;
}
newAct2 += "\n";

const newVendorText =
  vendorText.substring(0, act2Start !== -1 ? act2Start : vendorText.length) +
  newAct2 +
  afterAct2;
fs.writeFileSync(vendorPath, newVendorText, "utf8");
console.log("Wrote Act 2 block to", vendorPath);

// Simple validation: check per-role sets match provided lists
const vendorAfter = fs.readFileSync(vendorPath, "utf8");
// Only consider act: 2 entries for validation
const vendorRe = /"([^"]+)":\s*\{[^}]*act:\s*2[^}]*classes:\s*\[([^\]]*)\]/g;
const actual = {};
while ((m = vendorRe.exec(vendorAfter))) {
  const eng = m[1];
  const clsRaw = m[2].trim();
  const classes = clsRaw
    ? clsRaw
        .split(",")
        .map((s) => s.replace(/['"\s]/g, ""))
        .filter(Boolean)
    : [];
  for (const c of classes) {
    if (!actual[c]) actual[c] = new Set();
    actual[c].add(eng);
  }
}

let ok = true;
for (const role of Object.keys(lists)) {
  const expected = new Set();
  for (const kor of lists[role]) {
    const eng = findEnglishWithSynonyms(kor);
    expected.add(eng);
  }
  const actSet = actual[role] || new Set();
  const missing = [...expected].filter((x) => !actSet.has(x));
  const extra = [...actSet].filter((x) => !expected.has(x));
  if (missing.length || extra.length) {
    ok = false;
    console.log("\nRole:", role);
    if (missing.length) console.log("  Missing:", missing.sort());
    if (extra.length) console.log("  Extra:", extra.sort());
  }
}
if (ok)
  console.log("\nAct 2 validation: All roles match provided lists exactly.");
else console.log("\nAct 2 validation: Discrepancies found.");
