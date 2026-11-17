/* VRF 360 — campo de fluxo de ar (partículas) para fundos escuros */
(function () {
  'use strict';
  var VRF = window.VRF;

  function Airflow(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = Object.assign({ density: 5200, max: 900, speed: 1, colors: ['0,177,145', '155,226,217'], alpha: 0.42, warm: false }, opts || {});
    this.p = [];
    this.t = 0;
    this.visible = false;
    this.mouse = { x: -9999, y: -9999 };
    this.resize();
    var self = this;
    this.io = new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; }, { rootMargin: '120px' });
    this.io.observe(canvas);
    window.addEventListener('resize', function () { self.resize(); });
    if (VRF.flags.finePointer) {
      canvas.parentElement.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        self.mouse.x = e.clientX - r.left; self.mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('pointerleave', function () { self.mouse.x = self.mouse.y = -9999; });
    }
  }

  Airflow.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = this.c.clientWidth, h = this.c.clientHeight;
    if (!w || !h) return;
    this.w = w; this.h = h; this.dpr = dpr;
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var mobile = VRF.mq.mobile.matches;
    var n = Math.min(this.o.max, Math.round((w * h) / (this.o.density * (mobile ? 1.6 : 1))));
    this.p = [];
    for (var i = 0; i < n; i++) this.p.push(this.spawn(true));
  };

  Airflow.prototype.spawn = function (anywhere) {
    return {
      x: anywhere ? Math.random() * this.w : -10 - Math.random() * 60,
      y: Math.random() * this.h,
      life: 0,
      max: 160 + Math.random() * 260,
      c: this.o.colors[Math.random() < 0.72 ? 0 : 1],
      s: 0.6 + Math.random() * 0.9
    };
  };

  Airflow.prototype.field = function (x, y) {
    var t = this.t;
    return Math.sin(x * 0.0034 + Math.cos(y * 0.006 + t * 0.0004) * 1.4 + t * 0.00035) * 0.8 +
      Math.cos(y * 0.0052 - x * 0.0011 - t * 0.00028) * 0.6;
  };

  Airflow.prototype.step = function (dt) {
    if (!this.visible || !this.w) return;
    this.t += dt;
    var ctx = this.ctx, o = this.o, f = dt / 16.7;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    for (var i = 0; i < this.p.length; i++) {
      var q = this.p[i];
      var a = this.field(q.x, q.y);
      var vx = (Math.cos(a) * 0.35 + 0.75) * q.s * o.speed * f;
      var vy = Math.sin(a) * 0.42 * q.s * o.speed * f;
      var dx = q.x - this.mouse.x, dy = q.y - this.mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000) { var k = (1 - d2 / 22000) * 2.4; vx += (dx / Math.sqrt(d2 + 1)) * k; vy += (dy / Math.sqrt(d2 + 1)) * k; }
      var nx = q.x + vx, ny = q.y + vy;
      q.life += f;
      var fade = Math.min(1, q.life / 30) * Math.min(1, (q.max - q.life) / 40);
      ctx.strokeStyle = 'rgba(' + q.c + ',' + (o.alpha * Math.max(0, fade)).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(nx, ny); ctx.stroke();
      q.x = nx; q.y = ny;
      if (q.life > q.max || q.x > this.w + 20 || q.y < -20 || q.y > this.h + 20) this.p[i] = this.spawn(false);
    }
  };

  VRF.Airflow = Airflow;

  VRF.register('airflow', function () {
    if (VRF.flags.reduced) return;
    var fields = [];
    var s = VRF.qs('.services__air');
    if (s) fields.push(new Airflow(s, { density: 3400, alpha: 0.5 }));
    var c = VRF.qs('.contact__air');
    if (c) fields.push(new Airflow(c, { density: 7000, alpha: 0.28, speed: 0.8 }));
    if (!fields.length) return;
    gsap.ticker.add(function (t, dt) {
      if (document.hidden) return;
      var d = Math.min(dt || 16.7, 50);
      for (var i = 0; i < fields.length; i++) fields[i].step(d);
    });
  });
})();
