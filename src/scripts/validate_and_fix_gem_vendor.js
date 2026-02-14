const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const gemNamePath = path.join(root, "src", "data", "GemNameMapping.js");
const vendorPath = path.join(root, "src", "data", "GemVendorData.js");

const gemNameText = fs.readFileSync(gemNamePath, "utf8");
const vendorText = fs.readFileSync(vendorPath, "utf8");

// Build korean -> english map by regex parsing lines like: "English Name": "한글...",
const engToKor = {};
const korToEng = {};
const entryRe = /"([^"]+)":\s*"([^"]+)"\s*,?/g;
let m;
while ((m = entryRe.exec(gemNameText))) {
  const eng = m[1];
  const kor = m[2];
  engToKor[eng] = kor;
  korToEng[kor] = eng;
}

// User-provided lists (Korean names without '보조' suffix where applicable)
const lists = {
  Marauder: [
    "공격 속도 증가",
    "화염 피해 추가",
    "명중 시 생명력 획득",
    "정확도 추가",
    "근접 범위 피해",
    "밀어내기",
    "기절",
    "도망칠 확률",
    "실명",
    "주문 토템",
    "힘줄 절단",
    "연소",
    "생명력 전환",
    "화염나무",
  ],
  Witch: [
    "비전 쇄도",
    "원소 확산",
    "깊어지는 집중 유지",
    "연속 주문",
    "사격 공세",
    "환영 소환",
    "재빠른 조립",
    "냉기 피해 추가",
    "번개 피해 추가",
    "소환수 피해",
    "치명타 증가",
    "하위 다중 투사체",
    "다중 덫",
    "주문 토템",
    "연쇄 폭발 지뢰",
    "근접 범위 피해",
    "공허 조작",
    "덫",
    "벌어지는 상처",
    "연소",
    "지옥불 군단",
    "효력",
    "포식",
    "궤적 지뢰",
  ],
  Ranger: [
    "기세",
    "출혈 확률",
    "중독 확률",
    "신기루 궁수",
    "관통",
    "사격 공세",
    "선대의 부름",
    "재빠른 조립",
    "분광 격발",
    "공격 속도 증가",
    "하위 다중 투사체",
    "다중 덫",
    "근접 범위 피해",
    "화염 피해 추가",
    "냉기 피해 추가",
    "치명타 증가",
    "정확도 추가",
    "도망칠 확률",
    "실명",
    "쇠뇌 토템",
    "덫",
    "연쇄 폭발 지뢰",
    "힘줄 절단",
    "공허 조작",
    "화살 산개",
    "마나벼림 화살",
    "궤적 지뢰",
  ],
  Duelist: [
    "출혈 확률",
    "관통",
    "무자비",
    "기세",
    "사격 공세",
    "신기루 궁수",
    "선대의 부름",
    "재빠른 조립",
    "중독 확률",
    "공격 속도 증가",
    "정확도 추가",
    "화염 피해 추가",
    "하위 다중 투사체",
    "밀어내기",
    "기절",
    "덫",
    "명중 시 생명력 획득",
    "도망칠 확률",
    "실명",
    "쇠뇌 토템",
    "근접 범위 피해",
    "힘줄 절단",
    "화살 산개",
    "생명력 전환",
  ],
  Shadow: [
    "분광 격발",
    "관통",
    "원소 확산",
    "비전 쇄도",
    "기세",
    "사격 공세",
    "연속 주문",
    "깊어지는 집중 유지",
    "신기루 궁수",
    "환영 소환",
    "재빠른 조립",
    "공격 속도 증가",
    "다중 덫",
    "덫",
    "근접 범위 피해",
    "화염 피해 추가",
    "냉기 피해 추가",
    "번개 피해 추가",
    "하위 다중 투사체",
    "치명타 증가",
    "정확도 추가",
    "도망칠 확률",
    "실명",
    "쇠뇌 토템",
    "공허 조작",
    "연쇄 폭발 지뢰",
    "벌어지는 상처",
    "연소",
    "화살 산개",
    "마나벼림 화살",
    "효력",
    "포식",
    "궤적 지뢰",
  ],
  Templar: [
    "분광 격발",
    "원소 확산",
    "무자비",
    "비전 쇄도",
    "출혈 확률",
    "연속 주문",
    "깊어지는 집중 유지",
    "선대의 부름",
    "환영 소환",
    "화염 피해 추가",
    "번개 피해 추가",
    "명중 시 생명력 획득",
    "근접 범위 피해",
    "정확도 추가",
    "밀어내기",
    "기절",
    "연쇄 폭발 지뢰",
    "주문 토템",
    "소환수 피해",
    "공허 조작",
    "벌어지는 상처",
    "연소",
    "지옥불 군단",
    "효력",
    "생명력 전환",
    "포식",
    "화염나무",
  ],
  Scion: [
    "분광 격발",
    "비전 쇄도",
    "무자비",
    "출혈 확률",
    "중독 확률",
    "관통",
    "원소 확산",
    "선대의 부름",
    "사격 공세",
    "기세",
    "연속 주문",
    "깊어지는 집중 유지",
    "신기루 궁수",
    "환영 소환",
    "재빠른 조립",
    "공격 속도 증가",
    "하위 다중 투사체",
    "근접 범위 피해",
    "다중 덫",
    "화염 피해 추가",
    "냉기 피해 추가",
    "번개 피해 추가",
    "명중 시 생명력 획득",
    "치명타 증가",
    "밀어내기",
    "기절",
    "정확도 추가",
    "도망칠 확률",
    "실명",
    "주문 토템",
    "쇠뇌 토템",
    "덫",
    "연쇄 폭발 지뢰",
    "소환수 피해",
    "공허 조작",
    "힘줄 절단",
    "벌어지는 상처",
    "화살 산개",
    "마나벼림 화살",
    "효력",
    "생명력 전환",
    "포식",
    "화염나무",
    "궤적 지뢰",
  ],
};

function findEnglishForKorean(kor) {
  // try exact matches: kor + ' 보조', kor
  const candidates = [kor + " 보조", kor];
  for (const c of candidates) {
    if (korToEng[c]) return korToEng[c];
  }
  // Also try exact match against any value (some entries like '화염나무 보조' exist)
  for (const k in korToEng) {
    if (k === kor) return korToEng[k];
  }
  return null;
}

// Parse existing Act1 block into map
const act1Start = vendorText.indexOf("// Act 1");
if (act1Start === -1) {
  console.error("Cannot find // Act 1 in GemVendorData.js");
  process.exit(1);
}
const act2Start = vendorText.indexOf("// Act 2", act1Start);
const act1Block = vendorText.substring(
  act1Start,
  act2Start === -1 ? vendorText.length : act2Start,
);

const existingRe = /"([^"]+)":\s*\{[^\}]*classes:\s*\[([^\]]*)\]/g;
const existingMap = {}; // eng -> Set(classes)
while ((m = existingRe.exec(act1Block))) {
  const eng = m[1];
  const clsRaw = m[2].trim();
  const classes = clsRaw
    ? clsRaw
        .split(",")
        .map((s) => s.replace(/['"\s]/g, ""))
        .filter(Boolean)
    : [];
  existingMap[eng] = new Set(classes);
}

// Build desired map starting from existingMap
const desiredMap = {};
for (const eng of Object.keys(existingMap)) {
  desiredMap[eng] = new Set(existingMap[eng]);
}

// For each list, map Korean names to English and add role
const problems = [];
for (const role of Object.keys(lists)) {
  for (const kor of lists[role]) {
    const eng = findEnglishForKorean(kor);
    if (!eng) {
      problems.push({ role, kor, reason: "영문명 미발견" });
      continue;
    }
    if (!desiredMap[eng]) desiredMap[eng] = new Set();
    desiredMap[eng].add(role);
  }
}

// Convert desiredMap to sorted entries
const entries = Object.keys(desiredMap)
  .sort((a, b) => a.localeCompare(b))
  .map((eng) => ({ eng, classes: [...desiredMap[eng]].sort() }));

// Rebuild Act1 text
let newAct1 = "  // Act 1\n";
for (const e of entries) {
  const clsList = e.classes.map((c) => `"${c}"`).join(", ");
  newAct1 += `  "${e.eng}": { act: 1, classes: [${clsList}] },\n`;
}
newAct1 += "\n";

// Replace old Act1 block
const before = vendorText.substring(0, act1Start);
const after = act2Start === -1 ? "" : vendorText.substring(act2Start);
const newVendorText = before + newAct1 + after;

fs.writeFileSync(vendorPath, newVendorText, "utf8");

console.log("Validation complete. Problems:", problems.length);
if (problems.length) console.table(problems);
console.log("Wrote updated Act 1 to", vendorPath);
