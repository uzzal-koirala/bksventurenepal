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
});
