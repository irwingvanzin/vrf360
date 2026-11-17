/* VRF 360 — formulário de orçamento: validação, envio (PHP) e alternativas por WhatsApp/e-mail */
(function () {
  'use strict';
  var VRF = window.VRF;
  var WA_NUMBER = '5511945191038';
  var EMAIL = 'irwing.rich@outlook.com';

  VRF.register('form', function () {
    var form = VRF.qs('#orcamento');
    if (!form) return;
    var status = VRF.qs('.quote__status', form);
    var done = VRF.qs('.quote__done', form);
    var submit = VRF.qs('.quote__submit', form);
    var tField = form.querySelector('[name="t"]');
    var tel = form.querySelector('[name="telefone"]');
    var waAlt = VRF.qs('[data-wa-from-form]', form);
    var stamp = function () { if (tField) tField.value = String(Math.floor(Date.now() / 1000)); };
    stamp();

    VRF.prefillService = function (name) {
      VRF.qsa('input[name="servicos[]"]', form).forEach(function (cb) { if (cb.value === name) cb.checked = true; });
    };

    /* Máscara leve de telefone brasileiro (mantém números internacionais) */
    tel.addEventListener('input', function () {
      var v = tel.value;
      if (/^\s*\+/.test(v)) return;
      var d = v.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
      tel.value = out;
    });

    var rules = {
      nome: function (v) { return v.trim().length >= 2 ? '' : 'Informe o seu nome.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido.'; },
      telefone: function (v) { return v.replace(/\D/g, '').length >= 10 ? '' : 'Informe um telefone com DDD.'; },
      mensagem: function (v) { return v.trim().length >= 10 ? '' : 'Conte um pouco sobre o projeto (pelo menos 10 caracteres).'; }
    };

    function setError(name, msg) {
      var input = form.querySelector('[name="' + name + '"]');
      var field = input.closest('.field');
      var err = VRF.qs('#e-' + name, form);
      field.classList.toggle('is-invalid', !!msg);
      if (err) err.textContent = msg;
      if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', 'e-' + name); }
      else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    }

    function validate() {
      var first = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.querySelector('[name="' + name + '"]');
        var msg = rules[name](input.value || '');
        setError(name, msg);
        if (msg && !first) first = input;
      });
      return first;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      input.addEventListener('blur', function () { if (input.value) setError(name, rules[name](input.value)); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-invalid')) setError(name, rules[name](input.value)); });
    });

    function messageText() {
      var fd = new FormData(form);
      var g = function (k) { return (fd.get(k) || '').toString().trim(); };
      var servicos = fd.getAll('servicos[]').join(', ');
      var lines = ['Olá, VRF 360! Gostaria de solicitar um orçamento.', ''];
      var add = function (label, v) { if (v) lines.push(label + ': ' + v); };
      add('Nome', g('nome'));
      add('Empresa', g('empresa'));
      add('E-mail', g('email'));
      add('Telefone', g('telefone'));
      add('Cidade/UF', g('cidade'));
      add('Serviços', servicos);
      add('Edificação', g('edificacao'));
      add('Área aproximada', g('area'));
      add('Prazo', g('prazo'));
      if (g('mensagem')) { lines.push(''); lines.push(g('mensagem')); }
      return lines.join('\n');
    }
    function waUrl() { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(messageText()); }
    function mailUrl() {
      var nome = (form.querySelector('[name="nome"]').value || '').trim();
      return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Pedido de orçamento' + (nome ? ' — ' + nome : '')) + '&body=' + encodeURIComponent(messageText());
    }

    if (waAlt) waAlt.addEventListener('click', function () { waAlt.href = waUrl(); });

    function clearStatus() { status.textContent = ''; status.classList.remove('is-error'); }

    function showError(detail) {
      clearStatus();
      status.classList.add('is-error');
      var strong = document.createElement('strong');
      strong.textContent = 'Não foi possível enviar agora.';
      var p = document.createElement('span');
      p.textContent = ' ' + (detail ? detail + ' ' : '') + 'Mas o seu pedido não se perde: envie a mesma mensagem por um destes canais.';
      var box = document.createElement('div');
      box.className = 'quote__fallback';
      var a1 = document.createElement('a');
      a1.className = 'btn btn--primary';
      a1.href = waUrl(); a1.target = '_blank'; a1.rel = 'noopener';
      a1.textContent = 'Enviar pelo WhatsApp';
      var a2 = document.createElement('a');
      a2.className = 'btn btn--ghost';
      a2.href = mailUrl();
      a2.textContent = 'Enviar por e-mail';
      box.appendChild(a1); box.appendChild(a2);
      status.appendChild(strong); status.appendChild(p); status.appendChild(box);
    }

    function showDone() {
      form.classList.add('is-done');
      done.hidden = false;
      var h = done.querySelector('.quote__title');
      if (h) h.focus({ preventScroll: true });
      if (!VRF.flags.reduced) gsap.from(done.children, { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 });
      VRF.scrollTo(form, { offset: -(VRF.navH() + 24) });
      ScrollTrigger.refresh();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearStatus();
      var invalid = validate();
      if (invalid) {
        invalid.focus();
        status.textContent = 'Revise os campos destacados.';
        return;
      }
      form.classList.add('is-loading');
      submit.disabled = true;
      status.textContent = 'Enviando…';
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok || !data.ok) throw new Error(data.message || '');
            return data;
          });
        })
        .then(function () { clearStatus(); showDone(); })
        .catch(function (err) { showError(err && err.name !== 'AbortError' ? err.message : ''); })
        .then(function () { clearTimeout(timer); form.classList.remove('is-loading'); submit.disabled = false; });
    });

    var reset = VRF.qs('[data-quote-reset]', form);
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      form.classList.remove('is-done');
      done.hidden = true;
      clearStatus();
      Object.keys(rules).forEach(function (n) { setError(n, ''); });
      stamp();
      var first = form.querySelector('[name="nome"]');
      if (first) first.focus();
      ScrollTrigger.refresh();
    });
  });
})();
