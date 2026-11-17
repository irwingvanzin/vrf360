/* VRF 360 — cursor personalizado e botões magnéticos (somente mouse) */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('cursor', function () {
    if (!VRF.flags.finePointer || VRF.flags.reduced) return;
    var cursor = VRF.qs('.cursor');
    if (!cursor) return;
    var dot = VRF.qs('.cursor__dot', cursor);
    var ring = VRF.qs('.cursor__ring', cursor);
    var label = VRF.qs('.cursor__label', cursor);
    var mx = -100, my = -100, rx = -100, ry = -100;
    var setDot = { x: gsap.quickSetter(dot, 'x', 'px'), y: gsap.quickSetter(dot, 'y', 'px') };
    var setRing = { x: gsap.quickSetter(ring, 'x', 'px'), y: gsap.quickSetter(ring, 'y', 'px') };

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      setDot.x(mx); setDot.y(my);
      cursor.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });

    gsap.ticker.add(function (t, dt) {
      var k = 1 - Math.pow(0.0018, (dt || 16) / 1000);
      rx += (mx - rx) * k; ry += (my - ry) * k;
      setRing.x(rx); setRing.y(ry);
    });

    document.addEventListener('pointerover', function (e) {
      var labelled = e.target.closest('[data-cursor]');
      var hover = e.target.closest('a, button, summary, label.chip, input, select, textarea');
      cursor.classList.toggle('has-label', !!labelled);
      label.textContent = labelled ? labelled.getAttribute('data-cursor') : '';
      cursor.classList.toggle('is-hover', !!hover && !labelled);
    });

    /* Botões magnéticos */
    VRF.qsa('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  });
})();
