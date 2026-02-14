const fs = require("fs");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..");
const mappingPath = path.join(workspaceRoot, "data", "GemNameMapping.js");
const vendorPath = path.join(workspaceRoot, "data", "GemVendorData.js");

function parseMapping(content) {
  const map = new Map();
  const regex = /["']([^"']+)["']\s*:\s*["']([^"']+)["']\s*,/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const eng = m[1];
    const kor = m[2];
    if (!map.has(kor)) map.set(kor, eng);
  }
  return map;
}

const mappingRaw = fs.readFileSync(mappingPath, "utf8");
const korToEng = parseMapping(mappingRaw);

const act = 4;

const roles = {
  Marauder: [
    "연속타격",
    "근접 처치 시 시전",
    "치명타 시 시전",
    "피격 시 시전",
    "기절 시 시전",
    "사술 손길",
    "사망 시 시전",
    "효과 범위 증가",
    "상위 다중 투사체",
    "주문 메아리",
    "연쇄",
    "집중 유지 중 시전",
    "번제",
    "포악함",
    "다중 토템",
    "상위 사격 공세",
    "연발 사격",
    "전쟁의 주먹",
    "참수",
    "명중 시 징표",
    "영원한 축복",
    "돌아오는 투사체",
    "외상",
    "전심전력",
    "파열",
  ],
  Witch: [
    "주문 메아리",
    "상위 다중 투사체",
    "효과 범위 증가",
    "연쇄",
    "사술 손길",
    "치명타 시 시전",
    "기절 시 시전",
    "근접 처치 시 시전",
    "피격 시 시전",
    "사망 시 시전",
    "연속타격",
    "무리 덫",
    "집중 유지 중 시전",
    "점화 확산",
    "부패",
    "번제",
    "사무치는 한기",
    "다중 토템",
    "촉발",
    "지뢰밭",
    "상위 사격 공세",
    "연발 사격",
    "신바학자",
    "명중 시 징표",
    "사술의 꽃",
    "돌아오는 투사체",
    "차디찬 유대",
    "주문칼날",
  ],
  Ranger: [
    "상위 다중 투사체",
    "연속타격",
    "주문 메아리",
    "연쇄",
    "효과 범위 증가",
    "치명타 시 시전",
    "사술 손길",
    "피격 시 시전",
    "근접 처치 시 시전",
    "기절 시 시전",
    "사망 시 시전",
    "무리 덫",
    "집중 유지 중 시전",
    "끔찍한 독소",
    "위축의 손길",
    "다중 토템",
    "상위 사격 공세",
    "연발 사격",
    "명중 시 징표",
    "돌아오는 투사체",
    "파열",
  ],
  Duelist: [
    "상위 다중 투사체",
    "연속타격",
    "주문 메아리",
    "효과 범위 증가",
    "연쇄",
    "사술 손길",
    "치명타 시 시전",
    "근접 처치 시 시전",
    "피격 시 시전",
    "기절 시 시전",
    "사망 시 시전",
    "집중 유지 중 시전",
    "포악함",
    "위축의 손길",
    "다중 토템",
    "상위 사격 공세",
    "연발 사격",
    "전쟁의 주먹",
    "참수",
    "명중 시 징표",
    "영원한 축복",
    "돌아오는 투사체",
    "외상",
    "전심전력",
    "파열",
  ],
  Shadow: [
    "주문 메아리",
    "상위 다중 투사체",
    "연속타격",
    "연쇄",
    "효과 범위 증가",
    "치명타 시 시전",
    "피격 시 시전",
    "사술 손길",
    "근접 처치 시 시전",
    "기절 시 시전",
    "사망 시 시전",
    "무리 덫",
    "집중 유지 중 시전",
    "부패",
    "끔찍한 독소",
    "위축의 손길",
    "사무치는 한기",
    "다중 토템",
    "촉발",
    "지뢰밭",
    "상위 사격 공세",
    "연발 사격",
    "신비학자 낙인",
    "명중 시 징표",
    "사술의 꽃",
    "돌아오는 투사체",
    "주문칼날",
    "파열",
  ],
  Templar: [
    "연속타격",
    "주문 메아리",
    "상위 다중 투사체",
    "효과 범위",
    "연쇄",
    "사술 손길",
    "치명타 시 시전",
    "근접 처치 시 시전",
    "사망 시 시전",
    "피격 시 시전",
    "기절 시 시전",
    "집중 유지 중 시전",
    "점화 확산",
    "번제",
    "사무치는 한기",
    "다중 토템",
    "촉발",
    "상위 사격 공세",
    "연발 사격",
    "신비학자 낙인",
    "전쟁의 주먹",
    "참수",
    "명중 시 징표",
    "영원한 축복",
    "돌아오는 투사체",
    "외상",
    "차디찬 유대",
    "주문칼날",
    "전심전력",
  ],
  Scion: [
    "연속타격",
    "상위 다중 투사체",
    "주문 메아리",
    "효과 범위 증가",
    "연쇄",
    "치명타 시 시전",
    "피격 시 시전",
    "사술 손길",
    "근접 처치 시 시전",
    "기절 시 시전",
    "사망 시 시전",
    "무리 덫",
    "집중 유지 중 시전",
    "점화 확산",
    "부패",
    "끔찍한 독소",
    "번제",
    "포악함",
    "위축의 손길",
    "사무치는 한기",
    "다중 토템",
    "촉발",
    "지뢰밭",
    "상위 사격 공세",
    "연발 사격",
    "신비학자 낙인",
    "전쟁의 주먹",
    "참수",
    "명중 시 징표",
    "영원한 축복",
    "사술의 꽃",
    "돌아오는 투사체",
    "외상",
    "차디찬 유대",
    "주문칼날",
    "전심전력",
    "파열",
  ],
};

