/* VRF 360 — FAQ: acordeão acessível com animação de altura */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('faq', function () {
    VRF.qsa('.qa').forEach(function (d) {
      var summary = d.querySelector('summary');
      var body = d.querySelector('.qa__body');
      if (!summary || !body) return;
      summary.addEventListener('click', function (e) {
        if (VRF.flags.reduced) { setTimeout(function () { ScrollTrigger.refresh(); }, 50); return; }
        e.preventDefault();
        if (d.open) {
          gsap.fromTo(body, { height: body.offsetHeight }, {
            height: 0, duration: 0.45, ease: 'power2.inOut',
            onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); }
          });
        } else {
          d.open = true;
          gsap.fromTo(body, { height: 0 }, {
            height: body.scrollHeight, duration: 0.6, ease: 'expo.out',
            onComplete: function () { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); }
          });
          gsap.fromTo(body.firstElementChild, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.05 });
        }
      });
    });
  });
})();
