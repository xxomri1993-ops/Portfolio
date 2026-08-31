document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Header shrink on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
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

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxStage = document.getElementById('lightboxStage');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;

  const openLightbox = (videoId, orientation) => {
    if (!videoId) return;
    lastFocused = document.activeElement;
    lightboxStage.dataset.orientation = orientation === 'wide' ? 'wide' : 'vertical';
    lightboxStage.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(videoId) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Video player" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxStage.innerHTML = ''; // stops playback
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openLightbox(trigger.dataset.yt, trigger.dataset.orientation);
    });
  });

  /* ---------- Video cards ----------
     Each card ships as one line of HTML carrying a YouTube ID. The poster frame is
     loaded from YouTube's thumbnail CDN and the player iframe is only created once
     someone actually presses play — so the page stays fast no matter how many
     videos are listed.                                                          */
  const THUMB_SIZES = ['oardefault', 'maxresdefault', 'hqdefault'];

  document.querySelectorAll('.video-card').forEach((card) => {
    const videoId = card.dataset.yt;
    const title = card.dataset.title || 'Untitled';
    const orientation = card.dataset.orientation === 'wide' ? 'wide' : 'vertical';

    const button = document.createElement('button');
    button.className = 'video-thumb';
    button.setAttribute('aria-label', 'Play ' + title);

    const fallback = document.createElement('span');
    fallback.className = 'thumb-fallback';
    button.appendChild(fallback);

    if (videoId) {
      const img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      let sizeIndex = 0;
      const tryNextThumb = () => {
        if (sizeIndex >= THUMB_SIZES.length) {
          img.remove(); // leave the styled fallback showing
          return;
        }
        img.src = 'https://i.ytimg.com/vi/' + videoId + '/' + THUMB_SIZES[sizeIndex] + '.jpg';
        sizeIndex += 1;
      };
      // YouTube serves a 120x90 grey placeholder when a size is missing.
      img.addEventListener('load', () => {
        if (img.naturalWidth <= 120) tryNextThumb();
      });
      img.addEventListener('error', tryNextThumb);
      tryNextThumb();
      button.appendChild(img);
    }

    const badge = document.createElement('span');
    badge.className = 'play-badge';
    badge.innerHTML =
      '<svg width="15" height="17" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 6.63397C12.6667 7.01887 12.6667 7.98113 12 8.36603L2.25 13.9952C1.58333 14.3801 0.75 13.899 0.75 13.1292L0.75 1.87083C0.75 1.10103 1.58333 0.619903 2.25 1.0048L12 6.63397Z" fill="currentColor"/></svg>';
    button.appendChild(badge);

    button.addEventListener('click', () => openLightbox(videoId, orientation));

    const label = document.createElement('p');
    label.className = 'video-label';
    label.textContent = title;

    card.appendChild(button);
    card.appendChild(label);
  });

  /* ---------- Section counts ---------- */
  document.querySelectorAll('.work-section').forEach((section) => {
    const countEl = section.querySelector('.section-count');
    if (!countEl) return;
    const total = section.querySelectorAll('.video-card').length;
    countEl.textContent = total + (total === 1 ? ' film' : ' films');
  });

  /* ---------- Scroll-spy nav ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const spySections = document.querySelectorAll('[data-section]');

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.dataset.section === entry.target.dataset.section);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );
    spySections.forEach((section) => spy.observe(section));
  }

  /* ---------- Carousels ---------- */
  document.querySelectorAll('.work-section').forEach((section) => {
    const track = section.querySelector('.carousel-track');
    const prevBtn = section.querySelector('.carousel-arrow.prev');
    const nextBtn = section.querySelector('.carousel-arrow.next');
    if (!track || !prevBtn || !nextBtn) return;

    const step = () => track.clientWidth * 0.8;

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    const carouselNav = section.querySelector('.carousel-nav');

    const updateArrows = () => {
      const maxScroll = track.scrollWidth - track.clientWidth - 1;
      const overflows = maxScroll > 0;
      // Nothing to scroll to (e.g. three cards on a wide screen) — hide the controls
      // rather than leaving two dead buttons in the header.
      if (carouselNav) carouselNav.hidden = !overflows;
      prevBtn.disabled = track.scrollLeft <= 0;
      nextBtn.disabled = track.scrollLeft >= maxScroll;
    };

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  });

  /* ---------- Fade cards in on scroll ---------- */
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

  document.querySelectorAll('.video-card').forEach((card) => {
    if (io) {
      io.observe(card);
    } else {
      card.classList.add('in-view');
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
