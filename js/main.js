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

  /* ---------- Image lightbox popup ---------- */
  document.querySelectorAll('.photo-slot').forEach(function (slot) {
    slot.addEventListener('click', function (e) {
      // Don't trigger lightbox if the user clicked the upload button or file input
      if (e.target.closest('.photo-upload-btn')) return;

      var img = slot.querySelector('img');
      if (!img || img.style.display === 'none') return; // image is broken/placeholder showing

      var overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 cursor-zoom-out opacity-0 transition-opacity duration-300';
      
      var largeImg = document.createElement('img');
      largeImg.src = img.src;
      largeImg.className = 'max-w-full max-h-full rounded-lg object-contain shadow-2xl transform scale-95 transition-transform duration-300';
      
      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = 'absolute top-6 right-6 text-zinc-400 hover:text-white text-4xl font-light w-10 h-10 flex items-center justify-center cursor-pointer';
      
      overlay.appendChild(largeImg);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      
      // Animate opening
      setTimeout(function () {
        overlay.classList.remove('opacity-0');
        largeImg.classList.remove('scale-95');
      }, 10);
      
      function closeLightbox() {
        overlay.classList.add('opacity-0');
        largeImg.classList.add('scale-95');
        setTimeout(function () {
          overlay.remove();
        }, 300);
      }
      
      overlay.addEventListener('click', closeLightbox);
      closeBtn.addEventListener('click', closeLightbox);
    });
  });

  /* ---------- Hide edit/upload controls on production domains ---------- */
  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
  if (!isLocal) {
    document.querySelectorAll('.photo-upload-btn').forEach(function (btn) {
      btn.style.display = 'none';
    });
  }
})();