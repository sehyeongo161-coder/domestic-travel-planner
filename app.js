"use strict";

const STORAGE_KEY = "smallCityTravelPlanner";
const SWITCHER_COLLAPSED_KEY = "travelPlannerDestinationSwitcherCollapsed";
const DATA_VERSION = 7;
const MAX_TRIP_DAYS = 14;
const FIREBASE_COLLECTION = "domestic-travel";
const FIREBASE_DOCUMENT = "planner-state";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC56qGPGXTnYBpQNdrdv2gt6TlkPvzTz-8",
  authDomain: "kitakyushu-trip.firebaseapp.com",
  projectId: "kitakyushu-trip",
  storageBucket: "kitakyushu-trip.firebasestorage.app",
  messagingSenderId: "883462812612",
  appId: "1:883462812612:web:ebb0479fcafb1c807f2a91"
};
const DEFAULT_DESTINATIONS = ["구례", "하동", "곡성", "무주", "진안", "순창", "남원"];
const REGIONS = [
  { name: "서울", fullName: "서울특별시", mapClass: "seoul" },
  { name: "인천", fullName: "인천광역시", mapClass: "incheon" },
  { name: "경기", fullName: "경기도", mapClass: "gyeonggi" },
  { name: "강원", fullName: "강원특별자치도", mapClass: "gangwon" },
  { name: "충남", fullName: "충청남도", mapClass: "chungnam" },
  { name: "세종", fullName: "세종특별자치시", mapClass: "sejong" },
  { name: "대전", fullName: "대전광역시", mapClass: "daejeon" },
  { name: "충북", fullName: "충청북도", mapClass: "chungbuk" },
  { name: "경북", fullName: "경상북도", mapClass: "gyeongbuk" },
  { name: "대구", fullName: "대구광역시", mapClass: "daegu" },
  { name: "울산", fullName: "울산광역시", mapClass: "ulsan" },
  { name: "부산", fullName: "부산광역시", mapClass: "busan" },
  { name: "전북", fullName: "전북특별자치도", mapClass: "jeonbuk" },
  { name: "광주", fullName: "광주광역시", mapClass: "gwangju" },
  { name: "전남", fullName: "전라남도", mapClass: "jeonnam" },
  { name: "경남", fullName: "경상남도", mapClass: "gyeongnam" },
  { name: "제주", fullName: "제주특별자치도", mapClass: "jeju" },
  { name: "기타", fullName: "기타 지역", mapClass: "other" }
];
const DESTINATION_PROVINCES = { "구례": "전남", "하동": "경남", "곡성": "전남", "무주": "전북", "진안": "전북", "순창": "전북", "남원": "전북" };
const MUNICIPALITIES = {
  "전북": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  "전남": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  "경남": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]
};
const PROVINCE_MAP_KEYS = { "전북": "jeonbuk", "전남": "jeonnam", "경남": "gyeongnam" };
const PROVINCE_SVG_NAMES = {
  "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구", "인천광역시": "인천", "광주광역시": "광주", "대전광역시": "대전", "울산광역시": "울산",
  "세종특별자치시": "세종", "경기도": "경기", "강원도": "강원", "충청북도": "충북", "충청남도": "충남", "전라북도": "전북", "전라남도": "전남", "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주"
};
const LEGACY_GENERIC_DAYS = [
  [
    ["09:00", "전주 출발", "이동", "약 1시간 30분"], ["10:30", "첫 번째 관광지", "관광", "약 1시간"], ["12:00", "점심", "식사", "약 1시간"],
    ["13:30", "오후 관광지", "관광", "약 1시간 30분"], ["16:00", "카페 또는 산책", "카페", "약 1시간"], ["18:00", "저녁", "식사", "약 1시간 30분"],
    ["20:00", "숙소 체크인", "숙소", ""]
  ],
  [
    ["09:00", "숙소 출발", "이동", ""], ["09:30", "관광지", "관광", "약 1시간 30분"], ["11:30", "카페 또는 산책", "카페", "약 1시간"],
    ["13:00", "점심", "식사", "약 1시간"], ["14:30", "마지막 관광지", "관광", "약 1시간"], ["16:00", "전주 출발", "이동", ""], ["18:00", "전주 도착", "이동", ""]
  ]
];
const DESTINATION_SCHEDULES = {
  "구례": [
    [
      ["09:00", "전주 출발", "이동", "약 1시간 30분", "순천완주고속도로를 이용해 구례로 이동합니다."],
      ["10:40", "사성암", "관광", "약 1시간 20분", "오산에서 섬진강과 구례읍을 내려다보는 대표 전망 코스입니다. 방문 전 셔틀·주차 운영을 확인하세요."],
      ["12:20", "구례읍 점심", "식사", "약 1시간", "산채정식이나 육회비빔밥처럼 구례에서 즐기기 좋은 메뉴를 골라보세요."],
      ["13:40", "섬진강 대나무숲길", "산책", "약 40분", "섬진강 옆 대나무숲을 부담 없이 걷는 짧은 산책 코스입니다."],
      ["14:40", "쌍산재", "관광", "약 1시간 20분", "고택과 정원을 천천히 둘러봅니다. 휴무일과 입장 가능 시간을 미리 확인하세요."],
      ["16:30", "구례 전망 카페", "카페", "약 1시간", "섬진강이나 지리산 풍경이 보이는 카페에서 쉬어갑니다."],
      ["18:00", "구례 저녁", "식사", "약 1시간 30분", "섬진강 재첩 요리, 다슬기 수제비 등 지역 메뉴를 후보로 잡아두세요."],
      ["20:00", "숙소 체크인", "숙소", "", "화엄사·구례읍·산동면 중 다음 날 동선에 맞는 숙소를 선택하세요."]
    ],
    [
      ["09:00", "숙소 출발", "이동", "", "아침 식사와 체크아웃을 마치고 출발합니다."],
      ["09:30", "화엄사", "관광", "약 1시간 30분", "지리산 자락의 천년 사찰과 각황전 일대를 여유롭게 둘러봅니다."],
      ["11:20", "천은사 상생의 길", "산책", "약 1시간 20분", "천은저수지를 따라 이어지는 숲길을 걷습니다. 체력에 맞춰 일부 구간만 걸어도 좋습니다."],
      ["13:00", "구례 점심", "식사", "약 1시간", "전날 먹지 못한 구례 향토 메뉴나 가벼운 백반을 선택하세요."],
      ["14:20", "구례5일시장·로컬 상점", "쇼핑", "약 50분", "장날이 아니면 구례읍 로컬 상점과 특산품 판매점을 둘러보세요."],
      ["15:30", "마지막 카페", "카페", "약 50분", "귀가 전에 잠시 쉬면서 일정과 사진을 정리합니다."],
      ["16:30", "전주 출발", "이동", "약 1시간 30분", "교통 상황을 확인하고 전주로 출발합니다."],
      ["18:00", "전주 도착", "이동", "", "차량 정리와 여행 경비 기록을 마무리합니다."]
    ]
  ],
  "하동": [
    [
      ["09:00", "전주 출발", "이동", "약 1시간 40분", "구례를 지나 섬진강 동쪽의 화개권으로 이동합니다."],
      ["10:40", "화개장터", "관광", "약 50분", "영호남의 물산이 모이던 장터를 가볍게 둘러봅니다."],
      ["11:40", "화개 점심", "식사", "약 1시간", "재첩국, 참게탕, 산채비빔밥처럼 섬진강과 지리산의 지역 메뉴를 골라보세요."],
      ["13:00", "쌍계사", "관광", "약 1시간 20분", "화개동천을 따라 쌍계사 경내와 차나무 시배지 주변을 둘러봅니다."],
      ["14:40", "하동야생차박물관", "관광", "약 1시간", "하동의 차 문화와 야생차 역사를 살펴봅니다. 체험 운영 여부는 방문 전에 확인하세요."],
      ["16:00", "화개 차 카페", "카페", "약 1시간", "하동 녹차나 말차 메뉴를 맛보며 쉬어갑니다."],
      ["18:00", "하동 저녁", "식사", "약 1시간 30분", "재첩회, 은어, 참게 등 계절에 맞는 섬진강 음식을 후보로 잡아두세요."],
      ["20:00", "숙소 체크인", "숙소", "", "다음 날 평사리 동선을 고려해 악양면이나 하동읍 숙소를 선택하세요."]
    ],
    [
      ["09:00", "숙소 출발", "이동", "", "체크아웃 후 평사리·악양권으로 이동합니다."],
      ["09:30", "최참판댁·박경리문학관", "관광", "약 1시간 30분", "소설 토지의 배경과 전통가옥, 평사리 풍경을 함께 둘러봅니다."],
      ["11:20", "평사리 들판·동정호", "산책", "약 50분", "악양 들판과 부부송을 바라보며 천천히 산책합니다."],
      ["12:30", "악양·하동읍 점심", "식사", "약 1시간", "재첩국이나 참게탕 등 전날 먹지 못한 향토 메뉴를 선택하세요."],
      ["14:00", "하동송림공원", "산책", "약 1시간", "섬진강변의 오래된 소나무 숲과 백사장을 여유롭게 걷습니다."],
      ["15:20", "섬진강 카페", "카페", "약 50분", "강변 풍경을 보며 귀가 전 마지막 휴식을 갖습니다."],
      ["16:30", "전주 출발", "이동", "약 1시간 40분", "교통 상황을 확인하고 전주로 출발합니다."],
      ["18:10", "전주 도착", "이동", "", "차량 정리와 여행 경비 기록을 마무리합니다."]
    ]
  ]
};
const TRIP_STATUSES = ["후보", "계획 중", "확정", "여행 완료"];
const SCHEDULE_TYPES = ["이동", "관광", "식사", "카페", "숙소", "쇼핑", "산책", "기타"];
const CATEGORY_ICONS = { "이동": "car", "관광": "camera", "식사": "utensils", "카페": "coffee", "숙소": "bed", "쇼핑": "bag", "산책": "walk", "기타": "pin" };
const VIEW_TABS = [
  ["plan", "일정", "calendar"], ["placesHub", "장소", "map"], ["extras", "체크", "checklist"], ["ledger", "가계부", "wallet"]
];
const PLACE_TABS = [["places", "관광지", "camera"], ["restaurants", "맛집", "utensils"], ["cafes", "카페", "coffee"]];
const EXPENSE_CATEGORIES = ["이동", "식사", "카페", "숙박", "관광", "쇼핑", "기타"];
const COST_FIELDS = [
  ["fuel", "주유비"], ["toll", "톨게이트 비용"], ["lodging", "숙박"], ["food", "식비"],
  ["cafe", "카페"], ["admission", "관광지 입장료"], ["shopping", "쇼핑"], ["other", "기타"]
];

