/* VRF 360 — rolagem suave (Lenis, só com mouse) e âncoras */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('smooth', function () {
    var useLenis = window.Lenis && !VRF.flags.reduced && !VRF.flags.touch;
    if (useLenis) {
      var lenis = new Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1
      });
      VRF.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (VRF.closeMenu && VRF.menuOpen) VRF.closeMenu(false);
      var offset = 0;
      if (id === '#orcamento') offset = -(VRF.navH() + 24);
      setTimeout(function () { VRF.scrollTo(el, { offset: offset }); }, VRF.menuOpen ? 380 : 0);
      if (id === '#home') return;
      if (history.replaceState) history.replaceState(null, '', id);
      if (id === '#orcamento') {
        setTimeout(function () {
          var first = el.querySelector('input:not([type=hidden]):not([tabindex="-1"])');
          if (first) first.focus({ preventScroll: true });
        }, 1100);
      }
    });
  });
})();
