/* VRF 360 — portfólio: aletas que se abrem, parallax interno e visão térmica */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('portfolio', function () {
    var reduced = VRF.flags.reduced;
    VRF.qsa('.project').forEach(function (project) {
      var frame = VRF.qs('.project__frame', project);
      var img = VRF.qs('.project__img', project);
      var thermal = VRF.qs('.project__thermal', project);
      var louvers = VRF.qsa('.project__louvers i', project);
      var info = VRF.qs('.project__info', project);
      if (!frame) return;

      if (!reduced) {
        gsap.set(louvers, { scaleY: 1 });
        gsap.to(louvers, {
          scaleY: 0,
          duration: 1.15,
          ease: 'expo.inOut',
          stagger: 0.07,
          scrollTrigger: { trigger: frame, start: 'top 82%', once: true }
        });
        gsap.fromTo(thermal ? [img, thermal] : img, { scale: 1.2, yPercent: -3 }, {
          scale: 1.07,
          yPercent: 3,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
        });
        if (info) {
          gsap.from(info.children, {
            y: 32, opacity: 0, duration: 1.05, ease: 'expo.out', stagger: 0.08,
            scrollTrigger: { trigger: info, start: 'top 84%', once: true }
          });
        }
      }

      /* Visão térmica */
      if (VRF.flags.touch) {
        if (reduced) return;
        ScrollTrigger.create({
          trigger: frame,
          start: 'top 82%',
          end: 'bottom 18%',
          scrub: true,
          onUpdate: function (self) { frame.style.setProperty('--scan', (self.progress * 170 - 35).toFixed(1) + '%'); }
        });
        return;
      }
      var state = { r: 0, lens: 0 };
      var pos = { x: 0, y: 0, tx: 0, ty: 0 };
      var raf = 0;
      function loop() {
        pos.x += (pos.tx - pos.x) * 0.2;
        pos.y += (pos.ty - pos.y) * 0.2;
        frame.style.setProperty('--x', pos.x.toFixed(1) + 'px');
        frame.style.setProperty('--y', pos.y.toFixed(1) + 'px');
        raf = (Math.abs(pos.tx - pos.x) > 0.3 || Math.abs(pos.ty - pos.y) > 0.3 || state.r > 0) ? requestAnimationFrame(loop) : 0;
      }
      function apply() {
        frame.style.setProperty('--r', state.r.toFixed(1) + 'px');
        frame.style.setProperty('--lens', state.lens.toFixed(3));
      }
      frame.addEventListener('pointerenter', function (e) {
        var r = frame.getBoundingClientRect();
        pos.x = pos.tx = e.clientX - r.left; pos.y = pos.ty = e.clientY - r.top;
        gsap.to(state, { r: Math.min(150, r.width * 0.22), lens: 1, duration: reduced ? 0 : 0.7, ease: 'expo.out', onUpdate: apply });
        if (!raf) raf = requestAnimationFrame(loop);
      });
      frame.addEventListener('pointermove', function (e) {
        var r = frame.getBoundingClientRect();
        pos.tx = e.clientX - r.left; pos.ty = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      frame.addEventListener('pointerleave', function () {
        gsap.to(state, { r: 0, lens: 0, duration: reduced ? 0 : 0.5, ease: 'power3.inOut', onUpdate: apply });
      });
    });
  });
})();
