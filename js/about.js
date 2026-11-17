/* VRF 360 — sobre: retrato duotone → cor e linha do tempo guiada pela rolagem */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('about', function () {
    var frame = VRF.qs('.about__frame');
    var tl = VRF.qs('.timeline');
    var items = tl ? VRF.qsa('.tl', tl) : [];

    if (VRF.flags.reduced) {
      if (tl) tl.style.setProperty('--tl', '1');
      items.forEach(function (it) { it.classList.add('is-on'); });
      return;
    }

    if (frame) {
      ScrollTrigger.create({
        trigger: frame,
        start: 'top 78%',
        end: 'center 40%',
        scrub: 0.6,
        onUpdate: function (self) { frame.style.setProperty('--reveal', VRF.easeOut(self.progress).toFixed(4)); }
      });
      gsap.fromTo(frame, { scale: 0.94, borderRadius: 48 }, {
        scale: 1, borderRadius: 28, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'top 45%', scrub: true }
      });
    }

    if (tl) {
      ScrollTrigger.create({
        trigger: tl,
        start: 'top 80%',
        end: 'bottom 62%',
        scrub: 0.4,
        onUpdate: function (self) {
          var p = self.progress;
          tl.style.setProperty('--tl', p.toFixed(4));
          items.forEach(function (it, i) { it.classList.toggle('is-on', p >= i / Math.max(1, items.length - 1) - 0.02); });
        }
      });
    }
  });
})();
