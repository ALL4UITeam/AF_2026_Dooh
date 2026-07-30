# Doo'h CMS

- 페이지 목록(개발용): `index.html`
- 관리자 미디어 목록(리스트): `CMS_02서비스_01미디어_목록.html`
- 관리자 미디어 목록(카드): `CMS_02서비스_01미디어_카드.html`
- 관리자 미디어 등록: `CMS_02서비스_02미디어_등록.html`
- 프로덕트 관리(리스트): `CMS_03운영_01프로덕트_목록.html`
- 프로덕트 관리(카드): `CMS_03운영_01프로덕트_카드.html`
- 로그인: `login.html` (단일 파일, partial 없음)

## 실행

```bash
npm install
npm run dev
npm run build
```

`vite.config.js`의 `base: './'` 설정으로 `dist/index.html`을 로컬에서 직접 열어도 정적 경로가 유지됩니다.

## 파일 사용 규칙

- 앱 셸·공통 조각: `public/partials/*.html`
- **재사용 UI 컴포넌트** (뱃지, 페이지네이션 등): `public/components/*.html`
- **페이지 전용 섹션** (목록 테이블, 등록 폼 등): `public/pages/<도메인>/*.html`
- 그대로 복사할 정적 파일: `public/assets`
- 공통 SCSS: `src/styles/settings`, `base`, `components`
- **공통 컴포넌트 SCSS**: `src/styles/components/_cms-btn.scss`, `_badge-state.scss`, `_form-controls.scss`, `_tab-menu.scss`, `_info-panel.scss`
- 페이지 전용 SCSS: `src/styles/pages` (로그인 폼·상품안내는 `login.scss`에만)
- 공통 JS: `src/js/components`
- 페이지 전용 JS: `src/js/pages`
- CSS 이미지 경로: `@assets` 별칭 → `public/assets` (`src/styles/settings/_asset-urls.scss`)

관리자 화면만 `{{> partial-name}}` / `{{> components/...}}` / `{{> pages/...}}` include를 사용합니다.
로그인은 `login.html` 한 파일에 마크업이 모두 들어 있습니다.

관리자 공통 헤더는 `public/partials/app-header.html`에 준비되어 있습니다.
목록 페이지네이션은 `public/components/pagination.html`을 include해 사용합니다.

새 HTML 페이지는 프로젝트 루트에 추가하면 별도 Vite 설정 없이 자동으로 빌드됩니다.
