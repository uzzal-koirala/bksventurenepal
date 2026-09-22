document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) {
    AOS.init({
      duration: 700,
      once: true,
      offset: 60,
    });
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const menuOverlay = document.getElementById('menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu && menuOverlay) {
    const openMenu = () => {
      mobileMenu.classList.remove('translate-x-full');
      menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
      menuOverlay.classList.add('opacity-100', 'pointer-events-auto');
      mobileMenu.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.add('translate-x-full');
      menuOverlay.classList.add('opacity-0', 'pointer-events-none');
      menuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    menuBtn.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Live character counter for the contact form message field(s)
  [['message', 'message-count'], ['contact-message', 'contact-message-count']].forEach(([inputId, countId]) => {
    const messageInput = document.getElementById(inputId);
    const messageCount = document.getElementById(countId);
    if (!messageInput || !messageCount) return;
    const maxLen = messageInput.maxLength;
    const updateCount = () => {
      const len = messageInput.value.length;
      messageCount.textContent = len;
      messageCount.parentElement.classList.toggle('text-red-500', len >= maxLen);
      messageCount.parentElement.classList.toggle('text-slate-400', len < maxLen);
    };
    messageInput.addEventListener('input', updateCount);
    updateCount();
  });

  // Auto-sliding carousels that also support manual drag/swipe scrolling
  // (no visible arrows/scrollbar): auto-scroll pauses on hover or while the
  // user is actively dragging/touching, and resumes afterward.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initDragMarquee(wrap, speed) {
    const track = wrap.querySelector('.marquee-track');
    if (!track) return;

    let isDown = false;
    let hovering = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    // Cache the half-width instead of reading track.scrollWidth every
    // animation frame (a layout-forcing read that, done 60x/sec forever,
    // can leave translucent/rounded/clipped cards mid-repaint).
    let half = 0;
    const recomputeHalf = () => { half = track.scrollWidth / 2; };
    recomputeHalf();

    const images = track.querySelectorAll('img');
    let pending = images.length;
    if (pending === 0) recomputeHalf();
    images.forEach((img) => {
      if (img.complete) {
        pending -= 1;
      } else {
        img.addEventListener('load', () => {
          pending -= 1;
          if (pending <= 0) recomputeHalf();
        }, { once: true });
      }
    });
    if (pending <= 0) recomputeHalf();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recomputeHalf, 200);
    });

    wrap.scrollLeft = 1;

    function tick() {
      if (!isDown && !hovering && !prefersReducedMotion) {
        wrap.scrollLeft += speed;
        if (half > 0) {
          if (wrap.scrollLeft >= half) {
            wrap.scrollLeft -= half;
          } else if (wrap.scrollLeft <= 0) {
            wrap.scrollLeft += half;
          }
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Only re-check the wrap boundary (for manual drag) while the user is
    // actually interacting, rather than every single frame regardless.
    wrap.addEventListener('scroll', () => {
      if (!isDown || half <= 0) return;
      if (wrap.scrollLeft >= half) {
        wrap.scrollLeft -= half;
        startScroll -= half;
      } else if (wrap.scrollLeft <= 0) {
        wrap.scrollLeft += half;
        startScroll += half;
      }
    });

    wrap.addEventListener('mouseenter', () => { hovering = true; });
    wrap.addEventListener('mouseleave', () => {
      hovering = false;
      isDown = false;
      wrap.classList.remove('dragging');
    });

    wrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true;
      moved = false;
      hovering = true;
      wrap.classList.add('dragging');
      startX = e.clientX;
      startScroll = wrap.scrollLeft;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      wrap.scrollLeft = startScroll - dx;
    });

    window.addEventListener('pointerup', () => {
      if (!isDown) return;
      isDown = false;
      wrap.classList.remove('dragging');
    });

    // Prevent the drag from also being interpreted as a click on inner content.
    wrap.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  document.querySelectorAll('.marquee-drag').forEach((wrap) => {
    const isTestimonials = wrap.closest('#testimonials');
    initDragMarquee(wrap, isTestimonials ? 0.5 : 0.7);
  });

  // ===== Support dropdown (top bar) =====
  const supportDropdown = document.getElementById('support-dropdown');
  const supportBtn = document.getElementById('support-dropdown-btn');
  const supportPanel = document.getElementById('support-dropdown-panel');
  const supportIcon = document.getElementById('support-dropdown-icon');

  if (supportDropdown && supportBtn && supportPanel) {
    const openDropdown = () => {
      supportPanel.classList.remove('opacity-0', 'invisible', 'translate-y-1');
      supportBtn.setAttribute('aria-expanded', 'true');
      if (supportIcon) supportIcon.classList.add('rotate-180');
    };
    const closeDropdown = () => {
      supportPanel.classList.add('opacity-0', 'invisible', 'translate-y-1');
      supportBtn.setAttribute('aria-expanded', 'false');
      if (supportIcon) supportIcon.classList.remove('rotate-180');
    };

    supportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = supportBtn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeDropdown() : openDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!supportDropdown.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });
  }

  // ===== Support / consultation popup =====
  const supportOverlay = document.getElementById('support-overlay');
  const supportModal = document.getElementById('support-modal');
  const supportClose = document.getElementById('support-close');
  const supportCloseMobile = document.getElementById('support-close-mobile');

  if (supportOverlay && supportModal) {
    const openModal = () => {
      supportOverlay.classList.remove('opacity-0', 'pointer-events-none');
      supportModal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      supportOverlay.classList.add('opacity-0', 'pointer-events-none');
      supportModal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
      document.body.style.overflow = '';
      sessionStorage.setItem('bks-support-modal-seen', '1');
    };

    supportClose && supportClose.addEventListener('click', closeModal);
    supportCloseMobile && supportCloseMobile.addEventListener('click', closeModal);
    supportOverlay.addEventListener('click', closeModal);
    document.querySelectorAll('[data-close-support]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    if (!sessionStorage.getItem('bks-support-modal-seen')) {
      setTimeout(openModal, 3000);
    }
  }

  // ===== Hero: vertical looping venture pill list =====
  const loopViewport = document.getElementById('venture-loop');
  const loopTrack = document.getElementById('venture-loop-track');
  if (loopViewport && loopTrack) {
    const items = Array.from(loopTrack.children);
    const visibleCount = 3;

    // Clone the full list once at the end so the loop can reset seamlessly.
    items.forEach((item) => loopTrack.appendChild(item.cloneNode(true)));
    const allItems = Array.from(loopTrack.children);

    let itemHeight = 0;
    let index = 0;

    const measure = () => {
      // Round up so sub-pixel gaps never leave a sliver of the next pill visible.
      itemHeight = Math.ceil(items[0].getBoundingClientRect().height) + 12; // + gap-3
      loopViewport.style.height = `${itemHeight * visibleCount}px`;
      loopTrack.style.transform = `translateY(-${index * itemHeight}px)`;
    };

    const setActive = () => {
      const activeIndex = (index + 1) % allItems.length;
      allItems.forEach((item, i) => {
        item.classList.toggle('venture-pill--active', i === activeIndex);
      });
    };

    const step = () => {
      index += 1;
      loopTrack.style.transform = `translateY(-${index * itemHeight}px)`;
      setActive();

      if (index === items.length) {
        setTimeout(() => {
          loopTrack.style.transition = 'none';
          index = 0;
          loopTrack.style.transform = 'translateY(0px)';
          setActive();
          requestAnimationFrame(() => {
            loopTrack.style.transition = '';
          });
        }, 700);
      }
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener('resize', measure);

    setActive();
    setInterval(step, 1900);
  }

  // ===== Ventures page: search / filter =====
  const ventureSearch = document.getElementById('venture-search');
  const ventureList = document.getElementById('venture-list');
  const ventureEmpty = document.getElementById('venture-search-empty');

  if (ventureSearch && ventureList) {
    const items = Array.from(ventureList.querySelectorAll('.venture-item'));

    const applyFilter = () => {
      const query = ventureSearch.value.trim().toLowerCase();
      let visibleCount = 0;

      items.forEach((item) => {
        const matches = !query || item.textContent.toLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) {
          visibleCount += 1;
          item.open = query.length > 0;
        }
      });

      if (ventureEmpty) {
        ventureEmpty.classList.toggle('hidden', visibleCount !== 0);
      }
    };

    ventureSearch.addEventListener('input', applyFilter);

    // Arriving from the homepage hero search (?q=...): pre-fill and filter immediately.
    const params = new URLSearchParams(window.location.search);
    const incomingQuery = params.get('q');
    if (incomingQuery) {
      ventureSearch.value = incomingQuery;
      applyFilter();

      const searchSection = document.getElementById('venture-search-section');
      if (searchSection) {
        // Explicit offset math instead of scrollIntoView: the fixed header's
        // height overlaps the top of the viewport. The scroll is deferred to
        // the window 'load' event (not just DOMContentLoaded) because icon
        // rendering and web fonts still shift the layout by ~100px right
        // after DOMContentLoaded, which threw off an earlier, earlier-fired
        // calculation.
        const headerOffset = 130;
        const doScroll = (behavior) => {
          const top = searchSection.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top, behavior });
        };
        // A late reflow (icons/fonts settling) can still shift the layout
        // after the first scroll lands, so re-snap once more shortly after.
        const scrollTwice = () => {
          doScroll('smooth');
          setTimeout(() => doScroll('auto'), 500);
        };
        if (document.readyState === 'complete') {
          setTimeout(scrollTwice, 50);
        } else {
          window.addEventListener('load', () => setTimeout(scrollTwice, 50));
        }
      }
    }
  }
});
