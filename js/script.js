document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Header shrink on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.querySelector('.main-nav');

  const closeMenu = () => {
    menuToggle.classList.remove('open');
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* ---------- Tab switching ---------- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const activateTab = (tabId, { scroll = true } = {}) => {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === tabId);
    });

    if (scroll) {
      const work = document.getElementById('work');
      work.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    history.replaceState(null, '', `#${tabId}`);
    observeVideoCards();
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
      closeMenu();
    });
  });

  // Deep-link support (e.g. loading the page with #ai-showcase)
  const initialHash = window.location.hash.replace('#', '');
  const validTabs = Array.from(tabPanels).map((p) => p.dataset.panel);
  if (validTabs.includes(initialHash)) {
    activateTab(initialHash, { scroll: false });
  }

  /* ---------- Fade-in video cards on scroll ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      )
    : null;

  function observeVideoCards() {
    document.querySelectorAll('.video-card:not(.in-view)').forEach((card) => {
      if (io) {
        io.observe(card);
      } else {
        card.classList.add('in-view');
      }
    });
  }

  observeVideoCards();

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
