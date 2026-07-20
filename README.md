# Doo'h CMS

- 관리자 미디어 목록: `index.html`
- 로그인: `login.html` (단일 파일, partial 없음)

## 실행

```bash
npm install
npm run dev
npm run build
```

`vite.config.js`의 `base: './'` 설정으로 `dist/index.html`을 로컬에서 직접 열어도 정적 경로가 유지됩니다.

## 파일 사용 규칙

- 페이지 영역 조각: `public/partials/*.html`
- 반복 UI 컴포넌트: `public/components/*.html`
- 이후 페이지 레이아웃: `public/layouts/*.html`
- 그대로 복사할 정적 파일: `public/assets`
- Vite가 해시 파일명으로 처리할 이미지: `src/assets/images`
- 공통 SCSS: `src/styles/settings`, `base`, `components`
- 페이지 전용 SCSS: `src/styles/pages` (로그인 폼·상품안내는 `login.scss`에만)
- 공통 JS: `src/js/components`
- 페이지 전용 JS: `src/js/pages`
- CSS 이미지 경로: SCSS 파일 기준 상대경로 사용  
  예: `src/styles/pages/media-list.scss`에서는 `url('../../assets/images/media-bg.png')`

관리자 화면만 `{{> partial-name}}` / `{{> components/...}}` include를 사용합니다.
로그인은 `login.html` 한 파일에 마크업이 모두 들어 있습니다.

관리자 공통 헤더는 `public/partials/app-header.html`에 준비되어 있습니다.
공통 푸터는 `public/partials/app-footer.html`, 목록 페이지네이션은
`public/components/pagination.html`을 include해 사용합니다.

새 HTML 페이지는 프로젝트 루트에 추가하면 별도 Vite 설정 없이 자동으로 빌드됩니다.
