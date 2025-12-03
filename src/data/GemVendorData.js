// 젬 구매 정보: { act: number, classes: string[] }
// POE Wiki Vendor reward 기준 (Siosa, Lilly Roth 제외)
// 직업: Marauder, Templar, Witch, Shadow, Ranger, Duelist, Scion

export const GEM_VENDOR_INFO = {
  // Act 1
  "Added Fire Damage Support": { act: 1, classes: ["Marauder", "Templar"] },
  "Added Cold Damage Support": {
    act: 1,
    classes: ["Witch", "Shadow", "Ranger"],
  },
  "Added Lightning Damage Support": { act: 1, classes: ["Witch", "Templar"] },
  "Chance to Bleed Support": { act: 1, classes: ["Marauder", "Duelist"] },
  "Ruthless Support": { act: 1, classes: ["Marauder", "Duelist"] },
  "Pierce Support": { act: 1, classes: ["Ranger", "Duelist"] },
  "Arcane Surge Support": { act: 1, classes: ["Witch", "Templar", "Shadow"] },
  "Melee Splash Support": {
    act: 1,
    classes: ["Marauder", "Templar", "Ranger", "Duelist", "Shadow", "Scion"],
  },
  "Faster Attacks Support": {
    act: 1,
    classes: ["Marauder", "Duelist", "Ranger", "Shadow", "Scion"],
  },

  // Act 2
  "Faster Casting Support": {
    act: 2,
    classes: ["Witch", "Templar", "Shadow", "Scion"],
  },
  "Melee Physical Damage Support": { act: 2, classes: ["Marauder", "Duelist"] },
  "Minion Damage Support": { act: 2, classes: ["Witch", "Templar"] },
  "Minion Life Support": { act: 2, classes: ["Witch", "Templar"] },
  "Controlled Destruction Support": {
    act: 2,
    classes: ["Witch", "Templar", "Shadow"],
  },
  "Concentrated Effect Support": {
    act: 2,
    classes: ["Witch", "Templar", "Shadow"],
  },
  "Increased Area of Effect Support": {
    act: 2,
    classes: ["Witch", "Templar", "Shadow", "Marauder"],
  },
  "Less Duration Support": {
    act: 2,
    classes: ["Marauder", "Duelist", "Ranger"],
  },
  "Fork Support": { act: 2, classes: ["Ranger", "Shadow"] },
  "Ancestral Call Support": {
    act: 2,
    classes: ["Marauder", "Duelist", "Ranger"],
  },

  // Act 3
  "Elemental Damage with Attacks Support": {
    act: 3,
    classes: ["Ranger", "Duelist", "Shadow", "Marauder"],
  },
  "Fire Penetration Support": {
    act: 3,
    classes: ["Marauder", "Templar", "Witch"],
  },
  "Cold Penetration Support": {
    act: 3,
    classes: ["Witch", "Shadow", "Ranger"],
  },
  "Lightning Penetration Support": {
    act: 3,
    classes: ["Witch", "Templar", "Shadow"],
  },
  "Burning Damage Support": {
    act: 3,
    classes: ["Marauder", "Templar", "Witch"],
  },
  "Increased Critical Strikes Support": {
    act: 3,
    classes: ["Shadow", "Ranger", "Witch"],
  },
  "Increased Critical Damage Support": {
    act: 3,
    classes: ["Shadow", "Ranger", "Duelist"],
  },
  "Brutality Support": { act: 3, classes: ["Marauder", "Duelist"] },
  "Inspiration Support": {
    act: 3,
    classes: ["Duelist", "Marauder", "Templar", "Scion"],
  },
  "Generosity Support": { act: 3, classes: ["Templar", "Marauder"] },
  "Blasphemy Support": { act: 3, classes: ["Witch", "Shadow"] },
  "Greater Multiple Projectiles Support": {
    act: 3,
    classes: ["Ranger", "Shadow", "Duelist"],
  },
  "Void Manipulation Support": { act: 3, classes: ["Witch", "Shadow"] },
  "Swift Affliction Support": {
    act: 3,
    classes: ["Witch", "Shadow", "Ranger"],
  },
  "Deadly Ailments Support": { act: 3, classes: ["Shadow", "Ranger"] },
  "Vicious Projectiles Support": {
    act: 3,
    classes: ["Ranger", "Shadow", "Duelist"],
  },
  "Efficacy Support": { act: 3, classes: ["Witch", "Templar", "Shadow"] },
  "Elemental Focus Support": {
    act: 3,
    classes: ["Witch", "Templar", "Shadow"],
  },
  "Hypothermia Support": { act: 3, classes: ["Witch", "Shadow", "Ranger"] },
  "Combustion Support": { act: 3, classes: ["Marauder", "Templar", "Witch"] },
  "Immolate Support": { act: 3, classes: ["Marauder", "Templar", "Witch"] },
  "Fortify Support": { act: 3, classes: ["Marauder", "Duelist", "Templar"] },
  "Pulverise Support": { act: 3, classes: ["Marauder", "Duelist", "Templar"] },
  "Close Combat Support": {
    act: 3,
    classes: ["Marauder", "Duelist", "Ranger"],
  },
  "Added Chaos Damage Support": { act: 3, classes: ["Witch", "Shadow"] },

  // Act 4
  "Multistrike Support": {
    act: 4,
    classes: [
      "Marauder",
      "Templar",
      "Witch",
      "Shadow",
      "Ranger",
      "Duelist",
      "Scion",
    ],
  },
  "Spell Echo Support": {
    act: 4,
    classes: [
      "Marauder",
      "Templar",
      "Witch",
      "Shadow",
      "Ranger",
      "Duelist",
      "Scion",
    ],
  },
  "Cast when Damage Taken Support": {
    act: 4,
    classes: [
      "Marauder",
      "Templar",
      "Witch",
      "Shadow",
      "Ranger",
      "Duelist",
      "Scion",
    ],
  },
  "Chain Support": {
    act: 4,
    classes: [
      "Marauder",
      "Templar",
      "Witch",
      "Shadow",
      "Ranger",
      "Duelist",
      "Scion",
    ],
  },
  "Cast On Critical Strike Support": { act: 4, classes: ["Shadow", "Ranger"] },
  "Cast when Stunned Support": { act: 4, classes: ["Templar", "Marauder"] },
  "Power Charge On Critical Support": {
    act: 4,
    classes: ["Shadow", "Ranger", "Witch"],
  },
  "Arrogance Support": { act: 4, classes: ["Marauder", "Templar", "Duelist"] },
  "Cruelty Support": {
    act: 4,
    classes: ["Marauder", "Duelist", "Ranger", "Shadow"],
  },
  "Lifetap Support": { act: 4, classes: ["Marauder", "Templar", "Duelist"] },
  "Nightblade Support": { act: 4, classes: ["Shadow", "Ranger", "Duelist"] },
  "Culling Strike Support": {
    act: 4,
    classes: ["Ranger", "Shadow", "Duelist"],
  },
  "Bloodthirst Support": { act: 4, classes: ["Marauder", "Duelist"] },
  "Feeding Frenzy Support": { act: 4, classes: ["Witch", "Templar"] },
  "Meat Shield Support": { act: 4, classes: ["Witch", "Templar"] },
  "Elemental Army Support": { act: 4, classes: ["Witch", "Templar"] },
  "Damage on Full Life Support": {
    act: 4,
    classes: ["Marauder", "Duelist", "Ranger"],
  },
  "Barrage Support": { act: 4, classes: ["Ranger", "Shadow", "Duelist"] },
  "Hextouch Support": { act: 4, classes: ["Witch", "Shadow", "Templar"] },
  "Unbound Ailments Support": {
    act: 4,
    classes: ["Witch", "Shadow", "Ranger"],
  },
  "Infused Channelling Support": {
    act: 4,
    classes: ["Witch", "Templar", "Shadow", "Marauder"],
  },
  "Spell Cascade Support": { act: 4, classes: ["Witch", "Templar"] },
  "Greater Volley Support": {
    act: 4,
    classes: ["Ranger", "Shadow", "Duelist"],
  },
  "Mark On Hit Support": {
    act: 4,
    classes: ["Ranger", "Shadow", "Duelist", "Marauder"],
  },
  "Endurance Charge on Melee Stun Support": {
    act: 4,
    classes: ["Marauder", "Templar", "Duelist"],
  },
  "Second Wind Support": {
    act: 4,
    classes: ["Ranger", "Duelist", "Shadow", "Marauder"],
  },
};