const CANDIDATE_CONFIG = {
  places: {
    title: "관광지", kicker: "PLACE SHORTLIST", description: "가보고 싶은 관광지와 산책 장소를 여행지별로 모아두세요.", addLabel: "+ 관광지 추가",
    fields: [
      { name: "name", label: "장소명", required: true, span: 2, placeholder: "예: 사성암" },
      { name: "category", label: "분류", type: "select", options: ["관광", "산책", "쇼핑", "기타"] },
      { name: "address", label: "주소", span: 2, placeholder: "도로명 또는 지번 주소" },
      { name: "duration", label: "예상 체류시간", placeholder: "예: 1시간 30분" },
      { name: "mapUrl", label: "지도 URL", type: "url", placeholder: "https://..." },
      { name: "description", label: "간단한 설명", type: "textarea", span: 2 },
      { name: "memo", label: "메모", type: "textarea", span: 2 }
    ]
  },
  restaurants: {
    title: "맛집 후보", kicker: "FOOD SHORTLIST", description: "메뉴와 영업시간을 함께 기록해 식사 결정을 빠르게 하세요.", addLabel: "+ 맛집 후보 추가",
    fields: [
      { name: "name", label: "이름", required: true, span: 2, placeholder: "식당 이름" },
      { name: "menu", label: "대표 메뉴", placeholder: "예: 산채정식" }, { name: "priceRange", label: "가격대", placeholder: "예: 1인 15,000원" },
      { name: "address", label: "주소", span: 2 }, { name: "hours", label: "영업시간 메모", span: 2, placeholder: "브레이크타임·휴무일 등" },
      { name: "mapUrl", label: "지도 URL", type: "url", span: 2, placeholder: "https://..." }, { name: "memo", label: "자유 메모", type: "textarea", span: 2 }
    ]
  },
  cafes: {
    title: "카페 후보", kicker: "CAFE SHORTLIST", description: "뷰, 시그니처 메뉴, 쉬어가기 좋은 포인트를 모아두세요.", addLabel: "+ 카페 후보 추가",
    fields: [
      { name: "name", label: "이름", required: true, span: 2, placeholder: "카페 이름" }, { name: "feature", label: "특징", placeholder: "예: 섬진강 뷰" },
      { name: "priceRange", label: "가격대", placeholder: "예: 5,000~8,000원" }, { name: "address", label: "주소", span: 2 },
      { name: "mapUrl", label: "지도 URL", type: "url", span: 2, placeholder: "https://..." }, { name: "memo", label: "자유 메모", type: "textarea", span: 2 }
    ]
  },
  lodgings: {
    title: "숙소 후보", kicker: "STAY SHORTLIST", description: "가격과 입실 조건을 비교해 숙소 선택을 간단하게 만드세요.", addLabel: "+ 숙소 후보 추가",
    fields: [
      { name: "name", label: "이름", required: true, span: 2, placeholder: "숙소 이름" }, { name: "price", label: "가격", placeholder: "예: 120,000원" },
      { name: "parking", label: "주차 여부", type: "select", options: ["확인 필요", "가능", "불가"] }, { name: "checkin", label: "체크인", type: "time" },
      { name: "checkout", label: "체크아웃", type: "time" }, { name: "address", label: "주소", span: 2 },
      { name: "bookingUrl", label: "예약 URL", type: "url", span: 2, placeholder: "https://..." }, { name: "memo", label: "자유 메모", type: "textarea", span: 2 }
    ]
  }
};

const app = document.querySelector("#app");
const tabs = document.querySelector("#destination-tabs");
const destinationSwitcher = document.querySelector(".destination-switcher");
const destinationSwitcherToggle = document.querySelector("#destination-switcher-toggle");
const importInput = document.querySelector("#import-file");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalForm = document.querySelector("#modal-form");
const modalFields = document.querySelector("#modal-fields");
const modalTitle = document.querySelector("#modal-title");
const modalKicker = document.querySelector("#modal-kicker");
let modalContext = null;
let lastFocusedElement = null;
let saveIndicatorTimer = null;
let isEditMode = false;
let expandedScheduleIds = new Set();
let historyStack = [];
let lastHistorySavedAt = 0;
let firebaseDocumentRef = null;
let firebaseSetDocument = null;
let firebaseReady = false;
let firebaseInitialSnapshotHandled = false;
let firebaseSaveTimer = null;
let firebaseWriteVersion = 0;
let pendingFirebaseWrite = false;
let lastFirebaseSignature = "";
let state = loadState();
let destinationSwitcherCollapsed = loadDestinationSwitcherCollapsed();
let destinationSelectorMode = "map";
let selectedProvince = state.destinations.find((destination) => destination.id === state.selectedId)?.province || "전북";
let mapDrilldownProvince = "";

function makeId(prefix = "item") {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function createScheduleItem(time = "", place = "", type = "기타", duration = "") {
  return { id: makeId("schedule"), time, place, type, duration, address: "", memo: "", cost: 0, parking: "", mapUrl: "", completed: false };
}

function inferProvince(name = "") {
  return DESTINATION_PROVINCES[String(name).trim()] || "기타";
}

function areaBaseName(name = "") {
  return String(name).trim().replace(/(특별자치시|특별시|광역시|특별자치도|도|시|군|구)$/u, "");
}

function inferMunicipality(name = "", province = "기타") {
  const baseName = areaBaseName(name);
  return (MUNICIPALITIES[province] || []).find((municipality) => areaBaseName(municipality) === baseName) || "";
}

function createEmptyDay() {
  return {
    date: "", departureTime: "09:00", weather: "", note: "",
    items: []
  };
}

function createDefaultDay(dayNumber, destinationName = "") {
  const source = DESTINATION_SCHEDULES[destinationName]?.[dayNumber - 1] || LEGACY_GENERIC_DAYS[dayNumber - 1] || [];
  return {
    ...createEmptyDay(),
    items: source.map(([time, place, type, duration, memo = ""]) => ({ ...createScheduleItem(time, place, type, duration), memo }))
  };
}

function isUntouchedLegacyDay(day, dayNumber) {
  const expectedItems = LEGACY_GENERIC_DAYS[dayNumber - 1];
  if (!Array.isArray(expectedItems)) return false;
  if (!day || !Array.isArray(day.items) || day.items.length !== expectedItems.length) return false;
  return day.items.every((item, index) => {
    const [time, place, type, duration] = expectedItems[index];
    return item.time === time && item.place === place && item.type === type && item.duration === duration &&
      !item.memo && !item.address && !item.parking && !item.mapUrl && !(Number(item.cost) > 0) && !item.completed;
  });
}

function createDestination(name, id = makeId("destination"), province = inferProvince(name), municipality = inferMunicipality(name, province)) {
  return {
    id, name, province: REGIONS.some((region) => region.name === province) ? province : "기타", municipality,
    basic: { status: "후보", travelDate: "", departure: "전주", people: 2, accommodation: "", budget: 0, memo: "" },
    days: [createDefaultDay(1, name), createDefaultDay(2, name)],
    candidates: { places: [], restaurants: [], cafes: [], lodgings: [] },
    costs: { fuel: 0, toll: 0, lodging: 0, food: 0, cafe: 0, admission: 0, shopping: 0, other: 0 },
    ledger: { day1: [], day2: [] },
    checklist: ["숙소 예약", "차량 주유", "휴대폰 충전기", "보조배터리", "세면도구", "여벌 옷", "우산", "상비약"].map((text) => ({ id: makeId("check"), text, checked: false })),
    notes: "",
    activeView: "plan",
    activePlaceView: "places",
    collapsed: { places: false, restaurants: true, cafes: true, lodgings: true, costs: false, checklist: false, notes: false }
  };
}

function createInitialState() {
  const destinations = DEFAULT_DESTINATIONS.map((name) => createDestination(name));
  return { version: DATA_VERSION, selectedId: destinations[0].id, destinations };
}

function normalizeSchedule(item = {}) {
  return {
    id: typeof item.id === "string" ? item.id : makeId("schedule"), time: String(item.time || ""), place: String(item.place || "일정"),
    type: SCHEDULE_TYPES.includes(item.type) ? item.type : "기타", duration: String(item.duration || ""), address: String(item.address || ""),
    memo: String(item.memo || ""), cost: Math.max(0, Number(item.cost) || 0), parking: String(item.parking || ""), mapUrl: String(item.mapUrl || ""), completed: Boolean(item.completed)
  };
}

function normalizeExpense(item = {}) {
  return {
    id: typeof item.id === "string" ? item.id : makeId("expense"),
    time: String(item.time || ""),
    category: EXPENSE_CATEGORIES.includes(item.category) ? item.category : "기타",
    title: String(item.title || "지출"),
    amount: Math.max(0, Number(item.amount) || 0),
    memo: String(item.memo || "")
  };
}

function normalizeCandidate(item, kind) {
  const { priority: _removedPriority, ...candidate } = item;
  return { ...candidate, id: typeof item.id === "string" ? item.id : makeId(kind) };
}

function normalizeDestination(destination = {}) {
  if (!destination || typeof destination !== "object") throw new Error("여행지 형식이 올바르지 않습니다.");
  const destinationName = String(destination.name || "새 여행지").slice(0, 50);
  const province = REGIONS.some((region) => region.name === destination.province) ? destination.province : inferProvince(destinationName);
  const municipality = String(destination.municipality || inferMunicipality(destinationName, province));
  const fallback = createDestination(destinationName, typeof destination.id === "string" ? destination.id : undefined, province, municipality);
  const sourceDays = Array.isArray(destination.days) ? destination.days : [];
  const candidates = destination.candidates && typeof destination.candidates === "object" ? destination.candidates : {};
  const basic = destination.basic && typeof destination.basic === "object" ? destination.basic : {};
  const costs = destination.costs && typeof destination.costs === "object" ? destination.costs : {};
  const ledger = destination.ledger && typeof destination.ledger === "object" ? destination.ledger : {};
  const legacyPlaceView = ["places", "restaurants", "cafes"].includes(destination.activeView) ? destination.activeView : "places";
  const activeView = ["places", "restaurants", "cafes"].includes(destination.activeView) ? "placesHub" : (VIEW_TABS.some(([key]) => key === destination.activeView) ? destination.activeView : "plan");
  const dayCount = Math.min(MAX_TRIP_DAYS, Math.max(1, sourceDays.length || fallback.days.length));
  const normalizedDays = Array.from({ length: dayCount }, (_, index) => {
    const fallbackDay = createDefaultDay(index + 1, destinationName);
    const source = sourceDays[index] && typeof sourceDays[index] === "object" ? sourceDays[index] : fallbackDay;
    return {
      date: String(source.date || ""), departureTime: String(source.departureTime || "09:00"), weather: String(source.weather || ""), note: String(source.note || ""),
      items: Array.isArray(source.items) ? source.items.map(normalizeSchedule) : fallbackDay.items
    };
  });
  const migratedDays = DESTINATION_SCHEDULES[destinationName]
    ? normalizedDays.map((day, index) => isUntouchedLegacyDay(day, index + 1) ? createDefaultDay(index + 1, destinationName) : day)
    : normalizedDays;
  return {
    ...fallback,
    id: typeof destination.id === "string" ? destination.id : fallback.id,
    name: destinationName,
    province,
    municipality,
    basic: {
      status: TRIP_STATUSES.includes(basic.status) ? basic.status : "후보", travelDate: String(basic.travelDate || ""), departure: String(basic.departure || "전주"),
      people: Math.max(1, Number(basic.people) || 1), accommodation: String(basic.accommodation || ""), budget: Math.max(0, Number(basic.budget) || 0), memo: String(basic.memo || "")
    },
    days: migratedDays,
    candidates: Object.fromEntries(Object.keys(CANDIDATE_CONFIG).map((kind) => [kind, Array.isArray(candidates[kind]) ? candidates[kind].filter((item) => item && typeof item === "object").map((item) => normalizeCandidate(item, kind)) : []])),
    costs: Object.fromEntries(COST_FIELDS.map(([key]) => [key, Math.max(0, Number(costs[key]) || 0)])),
    ledger: Object.fromEntries(migratedDays.map((_, index) => {
      const key = `day${index + 1}`;
      return [key, Array.isArray(ledger[key]) ? ledger[key].filter((item) => item && typeof item === "object").map(normalizeExpense) : []];
    })),
    checklist: Array.isArray(destination.checklist) ? destination.checklist.filter((item) => item && typeof item === "object").map((item) => ({ id: typeof item.id === "string" ? item.id : makeId("check"), text: String(item.text || "준비 항목"), checked: Boolean(item.checked) })) : fallback.checklist,
    notes: String(destination.notes || ""),
    activeView,
    activePlaceView: PLACE_TABS.some(([key]) => key === destination.activePlaceView) ? destination.activePlaceView : legacyPlaceView,
    collapsed: { ...fallback.collapsed, ...(destination.collapsed && typeof destination.collapsed === "object" ? destination.collapsed : {}) }
  };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.destinations) || raw.destinations.length === 0) throw new Error("여행 플래너 백업 데이터가 아닙니다.");
  const destinations = raw.destinations.map(normalizeDestination);
  const selectedId = destinations.some((item) => item.id === raw.selectedId) ? raw.selectedId : destinations[0].id;
  return { version: DATA_VERSION, selectedId, destinations };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : createInitialState();
  } catch (error) {
    console.warn("저장 데이터를 불러오지 못해 기본 데이터로 시작합니다.", error);
    return createInitialState();
  }
}

