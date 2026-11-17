/* VRF 360 — núcleo: flags, utilitários e registro de módulos */
(function () {
  'use strict';
  var VRF = (window.VRF = window.VRF || {});
  var doc = document;
  var flags = window.VRF_FLAGS || {};

  VRF.flags = {
    nojs: !!flags.nojs,
    reduced: !!flags.reduced,
    touch: window.matchMedia('(hover: none), (pointer: coarse)').matches,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches
  };

  VRF.mq = {
    mobile: window.matchMedia('(max-width: 767px)'),
    desktop: window.matchMedia('(min-width: 1024px)')
  };

  VRF.qs = function (s, r) { return (r || doc).querySelector(s); };
  VRF.qsa = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  VRF.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  VRF.lerp = function (a, b, t) { return a + (b - a) * t; };
  VRF.map = function (v, a, b, c, d) { return c + (d - c) * VRF.clamp((v - a) / (b - a), 0, 1); };
  VRF.smooth = function (t) { t = VRF.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  VRF.easeOut = function (t) { t = VRF.clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  VRF.navH = function () { return parseFloat(getComputedStyle(doc.documentElement).getPropertyValue('--nav-h')) || 64; };

  VRF.hexToRgb = function (hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  VRF.luminance = function (rgb) {
    var c = rgb.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  VRF.formatNumber = (function () {
    var nf = window.Intl ? new Intl.NumberFormat('pt-BR') : null;
    return function (n) { return nf ? nf.format(n) : String(n); };
  })();

  /* Registro de módulos: cada módulo roda dentro de try/catch para não derrubar os demais */
  VRF.modules = [];
  VRF.register = function (name, fn) { VRF.modules.push({ name: name, fn: fn }); };

  /* Rolagem programática (usa Lenis quando ativo) */
  VRF.scrollTo = function (target, opts) {
    opts = opts || {};
    var offset = opts.offset != null ? opts.offset : 0;
    if (VRF.lenis) {
      VRF.lenis.scrollTo(target, { offset: offset, duration: opts.duration || 1.4, immediate: !!opts.immediate });
      return;
    }
    var y;
    if (typeof target === 'number') y = target;
    else {
      var el = typeof target === 'string' ? doc.querySelector(target) : target;
      if (!el) return;
      y = el.getBoundingClientRect().top + window.pageYOffset;
    }
    window.scrollTo({ top: y + offset, behavior: VRF.flags.reduced || opts.immediate ? 'auto' : 'smooth' });
  };
})();
