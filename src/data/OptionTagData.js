export const OPTION_TAG_DEFAULT_ORDER = 50;

export const OPTION_TAGS = [
  {
    id: "생명력",
    label: "",
    className: "tag-life",
    order: 50,
  },
  {
    id: "물리",
    label: "",
    className: "tag-physical",
    order: 50,
  },
  {
    id: "반사",
    label: "",
    className: "tag-reflection",
    order: 60,
  },
  {
    id: "범위",
    label: "",
    className: "tag-area",
    order: 60,
  },
  {
    id: "상태",
    label: "",
    className: "tag-ailment",
    order: 50,
  },
  {
    id: "억제",
    label: "",
    className: "tag-suppression",
    order: 50,
  },
  {
    id: "노출",
    label: "",
    className: "tag-exposure",
    order: 50,
  },
  {
    id: "재생",
    label: "",
    className: "tag-regen",
    order: 50,
  },
  {
    id: "충전",
    label: "",
    className: "tag-charge",
    order: 50,
  },
  {
    id: "오라",
    label: "",
    className: "tag-aura",
    order: 50,
  },
  {
    id: "소환수",
    label: "",
    className: "tag-summon",
    order: 50,
  },
  {
    id: "감속",
    label: "",
    className: "tag-slow",
    order: 50,
  },
  {
    id: "출혈",
    label: "",
    className: "tag-bleed",
    order: 50,
  },
  {
    id: "중독",
    label: "",
    className: "tag-poison",
    order: 50,
  },
  {
    id: "지속",
    label: "",
    className: "tag-duration",
    order: 50,
  },
  {
    id: "효과",
    label: "",
    className: "tag-effect",
    order: 60,
  },
  {
    id: "쿨다운",
    label: "",
    className: "tag-cooldown",
    order: 50,
  },
  {
    id: "방어도",
    label: "",
    className: "tag-armour",
    order: 50,
  },
  {
    id: "회피",
    label: "",
    className: "tag-evasion",
    order: 50,
  },
  {
    id: "보호막",
    label: "",
    className: "tag-shield",
    order: 50,
  },
  {
    id: "속도",
    label: "",
    className: "tag-speed",
    order: 50,
  },
  {
    id: "기절",
    label: "",
    className: "tag-stun",
    order: 50,
  },
  {
    id: "저항",
    label: "",
    className: "tag-resistance",
    order: 50,
  },
  {
    id: "흡수",
    label: "",
    className: "tag-leech",
    order: 50,
  },
  {
    id: "치명타",
    label: "",
    className: "tag-critical",
    order: 50,
  },
  {
    id: "저주",
    label: "",
    className: "tag-curse",
    order: 50,
  },
  {
    id: "화염",
    label: "",
    className: "tag-fire",
    order: 50,
  },
  {
    id: "냉기",
    label: "",
    className: "tag-cold",
    order: 60,
  },
  {
    id: "번개",
    label: "",
    className: "tag-lightning",
    order: 70,
  },
  {
    id: "카오스",
    label: "",
    className: "tag-chaos",
    order: 80,
  },
  {
    id: "HP",
    label: "",
    className: "tag-hp",
    order: 100,
  },
  {
    id: "MP",
    label: "",
    className: "tag-mp",
    order: 110,
  },
  {
    id: "SP",
    label: "",
    className: "tag-sp",
    order: 120,
  },
  {
    id: "TC",
    label: "",
    className: "tag-tc",
    order: 130,
  },
  {
    id: "Top",
    className: "tag-top",
    order: 100,
  },
  {
    id: "Uber",
    className: "tag-uber",
    order: 110,
  },
  {
    id: "진홍",
    image: "/images/items/basicstr.webp",
    className: "tag-jewel",
    order: 100,
  },
  {
    id: "진청록",
    image: "/images/items/basicdex.webp",
    className: "tag-jewel",
    order: 110,
  },
  {
    id: "진청록색",
    image: "/images/items/basicdex.webp",
    className: "tag-jewel",
    order: 110,
    aliasOnly: true,
  },
  {
    id: "코발트",
    image: "/images/items/basicint.webp",
    className: "tag-jewel",
    order: 120,
  },
  {
    id: "살인적인",
    image: "/images/items/MurderousEye.webp",
    className: "tag-jewel",
    order: 130,
  },
  {
    id: "탐색하는",
    image: "/images/items/SearchingEye.webp",
    className: "tag-jewel",
    order: 140,
  },
  {
    id: "최면거는",
    image: "/images/items/RivetedEye.webp",
    className: "tag-jewel",
    order: 150,
  },
  {
    id: "무시무시한",
    image: "/images/items/GhastlyEye.webp",
    className: "tag-jewel",
    order: 160,
  },
];

export const OPTION_TAG_MAP = OPTION_TAGS.reduce((map, tag) => {
  map[tag.id.normalize("NFC")] = tag;
  return map;
}, {});

export const JEWEL_TYPES = OPTION_TAGS.filter(
  (tag) => tag.image && !tag.aliasOnly,
).map((tag) => ({
  id: tag.id,
  img: tag.image,
}));

export function getOptionTag(type) {
  const normalizedType = type.normalize ? type.normalize("NFC") : type;
  const tag = OPTION_TAG_MAP[normalizedType];

  if (tag) {
    return {
      ...tag,
      id: normalizedType,
      label: tag.label || tag.id,
    };
  }

  return {
    id: normalizedType,
    label: normalizedType,
    className: "tag-custom",
    order: OPTION_TAG_DEFAULT_ORDER,
  };
}
