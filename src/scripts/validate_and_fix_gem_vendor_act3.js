const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const gemNamePath = path.join(root, "src", "data", "GemNameMapping.js");
const vendorPath = path.join(root, "src", "data", "GemVendorData.js");

const gemNameText = fs.readFileSync(gemNamePath, "utf8");
const vendorText = fs.readFileSync(vendorPath, "utf8");

// Build korean -> english map
const entryRe = /"([^\"]+)":\s*"([^\"]+)"\s*,?/g;
const korToEng = {};
let m;
while ((m = entryRe.exec(gemNameText))) {
  const eng = m[1];
  const kor = m[2];
  korToEng[kor] = eng;
}

const lists = {
  Marauder: [
    "생명력 흡수",
    "오만",
    "영감",
    "지속시간 증폭",
    "지속시간 감소",
    "화염 관통",
    "화상 피해",
    "관대함",
    "신성 모독",
    "꿰뚫기",
    "분쇄",
    "긴급 명령",
    "피의 갈증",
    "타락시키는 비명",
    "제어된 불길",
    "방어 상승",
    "노련한 보복",
  ],
  Witch: [
    "투사체 속도 증가",
    "갈래",
    "마나 흡수",
    "화염 관통",
    "냉기 관통",
    "번개 관통",
    "원소의 군단",
    "화상 피해",
    "체온저하",
    "얼음 쐐기",
    "자극",
    "아이템 희귀도",
    "관대함",
    "고통 격화",
    "신성 모독",
    "향상된 덫",
    "충전된 덫",
    "에너지 흡수",
    "격화",
    "분쇄",
    "고충격 지뢰",
    "격분 주입",
    "육탄 방어",
    "충전된 지뢰",
    "새로운 활력",
    "대마법사",
    "재빠른 낙인",
    "임박한 멸망",
    "핵심 조준",
    "저주받은 지대",
    "수호자의 축복",
    "희생",
    "집약된 집중 유지",
  ],
  Ranger: [
    "생명력 흡수",
    "마나 흡수",
    "투사체 속도 증가",
    "갈래",
    "투사체 속도 감소",
    "냉기 관통",
    "체온저하",
    "얼음 쐐기",
    "자극",
    "치명타 고통 격화",
    "고통 격화",
    "신성 모독",
    "향상된 덫",
    "꿰뚫기",
    "바람 격발",
    "분쇄",
    "새로운 활력",
    "쇠뇌 집중 사격",
    "방어 상승",
  ],
  Duelist: [
    "생명력 흡수",
    "마나 흡수",
    "갈래",
    "투사체 속도 감소",
    "오만",
    "얼음 쐐기",
    "체온저하",
    "영감",
    "지속시간 증폭",
    "지속시간 감소",
    "신성 모독",
    "꿰뚫기",
    "바람 격발",
    "분쇄",
    "새로운 활력",
    "긴급 명령",
    "피의 갈증",
    "쇠뇌 집중 사격",
    "타락시키는 비명",
    "제어된 불길",
    "방어 상승",
    "노련한 보복",
  ],
  Shadow: [
    "생명력 흡수",
    "마나 흡수",
    "투사체 속도 증가",
    "투사체 속도 감소",
    "갈래",
    "화염 관통",
    "냉기 관통",
    "번개 관통",
    "체온저하",
    "자극",
    "얼음 쐐기",
    "아이템 희귀도",
    "치명타 고통 격화",
    "고통 격화",
    "신성 모독",
    "향상된 덫",
    "충전된 덫",
    "에너지 흡수",
    "격화",
    "꿰뚫기",
    "바람 격발",
    "고충격 지뢰",
    "충전된 지뢰",
    "새로운 활력",
    "대마법사",
    "재빠른 낙인",
    "임박한 멸망",
    "핵심 조준",
    "쇠뇌 집중 사격",
    "저주받은 지대",
    "희생",
    "방어 상승",
    "집약된 집중 유지",
  ],
  Templar: [
    "영감",
    "생명력 흡수",
    "아이템 희귀도",
    "지속시간 증폭",
    "오만",
    "화염 관통",
    "냉기 관통",
    "번개 관통",
    "화상 피해",
    "원소의 군단",
    "지속시간 감소",
    "관대함",
    "얼음 쐐기",
    "체온저하",
    "자극",
    "고통 격화",
    "신성 모독",
    "에너지 흡수",
    "격화",
    "격분 주입",
    "육탄 방어",
    "새로운 활력",
    "대마법사",
    "긴급 명령",
    "재빠른 낙인",
    "임박한 멸망",
    "핵심 조준",
    "피의 갈증",
    "타락시키는 비명",
    "수호자의 축복",
    "희생",
    "제어된 불길",
    "방어 상승",
    "노련한 보복",
    "집약된 집중 유지",
  ],
  Scion: [
    "투사체 속도 증가",
    "영감",
    "생명력 흡수",
    "마나 흡수",
    "아이템 희귀도",
    "화염 관통",
    "냉기 관통",
    "번개 관통",
    "갈래",
    "화상 피해",
    "원소의 군단",
    "투사체 속도 감소",
    "지속시간 감소",
    "관대함",
    "얼음 쐐기",
    "체온저하",
    "자극",
    "치명타 고통 격화",
    "고통 격화",
    "신성 모독",
    "향상된 덫",
    "충전된 덫",
    "에너지 흡수",
    "격화",
    "꿰뚫기",
    "바람 격발",
    "분쇄",
    "고충격 지뢰",
    "격분 주입",
    "육탄 방어",
    "충전된 지뢰",
    "새로운 활력",
    "대마법사",
    "긴급 명령",
    "재빠른 낙인",
    "임박한 멸망",
    "핵심 조준",
    "피의 갈증",
    "쇠뇌 집중 사격",
    "저주받은 지대",
    "타락시키는 비명",
    "수호자의 축복",
    "희생",
    "제어된 불길",
    "방어 상승",
    "노련한 보복",
    "집약된 집중 유지",
  ],
};

