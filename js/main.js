/* VRF 360 — inicialização */
(function () {
  'use strict';
  var VRF = window.VRF;
  var html = document.documentElement;
  if (!VRF || VRF.flags.nojs) return;

  var yearEls = document.querySelectorAll('[data-year]');
  for (var i = 0; i < yearEls.length; i++) yearEls[i].textContent = new Date().getFullYear();

  if (!window.gsap || !window.ScrollTrigger) {
    // Bibliotecas indisponíveis: mantém o layout estático e legível.
    html.classList.remove('show-preloader', 'js');
    html.classList.add('no-js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out' });

  if (VRF.flags.touch) html.classList.add('is-touch');
  if (VRF.flags.finePointer && !VRF.flags.reduced) html.classList.add('has-cursor');
  html.classList.add('js-ready');

  VRF.modules.forEach(function (m) {
    try { m.fn(); } catch (e) { if (window.console) console.error('[VRF 360] módulo "' + m.name + '":', e); }
  });

  var refresh = function () { ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
