/* ALEXANDRIA CAR CLINIC — motion engine
   Adapted from the Loco Exotics engine (see SCROLL-SITE-PLAYBOOK in
   the Loco repo). Momentum wheel-scroll, two pinned scroll-scrubbed
   films (the M2 hero and the AMG lift), word-mask and soft-fade text
   reveals, the services index, and the booking form.
   Everything is off under prefers-reduced-motion. No libraries. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) html.classList.add('reduced');

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var fade = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };

  // Colour of the pin veil at hand-offs; matches --color-midnight.
  var CANVAS = '#050B16';

  /* ----------------------------------------------------------
     Momentum smooth scroll — wheel input eased toward a target
     so native layout (sticky stages, fixed nav, anchors) keeps
     working. Touch devices keep native scrolling.
     ---------------------------------------------------------- */
  var target = window.scrollY;
  var current = window.scrollY;
  var hijack = !reduced && window.matchMedia('(pointer: fine)').matches;

  function maxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  if (hijack) {
    html.classList.add('momentum');

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      target = clamp(target + dy, 0, maxScroll());
    }, { passive: false });

    window.addEventListener('scroll', function () {
      if (Math.abs(window.scrollY - current) > 2) {
        target = current = window.scrollY;
      }
    }, { passive: true });
  }

  // The lift scene is empty at progress 0, so its nav anchor lands a
  // little way INTO the scrub, far enough that the caption and first
  // review are on screen.
  var anchorDepth = { reviews: 0.18 };

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var dest = document.getElementById(id);
      if (!dest) return;
      var top = dest.getBoundingClientRect().top + window.scrollY;
      if (anchorDepth[id] && dest.hasAttribute('data-pin')) {
        top += (dest.offsetHeight - window.innerHeight) * anchorDepth[id];
      }
      e.preventDefault();
      if (hijack) {
        target = clamp(top, 0, maxScroll());
      } else {
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     Posters are assigned here, once, rather than in the HTML, so a
     phone never paints one frame and then swaps to another. A
     <source> may also carry data-portrait / data-portrait-poster for
     a 9:16 cut on phones; promoted synchronously to the video's own
     src before load() so only one file is ever fetched. (No portrait
     cuts exist yet, so no source sets these today.)
     ---------------------------------------------------------- */
  var portraitMode = window.matchMedia('(max-width: 640px)').matches;
  document.querySelectorAll('source[data-poster], source[data-portrait]').forEach(function (s) {
    var v = s.parentNode;
    var usePortrait = portraitMode && s.hasAttribute('data-portrait');
    if (usePortrait) {
      v.removeChild(s);
      v.src = s.getAttribute('data-portrait');
    }
    var poster = s.getAttribute(usePortrait ? 'data-portrait-poster' : 'data-poster');
    if (poster) v.poster = poster;
  });

  /* ----------------------------------------------------------
     Pinned sections — shared progress computation. Each .pin
     gets p in [0,1] across its scrollable span; a handler per
     pin-name turns p into the section's choreography.
     ---------------------------------------------------------- */
  var pins = Array.prototype.map.call(
    document.querySelectorAll('[data-pin]'),
    function (el) {
      var video = el.querySelector('[data-scrub]');
      return {
        el: el,
        name: el.getAttribute('data-pin-name'),
        video: video,
        reverse: video ? video.hasAttribute('data-scrub-reverse') : false,
        caption: el.querySelector('[data-pin-caption]'),
        fadeEl: el.querySelector('[data-pin-fade]'),
        vt: null // smoothed video time
      };
    }
  );

  /* Scrub with its own easing: the displayed frame chases the
     scroll-derived time, and we never queue a seek while one is
     still in flight, the two things that made scrubbing stutter. */
  function scrubVideo(pin, p) {
    var video = pin.video;
    if (!video || video.readyState < 1 || !video.duration) return;
    var t = (pin.reverse ? 1 - p : p) * (video.duration - 0.05);
    pin.vt = pin.vt == null ? t : pin.vt + (t - pin.vt) * 0.22;
    if (video.seeking) return;
    var delta = Math.abs(video.currentTime - pin.vt);
    if (delta < 1 / 48) return;
    if (delta > 0.5 && typeof video.fastSeek === 'function') {
      video.fastSeek(pin.vt);
    } else {
      video.currentTime = pin.vt;
    }
  }

  var heroLockup = document.querySelector('[data-hero-lockup]');
  var heroCue = document.querySelector('[data-hero-cue]');
  var navWordmark = document.querySelector('.nav__wordmark');
  var reviewCards = document.querySelectorAll('[data-review-card]');
  var liftHint = document.querySelector('[data-lift-hint]');
  var bookPill = document.querySelector('[data-book-pill]');

  // Scroll cue: ring of little dots around the chevron
  var cueRing = document.querySelector('[data-cue-ring]');
  if (cueRing) {
    for (var d = 0; d < 16; d++) {
      var dot = document.createElement('i');
      dot.style.setProperty('--dot-angle', (d * 22.5) + 'deg');
      cueRing.appendChild(dot);
    }
  }

  // Nav items: wrap each letter so it can ride the ticker wave
  document.querySelectorAll('.nav__item').forEach(function (item) {
    var text = item.textContent;
    item.textContent = '';
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'nav__ch';
      span.style.setProperty('--ch', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      item.appendChild(span);
    });
  });

  /* The hero film loads immediately; the lift film waits until its
     section is within two viewports, so the hero scrub gets the
     bandwidth and decode time. */
  function loadFilm(video) {
    if (!video) return;
    video.preload = 'auto';
    video.load();
  }

  function deferFilm(video, section) {
    if (!video || !section) return;
    if (!('IntersectionObserver' in window)) { loadFilm(video); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loadFilm(video);
        io.disconnect();
      });
    }, { rootMargin: '200% 0px' });
    io.observe(section);
  }

  pins.forEach(function (pin) {
    if (pin.name === 'hero') loadFilm(pin.video);
    else deferFilm(pin.video, pin.el);
  });

  var handlers = {
    hero: function (pin, p) {
      // The M2 drives out of frame across the first ~75% of the
      // scrub; the last quarter is the empty floor, where the
      // headline and buttons stay put and then ride away.
      scrubVideo(pin, p);
      if (heroLockup) {
        var lockupVis = 1 - fade(p, 0.82, 0.97);
        heroLockup.style.transform = 'translateY(' + (fade(p, 0.7, 1) * -60) + 'px)';
        heroLockup.style.opacity = String(lockupVis);
        // faded-out CTAs must stop catching taps: opacity alone
        // leaves invisible but clickable buttons over the film
        heroLockup.style.pointerEvents = lockupVis < 0.35 ? 'none' : '';
        heroLockup.style.visibility = lockupVis === 0 ? 'hidden' : '';
      }
      if (heroCue) heroCue.style.opacity = String(1 - fade(p, 0.02, 0.1));
      // corner wordmark SNAPS in as the big lockup leaves
      if (navWordmark) navWordmark.classList.toggle('is-on', p > 0.8);
      // phone quick-book pill stays out of the hero; the real CTAs
      // are already on screen. It returns as the hero scrolls away.
      if (bookPill) bookPill.classList.toggle('is-hidden', p < 0.9);
    },

    lift: function (pin, p) {
      // The lift film runs (reversed) underneath while five-star
      // reviews pop up over it as glass cards. Desktop accumulates all
      // six around the car; phones only fit two slots, so each card
      // holds its slot for a beat and hands off to the next.
      scrubVideo(pin, p);
      if (pin.caption) pin.caption.classList.toggle('is-on', p > 0.06 && p < 0.9);
      if (liftHint) {
        liftHint.style.opacity = String(fade(p, 0.08, 0.16) * (1 - fade(p, 0.32, 0.42)) * 0.9);
      }
      var n = reviewCards.length;
      var slot = 0.66 / n;
      var phones = window.innerWidth <= 640;
      reviewCards.forEach(function (card, i) {
        var at = 0.14 + i * slot;
        var on = phones ? (p > at && p < at + slot * 1.9) : (p > at);
        card.classList.toggle('is-on', on);
      });
      // flash guard: settle to the canvas colour at the very end
      if (pin.fadeEl) {
        pin.fadeEl.style.background = CANVAS;
        pin.fadeEl.style.opacity = String(fade(p, 0.97, 1));
      }
    }
  };

  function pinFrame() {
    if (reduced) return;
    pins.forEach(function (pin) {
      var rect = pin.el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      var span = pin.el.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      var p = clamp(-rect.top / span, 0, 1);
      var fn = handlers[pin.name];
      if (fn) fn(pin, p);
    });
  }

  /* ----------------------------------------------------------
     Main loop
     ---------------------------------------------------------- */
  function loop() {
    if (hijack) {
      current += (target - current) * 0.06;
      if (Math.abs(target - current) < 0.1) current = target;
      if (Math.abs(window.scrollY - current) >= 0.5) window.scrollTo(0, current);
    } else {
      current = window.scrollY;
    }
    pinFrame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ----------------------------------------------------------
     Text splitting — masked words for headings, soft-fade words
     for body copy.
     ---------------------------------------------------------- */
  function splitWords(el, stagger, cls) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var idx = 0;
    nodes.forEach(function (node) {
      if (node.nodeType !== 3) return; // keep <br> etc. intact
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (piece) {
        if (!piece.trim()) {
          if (piece) frag.appendChild(document.createTextNode(' '));
          return;
        }
        if (cls === 'softword') {
          var w = document.createElement('span');
          w.className = 'softword';
          w.textContent = piece;
          w.style.setProperty('--word-delay', (idx * stagger) + 'ms');
          frag.appendChild(w);
        } else {
          var mask = document.createElement('span');
          mask.className = 'word';
          var inner = document.createElement('span');
          inner.textContent = piece;
          inner.style.setProperty('--word-delay', (idx * stagger) + 'ms');
          mask.appendChild(inner);
          frag.appendChild(mask);
        }
        idx++;
      });
      el.replaceChild(frag, node);
    });
  }

  if (!reduced) {
    var introWords = document.querySelector('[data-intro-words]');
    if (introWords) splitWords(introWords, 120, 'word');
    document.querySelectorAll('[data-split]').forEach(function (el) {
      splitWords(el, 70, 'word');
    });
    document.querySelectorAll('[data-split-soft]').forEach(function (el) {
      splitWords(el, 24, 'softword');
    });

    window.addEventListener('load', function () {
      var lockup = document.querySelector('[data-hero-lockup]');
      if (lockup) lockup.classList.add('is-in');
      document.querySelectorAll('[data-intro-fade]').forEach(function (el) {
        el.classList.add('is-in');
      });
    });
  }

  /* ----------------------------------------------------------
     Count-up numbers (statement stats)
     ---------------------------------------------------------- */
  function fmtCount(val, el) {
    var pad = parseInt(el.getAttribute('data-pad'), 10) || 0;
    var s = pad ? String(val).padStart(pad, '0') : String(val);
    if (el.hasAttribute('data-comma')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s;
  }

  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    var dur = 1400;
    var t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = clamp((ts - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmtCount(Math.round(eased * to), el);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var countEls = document.querySelectorAll('[data-countup]');
    if (reduced) {
      countEls.forEach(function (el) {
        var to = parseInt(el.getAttribute('data-to'), 10) || 0;
        el.textContent = fmtCount(to, el);
      });
    } else {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          countIo.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -20% 0px' });
      countEls.forEach(function (el) { countIo.observe(el); });
    }
  }

  /* ----------------------------------------------------------
     Scroll-triggered reveals
     ---------------------------------------------------------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.getAttribute('data-reveal-delay');
        if (delay) el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px' });

    document.querySelectorAll('[data-reveal], [data-draw], [data-split], [data-split-soft]')
      .forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     Photo slots — any <figure data-photo> / stage frame shows a dashed
     placeholder frame with its label until a real image loads.
     ---------------------------------------------------------- */
  function watchPhoto(img, box) {
    function miss() { box.classList.add('is-missing'); }
    function ok() { box.classList.remove('is-missing'); }
    img.addEventListener('error', miss);
    img.addEventListener('load', ok);
    if (img.complete) { if (img.naturalWidth === 0) miss(); else ok(); }
  }

  document.querySelectorAll('[data-photo]').forEach(function (box) {
    var img = box.querySelector('img');
    if (img) watchPhoto(img, box);
  });

  /* ----------------------------------------------------------
     Services index — desktop: hover / focus / click a row and the
     sticky stage swaps to that service's photo and line. Phones:
     each row is an accordion holding its own photo.
     ---------------------------------------------------------- */
  var svcRoot = document.querySelector('[data-svc-root]');
  if (svcRoot) {
    var svcItems = Array.prototype.slice.call(svcRoot.querySelectorAll('[data-svc]'));
    var stageFrame = svcRoot.querySelector('[data-svc-frame]');
    var stageImg = svcRoot.querySelector('[data-svc-img]');
    var stageName = svcRoot.querySelector('[data-svc-name]');
    var stageDesc = svcRoot.querySelector('[data-svc-desc]');
    var narrow = window.matchMedia('(max-width: 900px)');
    var swapTimer = null;

    watchPhoto(stageImg, stageFrame);

    function warm(item) {
      if (!item) return;
      var src = item.getAttribute('data-img');
      if (src) { var im = new Image(); im.src = src; }
    }

    function setActive(item) {
      svcItems.forEach(function (it) { it.classList.toggle('is-active', it === item); });
      var src = item.getAttribute('data-img');
      stageName.innerHTML = item.getAttribute('data-name');
      stageDesc.textContent = item.getAttribute('data-desc');
      stageFrame.setAttribute('data-label', item.getAttribute('data-name').replace(/&amp;/g, '&') + ' · photo coming soon');
      clearTimeout(swapTimer);
      stageFrame.classList.add('is-swap');
      swapTimer = setTimeout(function () {
        stageImg.setAttribute('src', src);
        stageImg.setAttribute('alt', item.getAttribute('data-name').replace(/&amp;/g, '&'));
        stageFrame.classList.remove('is-swap');
      }, reduced ? 0 : 180);
      warm(item.nextElementSibling);
    }

    function fillPanel(item) {
      var panel = item.querySelector('.svc-panel');
      if (panel.getAttribute('data-filled')) return;
      panel.setAttribute('data-filled', '1');
      var label = item.getAttribute('data-name').replace(/&amp;/g, '&');
      var box = document.createElement('div');
      box.className = 'photo';
      box.setAttribute('data-label', label + ' · photo coming soon');
      var img = document.createElement('img');
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.alt = label;
      box.appendChild(img);
      watchPhoto(img, box);
      img.src = item.getAttribute('data-img');
      var desc = document.createElement('p');
      desc.className = 'svc-stage__desc';
      desc.textContent = item.getAttribute('data-desc');
      var actions = document.createElement('div');
      actions.className = 'svc-actions';
      actions.innerHTML = '<button class="btn-pill" type="button" data-request-svc>Request this service</button>';
      panel.appendChild(box);
      panel.appendChild(desc);
      panel.appendChild(actions);
    }

    svcItems.forEach(function (item) {
      var row = item.querySelector('.svc-row');
      row.addEventListener('mouseenter', function () {
        if (!narrow.matches) setActive(item);
      });
      row.addEventListener('focus', function () {
        if (!narrow.matches) setActive(item);
      });
      row.addEventListener('click', function () {
        if (narrow.matches) {
          var open = !item.classList.contains('is-open');
          svcItems.forEach(function (it) {
            it.classList.remove('is-open');
            it.querySelector('.svc-row').setAttribute('aria-expanded', 'false');
          });
          if (open) {
            fillPanel(item);
            item.classList.add('is-open');
            row.setAttribute('aria-expanded', 'true');
          }
        } else {
          setActive(item);
        }
      });
    });

    if (svcItems.length) {
      setActive(svcItems[0]);
      if ('IntersectionObserver' in window) {
        var warmIo = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          svcItems.slice(0, 3).forEach(warm);
          warmIo.disconnect();
        }, { rootMargin: '100% 0px' });
        warmIo.observe(svcRoot);
      }
    }
  }


  /* ----------------------------------------------------------
     Service chips in the booking form: click to select, click again
     to unselect, any number. "Request this service" buttons in the
     index add that service and jump to the form.
     ---------------------------------------------------------- */
  var chipBox = document.querySelector('[data-svc-chips]');
  var chipFor = {};
  if (chipBox && svcRoot) {
    Array.prototype.forEach.call(svcRoot.querySelectorAll('[data-svc]'), function (item) {
      var name = item.getAttribute('data-name').replace(/&amp;/g, '&');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.setAttribute('aria-pressed', 'false');
      b.textContent = name;
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
      chipBox.appendChild(b);
      chipFor[item.getAttribute('data-name')] = b;
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-request-svc]');
    if (!btn) return;
    var item = btn.closest('[data-svc]');
    var name = item ? item.getAttribute('data-name') : stageName && stageName.innerHTML;
    if (!name && svcRoot) {
      var act = svcRoot.querySelector('[data-svc].is-active');
      name = act && act.getAttribute('data-name');
    }
    var chip = chipFor[name];
    if (chip) chip.setAttribute('aria-pressed', 'true');
    var dest = document.getElementById('book');
    var top = dest.getBoundingClientRect().top + window.scrollY;
    if (hijack) target = clamp(top, 0, maxScroll());
    else window.scrollTo({ top: top, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     Active nav item
     ---------------------------------------------------------- */
  var navItems = document.querySelectorAll('[data-nav]');
  var sections = [];
  navItems.forEach(function (item) {
    var section = document.getElementById(item.getAttribute('data-nav'));
    if (section) sections.push({ el: section, item: item });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navItems.forEach(function (i) { i.classList.remove('is-active'); });
        sections.forEach(function (s) {
          if (s.el === entry.target) s.item.classList.add('is-active');
        });
      });
    }, { rootMargin: '-30% 0px -55% 0px' });
    sections.forEach(function (s) { navIo.observe(s.el); });
  }

  /* ----------------------------------------------------------
     Mobile quick-book pill — hidden while #book is on screen.
     ---------------------------------------------------------- */
  var bookSection = document.getElementById('book');
  if (bookPill && bookSection && 'IntersectionObserver' in window) {
    var pillIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bookPill.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    pillIo.observe(bookSection);
  }

  /* ----------------------------------------------------------
     Booking form — validates, then POSTs to form.dataset.endpoint
     (a form service that forwards to the shop's email). With no
     endpoint set it only swaps in the confirmation, sending nothing.
     ---------------------------------------------------------- */
  var form = document.querySelector('[data-book-form]');
  var done = document.querySelector('[data-book-done]');
  if (form && done) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var endpoint = form.getAttribute('data-endpoint');
      function finish() { form.hidden = true; done.hidden = false; }
      if (!endpoint) { finish(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.services = Array.prototype.map.call(
        form.querySelectorAll('.chip[aria-pressed="true"]'), function (c) { return c.textContent; }).join(', ');
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        finish();
      })['catch'](function () {
        alert('Sorry, that did not send. Please call 703.370.8870.');
      });
    });
  }
})();