// SYNONYMS: Korean variant -> canonical Korean (keys must match GemNameMapping.js entries)
const SYNONYMS = {
  // user short forms -> mapping file key
  "효과 범위": "효과 범위 증가 보조",
  // explicit exact-match exception (no ' 보조' in mapping for this skill name)
  "신비학자 낙인": "신비학자 낙인",
  // user typos / variants
  신바학자: "신비학자 낙인",
  포악함: "무자비 보조",
  "사무치는 한기": "체온저하 보조",
};

function findEnglishFromKorean(kor) {
  // try with ' 보조' appended (many support gems)
  const withSupport = kor + " 보조";
  if (korToEng.has(withSupport)) return korToEng.get(withSupport);
  if (korToEng.has(kor)) return korToEng.get(kor);
  if (SYNONYMS[kor] && korToEng.has(SYNONYMS[kor]))
    return korToEng.get(SYNONYMS[kor]);
  return null;
}

const engToClasses = new Map();
const missing = [];

for (const [role, korList] of Object.entries(roles)) {
  for (const kor of korList) {
    const eng = findEnglishFromKorean(kor);
    if (!eng) {
      missing.push({ role, kor });
      continue;
    }
    const set = engToClasses.get(eng) || new Set();
    set.add(role);
    engToClasses.set(eng, set);
  }
}

if (missing.length) {
  console.error("Missing mapping for the following entries:");
  missing.forEach((m) => console.error(`${m.role}: ${m.kor}`));
  process.exit(1);
}

// Build Act 4 block text
const entries = [];
for (const [eng, set] of engToClasses.entries()) {
  const classes = Array.from(set).sort();
  entries.push(
    `  "${eng}": { act: ${act}, classes: ["${classes.join('\", \"')}"] },`,
  );
}

entries.sort();

const block = ["  // Act 4", ...entries, "", "};"].join("\n");

let vendorRaw = fs.readFileSync(vendorPath, "utf8");

// Replace existing Act 4 block: find '// Act 4' and replace until closing '};' at file end
const act4Index = vendorRaw.indexOf("// Act 4");
if (act4Index === -1) {
  // append before final closing
  vendorRaw = vendorRaw.replace(/\n\s*};\s*\n?`?\}?\s*$/m, "\n" + block + "\n");
} else {
  const start = act4Index;
  const end = vendorRaw.lastIndexOf("\n};");
  if (end === -1) {
    console.error("Could not find file closing to replace Act 4 block.");
    process.exit(1);
  }
  vendorRaw =
    vendorRaw.slice(0, start) + block + "\n" + vendorRaw.slice(end + 2);
}

fs.writeFileSync(vendorPath, vendorRaw, "utf8");
console.log(`Wrote Act ${act} block to ${vendorPath}\n`);

// Simple validation: ensure every role kor entry maps to an English entry in file
const writtenRaw = fs.readFileSync(vendorPath, "utf8");
let problems = 0;
for (const [role, korList] of Object.entries(roles)) {
  for (const kor of korList) {
    const eng = findEnglishFromKorean(kor);
    if (!eng) {
      problems++;
    } else if (!writtenRaw.includes(`"${eng}": { act: ${act}`)) {
      problems++;
    }
  }
}

if (problems === 0) {
  console.log(`Act ${act} validation: All roles match provided lists exactly.`);
  process.exit(0);
} else {
  console.error(`Act ${act} validation: ${problems} problems found.`);
  process.exit(2);
}
