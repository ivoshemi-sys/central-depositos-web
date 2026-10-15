/* Central de Depósitos — interacciones base (Carbon) */
(function(){
  var WA = (window.CDD && CDD.wa) || '5491128449907';

  /* nav mobile */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true':'false');
    });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); }); });
  }

  /* year */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* reveal on scroll (L1) */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* contact form → WhatsApp */
  var form = document.querySelector('#contact-form');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var d = new FormData(form);
      var nombre=(d.get('nombre')||'').trim(), email=(d.get('email')||'').trim();
      if(!nombre||!email){ form.reportValidity(); return; }
      var lines=['Hola Central de Depósitos, quiero hacer una consulta.','Nombre: '+nombre,'Email: '+email];
      var tel=(d.get('telefono')||'').trim(); if(tel) lines.push('Teléfono: '+tel);
      var suc=d.get('sucursal')||''; if(suc) lines.push('Sucursal de interés: '+suc);
      var msg=(d.get('mensaje')||'').trim(); if(msg) lines.push('Mensaje: '+msg);
      var waNum = WA;
      if (window.CDD){
        var key = /urquiza/i.test(suc) ? 'urquiza' : (/palermo/i.test(suc) ? 'palermo' : null);
        if (key && CDD.sucursales[key]) waNum = CDD.sucursales[key].wa;
      }
      window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
      form.reset();
    });
  }

  /* boxes page: selector de sucursal actualiza precios */
  var priceGrid = document.querySelector('[data-price-grid]');
  if (priceGrid && window.CDD){
    var sucSel = document.querySelector('[data-suc-select]');
    function renderPrices(suc){
      priceGrid.querySelectorAll('[data-size]').forEach(function(card){
        var b = CDD.getBaulera(card.getAttribute('data-size'));
        var desde = CDD.desde(b, suc);
        var el = card.querySelector('[data-desde]');
        var btn = card.querySelector('[data-reservar]');
        var lv = card.querySelector('[data-levels]');
        if (desde==null){
          card.setAttribute('data-unavailable','');
          if(el) el.innerHTML = '<span class="na">Consultar disponibilidad</span>';
          if(lv) lv.innerHTML = '';
          if(btn){ btn.style.display='none'; }
        } else {
          card.removeAttribute('data-unavailable');
          if(el) el.innerHTML = 'desde <b>'+CDD.fmt(desde)+'</b> <small>/ mes</small>';
          if(lv){
            lv.innerHTML = Object.keys(b.niveles).filter(function(n){ return b.niveles[n][suc]!=null; })
              .map(function(n){ return '<li><span>'+CDD.nivelLabel[n]+'</span><b>'+CDD.fmt(b.niveles[n][suc])+'</b></li>'; }).join('');
          }
          if(btn){ btn.style.display=''; btn.href='reservar.html?suc='+suc+'&size='+b.id; }
        }
      });
    }
    if (sucSel){ sucSel.addEventListener('change', function(){ renderPrices(this.value); }); }
    renderPrices(sucSel ? sucSel.value : 'palermo');
  }
})();
