# Doo'h CMS — 컴포넌트 가이드

## 라이브 가이드

브라우저에서 **`guide.html`** 을 열면 Section 1 primitives + Media Detail UI를 확인할 수 있습니다.

```bash
npm run dev
# http://localhost:5173/guide.html
```

## SCSS 컴포넌트 (BEM)

| Figma / UI | SCSS 파일 | 클래스 예시 |
|------------|-----------|-------------|
| btn / btn_cta | `_cms-btn.scss` | `.btn`, `.btn-cta`, `.btn-text` |
| badge_state | `_badge-state.scss` | `.badge-state`, `.badge-settop` |
| input / select / check / radio | `_form-controls.scss` | `.field-input`, `.check`, `.radio` |
| tabmenu / list option | `_tab-menu.scss` | `.tab-menu`, `.tab-menu-page`, `.view-options` |
| info_guide / info_alert | `_info-panel.scss` | `.info-guide`, `.info-alert`, `.toggle` |
| pagination | `_navigation.scss` | `.pagination` |
| Media Detail UI | `pages/media-detail.scss` | `.media-detail-hero`, `.detail-card`, `.detail-row`, `.data-box`, `.kpi-card`, `.pie-panel`, `.mini-bar-chart`, `.display-preview`, `.link-status` |
| Product Register | `pages/product-register.scss` | `.product-register`, `.time-slot-row`, `.file-upload`, `.media-pick`, `.auto-calc` |
| Product Detail | `pages/product-detail.scss` | `.product-detail`, `.product-detail-hero`, `.product-status-flow` |
| Error 404 | `pages/error.scss` | `.error-page` |

새 화면 작업 시 위 클래스를 그대로 사용합니다. **페이지 섹션**은 `public/pages/`에, **재사용 조각**은 `public/components/`에 둡니다.

## 미디어 상세 페이지

| 페이지 | Partial | 레이아웃 |
|--------|---------|----------|
| `CMS_02서비스_01미디어_상세.html` | `detail-view` | 상세 v1 · `detail-row` |
| `CMS_02서비스_01미디어_상세02.html` | `detail-view02` | 상세 v2 · `data-box` + `detail-summary` |
| `CMS_02서비스_01미디어_상세03.html` | `detail-view03` | 오버뷰 · preview + chart |
| `CMS_02서비스_01미디어_상세04.html` | `detail-view04` | 분석 · KPI + pie + link |

공유 조각:

- `pages/media/detail-hero` — 히어로
- `pages/media/detail-actions` — 목록/삭제/수정
- `pages/media/display-preview` — 디스플레이 미리보기

## 프로덕트 상세 페이지

| 페이지 | Partial | 레이아웃 |
|--------|---------|----------|
| `CMS_02운영_01프로덕트_상세.html` | `detail-view` | Figma 1188:3258 · 히어로 + 미디어 목록 + 자동 산정 |

공유 조각:

- `pages/product/detail-hero` — 히어로 (통계 5칸)
- `pages/product/detail-actions` — 목록/삭제/수정
- `pages/product/media-pick-items` — 선택 미디어 리스트
- `pages/product/media-select-modal` — 미디어 선택 모달

## HTML 조각 규칙

| 폴더 | 용도 | include 예 |
|------|------|------------|
| `public/partials/` | 앱 셸 (header, sidebar) | `{{> app-sidebar}}` |
| `public/components/` | 재사용 UI (뱃지, pagination) | `{{> components/pagination}}` |
| `public/pages/` | 페이지 전용 섹션 | `{{> pages/media/filters}}` |

## 아이콘 규칙

- **아이콘 1개 = SVG 1개** (`public/assets/icons/`)
- on/off 상태는 `-on` 접미사 파일 분리, **viewBox 동일**
- SCSS background-image: `@assets` alias 또는 `settings/_asset-urls.scss` 토큰 사용

## 가이드 페이지 구조

```
guide.html
public/pages/guide/sections.html        ← 가이드 섹션 마크업
src/styles/pages/guide.scss             ← 가이드 레이아웃 + 컴포넌트 import
src/js/pages/guide.js                   ← 목차 하이라이트, toggle 데모
```

섹션 추가: `public/pages/guide/sections.html`에 `<section class="guide-section" id="...">` 블록 추가 → `guide.html` nav 링크 추가.
