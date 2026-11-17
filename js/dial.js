/* VRF 360 — dial 360° de progresso da página (clique = voltar ao topo) */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('dial', function () {
    var btn = VRF.qs('.dial-progress');
    if (!btn) return;
    var bar = VRF.qs('.dial-progress__bar', btn);
    var fan = VRF.qs('.dial-progress__fan', btn);
    var deg = VRF.qs('[data-progress-deg]', btn);
    var setFan = gsap.quickSetter(fan, 'rotation', 'deg');
    var footerFan = VRF.qs('.footer__fan');
    var setFooterFan = footerFan ? gsap.quickSetter(footerFan, 'rotation', 'deg') : null;

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var p = self.progress;
        bar.style.strokeDashoffset = String(360 - p * 360);
        deg.textContent = Math.round(p * 360);
        if (!VRF.flags.reduced) {
          setFan(p * 1080);
          if (setFooterFan) setFooterFan(p * 1440);
        }
        btn.classList.toggle('is-visible', self.scroll() > window.innerHeight * 0.6);
      }
    });

    btn.addEventListener('click', function () {
      VRF.scrollTo(0, { duration: 1.8 });
      var skip = document.querySelector('.skip-link');
      if (skip) setTimeout(function () { skip.focus({ preventScroll: true }); }, 900);
    });
  });
})();