function stateSignature(value = state) {
  return JSON.stringify({ version: value.version, selectedId: value.selectedId, destinations: value.destinations });
}

function setSyncStatus(message, status = "connecting") {
  const indicator = document.querySelector("#sync-status");
  if (!indicator) return;
  indicator.textContent = message;
  indicator.dataset.state = status;
}

function updateHeaderControls() {
  const undoButton = document.querySelector("#undo-btn");
  const editButton = document.querySelector("#edit-toggle-btn");
  if (undoButton) {
    undoButton.innerHTML = iconSvg("undo");
    undoButton.disabled = historyStack.length === 0;
  }
  if (editButton) {
    editButton.innerHTML = iconSvg(isEditMode ? "check" : "pencil");
    editButton.setAttribute("aria-pressed", String(isEditMode));
    editButton.setAttribute("aria-label", isEditMode ? "수정 완료" : "수정 모드 켜기");
  }
}

function queueFirebaseSave() {
  pendingFirebaseWrite = true;
  firebaseWriteVersion += 1;
  const writeVersion = firebaseWriteVersion;
  window.clearTimeout(firebaseSaveTimer);
  firebaseSaveTimer = window.setTimeout(() => flushFirebaseSave(writeVersion), 450);
}

async function flushFirebaseSave(writeVersion = firebaseWriteVersion) {
  if (!firebaseReady || !firebaseDocumentRef || !firebaseSetDocument) return;
  const payload = JSON.parse(stateSignature());
  const signature = stateSignature(payload);
  setSyncStatus("Firebase 저장 중", "connecting");
  try {
    await firebaseSetDocument(firebaseDocumentRef, {
      ...payload,
      updatedAt: new Date().toISOString(),
      schema: "domestic-travel-planner"
    });
    lastFirebaseSignature = signature;
    if (writeVersion === firebaseWriteVersion) {
      pendingFirebaseWrite = false;
      setSyncStatus("Firebase 동기화됨", "synced");
    }
  } catch (error) {
    console.error("Firebase 저장 실패", error);
    setSyncStatus("기기에 저장됨 · Firebase 확인 필요", "local");
  }
}

function saveState(options = {}) {
  const quiet = Boolean(options.quiet);
  const recordHistory = options.recordHistory ?? !quiet;
  const sync = options.sync ?? true;
  try {
    const nextRaw = JSON.stringify(state);
    const previousRaw = localStorage.getItem(STORAGE_KEY);
    if (recordHistory && previousRaw && previousRaw !== nextRaw) {
      const now = Date.now();
      if (historyStack.length === 0 || now - lastHistorySavedAt > 700) {
        historyStack.push(previousRaw);
        if (historyStack.length > 30) historyStack.shift();
      }
      lastHistorySavedAt = now;
    }
    localStorage.setItem(STORAGE_KEY, nextRaw);
    if (sync) queueFirebaseSave();
    if (!quiet) showSaved();
    updateHeaderControls();
  } catch (error) {
    console.error("데이터 저장 실패", error);
    showToast("저장 공간이 부족해 변경사항을 저장하지 못했습니다.", "error");
  }
}

function showSaved() {
  const indicator = document.querySelector("#save-indicator");
  if (!indicator) return;
  indicator.textContent = "방금 저장됨";
  window.clearTimeout(saveIndicatorTimer);
  saveIndicatorTimer = window.setTimeout(() => { indicator.textContent = "이 기기에 자동 저장"; }, 1600);
}

function currentDestination() {
  return state.destinations.find((destination) => destination.id === state.selectedId) || state.destinations[0];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function iconSvg(name, className = "icon") {
  const paths = {
    calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    checklist: '<path d="m3 6 2 2 4-4M3 12l2 2 4-4M3 18l2 2 4-4M12 6h9M12 12h9M12 18h9"/>',
    wallet: '<path d="M4 6h15a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12v3"/><path d="M16 13h5M16 13a2 2 0 1 0 0 4h5v-4Z"/>',
    car: '<path d="m5 17-1 2M19 17l1 2M3 12l2-6h14l2 6v6H3Z"/><path d="M5 12h14M7 16h.01M17 16h.01"/>',
    camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z"/><circle cx="12" cy="13" r="3"/>',
    utensils: '<path d="M3 2v8a3 3 0 0 0 6 0V2M6 2v20M15 2v8h5M20 2v20"/>',
    coffee: '<path d="M3 8h14v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z"/><path d="M17 10h2a3 3 0 0 1 0 6h-2M6 2v2M10 2v2M14 2v2"/>',
    bed: '<path d="M3 4v17M21 21v-7a3 3 0 0 0-3-3H3M7 11V7h6a3 3 0 0 1 3 3v1M3 18h18"/>',
    bag: '<path d="M6 8V6a6 6 0 0 1 12 0v2M4 8h16l1 14H3Z"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m10 22 2-7-3-3 2-5 4 3 3 1M6 22l3-7M15 14l3 4"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    undo: '<path d="M9 7 4 12l5 5"/><path d="M4 12h9a7 7 0 0 1 7 7v1"/>',
    pencil: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.pin}</svg>`;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function formatWon(value) { return `${Math.round(Number(value) || 0).toLocaleString("ko-KR")}원`; }
function optionsHtml(options, selected) { return options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join(""); }

function destinationForMunicipality(province, municipality) {
  const municipalityBase = areaBaseName(municipality);
  return state.destinations.find((destination) => destination.province === province &&
    (destination.municipality === municipality || areaBaseName(destination.name) === municipalityBase));
}

function municipalitiesForProvince(province) {
  const configured = MUNICIPALITIES[province] || [];
  const planned = state.destinations.filter((destination) => destination.province === province).map((destination) => destination.municipality || destination.name);
  return [...configured, ...planned.filter((municipality) => !configured.some((item) => areaBaseName(item) === areaBaseName(municipality)))];
}

function assetMunicipalityName(name) {
  if (name.startsWith("전주시 ")) return "전주시";
  if (name.startsWith("창원시 ")) return "창원시";
  return name;
}

function geographicPath({ path, label, action = "", data = {}, className = "", selected = false, labelPath = true }) {
  const dataAttributes = Object.entries(data).map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`).join("");
  const interactiveAttributes = action ? ` data-action="${action}" tabindex="0" role="button" aria-pressed="${selected}"` : ` aria-disabled="true"`;
  return `<path class="geo-shape ${className}" d="${escapeHtml(path.d)}" fill-rule="evenodd" vector-effect="non-scaling-stroke"${interactiveAttributes}${dataAttributes}${labelPath ? ` data-geo-label="${escapeHtml(label)}"` : ""}><title>${escapeHtml(label)}</title></path>`;
}

function renderCountryMap(counts) {
  const mapData = globalThis.KOREA_MAP_DATA?.country;
  if (!mapData) return `<section class="map-data-error"><p>지도 데이터를 불러오지 못했습니다.</p><span>목록 보기에서 여행지를 선택해주세요.</span></section>`;
  const paths = mapData.paths.map((path) => {
    const province = PROVINCE_SVG_NAMES[path.id];
    const available = Boolean(PROVINCE_MAP_KEYS[province]);
    const selected = province === selectedProvince;
    const count = counts[province] || 0;
    return geographicPath({
      path, label: province || path.id, action: available ? "select-province" : "", data: available ? { province } : {}, selected,
      className: `${available ? "is-available" : "is-muted"} ${count ? "has-plan" : ""} ${selected ? "is-selected" : ""}`
    });
  }).join("");
  return `<section class="province-map-card real-map-card" aria-label="대한민국 도 선택 지도">
    <div class="real-map-heading"><div><strong>대한민국</strong><span>도를 선택하세요</span></div><em>ICON MAP</em></div>
    <div class="geographic-map country-geographic-map"><svg class="geo-map" viewBox="${escapeHtml(mapData.viewBox)}" role="group" aria-label="대한민국 시·도 지도">${paths}</svg></div>
    <p>전북·전남·경남을 누르면 실제 행정구역 윤곽의 시·군 지도로 들어갑니다.</p>
  </section>`;
}

function renderMunicipalityMap(province) {
  const region = REGIONS.find((item) => item.name === province);
  const mapData = globalThis.KOREA_MAP_DATA?.[PROVINCE_MAP_KEYS[province]];
  if (!mapData) return `<section class="map-data-error"><p>${escapeHtml(region?.fullName || province)} 지도 준비 중</p><span>목록 보기에서 등록된 여행지를 선택할 수 있습니다.</span></section>`;
  const labelledMunicipalities = new Set();
  const paths = mapData.paths.map((path) => {
    const municipality = assetMunicipalityName(path.id);
    const destination = destinationForMunicipality(province, municipality);
    const selected = destination?.id === state.selectedId;
    const labelPath = !labelledMunicipalities.has(municipality);
    labelledMunicipalities.add(municipality);
    return geographicPath({
      path, label: municipality, action: "select-municipality", data: { province, municipality }, selected, labelPath,
      className: `municipality-shape ${destination ? "has-plan" : ""} ${selected ? "is-selected" : ""}`
    });
  }).join("");
  return `<section class="municipality-map-card" aria-label="${escapeHtml(region?.fullName || province)} 시·군 선택 지도">
    <div class="municipality-map-header">
      <button type="button" data-action="map-back-country" aria-label="전국 지도로 돌아가기">← 전국</button>
      <div><strong>${escapeHtml(region?.fullName || province)}</strong><span>시·군을 선택하세요</span></div>
      <em>ICON MAP</em>
    </div>
    <div class="geographic-map municipality-geographic-map"><svg class="geo-map" viewBox="${escapeHtml(mapData.viewBox)}" role="group" aria-label="${escapeHtml(province)} 시·군 지도">${paths}</svg></div>
    <p>주황색 시·군에는 저장된 계획이 있어요. 다른 시·군을 누르면 새 계획을 만들 수 있습니다.</p>
  </section>`;
}

function placeGeographicLabels() {
  const labelOffsetsByMap = {
    "대한민국 시·도 지도": { "경기": { y: 65 } },
    "전북 시·군 지도": {
      "완주군": { x: 28, y: -22 },
      "전주시": { x: -18, y: 18 }
    },
    "전남 시·군 지도": {
      "강진군": { x: -6, y: 6 },
      "장흥군": { x: 20, y: -18 },
      "담양군": { x: 14 }
    }
  };
  tabs.querySelectorAll(".geo-map").forEach((svg) => {
    const mapLabelOffsets = labelOffsetsByMap[svg.getAttribute("aria-label")] || {};
    svg.querySelectorAll(".geo-map-label").forEach((label) => label.remove());
    svg.querySelectorAll("[data-geo-label]").forEach((shape) => {
      try {
        const box = shape.getBBox();
        const offset = mapLabelOffsets[shape.dataset.geoLabel] || {};
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.classList.add("geo-map-label");
        if (shape.classList.contains("is-muted")) label.classList.add("is-muted");
        if (shape.classList.contains("is-selected")) label.classList.add("is-selected");
        label.setAttribute("x", String(box.x + box.width / 2 + (offset.x || 0)));
        label.setAttribute("y", String(box.y + box.height / 2 + (offset.y || 0)));
        label.textContent = shape.dataset.geoLabel;
        svg.append(label);
      } catch (error) { console.warn("지도 라벨 배치 실패", error); }
    });
  });
}

