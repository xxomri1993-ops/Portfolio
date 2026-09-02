document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const setMenu = (open) => {
    mainNav.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  };

  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenu(!mainNav.classList.contains('open'));
  });

  // Tapping a link, pressing Escape, or touching outside the panel all close it.
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('click', (event) => {
    if (!mainNav.classList.contains('open')) return;
    if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenu(false);
    }
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxStage = document.getElementById('lightboxStage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;

  const ORIENTATIONS = ['wide', 'square', 'portrait'];

  const openLightbox = (videoId, orientation, title) => {
    if (!videoId) return;
    lastFocused = document.activeElement;
    lightboxStage.dataset.orientation = ORIENTATIONS.includes(orientation) ? orientation : 'vertical';
    lightboxStage.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(videoId) +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Video player" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    lightboxCaption.textContent = title || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxStage.innerHTML = ''; // stops playback
    lightboxCaption.textContent = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {
    if (!event.target.closest('.lightbox-inner')) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!lightbox.hidden) closeLightbox();
    else if (mainNav.classList.contains('open')) setMenu(false);
  });

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openLightbox(trigger.dataset.yt, trigger.dataset.orientation, trigger.dataset.title);
    });
  });

  /* ---------- Video cards ----------
     Each card ships as one line of HTML carrying a YouTube ID. Only the poster frame
     is fetched up front; the player iframe is created on click, so the page never
     boots a dozen YouTube players at once.                                        */
  const THUMB_SIZES = ['oardefault', 'maxresdefault', 'hqdefault'];

  const buildCard = (card) => {
    const videoId = card.dataset.yt;
    const title = card.dataset.title || 'Untitled';

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
      // YouTube answers a missing size with a 120x90 grey placeholder.
      img.addEventListener('load', () => {
        if (img.naturalWidth <= 120) tryNextThumb();
        else img.classList.add('loaded');
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

    const label = document.createElement('p');
    label.className = 'video-label';
    label.textContent = title;

    card.appendChild(button);
    card.appendChild(label);
  };

  document.querySelectorAll('.video-card').forEach(buildCard);

  // Delegated so cloned cards in the looping carousels work without rebinding.
  document.addEventListener('click', (event) => {
    const thumb = event.target.closest('.video-thumb');
    if (!thumb) return;
    const card = thumb.closest('.video-card');
    if (!card) return;
    openLightbox(card.dataset.yt, card.dataset.orientation, card.dataset.title);
  });

  /* ---------- Hover previews ----------
     The interaction every good reel site has: rest on a card and it starts playing
     silently. Only one preview exists at a time, and it waits for a beat of hover so
     sweeping the cursor across a row doesn't spawn players.                      */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && !reducedMotion) {
    let hoverTimer = null;
    let activePreview = null;

    const clearPreview = () => {
      clearTimeout(hoverTimer);
      if (activePreview) {
        activePreview.remove();
        activePreview = null;
      }
    };

    document.addEventListener('mouseover', (event) => {
      const thumb = event.target.closest('.video-thumb');
      if (!thumb) return;
      if (activePreview && activePreview.parentElement === thumb) return;

      clearPreview();

      const card = thumb.closest('.video-card');
      const videoId = card && card.dataset.yt;
      if (!videoId) return;

      hoverTimer = setTimeout(() => {
        const frame = document.createElement('iframe');
        frame.className = 'thumb-preview';
        frame.setAttribute('tabindex', '-1');
        frame.setAttribute('aria-hidden', 'true');
        frame.allow = 'autoplay; encrypted-media';
        frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) +
          '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + encodeURIComponent(videoId) +
          '&modestbranding=1&rel=0&playsinline=1&disablekb=1';
        thumb.appendChild(frame);
        activePreview = frame;
        requestAnimationFrame(() => frame.classList.add('visible'));
      }, 420);
    });

    document.addEventListener('mouseout', (event) => {
      const thumb = event.target.closest('.video-thumb');
      if (!thumb) return;
      // Ignore moves between children of the same card.
      if (event.relatedTarget && thumb.contains(event.relatedTarget)) return;
      clearPreview();
    });

    // A preview left running behind the lightbox would keep playing.
    document.addEventListener('click', clearPreview);
  }

  /* ---------- Process pipeline switch ---------- */
  const pipelineTabs = document.querySelectorAll('.pipeline-tab');
  const pipelinePanels = document.querySelectorAll('[data-pipeline-panel]');

  pipelineTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      pipelineTabs.forEach((other) => {
        const isActive = other === tab;
        other.classList.toggle('active', isActive);
        other.setAttribute('aria-selected', String(isActive));
      });
      pipelinePanels.forEach((panel) => {
        panel.hidden = panel.dataset.pipelinePanel !== tab.dataset.pipeline;
      });
    });
  });

  /* ---------- Carousels ----------
     The card set is cloned end to end so scrolling never hits a wall: once the
     viewport drifts a whole set away from the middle copy, scrollLeft jumps back by
     exactly one set width. The cards under the viewport are identical at that point,
     so the seam is invisible and the row reads as an endless loop.               */
  const createCarousel = (carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const scope = carousel.closest('section') || document;
    const prevBtn = scope.querySelector('.carousel-arrow.prev');
    const nextBtn = scope.querySelector('.carousel-arrow.next');
    if (!track) return null;

    let originals = Array.from(track.children);
    let setWidth = 0;   // width of one full set of cards
    let wrapUnit = 0;   // whole number of sets, at least a viewport wide
    let wrapping = false;

    const measureSet = () => {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return originals.reduce((sum, card) => sum + card.getBoundingClientRect().width + gap, 0);
    };

    function jumpTo(position) {
      wrapping = true;
      const snap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      track.scrollLeft = position;
      track.style.scrollSnapType = snap;
      requestAnimationFrame(() => { wrapping = false; });
    }

    const build = () => {
      if (!originals.length) return;
      const measured = measureSet();
      if (measured <= 0) return;
      // Card widths haven't changed and the clones are already in place — rebuilding
      // would only yank the row back to its start position under the reader.
      if (measured === setWidth && track.querySelector('[data-clone]')) return;

      track.querySelectorAll('[data-clone]').forEach((clone) => clone.remove());
      setWidth = measured;

      wrapUnit = setWidth * Math.ceil(track.clientWidth / setWidth);
      const needed = Math.ceil((wrapUnit * 3 + track.clientWidth) / setWidth);

      for (let copy = 1; copy < needed; copy += 1) {
        originals.forEach((card) => {
          const clone = card.cloneNode(true);
          clone.dataset.clone = 'true';
          clone.setAttribute('aria-hidden', 'true');
          clone.classList.add('in-view');
          clone.querySelectorAll('button').forEach((button) => {
            button.tabIndex = -1;
          });
          track.appendChild(clone);
        });
      }

      jumpTo(wrapUnit);
    };

    track.addEventListener('scroll', () => {
      if (wrapping || !wrapUnit) return;
      if (track.scrollLeft < wrapUnit * 0.5) {
        jumpTo(track.scrollLeft + wrapUnit);
      } else if (track.scrollLeft > wrapUnit * 1.5) {
        jumpTo(track.scrollLeft - wrapUnit);
      }
    }, { passive: true });

    const step = () => Math.max(track.clientWidth * 0.8, 200);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -step(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: step(), behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });

    window.addEventListener('load', build);
    build();

    return {
      setCards(cards) {
        originals = cards;
        setWidth = 0;
        wrapUnit = 0;
        track.replaceChildren(...cards);
        cards.forEach((card) => card.classList.add('in-view'));
        build();
      },
    };
  };

  /* ---------- Filters ----------
     Chips are derived from the tags actually in use, so a category with no videos
     never shows up as a dead filter.                                             */
  const TAG_ORDER = ['AI', 'UGC', 'Ads For Social', 'TV Ads', 'Live Action'];

  const carouselEl = document.getElementById('workCarousel');
  const filterBar = document.getElementById('filterBar');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.querySelector('.section-count');
  const carousel = carouselEl ? createCarousel(carouselEl) : null;

  if (carousel && filterBar) {
    const allCards = Array.from(carouselEl.querySelectorAll('.video-card:not([data-clone])'));

    const tagsOf = (card) =>
      (card.dataset.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    const used = new Set();
    allCards.forEach((card) => tagsOf(card).forEach((tag) => used.add(tag)));

    const ordered = [
      ...TAG_ORDER.filter((tag) => used.has(tag)),
      ...[...used].filter((tag) => !TAG_ORDER.includes(tag)).sort(),
    ];

    const applyFilter = (tag, chip) => {
      filterBar.querySelectorAll('.filter-chip').forEach((el) => {
        const isActive = el === chip;
        el.classList.toggle('active', isActive);
        el.setAttribute('aria-pressed', String(isActive));
      });

      const matching = tag === null ? allCards : allCards.filter((card) => tagsOf(card).includes(tag));

      if (countEl) {
        countEl.textContent = matching.length + (matching.length === 1 ? ' film' : ' films');
      }
      if (emptyState) emptyState.hidden = matching.length > 0;
      carouselEl.hidden = matching.length === 0;

      carousel.setCards(matching);
    };

    const addChip = (label, tag, count) => {
      const chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.type = 'button';
      chip.setAttribute('aria-pressed', 'false');
      chip.innerHTML = label + ' <span class="chip-count">' + count + '</span>';
      chip.addEventListener('click', () => applyFilter(tag, chip));
      filterBar.appendChild(chip);
      return chip;
    };

    const allChip = addChip('All', null, allCards.length);
    ordered.forEach((tag) => {
      const count = allCards.filter((card) => tagsOf(card).includes(tag)).length;
      addChip(tag, tag, count);
    });

    applyFilter(null, allChip);
  }

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
        { threshold: 0.1 }
      )
    : null;

  document.querySelectorAll('.video-card').forEach((card) => {
    if (io) {
      io.observe(card);
    } else {
      card.classList.add('in-view');
    }
  });

  /* ---------- Ambient light rays and dust ---------- */
  const canvas = document.getElementById('ambientCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const RAYS = [
      { offset: 0.18, width: 0.16, tilt: -0.32, color: [240, 178, 94], alpha: 0.09, speed: 0.05, phase: 0 },
      { offset: 0.38, width: 0.09, tilt: -0.28, color: [255, 226, 178], alpha: 0.06, speed: 0.07, phase: 1.7 },
      { offset: 0.66, width: 0.2, tilt: -0.36, color: [109, 79, 224], alpha: 0.11, speed: 0.04, phase: 3.1 },
      { offset: 0.85, width: 0.12, tilt: -0.3, color: [148, 116, 255], alpha: 0.07, speed: 0.06, phase: 4.4 },
    ];

    const dust = [];
    const seedDust = () => {
      dust.length = 0;
      const count = Math.round(Math.min(window.innerWidth, 1600) / 22);
      for (let i = 0; i < count; i += 1) {
        dust.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.4 + 0.5,
          drift: Math.random() * 0.4 + 0.15,
          sway: Math.random() * 2 * Math.PI,
          alpha: Math.random() * 0.35 + 0.12,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedDust();
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      RAYS.forEach((ray) => {
        const sway = Math.sin(time * ray.speed + ray.phase) * width * 0.06;
        const x = ray.offset * width + sway;
        const beam = ray.width * width;
        const pulse = 0.75 + Math.sin(time * ray.speed * 1.6 + ray.phase) * 0.25;

        ctx.save();
        ctx.translate(x, height * 0.5);
        ctx.rotate(ray.tilt);
        const gradient = ctx.createLinearGradient(-beam / 2, 0, beam / 2, 0);
        const [r, g, b] = ray.color;
        gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        gradient.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',' + ray.alpha * pulse + ')');
        gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
        ctx.fillStyle = gradient;
        const span = Math.max(width, height) * 2;
        ctx.fillRect(-beam / 2, -span / 2, beam, span);
        ctx.restore();
      });

      dust.forEach((mote) => {
        const y = ((mote.y - time * mote.drift * 0.02) % 1 + 1) % 1;
        const x = mote.x * width + Math.sin(time * 0.25 + mote.sway) * 18;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 232, 196, ' + mote.alpha + ')';
        ctx.arc(x, y * height, mote.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    };

    let rafId = null;
    const loop = () => {
      draw(performance.now() / 1000);
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (rafId === null && !document.hidden) loop();
    };
    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      draw(0); // one static frame
    } else {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });
      start();
    }
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
