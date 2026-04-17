/* ═══════════════════════════════════════════════════
   통계 학습 노트 · 공통 스크립트
   드로어, 하단 네비, IntersectionObserver 기반 활성 챕터 표시
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // ══════════════════════════════════════════════════════
  //  공통 메타데이터 — 여기만 고치면 모든 페이지에 반영됩니다
  // ══════════════════════════════════════════════════════
  const META = {
    author: 'kimpaulie',
    instagramHandle: '@kimpaulie',
    instagramUrl: 'https://instagram.com/kimpaulie',
    courseName: 'KAIST BIT500 · Management Statistical Analysis',
    courseOwner: 'KAIST 경영대학',
    disclaimerHTML: [
      '이 문서는 <em>개인 학습을 위한 해설 노트</em>입니다.<br>',
      '강의 슬라이드와 원문 콘텐츠의 저작권은 해당 교수님과 KAIST에 있으며,<br>',
      '본 해설서는 그 내용을 초심자의 눈높이로 풀어 쓴 <em>파생 학습 자료</em>입니다.<br>',
      '상업적 이용 · 무단 재배포는 금지되어 있어요.'
    ].join('')
  };

  // ──────────── 0. 공통 푸터 렌더링 ────────────
  // side-footer (각 강의 사이드바 하단)
  const sideFooter = qs('.side-footer');
  if (sideFooter) {
    const lectureNum = sideFooter.dataset.lectureNum || '';
    sideFooter.innerHTML = [
      'KAIST BIT500<br>',
      'Management Statistical Analysis',
      lectureNum ? '<br>Lecture ' + lectureNum : '',
      '<br><br>',
      '해설 · 편집<br>',
      '<strong style="color:#1d1d1f">' + META.author + '</strong><br>',
      '<a href="' + META.instagramUrl + '" target="_blank" rel="noopener" ',
      'style="color:#8a7a50; text-decoration:none;">',
      'Instagram · ' + META.instagramHandle + '</a>'
    ].join('');
  }

  // hub-footer (index.html 메인 허브)
  const hubFooter = qs('.hub-footer');
  if (hubFooter) {
    hubFooter.innerHTML = [
      '<strong>원본</strong> · ' + META.courseOwner + ' · BIT500 Management Statistical Analysis<br>',
      '<strong>해설 · 편집</strong> · ' + META.author + ' · ',
      '<a href="' + META.instagramUrl + '" target="_blank" rel="noopener" ',
      'style="color:#c0392b; text-decoration:none; font-weight:600;">',
      'Instagram ' + META.instagramHandle + '</a>',
      '<br><br>',
      '<small style="line-height:1.7;">',
      META.disclaimerHTML,
      '</small>'
    ].join('');
  }

  // ──────────── 1. 드로어 ────────────
  const topbar = qs('.topbar');
  const sidebar = qs('.sidebar');
  const backdrop = qs('.drawer-backdrop');
  const hamburger = qs('.hamburger');

  function showTopbar() {
    if (topbar) topbar.classList.remove('topbar--hidden');
  }
  function openDrawer() {
    if (!sidebar) return;
    showTopbar(); // 드로어 열 때 앱바도 항상 보이게
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = sidebar && sidebar.classList.contains('open');
      isOpen ? closeDrawer() : openDrawer();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // 사이드바 안의 목차/강의 링크를 탭하면 드로어 닫기 (모바일)
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (window.matchMedia('(max-width: 960px)').matches) {
        // 내부 앵커(#ch...)면 살짝 딜레이 후 닫기 (smooth scroll 시작 보장)
        const href = link.getAttribute('href') || '';
        if (href.startsWith('#')) {
          setTimeout(closeDrawer, 100);
        } else {
          closeDrawer();
        }
      }
    });
  }

  // ──────────── 2. 엣지 스와이프 (모바일) ────────────
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = 0;
  const EDGE_ZONE = 24;        // 왼쪽 끝 몇 px 에서 시작해야 유효한가
  const SWIPE_THRESHOLD = 60;  // 얼마나 오른쪽으로 드래그해야 드로어 열림
  const SWIPE_TIME_LIMIT = 600;

  document.addEventListener('touchstart', (e) => {
    if (!window.matchMedia('(max-width: 960px)').matches) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;

    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.5;
    const fastEnough = dt < SWIPE_TIME_LIMIT;

    // 엣지에서 오른쪽으로 스와이프 → 드로어 열기
    if (touchStartX < EDGE_ZONE && dx > SWIPE_THRESHOLD && horizontal && fastEnough) {
      openDrawer();
    }
    // 드로어가 열린 상태에서 왼쪽으로 스와이프 → 닫기
    else if (sidebar && sidebar.classList.contains('open') && dx < -SWIPE_THRESHOLD && horizontal && fastEnough) {
      closeDrawer();
    }

    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  // ──────────── 3. 하단 네비 (이전/다음 장) ────────────
  const chapters = qsa('section.chapter');
  let activeChapterIdx = 0;

  const prevBtn = qs('.bottom-nav .prev-chap');
  const nextBtn = qs('.bottom-nav .next-chap-btn');
  const dots = qs('.bottom-nav .dots');

  function scrollToChapter(idx) {
    if (idx < 0 || idx >= chapters.length) return;
    chapters[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollToChapter(activeChapterIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToChapter(activeChapterIdx + 1));

  function updateNavState() {
    if (prevBtn) prevBtn.disabled = activeChapterIdx <= 0;
    if (nextBtn) nextBtn.disabled = activeChapterIdx >= chapters.length - 1;
    if (dots) {
      const total = chapters.length;
      dots.textContent = `${activeChapterIdx + 1} / ${total}`;
    }
  }

  // ──────────── 4. IntersectionObserver ────────────
  if (chapters.length > 0 && 'IntersectionObserver' in window) {
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -20% 0px'
    });

    chapters.forEach((ch) => chapterObserver.observe(ch));

    // 활성 챕터 감지 (뷰포트 상단 근처의 챕터)
    const activeObserver = new IntersectionObserver((entries) => {
      let topMost = null;
      let topMostIdx = activeChapterIdx;

      chapters.forEach((ch, idx) => {
        const rect = ch.getBoundingClientRect();
        const headerHeight = 56;
        if (rect.top <= headerHeight + 120 && rect.bottom > headerHeight) {
          if (topMost === null || rect.top > topMost.top) {
            topMost = rect;
            topMostIdx = idx;
          }
        }
      });

      if (topMostIdx !== activeChapterIdx) {
        activeChapterIdx = topMostIdx;
        highlightSidebarChapter(topMostIdx);
        updateNavState();
      }
    }, {
      threshold: [0, 0.2, 0.5, 0.8, 1]
    });

    chapters.forEach((ch) => activeObserver.observe(ch));

    // 초기 상태
    updateNavState();
  }

  function highlightSidebarChapter(idx) {
    const chapLinks = qsa('.sidebar .chap-list a');
    chapLinks.forEach((a, i) => a.classList.toggle('active', i === idx));
  }

  // ──────────── 5. 히스토리 anchor 스크롤 보정 ────────────
  // 페이지 로드 시 #anchor가 있으면 스크롤 마진 반영
  if (location.hash) {
    setTimeout(() => {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  // ──────────── 6. 읽기 진도 바 ────────────
  const readingProgress = qs('.reading-progress');
  if (readingProgress) {
    function updateReadingProgress() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;
      readingProgress.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();
  }

  // ──────────── 7. 앱바 자동 숨김 (스크롤 다운) ────────────
  if (topbar) {
    let lastY = window.scrollY;
    let rafPending = false;
    const THRESHOLD = 80; // 상단 이 픽셀 이내에서는 항상 보임

    function handleTopbarScroll() {
      const y = window.scrollY;
      const delta = y - lastY;

      if (y < THRESHOLD) {
        showTopbar();
      } else if (delta > 4) {
        topbar.classList.add('topbar--hidden');
      } else if (delta < -4) {
        showTopbar();
      }

      lastY = y;
      rafPending = false;
    }

    window.addEventListener('scroll', () => {
      if (!rafPending) {
        requestAnimationFrame(handleTopbarScroll);
        rafPending = true;
      }
    }, { passive: true });

    // 화면 탭(터치 시작) 시 앱바 복귀
    document.addEventListener('touchstart', showTopbar, { passive: true });
  }

  // ──────────── 8. 이전/다음 강의 레이블 ────────────
  // href="lectureXX.html" 에서 강의 번호를 읽어 "◀ N강" / "N강 ▶" 형태로 업데이트
  const navLec = qs('.topbar .nav-lec');
  if (navLec) {
    const links = qsa('a', navLec);
    links.forEach((a, i) => {
      if (a.classList.contains('disabled')) return;
      const href = a.getAttribute('href') || '';
      const m = href.match(/lecture(\d+)/i);
      if (!m) return;
      const n = parseInt(m[1], 10);
      a.textContent = i === 0 ? `◀ ${n}강` : `${n}강 ▶`;
    });
  }
})();
