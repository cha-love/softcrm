/* SoftCRM 홈페이지 — 정적 페이지 동작
   1) 스크롤 진입 모션  2) 아코디언  3) 상담 신청 폼 전송 */

/* ── 1) 스크롤 진입: opacity 0→1 + translateY 16px, 500ms, 1회만 ──
   IntersectionObserver만 쓰면 빠른 스크롤(트랙패드 플릭, End 키, 앵커 점프,
   새로고침 시 스크롤 복원)에 건너뛴 요소가 영구히 숨습니다.
   스크롤/리사이즈 리스너와 폴링으로 화면을 지나간 요소까지 반드시 표시합니다. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = [].slice.call(document.querySelectorAll(".reveal"));
  if (!items.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

  var pending = items.slice();
  var poll = null;

  function show(el) {
    if (el.classList.contains("is-visible")) return;
    el.classList.add("is-visible");
    io.unobserve(el);
    var i = pending.indexOf(el);
    if (i > -1) pending.splice(i, 1);
    if (!pending.length) stop();
  }

  function sweep() {
    var h = window.innerHeight;
    pending.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      // 화면에 들어왔거나, 이미 위로 지나간 요소도 표시
      if (r.top < h * 0.95 || r.bottom < 0) show(el);
    });
  }

  function stop() {
    window.removeEventListener("scroll", sweep);
    window.removeEventListener("resize", sweep);
    if (poll) { clearInterval(poll); poll = null; }
  }

  items.forEach(function (el) { io.observe(el); });
  sweep();
  if (pending.length) {
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
    poll = setInterval(sweep, 200);
    window.addEventListener("load", sweep);
  }
})();

/* ── 1-b) 모바일 메뉴 ── */
(function () {
  var btn = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!btn || !nav) return;

  function close() {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1024) close(); });
})();

/* ── 2) 아코디언 (FAQ, 상세 보기) ── */
(function () {
  var toggles = document.querySelectorAll("[data-toggle]");
  Array.prototype.forEach.call(toggles, function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("data-toggle"));
      if (!panel) return;
      var open = panel.hasAttribute("hidden");
      if (btn.hasAttribute("data-toggle-group")) {
        var group = btn.getAttribute("data-toggle-group");
        document.querySelectorAll('[data-toggle-group="' + group + '"]').forEach(function (other) {
          if (other === btn) return;
          var op = document.getElementById(other.getAttribute("data-toggle"));
          if (op) op.setAttribute("hidden", "");
          other.setAttribute("aria-expanded", "false");
          var oc = other.querySelector(".chev");
          if (oc) oc.style.transform = "rotate(45deg)";
        });
      }
      if (open) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      var chev = btn.querySelector(".chev");
      if (chev) chev.style.transform = open ? "rotate(-135deg)" : "rotate(45deg)";
      var lbl = btn.querySelector("[data-label-open]");
      if (lbl) lbl.textContent = open ? lbl.getAttribute("data-label-open") : lbl.getAttribute("data-label-closed");
    });
  });
})();

/* ── 3) 상담 신청 폼 → 구글 앱스스크립트 웹앱 ──
   apps-script/README.md 3단계에서 받은 웹앱 URL을 아래에 붙여넣으세요.
   비어 있으면 실제 전송 없이 화면 동작만 확인됩니다. */
var FORM_ENDPOINT = "";

(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var errorBox = document.getElementById("form-error");
  var doneBox = document.getElementById("form-done");
  var submitBtn = document.getElementById("form-submit");

  function fail(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    var data = {
      hospital: form.hospital.value.trim(),
      manager: form.manager.value.trim(),
      phone: form.phone.value.trim(),
      department: form.department.value,
      message: form.message.value.trim(),
      agree: form.agree.checked,
      page: location.pathname,
      submittedAt: new Date().toISOString()
    };

    if (!data.hospital || !data.manager || !data.phone || !data.department) {
      fail("병원명, 담당자 성함, 연락처, 진료과는 필수 항목입니다."); return;
    }
    if (!data.agree) { fail("개인정보 수집·이용 동의가 필요합니다."); return; }

    function showDone() {
      form.hidden = true;
      doneBox.hidden = false;
    }

    if (!FORM_ENDPOINT) { showDone(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "전송 중…";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
      redirect: "follow"
    })
      .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
      .then(function (out) {
        if (!out.ok) throw new Error(out.error || "전송 실패");
        showDone();
      })
      .catch(function () {
        fail("전송에 실패했습니다. 02-362-4680으로 전화 주시면 바로 도와드리겠습니다.");
        submitBtn.disabled = false;
        submitBtn.textContent = "도입 상담 신청";
      });
  });
})();

/* ── 4) 메인 이미지 페이드 슬라이더 ── */
(function () {
  var images = document.querySelectorAll(".shot__frame--slider img");
  if (images.length < 2) return;

  setInterval(function () {
    Array.prototype.forEach.call(images, function (img) {
      img.classList.toggle("active");
    });
  }, 2500);
})();