function renderTabs() {
  const selectedDestination = currentDestination();
  if (!state.destinations.some((destination) => destination.province === selectedProvince)) selectedProvince = selectedDestination.province || "기타";
  const counts = Object.fromEntries(REGIONS.map((region) => [region.name, state.destinations.filter((destination) => destination.province === region.name).length]));
  const activeRegion = REGIONS.find((region) => region.name === selectedProvince) || REGIONS[REGIONS.length - 1];
  const availableRegions = REGIONS.filter((region) => counts[region.name] > 0);
  const visibleDestinations = state.destinations.filter((destination) => destination.province === selectedProvince);
  tabs.innerHTML = `
    <div class="selector-toolbar">
      <div class="selector-mode" role="group" aria-label="여행지 선택 방식">
        <button type="button" data-action="select-selector-mode" data-mode="list" aria-pressed="${destinationSelectorMode === "list"}">목록</button>
        <button type="button" data-action="select-selector-mode" data-mode="map" aria-pressed="${destinationSelectorMode === "map"}">지도 <span>ICON</span></button>
      </div>
      <strong>${escapeHtml(activeRegion.fullName)}</strong>
    </div>
    <div class="province-tabs" role="tablist" aria-label="도·광역시 선택">
      ${availableRegions.map((region) => `<button class="province-tab" type="button" role="tab" aria-selected="${region.name === selectedProvince}" data-action="select-province" data-province="${region.name}">${region.name}<span>${counts[region.name]}</span></button>`).join("")}
    </div>
    ${destinationSelectorMode === "map" ? (mapDrilldownProvince ? renderMunicipalityMap(mapDrilldownProvince) : renderCountryMap(counts)) : ""}
    <div class="city-selector-heading"><span>${escapeHtml(selectedProvince)} 여행지</span><small>${visibleDestinations.length}곳</small></div>
    <nav class="destination-tabs" aria-label="${escapeHtml(selectedProvince)} 여행지 선택" role="tablist">
      ${visibleDestinations.map((destination) => `<button class="tab-button" type="button" role="tab" aria-selected="${destination.id === state.selectedId}" aria-controls="destination-content" data-action="select-destination" data-id="${escapeHtml(destination.id)}">${escapeHtml(destination.name || "이름 없음")}</button>`).join("")}
      <button class="tab-button tab-add" type="button" data-action="add-destination">${iconSvg("plus")}여행지 추가</button>
    </nav>`;
  window.requestAnimationFrame?.(placeGeographicLabels);
}

function scheduleCard(item, dayIndex, itemIndex, totalItems) {
  const mapUrl = safeUrl(item.mapUrl);
  const categoryIcon = iconSvg(CATEGORY_ICONS[item.type] || CATEGORY_ICONS["기타"]);
  if (isEditMode) {
    return `<article class="quick-edit-card schedule-quick-edit" data-schedule-id="${escapeHtml(item.id)}">
      <button class="quick-icon-button" type="button" data-action="cycle-schedule-type" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" aria-label="현재 ${escapeHtml(item.type)} 아이콘, 눌러서 변경" title="${escapeHtml(item.type)} · 눌러서 변경">${categoryIcon}</button>
      <div class="quick-edit-main">
        <div class="quick-edit-row">
          <input class="edit-input quick-time" type="text" value="${escapeHtml(item.time)}" placeholder="시간" aria-label="시간" data-inline-schedule data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="time">
          <input class="edit-input quick-title" type="text" value="${escapeHtml(item.place)}" placeholder="일정 이름" aria-label="일정 이름" data-inline-schedule data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="place">
        </div>
        <input class="edit-input" type="text" value="${escapeHtml(item.duration)}" placeholder="간단한 설명 또는 예상 시간" aria-label="간단한 설명" data-inline-schedule data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="duration">
        <textarea class="edit-input quick-memo" placeholder="이 일정의 메모" aria-label="일정 메모" data-inline-schedule data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="memo">${escapeHtml(item.memo)}</textarea>
        <div class="quick-edit-actions">
          <span class="quick-category-label">${escapeHtml(item.type)}</span>
          <button class="mini-icon-button" type="button" data-action="move-schedule" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-direction="-1" aria-label="위로 이동" ${itemIndex === 0 ? "disabled" : ""}>↑</button>
          <button class="mini-icon-button" type="button" data-action="move-schedule" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-direction="1" aria-label="아래로 이동" ${itemIndex === totalItems - 1 ? "disabled" : ""}>↓</button>
          <button class="text-button" type="button" data-action="duplicate-schedule" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}">복제</button>
          <button class="text-button danger-text push-right" type="button" data-action="delete-schedule" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}">삭제</button>
        </div>
      </div>
    </article>`;
  }
  const expansionKey = `${currentDestination().id}:${dayIndex}:${item.id}`;
  const expanded = expandedScheduleIds.has(expansionKey);
  const detailId = `agenda-detail-${dayIndex}-${item.id}`;
  const detailLines = [
    item.address ? `<span><strong>주소</strong> ${escapeHtml(item.address)}</span>` : "",
    item.parking ? `<span><strong>주차</strong> ${escapeHtml(item.parking)}</span>` : "",
    Number(item.cost) > 0 ? `<span><strong>예상 비용</strong> ${formatWon(item.cost)}</span>` : "",
    mapUrl ? `<a href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">지도 열기</a>` : ""
  ].filter(Boolean).join("");
  return `<article class="agenda-item ${expanded ? "is-open" : ""}" data-schedule-id="${escapeHtml(item.id)}">
    <button class="agenda-summary" type="button" data-action="toggle-agenda" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" aria-expanded="${expanded}" aria-controls="${escapeHtml(detailId)}">
      <time class="agenda-time">${escapeHtml(item.time || "--:--")}</time>
      <span class="category-icon" data-type="${escapeHtml(item.type)}" role="img" aria-label="${escapeHtml(item.type)}" title="${escapeHtml(item.type)}">${categoryIcon}</span>
      <span class="agenda-title"><strong>${escapeHtml(item.place || "이름 없는 일정")}</strong>${item.duration ? `<small>${escapeHtml(item.duration)}</small>` : ""}</span>
      <span class="agenda-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="agenda-detail" id="${escapeHtml(detailId)}" ${expanded ? "" : "hidden"}>
      ${detailLines ? `<div class="agenda-meta">${detailLines}</div>` : ""}
      <div class="agenda-memo"><label for="memo-${dayIndex}-${escapeHtml(item.id)}">${escapeHtml(item.time || "시간 미정")} 메모</label><textarea class="agenda-memo-input" id="memo-${dayIndex}-${escapeHtml(item.id)}" data-schedule-memo data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" placeholder="메모를 바로 입력하세요.">${escapeHtml(item.memo)}</textarea><span class="memo-autosave">입력 내용은 자동 저장됩니다.</span></div>
    </div>
  </article>`;
}

function renderDay(day, dayIndex) {
  const dayNumber = dayIndex + 1;
  const items = day.items.map((item, index) => scheduleCard(item, dayIndex, index, day.items.length)).join("");
  return `<section class="panel day-panel agenda-day" aria-labelledby="day-${dayNumber}-title"><div class="panel-header"><div class="day-number"><span class="day-index">${dayNumber}</span><div><p class="eyebrow">DAY ${dayNumber}</p><h3 id="day-${dayNumber}-title">${dayNumber}일차 목차</h3><p class="panel-description">시간대를 누르면 메모와 세부정보가 열립니다.</p></div></div><span class="agenda-count">${day.items.length}개 일정</span></div><div class="panel-body">
    <div class="agenda-list ${isEditMode ? "is-editing" : ""}">${items || `<div class="empty-state"><p>아직 일정이 없습니다.</p></div>`}</div>
    ${isEditMode ? `<button class="button button-secondary day-add" type="button" data-action="add-schedule" data-day="${dayIndex}">+ 일정 추가</button>` : ""}
  </div></section>`;
}

function candidateMeta(kind, item) {
  const rows = [];
  if (kind === "places") rows.push(["분류", item.category], ["체류", item.duration], ["주소", item.address], ["설명", item.description], ["메모", item.memo]);
  if (kind === "restaurants") rows.push(["대표 메뉴", item.menu], ["가격대", item.priceRange], ["주소", item.address], ["영업시간", item.hours], ["메모", item.memo]);
  if (kind === "cafes") rows.push(["특징", item.feature], ["가격대", item.priceRange], ["주소", item.address], ["메모", item.memo]);
  if (kind === "lodgings") rows.push(["가격", item.price], ["체크인", item.checkin], ["체크아웃", item.checkout], ["주차", item.parking], ["주소", item.address], ["메모", item.memo]);
  const url = kind === "lodgings" ? safeUrl(item.bookingUrl) : safeUrl(item.mapUrl);
  return rows.filter(([, value]) => value).map(([label, value]) => `<p><strong>${label}</strong> · ${escapeHtml(value)}</p>`).join("") + (url ? `<p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${kind === "lodgings" ? "예약 페이지" : "지도"} 새 탭에서 열기</a></p>` : "");
}

function candidateQuickField(kind) {
  if (kind === "restaurants") return { key: "menu", placeholder: "대표 메뉴 또는 태그" };
  if (kind === "cafes") return { key: "feature", placeholder: "카페 특징 또는 태그" };
  return { key: "description", placeholder: "장소 특징 또는 태그" };
}

function renderCandidateCard(kind, item, itemIndex = 0, totalItems = 0) {
  if (isEditMode) {
    const quickField = candidateQuickField(kind);
    const iconName = PLACE_TABS.find(([key]) => key === kind)?.[2] || "pin";
    return `<article class="quick-edit-card candidate-quick-edit">
      <div class="quick-icon-static" aria-hidden="true">${iconSvg(iconName)}</div>
      <div class="quick-edit-main">
        <input class="edit-input quick-title" type="text" value="${escapeHtml(item.name || "")}" placeholder="이름" aria-label="장소 이름" data-inline-candidate data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-field="name">
        <input class="edit-input" type="text" value="${escapeHtml(item[quickField.key] || "")}" placeholder="${quickField.placeholder}" aria-label="${quickField.placeholder}" data-inline-candidate data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-field="${quickField.key}">
        <input class="edit-input" type="url" value="${escapeHtml(item.mapUrl || "")}" placeholder="지도 URL (선택)" aria-label="지도 URL" data-inline-candidate data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-field="mapUrl">
        <textarea class="edit-input quick-memo" placeholder="메모 (선택)" aria-label="장소 메모" data-inline-candidate data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-field="memo">${escapeHtml(item.memo || "")}</textarea>
        <div class="quick-edit-actions">
          <button class="mini-icon-button" type="button" data-action="move-candidate" data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-direction="-1" aria-label="위로 이동" ${itemIndex === 0 ? "disabled" : ""}>↑</button>
          <button class="mini-icon-button" type="button" data-action="move-candidate" data-kind="${kind}" data-id="${escapeHtml(item.id)}" data-direction="1" aria-label="아래로 이동" ${itemIndex === totalItems - 1 ? "disabled" : ""}>↓</button>
          <button class="text-button danger-text push-right" type="button" data-action="delete-candidate" data-kind="${kind}" data-id="${escapeHtml(item.id)}">삭제</button>
        </div>
      </div>
    </article>`;
  }
  return `<article class="candidate-card"><div class="candidate-card-head"><h4>${escapeHtml(item.name || "이름 없는 후보")}</h4></div><div class="candidate-meta">${candidateMeta(kind, item) || `<p>세부 정보를 추가해보세요.</p>`}</div></article>`;
}