function findEnglish(kor) {
  const candidates = [kor + " 보조", kor];
  for (const c of candidates) {
    if (korToEng[c]) return korToEng[c];
  }
  if (korToEng[kor]) return korToEng[kor];
  return null;
}

const SYNONYMS = {
  "치명타 고통 격화": "Increased Critical Strikes Support",
  "유혈 충동": "Bloodlust Support",
  "쇠뇌 집중 사격": "Focused Ballista Support",
};

function findEnglishWithSynonyms(kor) {
  const direct = findEnglish(kor);
  if (direct) return direct;
  if (SYNONYMS[kor]) return SYNONYMS[kor];
  for (const k in korToEng) {
    if (k.includes(kor) || kor.includes(k)) return korToEng[k];
  }
  return null;
}

// Locate Act 3 region
const act2Start = vendorText.indexOf("// Act 2");
const act3Start = vendorText.indexOf("// Act 3");
const act4Start = vendorText.indexOf("// Act 4");

const beforeAct3 = vendorText.substring(
  0,
  act3Start !== -1
    ? act3Start
    : act4Start !== -1
      ? act4Start
      : vendorText.length,
);
const afterAct3 =
  act4Start !== -1 ? vendorText.substring(act4Start) : "\n// Act 4\n";

// Build desired Act3 map
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

const entries = Object.keys(desiredMap)
  .sort((a, b) => a.localeCompare(b))
  .map((eng) => ({ eng, classes: [...desiredMap[eng]].sort() }));

let newAct3 = "  // Act 3\n";
for (const e of entries) {
  const clsList = e.classes.map((c) => `"${c}"`).join(", ");
  newAct3 += `  "${e.eng}": { act: 3, classes: [${clsList}] },\n`;
}
newAct3 += "\n";

const newVendorText =
  vendorText.substring(0, act3Start !== -1 ? act3Start : vendorText.length) +
  newAct3 +
  afterAct3;
fs.writeFileSync(vendorPath, newVendorText, "utf8");
console.log("Wrote Act 3 block to", vendorPath);

// Validate only act:3 entries
const vendorAfter = fs.readFileSync(vendorPath, "utf8");
const vendorRe = /"([^\"]+)":\s*\{[^}]*act:\s*3[^}]*classes:\s*\[([^\]]*)\]/g;
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
  console.log("\nAct 3 validation: All roles match provided lists exactly.");
else console.log("\nAct 3 validation: Discrepancies found.");
