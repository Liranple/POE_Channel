const poe1 = "https://www.twitch.tv/directory/category/path-of-exile";
const poe2 = "https://www.twitch.tv/directory/category/path-of-exile-2";
const TGA = "https://www.twitch.tv/directory/category/the-game-awards";

// 임시이미지 >> /images/drops/Twitch.png

// Drops page stagger animation settings (only affects DropsPage)
export const DROPS_PAGE_ANIMATION = {
  STAGGER_STEP_SECONDS: 0.05,
  STAGGER_MAX_INDEX: 10,
  ITEM_DURATION_SECONDS: 0.3,
};

export const EVENTS = [
  {
    title: "허상 Live Stream",
    period: { start: "2026-02-27T04:00:00", end: "2026-02-28T04:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/MirageWeaponEffect.png",
            name: "허상 무기 이펙트",
          },
        ],
        start: "2026-02-27T04:00:00",
        end: "2026-02-28T04:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "최후의 드루이드 Launch",
    period: { start: "2025-12-13T04:00:00", end: "2025-12-28T19:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/AtzirisRoyalCacheStash.webp",
            name: "앗지리의 왕실 은닉함 보관함",
          },
        ],
        start: "2025-12-20T19:00:00",
        end: "2025-12-25T19:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
      {
        items: [
          {
            img: "/images/drops/BloodMoonWolfPackSkillEffect.webp",
            name: "핏빛 달 늑대 무리 스킬 이펙트",
          },
          {
            img: "/images/drops/MaskoftheVaal.webp",
            name: "바알의 가면",
          },
        ],
        start: "2025-12-13T04:00:00",
        end: "2025-12-20T19:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
    ],
  },
  {
    title: "The Game Awards",
    period: { start: "2025-12-12T09:00:00", end: "2025-12-12T13:30:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/VerdantDruidPortal.webp",
            name: "마지의 드루이드 포탈",
          },
        ],
        start: "2025-12-12T09:00:00",
        end: "2025-12-12T13:30:00",
        watchingText: "30 minute",
        url: TGA,
      },
    ],
  },
  {
    title: "최후의 드루이드 Live Stream",
    period: { start: "2025-12-05T04:00:00", end: "2025-12-06T04:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/VerdantStepsDodgerollEffect.webp",
            name: "신록의 대자연 회피 구르기 이펙트",
          },
        ],
        start: "2025-12-05T04:00:00",
        end: "2025-12-06T04:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "불길의 수호자들 Launch",
    period: { start: "2025-11-01T04:00:00", end: "2025-11-16T20:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/HandofXeshtSlamFinisherEffects.webp",
            name: "제쉬트의 강타 희귀 마무리 이펙트",
          },
        ],
        start: "2025-11-08T20:00:00",
        end: "2025-11-16T20:00:00",
        watchingText: "3 hour",
        url: poe1,
      },
      {
        items: [
          {
            img: "/images/drops/ExilesTreasurerHideoutDecoration.webp",
            name: "유배자의 회계원 은신처 장식물",
          },
          {
            img: "/images/drops/BreachlordsClawCharacterEffect.webp",
            name: "균열 군주의 발톱 캐릭터 이펙트",
          },
        ],
        start: "2025-11-01T04:00:00",
        end: "2025-11-08T20:00:00",
        watchingText: "3 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "불길의 수호자들 Live Stream",
    period: { start: "2025-10-24T04:00:00", end: "2025-10-25T04:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/HivebornCrawlerPet.webp",
            name: "벌레집 태생 벌레 애완동물",
          },
        ],
        start: "2025-10-24T04:00:00",
        end: "2025-10-25T04:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "세 번째 칙령 Launch",
    period: { start: "2025-08-30T05:00:00", end: "2025-09-14T21:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/AbyssalBackAttachment.webp",
            name: "심연의 존재의 단망토",
          },
        ],
        start: "2025-09-06T21:00:00",
        end: "2025-09-14T21:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
      {
        items: [
          {
            img: "/images/drops/ClamStash.webp",
            name: "조개 보관함",
          },
          {
            img: "/images/drops/HelmetoftheAbyssal.webp",
            name: "심연의 존재의 투구",
          },
        ],
        start: "2025-08-30T05:00:00",
        end: "2025-09-06T21:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
    ],
  },
  {
    title: "세 번째 칙령 Live Stream",
    period: { start: "2025-08-21T05:00:00", end: "2025-08-21T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/SunPriestIncinerationFinisherEffect.webp",
            name: "태양 사제의 소각 희귀 마무리 이펙트",
          },
        ],
        start: "2025-08-21T05:00:00",
        end: "2025-08-21T14:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "아틀라스의 비밀 Launch",
    period: { start: "2025-06-14T05:00:00", end: "2025-06-29T21:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/RoseCharges.webp",
            name: "장미 충전 이펙트",
          },
        ],
        start: "2025-06-21T21:00:00",
        end: "2025-06-29T21:00:00",
        watchingText: "3 hour",
        url: poe1,
      },
      {
        items: [
          {
            img: "/images/drops/SyndicatesDemiseUniqueFinisher.webp",
            name: "연합의 최후 고유 마무리 이펙트",
          },
        ],
        start: "2025-06-14T05:00:00",
        end: "2025-06-21T21:00:00",
        watchingText: "3 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "아틀라스의 비밀 Live Stream",
    period: { start: "2025-06-06T05:00:00", end: "2025-06-06T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/SkullofUndeathHelmet.webp",
            name: "불사의 해골",
          },
        ],
        start: "2025-06-06T05:00:00",
        end: "2025-06-06T14:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "사냥의 서막 Launch",
    period: { start: "2025-04-05T04:00:00", end: "2025-04-20T21:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/BoarHuntBackAttachment.webp",
            name: "사냥꾼의 전리품 등 부착물",
          },
          {
            img: "/images/drops/SummonHonourRhoaMount.webp",
            name: "의장대 로아 탈것 소환",
          },
        ],
        start: "2025-04-13T21:00:00",
        end: "2025-04-20T21:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
      {
        items: [
          {
            img: "/images/drops/AzmeriNobleDeerPet.webp",
            name: "아즈메리 고결한 꽃사슴 애완동물",
          },
        ],
        start: "2025-04-05T04:00:00",
        end: "2025-04-13T21:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
    ],
  },
  {
    title: "사냥의 서막 Live Stream",
    period: { start: "2025-03-28T04:00:00", end: "2025-03-28T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/ExecutionersGuillotineRareFinisherEffect.webp",
            name: "사형 집행자의 단두대 고유 마무리 이펙트",
          },
        ],
        start: "2025-03-28T05:00:00",
        end: "2025-03-28T14:00:00",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "POE 2 Early Access Launch",
    period: { start: "2024-12-07T04:00:00", end: "2024-12-22T17:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/TemporalLordsPortalEffect.webp",
            name: "시간의 군주의 포탈 이펙트",
          },
        ],
        start: "2024-12-14T17:00:00",
        end: "2024-12-22T17:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
      {
        items: [
          {
            img: "/images/drops/UtilityShock.webp",
            name: "활력의 낙뢰 플라스크 이펙트",
          },
          {
            img: "/images/drops/HaloOfTheRighteousHelmetAttachment.webp",
            name: "정의로운 자의 후광 투구 부착물",
          },
        ],
        start: "2024-12-07T04:00:00",
        end: "2024-12-14T17:00:00",
        watchingText: "3 hour",
        url: poe2,
      },
    ],
  },
  {
    title: "POE 2 Early Access Live Stream",
    period: { start: "2024-11-22T05:00:00", end: "2024-11-22T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/GigaHandsBackAttachment.webp",
            name: "제쉬트의 손 등 부착물",
          },
        ],
        start: "2024-11-22T05:00:00",
        end: "2024-11-22T14:00:00",
        watchingText: "90 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "칼구르의 정착자들 Live Stream",
    period: { start: "2024-07-19T05:00:00", end: "2024-07-19T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/CorsairBackAttachment.webp",
            name: "해적의 등 부착물",
          },
        ],
        start: "2024-07-19T05:00:00",
        end: "2024-07-19T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "네크로폴리스 Live Stream",
    period: { start: "2024-03-22T05:00:00", end: "2024-03-22T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/SufferingWings.webp",
            name: "고통의 등 부착물",
          },
        ],
        start: "2024-03-22T05:00:00",
        end: "2024-03-22T14:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "고난 Launch",
    period: { start: "2023-12-09T04:00:00", end: "2023-12-16T04:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/IceTiger.webp",
            name: "얼음 호랑이 애완동물",
          },
        ],
        start: "2023-12-09T04:00:00",
        end: "2023-12-16T04:00:00",
        watchingText: "4 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "고난 Live Stream",
    period: { start: "2023-12-01T04:00:00", end: "2023-12-01T14:30:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/HuntsmanWings.webp",
            name: "수렵가 날개",
          },
        ],
        start: "2023-12-01T04:00:00",
        end: "2023-12-01T14:30:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "ExileCon 2023",
    period: { start: "2023-07-29T07:00:00", end: "2023-07-30T14:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/HeartseekerPortal.webp",
            name: "심장 추적자 포탈 이펙트",
          },
        ],
        start: "2023-07-29T07:00:00",
        end: "2023-07-30T14:00:00",
        watchingText: "4 hour",
        url: poe1,
      },
      {
        items: [
          {
            img: "/images/drops/RavenDemonWings.webp",
            name: "큰까마귀 악마 날개",
          },
        ],
        start: "2023-07-29T04:00:00",
        end: "2023-07-29T08:30:00",
        watchingText: "1 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "시련 Live Stream",
    period: { start: "2023-03-31T04:00:00", end: "2023-03-31T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/SphinxWings.webp",
            name: "스핑크스 날개",
          },
        ],
        start: "2023-03-31T04:00:00",
        end: "2023-03-31T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "금지된 성역 Live Stream",
    period: { start: "2022-12-02T04:00:00", end: "2022-12-02T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/BloodGuardWings.webp",
            name: "피의 수호병 날개",
          },
        ],
        start: "2022-12-02T04:00:00",
        end: "2022-12-02T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "칼란드라 호수 Launch",
    period: { start: "2022-08-20T05:00:00", end: "2022-08-22T05:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/ArcaneThrone.webp",
            name: "비전 왕좌",
          },
        ],
        start: "2022-12-02T04:00:00",
        end: "2022-12-02T13:00:00",
        watchingText: "3 hour",
        url: poe1,
      },
      {
        items: [
          {
            img: "/images/drops/ArcaneFootprints.webp",
            name: "비전 발자국 이펙트",
          },
        ],
        start: "2022-08-20T05:00:00",
        end: "2022-08-22T05:00:00",
        watchingText: "1 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "칼란드라 호수 Live Stream",
    period: { start: "2022-08-12T05:00:00", end: "2022-08-12T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/WranglerWings.webp",
            name: "몰이꾼 날개",
          },
        ],
        start: "2022-08-12T05:00:00",
        end: "2022-08-12T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "파수꾼 Live Stream",
    period: { start: "2022-05-06T05:00:00", end: "2022-05-06T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/RaptureWings.webp",
            name: "휴거 날개",
          },
        ],
        start: "2022-05-06T05:00:00",
        end: "2022-05-06T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "아틀라스 공성전 Live Stream",
    period: { start: "2022-01-28T04:00:00", end: "2022-01-28T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/WastelandWings.webp",
            name: "황무지 날개",
          },
        ],
        start: "2022-01-28T04:00:00",
        end: "2022-01-28T13:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "환영 정복 Event League",
    period: { start: "2022-01-01T05:00:00", end: "2022-01-01T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/DemonKingPortal.webp",
            name: "악마왕 포탈 이펙트",
          },
        ],
        start: "2022-01-01T05:00:00",
        end: "2022-01-01T23:59:59",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "아틀라스 침공 Event League",
    period: { start: "2021-12-25T05:00:00", end: "2021-12-25T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/MalachaiPortal.webp",
            name: "말라카이 포탈 이펙트",
          },
        ],
        start: "2021-12-25T05:00:00",
        end: "2021-12-25T23:59:59",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "끝없는 강탈 Event League",
    period: { start: "2021-12-18T05:00:00", end: "2021-12-18T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/TemplePortalEffect.webp",
            name: "사원 포탈 이펙트",
          },
        ],
        start: "2021-12-18T05:00:00",
        end: "2021-12-18T23:59:59",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "Zizaran Gauntlet League",
    period: { start: "2021-12-11T05:00:00", end: "2021-12-11T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/WranglerPortal.webp",
            name: "몰이꾼 포탈 이펙트",
          },
        ],
        start: "2021-12-11T05:00:00",
        end: "2021-12-11T23:59:59",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "끝없는 탐광 Event League",
    period: { start: "2021-12-04T05:00:00", end: "2021-12-04T23:59:59" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/VoidgatePortal.webp",
            name: "비전 공허의 입구 포탈 이펙트",
          },
        ],
        start: "2021-12-04T05:00:00",
        end: "2021-12-04T23:59:59",
        watchingText: "2 hour",
        url: poe1,
      },
    ],
  },
  {
    title: "스컬지 Live Stream",
    period: { start: "2021-10-15T04:00:00", end: "2021-10-15T09:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/DragonflyWings.webp",
            name: "잠자리 날개",
          },
        ],
        start: "2021-10-15T04:00:00",
        end: "2021-10-15T09:00:00",
        watchingText: "45 minute",
        url: poe1,
      },
    ],
  },
  {
    title: "결전 Live Stream",
    period: { start: "2021-04-09T04:00:00", end: "2021-04-09T13:00:00" },
    groups: [
      {
        items: [
          {
            img: "/images/drops/FaithGuardWings.webp",
            name: "신념 수호병 날개",
          },
        ],
        start: "2021-04-09T04:00:00",
        end: "2021-04-09T13:00:00",
        watchingText: "30 minute",
        url: poe1,
      },
    ],
  },
];