function renderCollapsiblePanel(key, title, kicker, description, content, footer = "") {
  const collapsed = Boolean(currentDestination().collapsed[key]);
  return `<section class="panel ${collapsed ? "is-collapsed" : ""}" aria-labelledby="${key}-title"><div class="panel-header"><div class="panel-header-copy"><p class="eyebrow">${kicker}</p><h3 id="${key}-title">${title}</h3><p class="panel-description">${description}</p></div><button class="section-toggle" type="button" data-action="toggle-section" data-section="${key}" aria-expanded="${!collapsed}" aria-label="${title} ${collapsed ? "펼치기" : "접기"}">⌄</button></div><div class="panel-body">${content}${footer}</div></section>`;
}

function renderCandidateSection(kind, destination) {
  const config = CANDIDATE_CONFIG[kind];
  const cards = destination.candidates[kind].map((item, index, list) => renderCandidateCard(kind, item, index, list.length)).join("");
  const content = cards ? `<div class="card-grid">${cards}</div>` : `<div class="empty-state"><p>저장해 둔 ${config.title}가 없습니다.</p><span>마음에 드는 곳을 발견하면 먼저 후보로 보관하세요.</span></div>`;
  const footer = isEditMode ? `<div class="section-footer"><button class="button button-secondary" type="button" data-action="add-candidate" data-kind="${kind}">${config.addLabel}</button></div>` : "";
  return `<section class="panel" aria-labelledby="${kind}-title"><div class="panel-header"><div class="panel-header-copy"><p class="eyebrow">${config.kicker}</p><h3 id="${kind}-title">${config.title}</h3><p class="panel-description">${config.description}</p></div></div><div class="panel-body">${content}${footer}</div></section>`;
}

function calculateCosts(destination = currentDestination()) {
  const categoryTotal = COST_FIELDS.reduce((sum, [key]) => sum + (Number(destination.costs[key]) || 0), 0);
  const dayTotals = destination.days.map((day) => day.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0));
  return { categoryTotal, dayTotals, scheduleTotal: dayTotals.reduce((sum, total) => sum + total, 0), perPerson: categoryTotal / Math.max(1, Number(destination.basic.people) || 1) };
}

function renderCosts(destination) {
  const summary = calculateCosts(destination);
  const inputs = COST_FIELDS.map(([key, label]) => `<div class="field"><label for="cost-${key}">${label}</label><div class="input-prefix"><input class="input" id="cost-${key}" data-bind="costs.${key}" type="number" min="0" step="1000" inputmode="numeric" value="${Number(destination.costs[key]) || 0}" ${isEditMode ? "" : "readonly aria-readonly=\"true\""}><span>원</span></div></div>`).join("");
  const content = `<div class="cost-layout"><div class="cost-inputs">${inputs}</div><aside class="cost-summary" aria-live="polite"><dl>
    <div class="cost-summary-row grand-total"><dt>총 예상 비용</dt><dd id="category-total">${formatWon(summary.categoryTotal)}</dd></div>
    <div class="cost-summary-row"><dt>1인당 예상 비용</dt><dd id="per-person-total">${formatWon(summary.perPerson)}</dd></div>
    ${summary.dayTotals.map((total, index) => `<div class="cost-summary-row"><dt>DAY ${index + 1} 일정 비용</dt><dd id="day-${index + 1}-cost">${formatWon(total)}</dd></div>`).join("")}
    <div class="cost-summary-row"><dt>전체 일정 비용</dt><dd id="schedule-total">${formatWon(summary.scheduleTotal)}</dd></div>
  </dl></aside></div>`;
  return renderCollapsiblePanel("costs", "예상 비용", "BUDGET", "항목별 예산과 일정에 입력한 비용을 한눈에 확인하세요.", content);
}

function expenseIcon(category) {
  return category === "숙박" ? CATEGORY_ICONS["숙소"] : (CATEGORY_ICONS[category] || CATEGORY_ICONS["기타"]);
}

function renderExpenseCard(item, dayIndex) {
  if (isEditMode) {
    return `<article class="quick-edit-card expense-quick-edit">
      <button class="quick-icon-button" type="button" data-action="cycle-expense-category" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" aria-label="현재 ${escapeHtml(item.category)} 분류, 눌러서 변경" title="${escapeHtml(item.category)} · 눌러서 변경">${iconSvg(expenseIcon(item.category))}</button>
      <div class="quick-edit-main">
        <div class="quick-edit-row expense-edit-row">
          <input class="edit-input quick-time" type="text" value="${escapeHtml(item.time)}" placeholder="시간" aria-label="지출 시간" data-inline-expense data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="time">
          <input class="edit-input quick-title" type="text" value="${escapeHtml(item.title)}" placeholder="지출 내역" aria-label="지출 내역" data-inline-expense data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="title">
          <div class="quick-amount"><input class="edit-input" type="number" min="0" step="1000" inputmode="numeric" value="${Number(item.amount) || 0}" placeholder="금액" aria-label="지출 금액" data-inline-expense data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="amount"><span>원</span></div>
        </div>
        <input class="edit-input" type="text" value="${escapeHtml(item.memo || "")}" placeholder="메모 (선택)" aria-label="지출 메모" data-inline-expense data-day="${dayIndex}" data-id="${escapeHtml(item.id)}" data-field="memo">
        <div class="quick-edit-actions"><span class="quick-category-label">${escapeHtml(item.category)}</span><button class="text-button danger-text push-right" type="button" data-action="delete-expense" data-day="${dayIndex}" data-id="${escapeHtml(item.id)}">삭제</button></div>
      </div>
    </article>`;
  }
  return `<article class="expense-card">
    <div class="expense-icon" aria-hidden="true">${iconSvg(expenseIcon(item.category))}</div>
    <div class="expense-main"><div class="expense-heading"><div><span class="expense-time">${escapeHtml(item.time || "시간 미정")}</span><h4>${escapeHtml(item.title || "지출")}</h4></div><strong class="expense-amount">${formatWon(item.amount)}</strong></div><p class="expense-category">${escapeHtml(item.category)}</p>${item.memo ? `<p class="expense-memo">${escapeHtml(item.memo)}</p>` : ""}</div>
  </article>`;
}

