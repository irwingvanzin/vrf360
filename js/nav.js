/* VRF 360 — navegação: estado ao rolar, tema por seção, scrollspy e menu móvel */
(function () {
  'use strict';
  var VRF = window.VRF;

  VRF.register('nav', function () {
    var nav = VRF.qs('[data-nav]');
    if (!nav) return;
    var burger = VRF.qs('.nav__burger', nav);
    var menu = VRF.qs('#menu-mobile');
    var heroTheme = 'dark';
    var sectionTheme = 'dark';
    VRF.menuOpen = false;

    VRF.setNavTheme = function (t, fromHero) {
      if (fromHero) heroTheme = t; else sectionTheme = t;
      if (VRF.menuOpen) return;
      if (nav.getAttribute('data-theme-nav') !== t) nav.setAttribute('data-theme-nav', t);
    };

    /* Rolagem: fundo de vidro + esconder ao descer */
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 24);
        if (VRF.menuOpen) return;
        if (self.direction === 1 && y > window.innerHeight * 0.9) nav.classList.add('is-hidden');
        else if (self.direction === -1) nav.classList.remove('is-hidden');
      }
    });

    /* Tema conforme a seção sob o menu (o hero controla o próprio tema) */
    VRF.qsa('main > section, main > .marquee, .footer').forEach(function (sec) {
      if (sec.classList.contains('hero')) return;
      var theme = sec.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      ScrollTrigger.create({
        trigger: sec,
        start: function () { return 'top ' + VRF.navH() / 2; },
        end: function () { return 'bottom ' + VRF.navH() / 2; },
        onToggle: function (self) { if (self.isActive) VRF.setNavTheme(theme); }
      });
    });
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: function () { return 'bottom ' + VRF.navH() / 2; },
      onToggle: function (self) { if (self.isActive) VRF.setNavTheme(heroTheme, true); }
    });

    /* Scrollspy */
    VRF.qsa('[data-spy]').forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('data-spy'));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: function (self) { a.classList.toggle('is-active', self.isActive); if (self.isActive) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }
      });
    });

    /* Menu móvel */
    if (!burger || !menu) return;
    var links = VRF.qsa('a', menu);
    var lastFocus = null;

    function focusables() {
      return [burger].concat(VRF.qsa('a, button', menu));
    }

    function onKey(e) {
      if (e.key === 'Escape') { VRF.closeMenu(true); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    VRF.openMenu = function () {
      VRF.menuOpen = true;
      lastFocus = document.activeElement;
      menu.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fechar menu');
      nav.classList.remove('is-hidden');
      nav.setAttribute('data-theme-nav', 'dark');
      document.body.style.overflow = 'hidden';
      if (VRF.lenis) VRF.lenis.stop();
      document.addEventListener('keydown', onKey);
      if (!VRF.flags.reduced) {
        gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 44px) 32px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 32px)', duration: 0.9, ease: 'expo.out' });
        gsap.fromTo(VRF.qsa('.menu__links a, .menu__foot > *', menu), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, delay: 0.12 });
      }
      setTimeout(function () { if (links[0]) links[0].focus({ preventScroll: true }); }, 60);
    };

    VRF.closeMenu = function (restoreFocus) {
      if (!VRF.menuOpen) return;
      VRF.menuOpen = false;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (VRF.lenis) VRF.lenis.start();
      nav.setAttribute('data-theme-nav', window.scrollY < 10 ? heroTheme : sectionTheme);
      var done = function () { menu.hidden = true; gsap.set(menu, { clearProps: 'clipPath' }); };
      if (VRF.flags.reduced) done();
      else gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 32px)', duration: 0.55, ease: 'expo.inOut', onComplete: done });
      if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
    };

    burger.addEventListener('click', function () { if (VRF.menuOpen) VRF.closeMenu(true); else VRF.openMenu(); });
    VRF.mq.desktop.addEventListener('change', function (e) { if (e.matches && VRF.menuOpen) VRF.closeMenu(false); });
  });
})();
