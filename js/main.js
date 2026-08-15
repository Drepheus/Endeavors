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

  /* ---------- Photo slot uploads ---------- */
  document.querySelectorAll('.photo-slot').forEach(function (slot) {
    if (slot.dataset.uploadBound) return;
    slot.dataset.uploadBound = '1';

    var btn = slot.querySelector('.photo-upload-btn');
    var input = slot.querySelector('input[type=file]');
    var img = slot.querySelector('img');
    var placeholder = slot.querySelector('.photo-placeholder');
    var status = slot.querySelector('.photo-status');
    var slotName = slot.dataset.slot;

    function flash(message, isError) {
      if (!status) return;
      status.textContent = message;
      status.style.color = isError ? '#EF4444' : (slot.dataset.accent || '#FFD40A');
      clearTimeout(slot._statusTimer);
      slot._statusTimer = setTimeout(function () {
        status.textContent = '';
      }, 3000);
    }

    input.addEventListener('change', function () {
      var file = input.files[0];
      if (!file) return;
      var fd = new FormData();
      fd.append('slot', slotName);
      fd.append('file', file);
      flash('Uploading…', false);
      fetch('/cgi-bin/upload.py', { method: 'POST', body: fd })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.ok) {
            img.src = data.url;
            img.style.display = '';
            if (placeholder) placeholder.style.display = 'none';
            flash('Saved ✓', false);
          } else {
            flash(data.error || 'Upload failed', true);
          }
        })
        .catch(function () { flash('Upload failed', true); });
      input.value = '';
    });
  });
})();