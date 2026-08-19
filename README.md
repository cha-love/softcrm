# SoftCRM 정적 홈페이지 (site/)

React 없이 동작하는 정적 HTML입니다. 이 폴더를 그대로 웹서버(또는 카페24·가비아 호스팅, Netlify, Vercel, S3 등)에 올리면 됩니다. 빌드 과정이 없습니다.

## 파일

| 파일 | 페이지 |
| --- | --- |
| index.html | 홈 |
| why-crm.html | CRM필요성 |
| product.html | 기능 (10개 서비스) |
| pricing.html | 요금 |
| contact.html | 상담 신청 |
| site.css | 전체 스타일 (디자인 토큰 포함) |
| site.js | 스크롤 진입 모션, FAQ 아코디언, 상담 폼 전송 |
| assets/ | 로고, 제품 화면 이미지 |

## 상담 신청 폼 연결

`site.js` 상단의 다음 줄에 구글 앱스스크립트 웹앱 URL을 넣습니다.

```js
var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
```

설정 절차는 `../ui_kits/website/apps-script/README.md` 와 같습니다(같은 `Code.gs`를 사용). 비어 있으면 전송 없이 완료 화면만 표시됩니다.

## 남은 작업

1. **제품 화면 이미지** — 홈 히어로 1장만 실제 캡처입니다. 나머지는 격자 자리표시(1440×900)입니다. 캡처를 `assets/`에 넣고 해당 `<div class="grid-slot">` 을 `<div class="shot__frame"><img src="assets/파일명.png" alt="설명"></div>` 로 바꾸면 됩니다.
2. **사업자 정보** — 푸터의 사업자등록번호가 `000-00-00000` 예시값입니다.
3. **개인정보처리방침** — 푸터 링크가 아직 페이지로 연결되지 않았습니다. 문구를 주시면 `privacy.html`을 추가하겠습니다.
4. **도메인·파비콘** — 도메인이 정해지면 `og:` 메타태그와 파비콘을 넣습니다.

## 참고

- 폰트는 CDN에서 불러옵니다. Pretendard는 각 페이지 `<head>`의 dynamic-subset 스타일시트(한글 글리프를 필요한 만큼만 내려받음), Inter는 `site.css`의 `@font-face`입니다. 사내망 등 외부 접속이 제한된 환경이라면 woff2 파일을 `assets/fonts/`에 넣고 두 경로를 바꾸세요.
- 섹션 상하 여백은 브리프 규격대로 모바일 80px → 태블릿 104px → 데스크톱(1180px 이상) 140px입니다.
- 1024px 이하에서는 상단 메뉴가 햄버거 버튼으로 바뀝니다(버튼 44×44, 메뉴 항목 높이 44px).
- 스크롤 진입 모션은 빠른 스크롤·앵커 점프·스크롤 위치 복원 상황에서도 지나간 요소를 반드시 표시합니다.
