/* VRF 360 — faixa rolante que acelera e inclina com a velocidade do scroll */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('marquee', function () {
    var wrap = VRF.qs('.marquee');
    if (!wrap) return;
    var rows = VRF.qsa('[data-marquee]', wrap).map(function (row) {
      var group = row.querySelector('.marquee__group');
      var w = group.getBoundingClientRect().width || 1;
      var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / w) + 1);
      for (var i = 1; i < copies; i++) row.appendChild(group.cloneNode(true));
      return { el: row, group: group, w: w, x: 0, dir: parseFloat(row.getAttribute('data-marquee')) || 1 };
    });
    if (VRF.flags.reduced) return;

    var velocity = 0, running = false, direction = 1;
    ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: function (self) { running = self.isActive; },
      onUpdate: function (self) {
        velocity = self.getVelocity();
        if (Math.abs(velocity) > 20) direction = velocity > 0 ? 1 : -1;
      }
    });
    window.addEventListener('resize', function () {
      rows.forEach(function (r) { r.w = r.group.getBoundingClientRect().width || r.w; });
    });

    var skew = 0;
    gsap.ticker.add(function (t, dt) {
      if (!running) return;
      var f = (dt || 16.7) / 16.7;
      var boost = VRF.clamp(Math.abs(velocity) / 220, 0, 9);
      var targetSkew = VRF.clamp(velocity / -380, -7, 7);
      skew += (targetSkew - skew) * 0.12;
      rows.forEach(function (r) {
        r.x -= (0.55 + boost) * r.dir * direction * f;
        if (r.x <= -r.w) r.x += r.w;
        if (r.x > 0) r.x -= r.w;
        r.el.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      });
      velocity *= 0.9;
    });
  });
})();
