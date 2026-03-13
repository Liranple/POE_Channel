const withOverlayColor = (overlayMap, color) =>
  Object.fromEntries(
    Object.entries(overlayMap).map(([name, overlay]) => [
      name,
      { overlay, color },
    ]),
  );

export const CARD_ART_IMAGES = {
  // 카드 이름: "삽화 이미지 URL"
  "거울의 집": "/images/cards/HouseOfMirrors.png",
  약제사: "/images/cards/TheApothecary.png",
  짝사랑: "/images/cards/UnrequitedLove.png",
  천벌: "/images/cards/Damnation.png",
  "근원을 알 수 없는 화염": "/images/cards/FireOfUnknownOrigin.png",
  "헌신의 대가": "/images/cards/ThePriceOfDevotion.png",
  "아버지의 사랑": "/images/cards/FathersLove.png",
  역사: "/images/cards/History.png",
  "실성한 고양이": "/images/cards/TheInsaneCat.png",
  의사: "/images/cards/TheDoctor.png",
  악마: "/images/cards/TheDemon.png",
  불멸자: "/images/cards/TheImmortal.png",
  마귀: "/images/cards/TheFiend.png",
  "형제의 선물": "/images/cards/BrotherGift.png",
  "루나리스의 자손": "/images/cards/TheProgenyofLunaris.png",
  "신성한 정의": "/images/cards/DivineJustice.png",
  "형제가 보인다": "/images/cards/ISeeBrothers.png",
  "끝없는 어둠": "/images/cards/TheEndlessDarkness.png",
  사기꾼: "/images/cards/TheCheater.png",
  "한 수 밀림": "/images/cards/Outfoxed.png",
  "7년 간의 불운": "/images/cards/SevenYearsBadLuck.png",
  "얼음을 가르는 사랑": "/images/cards/LoveThroughIce.png",
  "토끼 발": "/images/cards/TheRabbitsFoot.png",
  간호사: "/images/cards/TheNurse.png",
  "부와 권력": "/images/cards/WealthAndPower.png",
  "숨막히는 죄책감": "/images/cards/ChokingGuilt.png",
  "마지막 저항": "/images/cards/LastStand.png",
  "외로운 전사": "/images/cards/LonelyWarrior.png",
  "마지막 한 번의 기회": "/images/cards/OneLastScore.png",
  세피로트: "/images/cards/TheSephirot.png",
  호수: "/images/cards/TheLake.png",
  "빛나는 발견물": "/images/cards/LuminousTrove.png",
  "훼손된 미덕": "/images/cards/DesecratedVirtue.png",
  기적: "/images/cards/TheMiracle.png",
  "행운의 보루": "/images/cards/LuckyBastion.png",
  "잠든 야수": "/images/cards/TheSlumberingBeast.png",
  "심장의 투영": "/images/cards/TheReflectionOfTheHeart.png",
  "방패 운반자": "/images/cards/TheShieldbearer.png",
  계약: "/images/cards/ThePact.png",
  "용의 심장": "/images/cards/TheDragonsHeart.png",
};

const NIGHTMARE_MAP_OVERLAYS = {
  흉물: "/images/items/UberMalformation.webp",
  성역: "/images/items/UberRelicChambers.webp",
  요새: "/images/items/UberSilo.webp",
  지구라트: "/images/items/UberMausoleum.webp",
  성채: "/images/items/UberPrimordialBlocks.webp",
};

const TIER16_MAP_OVERLAYS = {
  산호섬: "/images/items/Atoll.webp",
  공원: "/images/items/Park.webp",
  해안: "/images/items/Strand.webp",
  묘지: "/images/items/Graveyard.webp",
  소굴: "/images/items/Lair.webp",
  분화구: "/images/items/Tribunal.webp",
  탑: "/images/items/Tower.webp",
  미로: "/images/items/Maze.webp",
  부두: "/images/items/Wharf.webp",
  빌라: "/images/items/Villa.webp",
  빈민촌: "/images/items/Ghetto.webp",
  묘실: "/images/items/BurialChambers.webp",
  매장소: "/images/items/Sepulchre.webp",
  종탑: "/images/items/Belfry.webp",
  공장: "/images/items/Factory.webp",
  매장지: "/images/items/Necropolis.webp",
  협곡: "/images/items/Canyon.webp",
  사막: "/images/items/Desert.webp",
  전망대: "/images/items/Lookout.webp",
  감방: "/images/items/Cells.webp",
  병기창: "/images/items/Arsenal.webp",
  화산: "/images/items/Volcano.webp",
  주택: "/images/items/Residence.webp",
  수로: "/images/items/Waterways.webp",
  항만: "/images/items/Quay.webp",
  "상아 사원": "/images/items/IvoryTemple.webp",
  "무덤 고랑": "/images/items/Burn.webp",
  "용암 호수": "/images/items/Corpse.webp",
  "진흙 간헐천": "/images/items/MudGeyser.webp",
  "산성 암굴": "/images/items/SulphurVents.webp",
  "공성 구역": "/images/items/Boulevard.webp",
  "태고의 웅덩이": "/images/items/PrimordialPool.webp",
  "태고의 구역": "/images/items/PrimevalRuins.webp",
  "진홍색 마을": "/images/items/CrimsonTownship.webp",
  "더럽혀진 대성당": "/images/items/DefiledCathedral.webp",
  "달의 사원": "/images/items/LunarisTemple.webp",
};

export const LOCATION_IMAGES = {
  // 드랍처 이름: "이미지 URL" 또는 { overlay: "이미지 URL", color: "#RRGGBB" } (Base23 프레임 사용 시)

  // 기타
  도박꾼: "/images/items/InventoryIcon.webp",
  "미궁 내 은상자": "/images/items/KeySilver.webp",

  // 고유 지도
  "오바의 저주받은 전리품": "/images/items/oba.webp",
  "액턴의 악몽": "/images/items/musicbox.webp",
  "황혼의 사원": "/images/items/Celestial.webp",
  "도리아니의 기계실": "/images/items/Doryanis.webp",
  "악취 나는 수도원": "/images/items/PutridCloister.webp",
  "명인의 전당": "/images/items/HallOfGrandmasters.webp",
  "겁쟁이의 시험": "/images/items/UndeadSiege.webp",
  "푸어조이의 은신처": "/images/items/PoorjoysAsylum.webp",

  // 특수 지도
  키메라: "/images/items/Chimera.webp",
  히드라: "/images/items/Hydra.webp",
  미노타우로스: "/images/items/Minotaur.webp",
  불사조: "/images/items/Phoenix.webp",
  "앗조아틀의 사원": "/images/items/TempleMap.webp",
  "매혹적인 심연": "/images/items/UberVaal01.webp",
  "바알 사원": "/images/items/VaalTempleBase.webp",
  교두보: "/images/items/HarbingerRed.webp",
  "끓어오르는 유미즙": "/images/items/TangledOrbQuest0.webp",

  // 몬스터
  "환영 고유 몬스터": "/images/items/DeliriumBoss1.webp",
  "우버 앗지리": "/images/items/UberVaal01.webp",
  베리타니아: "/images/items/VeritaniaMap.webp",
  아울: "/images/items/BossProtoVaal.webp",

  // 악몽 지도
  ...withOverlayColor(NIGHTMARE_MAP_OVERLAYS, "#6a0dad"),

  // 16티어
  ...withOverlayColor(TIER16_MAP_OVERLAYS, "#d20000"),
};
