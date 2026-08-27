# 소도시 여행 플래너

전주에서 출발하는 국내 소도시 1박 2일 여행을 여행지별로 계획하고 관리하는 개인용 웹앱입니다. Firestore의 국내여행 전용 영역과 브라우저의 `localStorage`에 내용을 함께 저장합니다.

## 실행 방법

1. `travel-planner` 폴더의 `index.html`을 더블클릭합니다.
2. Chrome, Edge, Safari, Firefox 등 최신 브라우저로 엽니다.
3. 여행지를 선택한 뒤 헤더의 연필 아이콘을 눌러 계획, 장소, 가계부 등을 입력합니다.

npm 설치나 빌드는 필요하지 않습니다. 인터넷 또는 Firebase 연결이 끊겨도 기기 저장본을 계속 사용할 수 있습니다.

## 파일 구조

```text
travel-planner/
├─ index.html   # 앱의 기본 문서, 여행지 선택 영역, 모달 구조
├─ styles.css   # 참고 앱 기반 모바일 카드형 반응형 디자인
├─ app.js       # 데이터 모델, 편집, 실행 취소, 로컬·Firebase 동기화
├─ assets/maps/ # 앱에 내장된 단순 행정구역 지도 데이터와 원본 라이선스
└─ README.md    # 사용 및 유지보수 안내
```

## 주요 기능

- 구례, 하동, 곡성, 무주, 진안, 순창, 남원 기본 여행지 제공
- 여행지를 도·광역시별로 분류하고 목록 또는 단순 행정구역 아이콘 지도에서 지역 선택
- 여행지 선택 영역을 접고 펼칠 수 있으며 현재 기기의 선택 상태를 기억
- 실제 행정구역 윤곽을 단순화한 전국 지도에서 도를 고른 뒤 전북·전남·경남 시·군 지도에서 여행지 선택
- 전국·시군 지도를 넓게 표시하고 수도권의 인접 라벨이 겹치지 않도록 배치
- 계획이 없는 시·군을 누르면 해당 지역의 새 여행 계획 작성 화면 제공
- 새 여행지 추가·이름 변경 시 소속 도·광역시를 함께 지정
- 구례·하동은 전주 출발 기준 대표 명소를 반영한 1박 2일 기본 일정과 시간대별 메모 제공
- 이전 버전의 일반 문구 일정은 구례·하동 코스로 자동 교체하되, 사용자가 수정한 일정은 그대로 보존
- 여행지 추가, 이름 변경, 삭제, 현재 여행지·전체 데이터 초기화
- 하단 고정 메뉴에서 일정, 장소, 체크, 가계부를 빠르게 전환
- 장소 모음 안에서 관광지, 맛집, 카페를 다시 세분화
- 보기 모드와 수정 모드를 분리해 실수로 내용을 바꾸는 상황 방지
- 헤더의 연필 아이콘으로 수정 모드 전환, 옆의 되돌리기 아이콘으로 마지막 수정 취소
- 수정 모드에서 별도 입력창 없이 카드 안에서 시간·이름·설명·메모를 바로 편집
- 추가 버튼을 누르면 빈 항목이 즉시 생기며 입력할 첫 칸으로 자동 이동
- 일정·지출 아이콘을 누르면 분류가 순서대로 변경
- DAY 1·2 일정을 시간순 목차형 아코디언으로 관리
- 각 시간대를 누르면 메모 입력창이 열리며 수정 모드와 관계없이 바로 작성·자동 저장
- 이동, 관광, 식사, 카페, 숙소에 맞춘 일관된 선형 아이콘
- 일정 추가, 수정, 위·아래 이동, 복제, 삭제
- 관광지·맛집·카페를 각각의 하위 탭에서 추가, 수정, 삭제
- 관광지를 원본은 유지한 채 DAY 1 또는 DAY 2 일정으로 복사
- DAY 1·2 실제 지출 가계부와 일자별·전체 사용 금액 자동 합산
- 여행 준비 체크리스트와 접기·펼치기 상태 저장
- 키보드 포커스, 모달 포커스 순환, 충분한 모바일 터치 영역

## 데이터 저장 방식

데이터는 Firestore의 `domestic-travel` 컬렉션 안 `planner-state` 문서에 저장됩니다. 해당 컬렉션과 문서는 앱이 처음 데이터를 기록할 때 자동 생성됩니다. 같은 내용은 현재 브라우저의 `localStorage`에도 `smallCityTravelPlanner` 키로 보관되어 연결 장애가 있을 때 사용할 수 있습니다.

최상위 데이터는 다음처럼 버전과 여행지 목록을 가집니다.

```js
{
  version: 6,
  selectedId: "destination-...",
  destinations: [/* 여행지별 독립 데이터 */]
}
```

Firestore 연결이 성공하면 헤더에 `Firebase 동기화됨`이 표시됩니다. 보안 규칙이나 네트워크 문제로 연결할 수 없을 때는 `기기에 저장됨 · Firebase 확인 필요`가 표시되고 로컬 저장은 계속 동작합니다.

## 향후 수정하기 좋은 코드 위치

`app.js`의 상단 상수와 생성 함수를 중심으로 수정하면 됩니다.

- 기본 여행지: `DEFAULT_DESTINATIONS`
- 여행 상태와 일정 종류: `TRIP_STATUSES`, `SCHEDULE_TYPES`
- 일정 종류 아이콘: `CATEGORY_ICONS`
- 여행지 내부 관리 탭: `VIEW_TABS`, `PLACE_TABS`
- 가계부 분류: `EXPENSE_CATEGORIES`
- 비용 항목: `COST_FIELDS`
- 후보 유형별 입력 필드: `CANDIDATE_CONFIG`
- 여행지별 대표 일정: `DESTINATION_SCHEDULES`
- DAY 1·2 기본 일정: `createDefaultDay()`
- 새 여행지 기본 구조: `createDestination()`
- 저장 구조 변경과 구버전 보정: `normalizeState()`, `normalizeDestination()`
- 화면 구성: `renderDestination()`, `renderActiveView()`, `renderDay()`, `renderCandidateSection()`
- 일정 조작: `addScheduleItem()`, `updateScheduleItem()`, `moveScheduleItem()`, `duplicateScheduleItem()`, `deleteScheduleItem()`
- 가계부 구성과 합계: `renderLedger()`, `renderLedgerDay()`, `ledgerDayTotal()`
- 비용 계산: `calculateCosts()`
- Firebase 위치: `FIREBASE_COLLECTION`, `FIREBASE_DOCUMENT`
- 실시간 동기화: `connectFirebase()`, `flushFirebaseSave()`
- 실행 취소: `undoAction()`

데이터 구조를 바꿀 때는 `DATA_VERSION`을 올리고 `normalizeState()`에 이전 버전 데이터를 새 형식으로 보정하는 로직을 추가하면 기존 사용자의 저장 데이터를 안전하게 이어갈 수 있습니다.

## 지도 데이터 출처

전국 시·도 및 전북·전남·경남 시·군 윤곽은 통계청 SGIS 오픈 API 자료를 바탕으로 만든 `swcho/korea-maps`의 단순화 SVG를 앱 내부 데이터로 변환해 사용합니다. 해당 저장소의 MIT 라이선스 전문은 `assets/maps/LICENSE-korea-maps.txt`에 포함했습니다.
