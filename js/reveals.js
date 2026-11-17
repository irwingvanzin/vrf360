/* VRF 360 — revelações: títulos por linha, palavras que acendem, fade-up, contadores e parallax */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.splitLines = function (el, opts) {
    if (!window.SplitText) return null;
    opts = opts || {};
    return SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: opts.onSplit
    });
  };

  VRF.register('reveals', function () {
    var reduced = VRF.flags.reduced;

    /* Títulos [data-split] (exceto o H1, animado pelo hero) */
    VRF.qsa('[data-split]').forEach(function (el) {
      if (el.closest('.hero') || reduced) return;
      VRF.splitLines(el, {
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.15,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          });
        }
      });
    });

    /* Texto que "acende" palavra por palavra conforme a rolagem */
    VRF.qsa('[data-words]').forEach(function (el) {
      if (reduced || !window.SplitText) return;
      var split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
      gsap.fromTo(split.words, { opacity: 0.14 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: 0.6 }
      });
    });

    /* Fade-up em lote */
    var revealEls = VRF.qsa('[data-reveal]');
    if (!reduced && revealEls.length) {
      gsap.set(revealEls, { opacity: 0, y: 34 });
      ScrollTrigger.batch(revealEls, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 1.05, ease: 'expo.out', stagger: 0.09, overwrite: true });
        }
      });
    }

    /* Contadores */
    VRF.qsa('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      if (reduced || isNaN(target)) { el.textContent = prefix + VRF.formatNumber(target); return; }
      var state = { v: 0 };
      el.textContent = prefix + '0';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(state, {
            v: target,
            duration: target > 100 ? 2.1 : 1.5,
            ease: 'power3.out',
            onUpdate: function () { el.textContent = prefix + VRF.formatNumber(Math.round(state.v)); }
          });
        }
      });
    });

    /* Parallax de mídia (seção Escala) */
    VRF.qsa('[data-parallax-media]').forEach(function (wrap) {
      if (reduced) return;
      var img = wrap.querySelector('img');
      gsap.fromTo(img, { scale: 1.22, yPercent: -6 }, {
        scale: 1.02,
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: wrap.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });
})();
