/* VRF 360 — preloader "start-up do sistema" (só na primeira visita da sessão) */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('preloader', function () {
    var html = document.documentElement;
    var pre = VRF.qs('.preloader');
    var show = html.classList.contains('show-preloader') && pre && !VRF.flags.reduced;
    var start = function (delay) { if (VRF.heroIntro) VRF.heroIntro(delay); };

    if (!show) {
      html.classList.remove('show-preloader');
      start(0.05);
      return;
    }
    try { sessionStorage.setItem('vrf360-visitou', '1'); } catch (e) {}

    var temp = VRF.qs('[data-temp]', pre);
    var bar = VRF.qs('.preloader__bar span', pre);
    var state = { t: 31 };
    gsap.timeline()
      .to(state, { t: 23, duration: 1.45, ease: 'power2.inOut', onUpdate: function () { temp.textContent = state.t.toFixed(1).replace('.', ','); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.45, ease: 'power2.inOut' }, 0);

    var minTime = new Promise(function (r) { setTimeout(r, 1500); });
    var heroReady = Promise.race([VRF.heroReady || Promise.resolve(), new Promise(function (r) { setTimeout(r, 2600); })]);

    Promise.all([minTime, heroReady]).then(function () {
      gsap.to(VRF.qs('.preloader__core', pre), { y: -30, opacity: 0, duration: 0.6, ease: 'power2.in' });
      gsap.to(pre, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.05,
        delay: 0.25,
        ease: 'expo.inOut',
        onComplete: function () { html.classList.remove('show-preloader'); gsap.set(pre, { clearProps: 'all' }); }
      });
      start(0.55);
    });
  });
})();
