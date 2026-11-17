/* VRF 360 — etapas: tubulação de cobre que se desenha com a rolagem e liga as 4 etapas */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('process', function () {
    var body = VRF.qs('.process__body');
    if (!body) return;
    var svg = VRF.qs('.process__pipe', body);
    var steps = VRF.qsa('.step', body);
    var ins = VRF.qs('.pipe__insulation', svg);
    var cu = VRF.qs('.pipe__copper', svg);
    var flow = VRF.qs('.pipe__flow', svg);
    var len = 0, fracs = [], progress = VRF.flags.reduced ? 1 : 0;

    function elbow(a, b, r) {
      if (Math.abs(a.y - b.y) < 1) return ' L' + b.x + ' ' + b.y;
      var mx = (a.x + b.x) / 2, sy = b.y > a.y ? 1 : -1;
      var rr = Math.min(r, Math.abs(b.y - a.y) / 2, Math.abs(b.x - a.x) / 2);
      return ' L' + (mx - rr) + ' ' + a.y +
        ' Q' + mx + ' ' + a.y + ' ' + mx + ' ' + (a.y + rr * sy) +
        ' L' + mx + ' ' + (b.y - rr * sy) +
        ' Q' + mx + ' ' + b.y + ' ' + (mx + rr) + ' ' + b.y +
        ' L' + b.x + ' ' + b.y;
    }

    function build() {
      var br = body.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + br.width.toFixed(1) + ' ' + br.height.toFixed(1));
      var pts = steps.map(function (s) {
        var n = s.querySelector('.step__node');
        var x = n.offsetWidth / 2, y = n.offsetHeight / 2, el = n;
        while (el && el !== body) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
        return { x: +x.toFixed(1), y: +y.toFixed(1) };
      });
      var d;
      if (VRF.mq.desktop.matches) {
        var left = -br.left - 30, right = window.innerWidth - br.left + 30;
        d = 'M' + left + ' ' + pts[0].y + ' L' + pts[0].x + ' ' + pts[0].y;
        for (var i = 0; i < pts.length - 1; i++) d += elbow(pts[i], pts[i + 1], 34);
        d += ' L' + right + ' ' + pts[pts.length - 1].y;
      } else {
        d = 'M' + pts[0].x + ' ' + (pts[0].y - 70) + ' L' + pts[0].x + ' ' + (pts[pts.length - 1].y + 50);
      }
      [ins, cu, flow].forEach(function (p) { p.setAttribute('d', d); });
      var grad = svg.querySelector('#copper');
      if (grad) {
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
        grad.setAttribute('x2', VRF.mq.desktop.matches ? String(Math.round(br.width / 3)) : '60');
        grad.setAttribute('y2', VRF.mq.desktop.matches ? '220' : String(Math.round(br.height / 3)));
        grad.setAttribute('spreadMethod', 'reflect');
      }
      len = cu.getTotalLength();
      /* fração do caminho em que cada nó é alcançado */
      fracs = pts.map(function (pt) {
        var best = 0, bestD = Infinity;
        for (var s = 0; s <= 240; s++) {
          var q = cu.getPointAtLength(len * s / 240);
          var dd = (q.x - pt.x) * (q.x - pt.x) + (q.y - pt.y) * (q.y - pt.y);
          if (dd < bestD) { bestD = dd; best = s / 240; }
        }
        return best;
      });
      [ins, cu].forEach(function (p) { p.style.strokeDasharray = len + ' ' + len; });
      apply();
    }

    function apply() {
      [ins, cu].forEach(function (p) { p.style.strokeDashoffset = String(len * (1 - progress)); });
      flow.style.opacity = String(VRF.map(progress, 0.9, 1, 0, 1));
      steps.forEach(function (s, i) { s.classList.toggle('is-on', progress >= fracs[i] - 0.005); });
    }

    build();
    ScrollTrigger.addEventListener('refresh', build);
    window.addEventListener('resize', function () { requestAnimationFrame(build); });

    if (VRF.flags.reduced) return;
    ScrollTrigger.create({
      trigger: body,
      start: 'top 72%',
      end: 'bottom 62%',
      scrub: 0.5,
      onUpdate: function (self) { progress = self.progress; apply(); }
    });
  });
})();
