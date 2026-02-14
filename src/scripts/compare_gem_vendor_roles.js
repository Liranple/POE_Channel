const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..", "..");
const gemNamePath = path.join(root, "src", "data", "GemNameMapping.js");
const vendorPath = path.join(root, "src", "data", "GemVendorData.js");

const gemNameText = fs.readFileSync(gemNamePath, "utf8");
const vendorText = fs.readFileSync(vendorPath, "utf8");

const entryRe = /"([^"]+)":\s*"([^"]+)"\s*,?/g;
const korToEng = {};
let m;
while ((m = entryRe.exec(gemNameText))) {
  korToEng[m[2]] = m[1];
}

// Build provided lists same as validator
const lists = require("./validate_and_fix_gem_vendor.js");
// But validate_and_fix file doesn't export; instead re-declare lists here
// To keep it simple, rebuild lists here inline (same content as validator)
const provided = {
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

// Build expected English sets
const expected = {};
for (const role of Object.keys(provided)) {
  expected[role] = new Set();
  for (const kor of provided[role]) {
    const korWithSuffix = kor + " 보조";
    const eng = korToEng[korWithSuffix] || korToEng[kor];
    if (!eng) {
      console.error(`Missing mapping for Korean: ${kor} (role ${role})`);
      continue;
    }
    expected[role].add(eng);
  }
}

// Parse vendor file to get actual sets
const vendorRe = /"([^"]+)":\s*\{[^\}]*classes:\s*\[([^\]]*)\]/g;
const actual = {};
while ((m = vendorRe.exec(vendorText))) {
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

// Compare per role
let anyProblems = false;
for (const role of Object.keys(provided)) {
  const exp = expected[role] || new Set();
  const act = actual[role] || new Set();
  const missing = [...exp].filter((x) => !act.has(x));
  const extra = [...act].filter((x) => !exp.has(x));
  if (missing.length || extra.length) {
    anyProblems = true;
    console.log(`\nRole: ${role}`);
    if (missing.length) console.log("  Missing:", missing.sort());
    if (extra.length) console.log("  Extra:", extra.sort());
  }
}

if (!anyProblems) console.log("All roles match provided lists exactly.");
else console.log("\nDiscrepancies found.");