function ledgerDayTotal(destination, dayIndex) {
  return (destination.ledger[`day${dayIndex + 1}`] || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

function renderLedgerDay(destination, dayIndex) {
  const items = destination.ledger[`day${dayIndex + 1}`] || [];
  const total = ledgerDayTotal(destination, dayIndex);
  return `<section class="ledger-day" aria-labelledby="ledger-day-${dayIndex + 1}">
    <div class="ledger-day-header"><div><p class="eyebrow">DAY ${dayIndex + 1}</p><h3 id="ledger-day-${dayIndex + 1}">${dayIndex + 1}일차 지출</h3></div><div class="ledger-day-total"><span>${dayIndex + 1}일차에 쓴 금액</span><strong id="ledger-day-total-${dayIndex}">${formatWon(total)}</strong></div></div>
    <div class="expense-list">${items.length ? items.map((item) => renderExpenseCard(item, dayIndex)).join("") : `<div class="empty-state"><p>아직 적은 지출이 없습니다.</p><span>식사, 카페, 이동비처럼 실제로 쓴 금액을 기록하세요.</span></div>`}</div>
    ${isEditMode ? `<button class="button button-secondary ledger-add" type="button" data-action="add-expense" data-day="${dayIndex}">+ ${dayIndex + 1}일차 지출 추가</button>` : ""}
  </section>`;
}

function renderLedger(destination) {
  const grandTotal = destination.days.reduce((sum, _, dayIndex) => sum + ledgerDayTotal(destination, dayIndex), 0);
  return `<section class="panel ledger-panel" aria-labelledby="ledger-title"><div class="panel-header ledger-overview"><div class="panel-header-copy"><p class="eyebrow">TRAVEL LEDGER</p><h3 id="ledger-title">여행 가계부</h3><p class="panel-description">실제로 쓴 금액을 여행 일차별로 나누어 기록하세요.</p></div><div class="ledger-grand-total"><span>총지출</span><strong id="ledger-grand-total">${formatWon(grandTotal)}</strong></div></div><div class="panel-body"><div class="ledger-grid">${destination.days.map((_, dayIndex) => renderLedgerDay(destination, dayIndex)).join("")}</div></div></section>`;
}

function renderChecklist(destination) {
  const items = destination.checklist.map((item, index, list) => isEditMode
    ? `<div class="check-item check-quick-edit"><input class="edit-input" type="text" value="${escapeHtml(item.text)}" placeholder="준비 항목" aria-label="준비 항목" data-inline-checklist data-id="${escapeHtml(item.id)}"><div class="quick-check-actions"><button class="mini-icon-button" type="button" data-action="move-checklist" data-id="${escapeHtml(item.id)}" data-direction="-1" aria-label="위로 이동" ${index === 0 ? "disabled" : ""}>↑</button><button class="mini-icon-button" type="button" data-action="move-checklist" data-id="${escapeHtml(item.id)}" data-direction="1" aria-label="아래로 이동" ${index === list.length - 1 ? "disabled" : ""}>↓</button><button class="text-button danger-text" type="button" data-action="delete-checklist" data-id="${escapeHtml(item.id)}">삭제</button></div></div>`
    : `<div class="check-item ${item.checked ? "is-checked" : ""}"><input id="check-${escapeHtml(item.id)}" type="checkbox" data-action="toggle-checklist" data-id="${escapeHtml(item.id)}" ${item.checked ? "checked" : ""}><label for="check-${escapeHtml(item.id)}">${escapeHtml(item.text)}</label></div>`).join("");
  const content = items ? `<div class="checklist">${items}</div>` : `<div class="empty-state"><p>체크리스트가 비어 있습니다.</p></div>`;
  const footer = isEditMode ? `<button class="button button-secondary quick-add-button" type="button" data-action="add-checklist-quick">+ 준비 항목 추가</button>` : "";
  return renderCollapsiblePanel("checklist", "준비 체크리스트", "PACKING LIST", "체크 상태도 여행지별로 자동 저장됩니다.", content, footer);
}

function renderNotes(destination) {
  const content = `<div class="field"><label for="free-notes">자유 메모</label><textarea class="textarea memo-large" id="free-notes" data-bind="notes" placeholder="비 오는 날의 대체 코스, 먹어볼 음식, 주차 정보, 사진 찍을 장소, 다음 여행 참고사항 등을 자유롭게 적어두세요." ${isEditMode ? "" : "readonly aria-readonly=\"true\""}>${escapeHtml(destination.notes)}</textarea></div>`;
  return renderCollapsiblePanel("notes", "여행 메모", "TRAVEL NOTES", "정리되지 않은 생각도 편하게 남겨두세요.", content);
}

function viewCount(destination, view) {
  if (view === "placesHub") return destination.candidates.places.length + destination.candidates.restaurants.length + destination.candidates.cafes.length;
  if (view === "ledger") return destination.days.reduce((sum, _, index) => sum + (destination.ledger[`day${index + 1}`]?.length || 0), 0);
  return null;
}

function renderPlaceHub(destination) {
  return `<section class="place-hub" aria-labelledby="place-hub-title"><div class="place-hub-heading"><div><p class="eyebrow">SAVED PLACES</p><h3 id="place-hub-title">장소 모음</h3><p>관광지, 맛집, 카페를 한 탭 안에서 나누어 관리하세요.</p></div></div><nav class="place-tabs" role="tablist" aria-label="장소 분류">${PLACE_TABS.map(([key, label, icon]) => `<button class="place-tab" id="place-tab-${key}" type="button" role="tab" aria-selected="${destination.activePlaceView === key}" aria-controls="place-category-panel" data-action="select-place-view" data-place-view="${key}">${iconSvg(icon)}${label}<span class="view-count">${destination.candidates[key].length}</span></button>`).join("")}</nav><div id="place-category-panel" role="tabpanel" aria-labelledby="place-tab-${destination.activePlaceView}">${renderCandidateSection(destination.activePlaceView, destination)}</div></section>`;
}

function renderViewTabs(destination) {
  return `<nav class="view-tabs" role="tablist" aria-label="${escapeHtml(destination.name)} 관리 영역">${VIEW_TABS.map(([key, label, icon]) => {
    const count = viewCount(destination, key);
    return `<button class="view-tab" id="view-tab-${key}" type="button" role="tab" aria-selected="${destination.activeView === key}" aria-controls="active-view-panel" data-action="select-view" data-view="${key}">${iconSvg(icon)}<span>${label}</span>${count !== null ? `<span class="view-count">${count}</span>` : ""}</button>`;
  }).join("")}</nav>`;
}

function tripDurationLabel(dayCount) {
  const days = Math.min(MAX_TRIP_DAYS, Math.max(1, Number(dayCount) || 1));
  return days === 1 ? "당일치기" : `${days - 1}박 ${days}일`;
}

function tripDurationKicker(dayCount) {
  const days = Math.min(MAX_TRIP_DAYS, Math.max(1, Number(dayCount) || 1));
  if (days === 1) return "DAY TRIP";
  const nights = days - 1;
  return `${nights} ${nights === 1 ? "NIGHT" : "NIGHTS"} · ${days} DAYS`;
}

function renderTripDurationEditor(destination) {
  const dayCount = destination.days.length;
  return `<section class="trip-duration-editor" aria-label="여행 기간 설정">
    <div class="trip-duration-copy"><span>여행 기간</span><strong>${tripDurationLabel(dayCount)}</strong><small>당일치기부터 최대 ${MAX_TRIP_DAYS - 1}박 ${MAX_TRIP_DAYS}일까지 설정할 수 있어요.</small></div>
    <div class="trip-duration-stepper" role="group" aria-label="여행 일수 조절">
      <button type="button" data-action="change-trip-days" data-delta="-1" aria-label="여행 일수 하루 줄이기" ${dayCount <= 1 ? "disabled" : ""}>−</button>
      <span><b>${dayCount}</b><small>일</small></span>
      <button type="button" data-action="change-trip-days" data-delta="1" aria-label="여행 일수 하루 늘리기" ${dayCount >= MAX_TRIP_DAYS ? "disabled" : ""}>+</button>
    </div>
  </section>`;
}

function renderActiveView(destination) {
  if (destination.activeView === "placesHub") return renderPlaceHub(destination);
  if (destination.activeView === "ledger") return renderLedger(destination);
  if (destination.activeView === "extras") return renderChecklist(destination);
  return `<div class="plan-intro"><p class="eyebrow">ITINERARY INDEX</p><h3>시간순 여행 목차</h3><p>각 시간대를 눌러 메모를 확인하세요. 수정 모드에서는 바로 메모를 작성할 수 있습니다.</p></div><div class="days-grid agenda-grid">${destination.days.map(renderDay).join("")}</div>`;
}

function renderDestination() {
  const destination = currentDestination();
  if (!destination) return;
  document.title = `${destination.name || "소도시"} 여행 플래너`;
  const headerName = document.querySelector("#current-trip-name");
  if (headerName) headerName.textContent = `${destination.name || "소도시"} 여행`;
  const tripBadge = document.querySelector(".trip-badge");
  if (tripBadge) tripBadge.textContent = tripDurationLabel(destination.days.length);
  app.innerHTML = `<div id="destination-content">
    <section class="destination-heading"><div><p class="eyebrow">${tripDurationKicker(destination.days.length)}</p><h2 id="heading-name">${escapeHtml(destination.name || "이름 없는 여행지")}</h2><p class="heading-copy">${escapeHtml(destination.basic.departure || "전주")} 출발 · 시간순 여행 목차</p></div>${isEditMode ? `<div class="heading-actions"><button class="button button-secondary" type="button" data-action="rename-destination">이름 변경</button><button class="button button-quiet danger-text" type="button" data-action="delete-destination">삭제</button></div>` : ""}</section>
    <div class="edit-mode-note ${isEditMode ? "is-active" : ""}"><span aria-hidden="true">${isEditMode ? "✎" : "○"}</span><p><strong>${isEditMode ? "수정 모드가 켜졌습니다." : "보기 모드입니다."}</strong> ${isEditMode ? "입력, 추가, 삭제, 순서 변경을 마친 뒤 수정 완료를 누르세요." : "체크 항목은 바로 사용할 수 있고, 계획을 바꾸려면 수정 모드를 켜세요."}</p></div>
    ${isEditMode ? renderTripDurationEditor(destination) : ""}
    ${renderViewTabs(destination)}<div class="active-view" id="active-view-panel" role="tabpanel" aria-labelledby="view-tab-${destination.activeView}">${renderActiveView(destination)}</div>
  </div>`;
  updateHeaderControls();
}

function renderAll() {
  selectedProvince = currentDestination().province || "기타";
  renderDestinationSwitcherState();
  renderTabs();
  renderDestination();
}

function loadDestinationSwitcherCollapsed() {
  try {
    return localStorage.getItem(SWITCHER_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function renderDestinationSwitcherState() {
  if (!destinationSwitcher || !destinationSwitcherToggle) return;
  destinationSwitcher.classList.toggle("is-collapsed", destinationSwitcherCollapsed);
  destinationSwitcherToggle.setAttribute("aria-expanded", String(!destinationSwitcherCollapsed));
  const label = destinationSwitcherToggle.querySelector("span");
  if (label) label.textContent = destinationSwitcherCollapsed ? "펼치기" : "접기";
}

function setPath(target, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const parent = parts.reduce((current, key) => current[key], target);
  parent[last] = value;
}

function updateCostOutputs() {
  const summary = calculateCosts();
  const values = { "category-total": summary.categoryTotal, "per-person-total": summary.perPerson, "schedule-total": summary.scheduleTotal };
  summary.dayTotals.forEach((total, index) => { values[`day-${index + 1}-cost`] = total; });
  Object.entries(values).forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.textContent = formatWon(value); });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function addDestination(prefill = {}) {
  openModal({
    title: "새 여행지 추가",
    kicker: "NEW DESTINATION",
    fields: [
      { name: "province", label: "도·광역시", type: "select", options: REGIONS.map((region) => region.name), span: 2 },
      { name: "name", label: "여행지 이름", required: true, span: 2, placeholder: "예: 보성, 산청, 담양" }
    ],
    values: { name: prefill.name || "", province: prefill.province || (selectedProvince === "기타" ? "전북" : selectedProvince) },
    context: { type: "destination", mode: "add" }
  });
}

function renameDestination() {
  const destination = currentDestination();
  openModal({
    title: "여행지 이름 변경",
    kicker: "RENAME DESTINATION",
    fields: [
      { name: "province", label: "도·광역시", type: "select", options: REGIONS.map((region) => region.name), span: 2 },
      { name: "name", label: "여행지 이름", required: true, span: 2 }
    ],
    values: { name: destination.name, province: destination.province },
    context: { type: "destination", mode: "rename" }
  });
}

function deleteDestination() {
  const destination = currentDestination();
  openConfirm("여행지 삭제", `'${destination.name}' 여행지와 모든 계획을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.`, () => {
    state.destinations = state.destinations.filter((item) => item.id !== destination.id);
    if (state.destinations.length === 0) state.destinations.push(createDestination("새 여행지"));
    state.selectedId = state.destinations[0].id;
    selectedProvince = currentDestination().province;
    saveState(); renderAll(); showToast("여행지를 삭제했습니다.");
  }, "여행지 삭제");
}

function findSchedule(dayIndex, id) {
  const items = currentDestination().days[dayIndex]?.items || [];
  const index = items.findIndex((item) => item.id === id);
  return { items, index, item: items[index] };
}

function changeTripDays(delta) {
  const destination = currentDestination();
  const currentCount = destination.days.length;
  const nextCount = Math.min(MAX_TRIP_DAYS, Math.max(1, currentCount + delta));
  if (nextCount === currentCount) return;

  if (nextCount > currentCount) {
    destination.days.push(createEmptyDay());
    destination.ledger[`day${nextCount}`] = [];
    saveState();
    renderDestination();
    showToast(`${tripDurationLabel(nextCount)} 일정으로 변경했습니다.`);
    return;
  }

  const lastDayIndex = currentCount - 1;
  const lastDay = destination.days[lastDayIndex];
  const lastDayExpenses = destination.ledger[`day${currentCount}`] || [];
  const hasSavedContent = lastDay.items.length > 0 || lastDayExpenses.length > 0 || lastDay.date || lastDay.note || lastDay.weather;
  const applyDecrease = () => {
    destination.days.pop();
    delete destination.ledger[`day${currentCount}`];
    expandedScheduleIds = new Set([...expandedScheduleIds].filter((key) => !key.startsWith(`${destination.id}:${lastDayIndex}:`)));
    saveState();
    renderDestination();
    showToast(`${tripDurationLabel(nextCount)} 일정으로 변경했습니다.`);
  };

  if (hasSavedContent) {
    openConfirm("여행 기간 줄이기", `${currentCount}일차의 일정과 가계부 기록이 함께 삭제됩니다. ${tripDurationLabel(nextCount)}로 변경할까요?`, applyDecrease, "기간 줄이기");
  } else applyDecrease();
}

function addScheduleItem(dayIndex, item) {
  currentDestination().days[dayIndex].items.push(item || createScheduleItem());
  saveState(); renderDestination();
  requestAnimationFrame(() => {
    const fields = document.querySelectorAll(`[data-inline-schedule][data-day="${dayIndex}"][data-field="place"]`);
    fields[fields.length - 1]?.focus();
  });
}

function updateScheduleItem(dayIndex, id, values) {
  const item = findSchedule(dayIndex, id).item;
  if (item) Object.assign(item, values);
  saveState(); renderDestination();
}

function moveScheduleItem(dayIndex, id, direction) {
  const { items, index } = findSchedule(dayIndex, id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
  [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
  saveState(); renderDestination();
}

function duplicateScheduleItem(dayIndex, id) {
  const { items, index, item } = findSchedule(dayIndex, id);
  if (!item) return;
  items.splice(index + 1, 0, { ...item, id: makeId("schedule"), place: `${item.place} 복사본`, completed: false });
  saveState(); renderDestination(); showToast("일정을 복제했습니다.");
}

function deleteScheduleItem(dayIndex, id) {
  const { items, index, item } = findSchedule(dayIndex, id);
  if (!item) return;
  openConfirm("일정 삭제", `'${item.place}' 일정을 삭제할까요?`, () => {
    items.splice(index, 1);
    saveState(); renderDestination(); showToast("일정을 삭제했습니다.");
  }, "일정 삭제");
}

function cycleScheduleType(dayIndex, id) {
  const item = findSchedule(dayIndex, id).item;
  if (!item) return;
  const currentIndex = SCHEDULE_TYPES.indexOf(item.type);
  item.type = SCHEDULE_TYPES[(currentIndex + 1) % SCHEDULE_TYPES.length];
  saveState(); renderDestination();
}

function modalFieldHtml(field, value = "") {
  const id = `modal-field-${field.name}`;
  const className = field.span === 2 ? "field span-2" : "field";
  const required = field.required ? "required" : "";
  let control;
  if (field.type === "select") control = `<select class="select" id="${id}" name="${field.name}" ${required}>${optionsHtml(field.options, value || field.options[0])}</select>`;
  else if (field.type === "textarea") control = `<textarea class="textarea" id="${id}" name="${field.name}" placeholder="${escapeHtml(field.placeholder || "")}" ${required}>${escapeHtml(value)}</textarea>`;
  else control = `<input class="input" id="${id}" name="${field.name}" type="${field.type || "text"}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.step !== undefined ? `step="${field.step}"` : ""} ${required}>`;
  return `<div class="${className}"><label for="${id}">${field.label}</label>${control}</div>`;
}

function openModal({ title, kicker, fields, values, context }) {
  lastFocusedElement = document.activeElement;
  modalContext = context;
  modalTitle.textContent = title;
  modalKicker.textContent = kicker;
  modalFields.innerHTML = fields.map((field) => modalFieldHtml(field, values?.[field.name] ?? "")).join("");
  const submitButton = modalForm.querySelector('[type="submit"]');
  submitButton.textContent = "저장";
  submitButton.classList.remove("danger-button");
  modalBackdrop.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => modalForm.querySelector("input, select, textarea")?.focus());
}

function openConfirm(title, message, onConfirm, confirmLabel = "확인") {
  openModal({ title, kicker: "PLEASE CONFIRM", fields: [], values: {}, context: { type: "confirm", onConfirm } });
  modalFields.innerHTML = `<p class="confirm-copy">${escapeHtml(message)}</p>`;
  const submitButton = modalForm.querySelector('[type="submit"]');
  submitButton.textContent = confirmLabel;
  submitButton.classList.add("danger-button");
  submitButton.focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.classList.remove("modal-open");
  modalContext = null;
  lastFocusedElement?.focus?.();
}

function openScheduleModal(dayIndex, id = null) {
  const item = id ? findSchedule(dayIndex, id).item : createScheduleItem();
  openModal({
    title: id ? "일정 수정" : `DAY ${dayIndex + 1} 일정 추가`, kicker: `DAY ${dayIndex + 1} · SCHEDULE`, values: item, context: { type: "schedule", dayIndex, id },
    fields: [
      { name: "time", label: "시간", type: "time", required: true }, { name: "type", label: "일정 종류", type: "select", options: SCHEDULE_TYPES },
      { name: "place", label: "장소명", required: true, span: 2, placeholder: "장소 또는 일정 이름" }, { name: "duration", label: "예상 체류시간", placeholder: "예: 1시간" },
      { name: "cost", label: "예상 비용", type: "number", min: 0, step: 1000 }, { name: "address", label: "주소", span: 2 },
      { name: "parking", label: "주차 정보", span: 2, placeholder: "예: 전용 주차장, 2시간 무료" }, { name: "mapUrl", label: "지도 URL", type: "url", span: 2, placeholder: "https://..." },
      { name: "memo", label: "메모", type: "textarea", span: 2 }
    ]
  });
}

function openCandidateModal(kind, id = null) {
  const config = CANDIDATE_CONFIG[kind];
  const item = id ? currentDestination().candidates[kind].find((candidate) => candidate.id === id) : {};
  openModal({ title: id ? `${config.title} 수정` : config.addLabel.replace("+ ", ""), kicker: config.kicker, fields: config.fields, values: item, context: { type: "candidate", kind, id } });
}

function findExpense(dayIndex, id) {
  const list = currentDestination().ledger[`day${dayIndex + 1}`];
  return { list, item: list.find((expense) => expense.id === id), index: list.findIndex((expense) => expense.id === id) };
}

function openExpenseModal(dayIndex, id = null) {
  const item = id ? findExpense(dayIndex, id).item : { time: "", category: "식사", title: "", amount: 0, memo: "" };
  openModal({
    title: id ? `${dayIndex + 1}일차 지출 수정` : `${dayIndex + 1}일차 지출 추가`, kicker: `DAY ${dayIndex + 1} · LEDGER`, values: item, context: { type: "expense", dayIndex, id },
    fields: [
      { name: "time", label: "시간", type: "time" }, { name: "category", label: "분류", type: "select", options: EXPENSE_CATEGORIES },
      { name: "title", label: "사용처 또는 항목", required: true, span: 2, placeholder: "예: 점심 산채정식" },
      { name: "amount", label: "금액", type: "number", min: 0, step: 1000 },
      { name: "memo", label: "메모", type: "textarea", span: 2, placeholder: "결제 수단, 함께 낸 사람 등" }
    ]
  });
}

function deleteExpense(dayIndex, id) {
  const { list, item, index } = findExpense(dayIndex, id);
  if (!item) return;
  openConfirm("지출 삭제", `'${item.title}' 지출 ${formatWon(item.amount)}을 삭제할까요?`, () => {
    list.splice(index, 1);
    saveState(); renderDestination(); showToast("지출을 삭제했습니다.");
  }, "지출 삭제");
}

function addExpenseQuick(dayIndex) {
  currentDestination().ledger[`day${dayIndex + 1}`].push({ id: makeId("expense"), time: "", category: "식사", title: "", amount: 0, memo: "" });
  saveState(); renderDestination();
  requestAnimationFrame(() => {
    const fields = document.querySelectorAll(`[data-inline-expense][data-day="${dayIndex}"][data-field="title"]`);
    fields[fields.length - 1]?.focus();
  });
}

function cycleExpenseCategory(dayIndex, id) {
  const item = findExpense(dayIndex, id).item;
  if (!item) return;
  const currentIndex = EXPENSE_CATEGORIES.indexOf(item.category);
  item.category = EXPENSE_CATEGORIES[(currentIndex + 1) % EXPENSE_CATEGORIES.length];
  saveState(); renderDestination();
}

function saveModal(event) {
  event.preventDefault();
  if (!modalContext) return;
  if (modalContext.type === "confirm") {
    const onConfirm = modalContext.onConfirm;
    closeModal();
    onConfirm();
    return;
  }
  const shouldRenderAll = modalContext.type === "destination";
  const values = Object.fromEntries(new FormData(modalForm).entries());
  if (modalContext.type === "destination") {
    const cleanName = String(values.name || "").trim().slice(0, 50);
    const cleanProvince = REGIONS.some((region) => region.name === values.province) ? values.province : "기타";
    if (!cleanName) return showToast("여행지 이름을 입력해주세요.", "error");
    if (modalContext.mode === "add") {
      const destination = createDestination(cleanName, undefined, cleanProvince);
      state.destinations.push(destination);
      state.selectedId = destination.id;
      selectedProvince = cleanProvince;
    } else {
      currentDestination().name = cleanName;
      currentDestination().province = cleanProvince;
      currentDestination().municipality = inferMunicipality(cleanName, cleanProvince);
      selectedProvince = cleanProvince;
    }
    saveState();
  } else if (modalContext.type === "schedule") {
    values.cost = Math.max(0, Number(values.cost) || 0);
    if (modalContext.id) updateScheduleItem(modalContext.dayIndex, modalContext.id, values);
    else addScheduleItem(modalContext.dayIndex, { ...createScheduleItem(), ...values });
  } else if (modalContext.type === "expense") {
    values.amount = Math.max(0, Number(values.amount) || 0);
    const list = currentDestination().ledger[`day${modalContext.dayIndex + 1}`];
    if (modalContext.id) {
      const item = list.find((expense) => expense.id === modalContext.id);
      if (item) Object.assign(item, values);
    } else list.push({ id: makeId("expense"), ...values });
    saveState();
  } else {
    const list = currentDestination().candidates[modalContext.kind];
    if (modalContext.id) {
      const item = list.find((candidate) => candidate.id === modalContext.id);
      if (item) Object.assign(item, values);
    } else list.push({ id: makeId(modalContext.kind), ...values });
    saveState();
  }
  closeModal();
  if (shouldRenderAll) renderAll();
  else renderDestination();
  showToast("저장했습니다.");
}

function candidateToDay(kind, id, dayIndex) {
  const candidate = currentDestination().candidates[kind].find((item) => item.id === id);
  if (!candidate) return;
  currentDestination().days[dayIndex].items.push({
    ...createScheduleItem("", candidate.name, SCHEDULE_TYPES.includes(candidate.category) ? candidate.category : "관광", candidate.duration || ""),
    address: candidate.address || "", memo: [candidate.description, candidate.memo].filter(Boolean).join(" · "), mapUrl: candidate.mapUrl || ""
  });
  saveState(); renderDestination(); showToast(`DAY ${dayIndex + 1}에 추가했습니다. 원본 후보는 유지됩니다.`);
}

function addCandidateQuick(kind) {
  const defaults = {
    places: { category: "관광", description: "", duration: "", address: "", mapUrl: "", memo: "" },
    restaurants: { menu: "", priceRange: "", address: "", hours: "", mapUrl: "", memo: "" },
    cafes: { feature: "", priceRange: "", address: "", mapUrl: "", memo: "" }
  };
  currentDestination().candidates[kind].push({ id: makeId(kind), name: "", ...(defaults[kind] || { memo: "" }) });
  saveState(); renderDestination();
  requestAnimationFrame(() => {
    const fields = document.querySelectorAll(`[data-inline-candidate][data-kind="${kind}"][data-field="name"]`);
    fields[fields.length - 1]?.focus();
  });
}

function moveCandidateItem(kind, id, direction) {
  const list = currentDestination().candidates[kind];
  const index = list.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  saveState(); renderDestination();
}

function deleteCandidate(kind, id) {
  const list = currentDestination().candidates[kind];
  const item = list.find((candidate) => candidate.id === id);
  if (!item) return;
  openConfirm("후보 삭제", `'${item.name}' 후보를 삭제할까요?`, () => {
    currentDestination().candidates[kind] = list.filter((candidate) => candidate.id !== id);
    saveState(); renderDestination();
  }, "후보 삭제");
}

function addChecklist(text) {
  const cleanText = text.trim();
  if (!cleanText) return;
  currentDestination().checklist.push({ id: makeId("check"), text: cleanText.slice(0, 80), checked: false });
  saveState(); renderDestination();
}

function addChecklistQuick() {
  currentDestination().checklist.push({ id: makeId("check"), text: "", checked: false });
  saveState(); renderDestination();
  requestAnimationFrame(() => {
    const fields = document.querySelectorAll("[data-inline-checklist]");
    fields[fields.length - 1]?.focus();
  });
}

function moveChecklistItem(id, direction) {
  const list = currentDestination().checklist;
  const index = list.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  saveState(); renderDestination();
}

function exportData() {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `travel-planner-backup-${date}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("전체 데이터를 JSON으로 내보냈습니다.");
}

async function importData(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const restored = normalizeState(parsed);
    openConfirm("백업 데이터 불러오기", `여행지 ${restored.destinations.length}개의 백업으로 현재 데이터를 교체할까요?`, () => {
      state = restored;
      saveState(); renderAll(); showToast("백업 데이터를 불러왔습니다.");
    }, "데이터 교체");
  } catch (error) {
    console.warn("백업 불러오기 실패", error);
    showToast(error.message || "올바른 JSON 백업 파일이 아닙니다.", "error");
  } finally { importInput.value = ""; }
}

function resetCurrent() {
  const destination = currentDestination();
  openConfirm("현재 여행지 초기화", `'${destination.name}'의 모든 입력과 일정을 기본값으로 되돌릴까요?`, () => {
    const index = state.destinations.findIndex((item) => item.id === destination.id);
    state.destinations[index] = createDestination(destination.name, destination.id, destination.province, destination.municipality);
    saveState(); renderAll(); showToast("현재 여행지를 초기화했습니다.");
  }, "초기화");
}

function resetAll() {
  openConfirm("전체 데이터 초기화", "모든 여행지와 저장 데이터를 초기 상태로 되돌릴까요? 이 작업은 되돌릴 수 없습니다.", () => {
    state = createInitialState();
    saveState(); renderAll(); showToast("전체 데이터를 초기화했습니다.");
  }, "전체 초기화");
}

function undoAction() {
  const previousRaw = historyStack.pop();
  if (!previousRaw) return;
  try {
    state = normalizeState(JSON.parse(previousRaw));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    lastHistorySavedAt = 0;
    queueFirebaseSave();
    renderAll();
    showToast("마지막 수정을 되돌렸습니다.");
  } catch (error) {
    console.error("실행 취소 실패", error);
    historyStack = [];
    updateHeaderControls();
    showToast("이 변경은 되돌릴 수 없습니다.", "error");
  }
}

async function connectFirebase() {
  setSyncStatus("Firebase 연결 중", "connecting");
  try {
    const [appModule, firestoreModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js")
    ]);
    const firebaseApp = appModule.initializeApp(FIREBASE_CONFIG);
    const firestore = firestoreModule.getFirestore(firebaseApp);
    firebaseDocumentRef = firestoreModule.doc(firestore, FIREBASE_COLLECTION, FIREBASE_DOCUMENT);
    firebaseSetDocument = firestoreModule.setDoc;
    firebaseReady = true;

    firestoreModule.onSnapshot(firebaseDocumentRef, (snapshot) => {
      try {
        if (!firebaseInitialSnapshotHandled) {
          firebaseInitialSnapshotHandled = true;
          if (!snapshot.exists() || pendingFirebaseWrite) {
            queueFirebaseSave();
            return;
          }
          const remotePayload = snapshot.data();
          const remoteNeedsUpgrade = Number(remotePayload.version) !== DATA_VERSION;
          const remoteState = normalizeState(remotePayload);
          state = remoteState;
          lastFirebaseSignature = stateSignature(remoteState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          historyStack = [];
          renderAll();
          setSyncStatus("Firebase 동기화됨", "synced");
          if (remoteNeedsUpgrade) queueFirebaseSave();
          return;
        }

        if (!snapshot.exists()) {
          queueFirebaseSave();
          return;
        }
        const remoteState = normalizeState(snapshot.data());
        const remoteSignature = stateSignature(remoteState);
        if (pendingFirebaseWrite || remoteSignature === stateSignature() || remoteSignature === lastFirebaseSignature) {
          setSyncStatus("Firebase 동기화됨", "synced");
          return;
        }
        state = remoteState;
        lastFirebaseSignature = remoteSignature;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        historyStack = [];
        renderAll();
        setSyncStatus("Firebase 동기화됨", "synced");
        showToast("다른 기기의 변경사항을 불러왔습니다.");
      } catch (error) {
        console.error("Firebase 데이터 처리 실패", error);
        setSyncStatus("기기에 저장됨 · Firebase 확인 필요", "local");
      }
    }, (error) => {
      console.error("Firebase 실시간 연결 실패", error);
      setSyncStatus("기기에 저장됨 · Firebase 확인 필요", "local");
    });
  } catch (error) {
    console.error("Firebase 모듈 연결 실패", error);
    setSyncStatus("기기에 저장됨 · Firebase 확인 필요", "local");
  }
}

function updateLedgerOutputs() {
  const destination = currentDestination();
  const dayTotals = destination.days.map((_, dayIndex) => ledgerDayTotal(destination, dayIndex));
  const grandTotal = document.querySelector("#ledger-grand-total");
  if (grandTotal) grandTotal.textContent = formatWon(dayTotals.reduce((sum, total) => sum + total, 0));
  dayTotals.forEach((total, dayIndex) => {
    const output = document.querySelector(`#ledger-day-total-${dayIndex}`);
    if (output) output.textContent = formatWon(total);
  });
}

function handleInlineEditor(target) {
  if (!isEditMode) return false;
  let changed = false;
  if (target.matches("[data-inline-schedule]")) {
    const item = findSchedule(Number(target.dataset.day), target.dataset.id).item;
    if (item) { item[target.dataset.field] = target.value; changed = true; }
  } else if (target.matches("[data-inline-candidate]")) {
    const item = currentDestination().candidates[target.dataset.kind]?.find((entry) => entry.id === target.dataset.id);
    if (item) { item[target.dataset.field] = target.value; changed = true; }
  } else if (target.matches("[data-inline-expense]")) {
    const item = findExpense(Number(target.dataset.day), target.dataset.id).item;
    if (item) {
      item[target.dataset.field] = target.dataset.field === "amount" ? Math.max(0, Number(target.value) || 0) : target.value;
      changed = true;
      updateLedgerOutputs();
    }
  } else if (target.matches("[data-inline-checklist]")) {
    const item = currentDestination().checklist.find((entry) => entry.id === target.dataset.id);
    if (item) { item.text = target.value; changed = true; }
  }
  if (changed) saveState({ quiet: true, recordHistory: true });
  return changed;
}

function handleBoundInput(target) {
  const path = target.dataset.bind;
  if (!path) return;
  if (!isEditMode) return;
  let value = target.type === "number" ? Math.max(Number(target.min || 0), Number(target.value) || 0) : target.value;
  if (path === "basic.people") value = Math.max(1, value || 1);
  setPath(currentDestination(), path, value);
  saveState();
  if (path === "name") {
    renderTabs();
    const heading = document.querySelector("#heading-name");
    if (heading) heading.textContent = value || "이름 없는 여행지";
  }
  if (path === "basic.status") {
    const chip = document.querySelector("#heading-status");
    if (chip) chip.textContent = value;
  }
  if (path === "basic.departure") {
    const copy = document.querySelector(".heading-copy");
    if (copy) copy.textContent = `${value || "전주"} 출발 · 시간순 여행 목차`;
  }
  if (path.startsWith("costs.") || path === "basic.people") updateCostOutputs();
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (handleInlineEditor(target)) return;
  if (target.matches("[data-schedule-memo]")) {
    const item = findSchedule(Number(target.dataset.day), target.dataset.id).item;
    if (item) item.memo = target.value;
    saveState({ quiet: true, recordHistory: true });
    return;
  }
  handleBoundInput(target);
});
document.addEventListener("change", (event) => {
  const target = event.target;
  handleBoundInput(target);
  if (target.matches('[data-action="toggle-checklist"]')) {
    const item = currentDestination().checklist.find((entry) => entry.id === target.dataset.id);
    if (item) item.checked = target.checked;
    saveState(); renderDestination();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target === modalForm) return saveModal(event);
  if (event.target.id === "checklist-form") {
    event.preventDefault();
    addChecklist(new FormData(event.target).get("text") || "");
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "toggle-destination-switcher") {
    destinationSwitcherCollapsed = !destinationSwitcherCollapsed;
    try {
      localStorage.setItem(SWITCHER_COLLAPSED_KEY, String(destinationSwitcherCollapsed));
    } catch {
      // 저장이 제한된 브라우저에서도 현재 화면의 접기·펼치기는 계속 동작합니다.
    }
    renderDestinationSwitcherState();
  }
  if (action === "select-destination") {
    const destinationChanged = state.selectedId !== button.dataset.id;
    state.selectedId = button.dataset.id;
    selectedProvince = currentDestination().province || "기타";
    if (destinationChanged) currentDestination().activeView = "plan";
    isEditMode = false;
    saveState({ quiet: true });
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "select-selector-mode") {
    destinationSelectorMode = button.dataset.mode === "list" ? "list" : "map";
    if (destinationSelectorMode === "map") mapDrilldownProvince = "";
    renderTabs();
  }
  if (action === "select-province") {
    const province = button.dataset.province;
    if (!REGIONS.some((region) => region.name === province)) return;
    if (destinationSelectorMode === "map") {
      selectedProvince = province;
      mapDrilldownProvince = province;
      renderTabs();
      return;
    }
    const regionChanged = currentDestination().province !== province;
    selectedProvince = province;
    if (regionChanged) {
      const firstDestination = state.destinations.find((destination) => destination.province === province);
      if (firstDestination) {
        state.selectedId = firstDestination.id;
        firstDestination.activeView = "plan";
        isEditMode = false;
        saveState({ quiet: true });
        renderAll();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else renderTabs();
  }
  if (action === "map-back-country") {
    mapDrilldownProvince = "";
    selectedProvince = currentDestination().province || "기타";
    renderTabs();
  }
  if (action === "select-municipality") {
    const province = button.dataset.province;
    const municipality = button.dataset.municipality;
    const destination = destinationForMunicipality(province, municipality);
    if (destination) {
      const destinationChanged = state.selectedId !== destination.id;
      state.selectedId = destination.id;
      selectedProvince = province;
      if (destinationChanged) destination.activeView = "plan";
      isEditMode = false;
      saveState({ quiet: true });
      renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else addDestination({ province, name: areaBaseName(municipality) });
  }
  if (action === "select-view") { currentDestination().activeView = button.dataset.view; saveState({ quiet: true }); renderDestination(); }
  if (action === "select-place-view") { currentDestination().activePlaceView = button.dataset.placeView; saveState({ quiet: true }); renderDestination(); }
  if (action === "toggle-agenda") {
    const key = `${currentDestination().id}:${button.dataset.day}:${button.dataset.id}`;
    if (expandedScheduleIds.has(key)) expandedScheduleIds.delete(key);
    else expandedScheduleIds.add(key);
    renderDestination();
  }
  if (action === "undo-action") undoAction();
  if (action === "toggle-edit-mode") { isEditMode = !isEditMode; renderDestination(); showToast(isEditMode ? "수정 모드를 시작했습니다." : "수정을 마쳤습니다."); }
  if (action === "change-trip-days") changeTripDays(Number(button.dataset.delta));
  if (action === "add-destination") addDestination();
  if (action === "rename-destination") renameDestination();
  if (action === "delete-destination") deleteDestination();
  if (action === "add-schedule") addScheduleItem(Number(button.dataset.day));
  if (action === "edit-schedule") openScheduleModal(Number(button.dataset.day), button.dataset.id);
  if (action === "cycle-schedule-type") cycleScheduleType(Number(button.dataset.day), button.dataset.id);
  if (action === "move-schedule") moveScheduleItem(Number(button.dataset.day), button.dataset.id, Number(button.dataset.direction));
  if (action === "duplicate-schedule") duplicateScheduleItem(Number(button.dataset.day), button.dataset.id);
  if (action === "delete-schedule") deleteScheduleItem(Number(button.dataset.day), button.dataset.id);
  if (action === "add-expense") addExpenseQuick(Number(button.dataset.day));
  if (action === "edit-expense") openExpenseModal(Number(button.dataset.day), button.dataset.id);
  if (action === "cycle-expense-category") cycleExpenseCategory(Number(button.dataset.day), button.dataset.id);
  if (action === "delete-expense") deleteExpense(Number(button.dataset.day), button.dataset.id);
  if (action === "add-candidate") addCandidateQuick(button.dataset.kind);
  if (action === "edit-candidate") openCandidateModal(button.dataset.kind, button.dataset.id);
  if (action === "move-candidate") moveCandidateItem(button.dataset.kind, button.dataset.id, Number(button.dataset.direction));
  if (action === "delete-candidate") deleteCandidate(button.dataset.kind, button.dataset.id);
  if (action === "candidate-to-day") candidateToDay(button.dataset.kind, button.dataset.id, Number(button.dataset.day));
  if (action === "delete-checklist") {
    currentDestination().checklist = currentDestination().checklist.filter((item) => item.id !== button.dataset.id);
    saveState(); renderDestination();
  }
  if (action === "add-checklist-quick") addChecklistQuick();
  if (action === "move-checklist") moveChecklistItem(button.dataset.id, Number(button.dataset.direction));
  if (action === "toggle-section") {
    const destination = currentDestination();
    destination.collapsed[button.dataset.section] = !destination.collapsed[button.dataset.section];
    saveState({ quiet: true }); renderDestination();
  }
  if (action === "close-modal") closeModal();
  if (action === "export-data") exportData();
  if (action === "trigger-import") importInput.click();
  if (action === "reset-current") resetCurrent();
  if (action === "reset-all") resetAll();
});

modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });

document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches?.('.geo-shape[role="button"]')) {
    event.preventDefault();
    event.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return;
  }
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
  if (event.key === "Tab" && !modalBackdrop.hidden) {
    const focusable = [...modalBackdrop.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

importInput.addEventListener("change", () => importData(importInput.files?.[0]));
renderAll();
connectFirebase();
