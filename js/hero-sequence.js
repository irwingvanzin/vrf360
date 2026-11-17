/* VRF 360 — hero: a condensadora se desmonta conforme a rolagem (sequência de quadros em canvas) */
(function () {
  'use strict';
  var VRF = window.VRF;

  var SETS = {
    desktop: {
      dir: 'assets/seq/desktop/', count: 96, w: 1120, h: 630,
      colors: ['#343332', '#343332', '#333230', '#323130', '#302f2f', '#2f2f2e', '#2e2e2e', '#2e2d2d', '#2d2d2d', '#2d2d2d', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2d2d2d', '#2d2d2d', '#2d2d2d', '#2d2d2d', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2f2f2f', '#2f2f2f', '#303030', '#303030', '#333333', '#343434', '#363637', '#3a3a3a', '#3d3d3d', '#414141', '#444444', '#494a4a', '#505051', '#575757', '#5d5d5d', '#646464', '#6c6c6c', '#747474', '#7c7c7c', '#838383', '#8c8c8c', '#939393', '#9a9a9a', '#a1a1a1', '#a8a8a8', '#aeaeae', '#b4b4b4', '#b7b7b7', '#bcbbbb', '#c0c0be', '#c2c2c2', '#c5c5c5', '#c9c9c9', '#cbcbcb', '#cfcfcf', '#d1d1d0', '#d5d5d5', '#d6d6d6', '#d8d8d8', '#d9d9d9', '#dcdcdc', '#dedede', '#dfdfdf', '#e1e1e0', '#e3e3e3', '#e5e5e5', '#e6e6e6', '#e7e7e7', '#ebebeb', '#ececec', '#ededed', '#efefee', '#f1f1f0', '#f3f3f3', '#f4f4f4', '#f5f5f5', '#f8f8f8', '#f8f8f8', '#f9f9f9', '#fafafa', '#fbfbfb', '#fcfcfc', '#fdfdfd', '#fdfdfd', '#ffffff', '#ffffff', '#ffffff', '#ffffff']
    },
    mobile: {
      dir: 'assets/seq/mobile/', count: 64, w: 640, h: 360,
      colors: ['#343332', '#333232', '#323130', '#302f2f', '#2e2e2e', '#2d2d2d', '#2d2d2d', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2c2c2c', '#2d2d2d', '#2d2d2d', '#2d2d2d', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2e2e2e', '#2f2f2f', '#303030', '#323232', '#343434', '#373737', '#3d3d3d', '#424242', '#494a4a', '#555555', '#5d5d5d', '#676767', '#747474', '#808080', '#8c8c8c', '#979797', '#a1a1a1', '#acacac', '#b4b4b4', '#babab8', '#c0c0be', '#c3c3c3', '#c9c9c9', '#cccccc', '#d1d1d0', '#d5d5d5', '#d8d8d8', '#d9d9d9', '#dedede', '#dfdfdf', '#e3e3e3', '#e6e6e6', '#e7e7e7', '#ebebeb', '#ededed', '#efefee', '#f3f3f3', '#f4f4f4', '#f8f8f8', '#f8f8f8', '#fafafa', '#fbfbfb', '#fdfdfd', '#ffffff', '#ffffff', '#ffffff']
    }
  };

  /* Fases da rolagem (0 a 1) */
  var PH = {
    hint: [0, 0.03],
    introOut: [0.012, 0.12],
    camera: [0.03, 0.3],
    frames: [0.05, 0.78],
    labels: [0.79, 0.985]
  };

  function pad(i) { return (i < 10 ? '00' : i < 100 ? '0' : '') + i; }

  VRF.register('hero', function () {
    var hero = VRF.qs('.hero');
    if (!hero) return;
    var reduced = VRF.flags.reduced;
    var stage = VRF.qs('.hero__stage', hero);
    var intro = VRF.qs('.hero__intro', hero);
    var title = VRF.qs('.hero__title', hero);
    var canvas = VRF.qs('.hero__canvas', hero);

    /* ---------- Entrada do texto (chamada pelo preloader) ---------- */
    var introPlayed = false;
    VRF.heroIntro = function (delay) {
      if (introPlayed) return;
      introPlayed = true;
      delay = delay || 0;
      var kids = VRF.qsa('.hero__intro > *', hero);
      gsap.set(kids, { opacity: 1 });
      if (reduced) return;
      var eyebrow = VRF.qs('.hero__eyebrow', hero);
      var lead = VRF.qs('.hero__lead', hero);
      var ctas = VRF.qs('.hero__ctas', hero);
      var hint = VRF.qs('.hero__hint', hero);
      var tl = gsap.timeline({ delay: delay });
      tl.from(eyebrow, { y: 18, opacity: 0, duration: 0.9, ease: 'expo.out' }, 0);
      if (window.SplitText) {
        VRF.splitLines(title, {
          onSplit: function (self) {
            return gsap.from(self.lines, { yPercent: 118, duration: 1.35, ease: 'expo.out', stagger: 0.1, delay: delay + 0.06 });
          }
        });
      } else {
        tl.from(title, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.05);
      }
      tl.from(lead, { y: 22, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.38)
        .from(ctas.children, { y: 22, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.48);
      if (hint) tl.from(hint, { opacity: 0, duration: 1.2 }, 0.9);
      if (canvas) tl.from(canvas, { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0);
    };
    setTimeout(function () { VRF.heroIntro(0); }, 3200);

    if (reduced || !canvas) { VRF.heroReady = Promise.resolve(true); return; }

    /* ---------- Sequência ---------- */
    var ctx = canvas.getContext('2d', { alpha: false });
    var setKey = VRF.mq.mobile.matches ? 'mobile' : 'desktop';
    var S = SETS[setKey];
    var imgs = new Array(S.count);
    var loaded = new Array(S.count);
    var ext = 'avif';
    var target = 0, current = 0, lastDrawn = -1, dirty = true, inView = true;
    var vw = 0, vh = 0, dpr = 1, stacked = false, introBottom = 0, introRight = 0;
    var labels = VRF.qsa('.hlabel', hero).map(function (el) {
      return { el: el, line: el.querySelector('.hlabel__line'), x: parseFloat(el.getAttribute('data-x')), y: parseFloat(el.getAttribute('data-y')), side: el.getAttribute('data-side') || 'right', vis: -1 };
    });
    var hud = VRF.qs('.hero__hud', hero);
    var hudPct = VRF.qs('[data-hud-pct]', hero);
    var hint = VRF.qs('.hero__hint', hero);
    var colors = S.colors.map(VRF.hexToRgb);
    var navTheme = '';

    function loadImage(src) {
      return new Promise(function (res, rej) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = function () { res(im); };
        im.onerror = rej;
        im.src = src;
      });
    }

    function fallback() {
      hero.classList.add('is-fallback');
      ScrollTrigger.refresh();
    }

    VRF.heroReady = loadImage(S.dir + 'f_000.avif')
      .catch(function () { ext = 'webp'; return loadImage(S.dir + 'f_000.webp'); })
      .then(function (im) { imgs[0] = im; loaded[0] = true; dirty = true; queue(); return true; })
      .catch(function () { fallback(); return false; });

    function order(n) {
      var out = [], seen = { 0: 1 };
      [12, 6, 3, 2, 1].forEach(function (st) { for (var i = 0; i < n; i += st) if (!seen[i]) { seen[i] = 1; out.push(i); } });
      return out;
    }

    function queue() {
      var q = order(S.count), inflight = 0, MAX = 6;
      function next() {
        while (inflight < MAX && q.length) {
          (function (i) {
            inflight++;
            var im = new Image();
            im.decoding = 'async';
            im.onload = function () {
              var done = function () { imgs[i] = im; loaded[i] = true; inflight--; dirty = true; next(); };
              if (im.decode) im.decode().then(done, done); else done();
            };
            im.onerror = function () { inflight--; next(); };
            im.src = S.dir + 'f_' + pad(i) + '.' + ext;
          })(q.shift());
        }
      }
      next();
    }

    function nearest(i) {
      if (loaded[i]) return i;
      for (var d = 1; d < S.count; d++) {
        if (i - d >= 0 && loaded[i - d]) return i - d;
        if (i + d < S.count && loaded[i + d]) return i + d;
      }
      return -1;
    }

    function measure() {
      dpr = Math.min(window.devicePixelRatio || 1, setKey === 'mobile' ? 2 : 1.75);
      vw = stage.clientWidth;
      vh = stage.clientHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      stacked = vw < 1000 || vw / vh < 1.08;
      var prev = intro.style.transform;
      intro.style.transform = 'none';
      var sr = stage.getBoundingClientRect();
      var tr = title.getBoundingClientRect();
      var ir = VRF.qs('.hero__ctas', hero).getBoundingClientRect();
      intro.style.transform = prev;
      introBottom = ir.bottom - sr.top;
      introRight = tr.right - sr.left;
      labels.forEach(function (lb) { lb.vis = -1; if (stacked && lb.line) lb.line.style.transform = ''; if (!stacked) lb.el.classList.remove('is-current'); });
      dirty = true;
    }

    /* Retângulo onde o quadro é desenhado (com câmera) */
    function layout(p) {
      var ar = S.w / S.h;
      var t = VRF.smooth(VRF.map(p, PH.camera[0], PH.camera[1], 0, 1));
      var s0, s1;
      if (!stacked) {
        var sw = Math.min(vw * 0.66, vh * 1.02 * ar);
        var x0 = vw + sw * 0.06 - sw;
        var minX0 = introRight + 18 - sw * 0.1;
        if (x0 < minX0) x0 = minX0;
        s0 = { w: sw, cx: x0 + sw / 2, cy: vh * 0.56 };
        var ew = Math.min(vw * 0.94, vh * 0.84 * ar);
        s1 = { w: ew, cx: vw * 0.5, cy: vh * 0.54 };
      } else {
        var top0 = introBottom + 20;
        var remaining = Math.max(0, vh - top0);
        var sw2 = setKey === 'mobile' ? vw * 1.12 : Math.min(vw * 0.98, vh * 0.92 * ar);
        if (remaining * ar * 0.96 > sw2) sw2 = Math.min(vw * 1.5, remaining * ar * 0.96);
        s0 = { w: sw2, cx: vw * 0.5, cy: top0 + (sw2 / ar) / 2 };
        var ew2 = setKey === 'mobile' ? vw * 1.04 : Math.min(vw * 0.96, vh * 0.66 * ar);
        s1 = { w: ew2, cx: vw * 0.5, cy: vh * 0.47 };
      }
      var w = VRF.lerp(s0.w, s1.w, t);
      var cx = VRF.lerp(s0.cx, s1.cx, t);
      var cy = VRF.lerp(s0.cy, s1.cy, t);
      var h = w / ar;
      var L = { x: cx - w / 2, y: cy - h / 2, w: w, h: h };

      /* Câmera do celular: aproxima cada componente rotulado */
      if (stacked && labels.length) {
        var k = VRF.smooth(VRF.map(p, PH.labels[0] - 0.012, PH.labels[0] + 0.03, 0, 1));
        if (k > 0) {
          var s = VRF.map(p, PH.labels[0], PH.labels[1], 0, labels.length - 1);
          var i0 = Math.floor(s), i1 = Math.min(labels.length - 1, i0 + 1);
          var fr = VRF.smooth((s - i0 - 0.55) / 0.45);
          var fx = VRF.lerp(labels[i0].x, labels[i1].x, fr);
          var fy = VRF.lerp(labels[i0].y, labels[i1].y, fr);
          var zoom = 1 + 0.85 * k;
          var ax = L.x + fx * L.w, ay = L.y + fy * L.h;
          var tx = VRF.lerp(ax, vw * 0.5, k), ty = VRF.lerp(ay, vh * 0.36, k);
          var nw = L.w * zoom, nh = L.h * zoom;
          L = { x: tx - fx * nw, y: ty - fy * nh, w: nw, h: nh };
        }
      }
      return L;
    }

    function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }

    function render() {
      var p = current;
      var ff = VRF.map(p, PH.frames[0], PH.frames[1], 0, S.count - 1);
      var f0 = Math.floor(ff), f1 = Math.min(S.count - 1, f0 + 1), fr = ff - f0;
      var c = mix(colors[f0], colors[f1], fr);
      var rgb = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      var lum = VRF.luminance(c);

      ctx.globalAlpha = 1;
      ctx.fillStyle = rgb;
      ctx.fillRect(0, 0, vw, vh);
      var L = layout(p);
      var i0 = nearest(f0);
      if (i0 >= 0) {
        ctx.drawImage(imgs[i0], L.x, L.y, L.w, L.h);
        if (i0 === f0 && f1 !== f0 && loaded[f1] && fr > 0.04) {
          ctx.globalAlpha = fr;
          ctx.drawImage(imgs[f1], L.x, L.y, L.w, L.h);
          ctx.globalAlpha = 1;
        }
      }
      /* Vinheta elíptica: funde as bordas do quadro com a cor da página */
      var vig = VRF.map(lum, 0.32, 0.8, 1, 0);
      if (vig > 0.01) {
        var cx = L.x + L.w / 2, cy = L.y + L.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, L.h / L.w);
        var g = ctx.createRadialGradient(0, 0, L.w * 0.22, 0, 0, L.w * 0.5);
        var base = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',';
        g.addColorStop(0, base + '0)');
        g.addColorStop(0.5, base + (vig * 0.22).toFixed(3) + ')');
        g.addColorStop(0.8, base + (vig * 0.72).toFixed(3) + ')');
        g.addColorStop(0.97, base + vig.toFixed(3) + ')');
        g.addColorStop(1, base + vig.toFixed(3) + ')');
        ctx.fillStyle = g;
        ctx.fillRect(-L.w, -L.w, L.w * 2, L.w * 2);
        ctx.restore();
        if (vig > 0.5) {
          ctx.globalAlpha = (vig - 0.5) * 2;
          ctx.fillStyle = rgb;
          ctx.fillRect(0, 0, vw, Math.max(0, L.y + 1));
          ctx.fillRect(0, L.y + L.h - 1, vw, vh);
          ctx.globalAlpha = 1;
        }
      }

      hero.style.setProperty('--hero-bg', rgb);
      var theme = lum > 0.42 ? 'light' : 'dark';
      if (theme !== navTheme && VRF.setNavTheme && current < 0.995) { navTheme = theme; VRF.setNavTheme(theme, true); }

      /* Texto de abertura e dica */
      var io = VRF.map(p, PH.introOut[0], PH.introOut[1], 0, 1);
      intro.style.transform = 'translate3d(0,' + (-io * 70).toFixed(1) + 'px,0)';
      intro.style.opacity = (1 - io).toFixed(3);
      intro.style.visibility = io > 0.98 ? 'hidden' : '';
      if (hint) hint.style.opacity = (1 - VRF.map(p, PH.hint[0], PH.hint[1], 0, 1)).toFixed(3);

      /* HUD */
      if (hud) {
        var ho = VRF.map(p, 0.05, 0.1, 0, 1) * (1 - VRF.map(p, 0.975, 1, 0, 1));
        hud.style.opacity = ho.toFixed(3);
        hud.style.setProperty('--hud-fg', lum > 0.42 ? 'rgba(13,15,16,.62)' : 'rgba(255,255,255,.72)');
        var pct = VRF.map(p, PH.frames[0], PH.frames[1], 0, 1);
        hud.style.setProperty('--hud', pct.toFixed(3));
        hudPct.textContent = Math.round(pct * 100) + '%';
      }

      /* Rótulos dos componentes */
      var lp = VRF.map(p, PH.labels[0] - 0.01, PH.labels[1], 0, 1);
      var currentIdx = Math.min(labels.length - 1, Math.floor(VRF.map(p, PH.labels[0], PH.labels[1] + 0.005, 0, labels.length)));
      labels.forEach(function (lb, i) {
        var a;
        if (stacked) {
          var on = p >= PH.labels[0] && i === currentIdx;
          a = on ? VRF.smooth(VRF.map(p, PH.labels[0], PH.labels[0] + 0.02, 0, 1)) : 0;
          lb.el.classList.toggle('is-current', on);
        } else {
          var st = PH.labels[0] + i * 0.022;
          a = VRF.smooth(VRF.map(p, st, st + 0.035, 0, 1));
        }
        if (lp <= 0) a = 0;
        var x = L.x + lb.x * L.w, y = L.y + lb.y * L.h;
        if (stacked && a > 0) {
          var capY = vh * 0.8;
          lb.el.style.setProperty('--cap-dy', Math.max(40, capY - y).toFixed(1) + 'px');
          lb.el.style.setProperty('--cap-dx', (vw / 2 - x).toFixed(1) + 'px');
        }
        if (!stacked) {
          var side = lb.side;
          if (side === 'right' && x + 320 > vw) side = 'left';
          if (side === 'left' && x - 320 < 0) side = 'right';
          if (lb.el.getAttribute('data-side') !== side) lb.el.setAttribute('data-side', side);
        }
        lb.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y + (1 - a) * 10).toFixed(1) + 'px,0)';
        if (a !== lb.vis) {
          lb.vis = a;
          lb.el.style.opacity = a.toFixed(3);
          lb.el.style.visibility = a > 0.01 ? 'visible' : 'hidden';
          if (lb.line && !stacked) lb.line.style.transform = (lb.el.getAttribute('data-side') === 'left' ? 'translateX(-100%) ' : '') + 'scaleX(' + a.toFixed(3) + ')';
        }
      });
    }

    /* Gancho de depuração: VRF.heroDebug(0.9) desenha o estado de 90% imediatamente */
    VRF.heroDebug = function (p) { target = current = VRF.clamp(p, 0, 1); render(); };

    measure();
    window.addEventListener('resize', function () { measure(); });
    ScrollTrigger.addEventListener('refresh', measure);

    ScrollTrigger.create({
      trigger: VRF.qs('.hero__track', hero),
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) { target = self.progress; }
    });
    ScrollTrigger.create({
      trigger: hero,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: function (self) { inView = self.isActive; if (inView) dirty = true; }
    });

    gsap.ticker.add(function (t, dt) {
      if (!inView || hero.classList.contains('is-fallback')) return;
      var k = VRF.lenis ? 0.34 : 0.2;
      var d = target - current;
      if (Math.abs(d) > 0.00005) { current += d * Math.min(1, k * ((dt || 16.7) / 16.7)); dirty = true; }
      else if (current !== target) { current = target; dirty = true; }
      if (dirty) { dirty = false; render(); }
    });
  });
})();
