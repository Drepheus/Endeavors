(function () {
  'use strict';

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var open = false;
    toggle.addEventListener('click', function () {
      open = !open;
      menu.classList.toggle('hidden', !open);
      var bars = toggle.children;
      if (open) {
        bars[0].style.transform = 'translateY(3.5px) rotate(45deg)';
        bars[1].style.transform = 'translateY(-3.5px) rotate(-45deg)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.transform = '';
      }
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        open = false;
        menu.classList.add('hidden');
        toggle.children[0].style.transform = '';
        toggle.children[1].style.transform = '';
      }
    });
  }

  /* ---------- Header background on scroll ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) {
        header.classList.add('bg-ink-950/80', 'backdrop-blur-md');
      } else {
        header.classList.remove('bg-ink-950/80', 'backdrop-blur-md');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Mouse-follow glow on venture cards ---------- */
  document.querySelectorAll('.card-glow').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  });
})();