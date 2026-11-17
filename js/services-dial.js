/* VRF 360 — serviços: dial de 360°, 60° por serviço */
(function () {
  'use strict';
  var VRF = window.VRF;
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function polar(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function arc(cx, cy, r, a0, a1) {
    var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }

  VRF.register('services', function () {
    var sec = VRF.qs('.services');
    if (!sec) return;

    /* Links "Pedir orçamento deste serviço" marcam o serviço no formulário */
    VRF.qsa('[data-service]').forEach(function (a) {
      a.addEventListener('click', function () { if (VRF.prefillService) VRF.prefillService(a.getAttribute('data-service')); });
    });

    if (VRF.flags.reduced) return;

    var items = VRF.qsa('.service', sec);
    var navBtns = VRF.qsa('[data-go]', sec);
    var svg = VRF.qs('.dial__ring', sec);
    var fan = VRF.qs('.dial__fan', sec);
    var degEl = VRF.qs('[data-dial-deg]', sec);
    var track = VRF.qs('.services__track', sec);
    var N = items.length;
    var C = 300, R = 286;

    /* Monta o anel */
    el('circle', { cx: C, cy: C, r: R, class: 'ring-base' }, svg);
    el('circle', { cx: C, cy: C, r: R - 70, class: 'ring-inner' }, svg);
    var rot = el('g', { class: 'dial__rot' }, svg);
    for (var a = 0; a < 360; a += 5) {
      var major = a % 30 === 0;
      var p0 = polar(C, C, R - (major ? 22 : 10), a), p1 = polar(C, C, R - 2, a);
      el('line', { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: 'tick' + (major ? ' tick--major' : '') }, rot);
    }
    var sectors = [], sLabels = [];
    for (var i = 0; i < N; i++) {
      var a0 = i * 60 + 3, a1 = (i + 1) * 60 - 3;
      sectors.push(el('path', { d: arc(C, C, R - 44, a0, a1), class: 'sector' }, rot));
      var lp = polar(C, C, R - 92, i * 60 + 30);
      var t = el('text', { x: lp[0].toFixed(2), y: lp[1].toFixed(2), class: 'sector-label' }, rot);
      t.textContent = '0' + (i + 1);
      sLabels.push(t);
    }
    var pointer = el('path', { class: 'pointer', d: '' }, svg);

    var desktop = VRF.mq.desktop;
    function pointerAngle() { return window.innerWidth >= 900 ? 90 : 180; }
    function drawPointer() {
      var pa = pointerAngle();
      var tip = polar(C, C, R - 28, pa), b1 = polar(C, C, R + 4, pa - 3.2), b2 = polar(C, C, R + 4, pa + 3.2);
      pointer.setAttribute('d', 'M' + tip.join(' ') + ' L' + b1.join(' ') + ' L' + b2.join(' ') + 'Z');
    }
    drawPointer();
    window.addEventListener('resize', drawPointer);

    var setRot = function (deg) {
      rot.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' ' + C + ' ' + C + ')');
      sLabels.forEach(function (t) { t.setAttribute('transform', 'rotate(' + (-deg).toFixed(2) + ' ' + t.getAttribute('x') + ' ' + t.getAttribute('y') + ')'); });
    };
    var setFan = gsap.quickSetter(fan, 'rotation', 'deg');
    var activeIdx = -1;

    function activate(i) {
      if (i === activeIdx) return;
      activeIdx = i;
      items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); it.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      navBtns.forEach(function (b, k) { b.classList.toggle('is-active', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      sectors.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      sLabels.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      var icon = items[i].querySelector('.service__icon');
      if (icon) gsap.fromTo(icon, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: 0.15 });
    }

    function baseRot(i) { return pointerAngle() - (i * 60 + 30); }

    var st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        var p = self.progress;
        var raw = VRF.clamp(p * N, 0, N - 0.0001);
        var idx = Math.floor(raw);
        var f = raw - idx;
        var e = idx < N - 1 ? VRF.smooth((f - 0.62) / 0.38) : 0;
        setRot(VRF.lerp(baseRot(idx), baseRot(Math.min(N - 1, idx + 1)), e));
        activate(e > 0.5 ? idx + 1 : idx);
        setFan(p * 1440);
        degEl.textContent = Math.round(p * 360);
      }
    });
    setRot(baseRot(0));
    activate(0);

    navBtns.forEach(function (b, k) {
      b.addEventListener('click', function () {
        var y = st.start + (st.end - st.start) * ((k + 0.3) / N);
        VRF.scrollTo(y, { duration: 1.2 });
      });
    });
  });
})();
