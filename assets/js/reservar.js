/* Central de Depósitos — Estimador de tamaño + Flujo de pre-reserva
   - Estimador: monta en [data-estimator]. El cliente elige qué guarda -> sugiere baulera (con margen) -> lleva a reservar.
   - Flujo: monta en [data-reserve]. sucursal -> tamaño -> nivel -> datos -> WhatsApp (pre-reserva sujeta a confirmación). */
(function(){
  if (!window.CDD) return;
  var WA = CDD.wa;

  /* ---------- ESTIMADOR ---------- */
  // Casos: qué guarda -> m³ estimados. Sugerimos con margen cómodo (sugerir redondea para arriba).
  var CASOS = [
    { id:'cajas',   label:'Cajas y valijas',        detail:'Ropa, libros, objetos',        m3:4 },
    { id:'mono',    label:'Un monoambiente',        detail:'Muebles de 1 ambiente',        m3:7 },
    { id:'2amb',    label:'Depto 2 ambientes',      detail:'Living + 1 dormitorio',        m3:10 },
    { id:'3amb',    label:'Depto 3 ambientes',      detail:'Casa/depto mediano',           m3:15 },
    { id:'casa',    label:'Casa 4–5 ambientes',     detail:'Mudanza de casa completa',     m3:26 },
    { id:'comercio',label:'Stock de comercio',      detail:'Mercadería, temporada',        m3:20 }
  ];

  document.querySelectorAll('[data-estimator]').forEach(function(root){
    var suc = 'palermo';
    var chips = CASOS.map(function(c){
      return '<button type="button" class="est-chip" data-caso="'+c.id+'">'+
        '<b>'+c.label+'</b><span>'+c.detail+'</span></button>';
    }).join('');
    root.innerHTML =
      '<div class="est">'+
        '<div class="est-suc">'+
          '<span class="est-suclabel">Sucursal</span>'+
          '<button type="button" class="est-sucbtn active" data-suc="palermo">Palermo</button>'+
          '<button type="button" class="est-sucbtn" data-suc="urquiza">Villa Urquiza</button>'+
        '</div>'+
        '<div class="est-chips">'+chips+'</div>'+
        '<div class="est-result" data-result hidden></div>'+
      '</div>';

    var resultBox = root.querySelector('[data-result]');

    root.querySelectorAll('[data-suc]').forEach(function(b){
      b.addEventListener('click', function(){
        suc = b.getAttribute('data-suc');
        root.querySelectorAll('[data-suc]').forEach(function(x){x.classList.remove('active');});
        b.classList.add('active');
        var active = root.querySelector('.est-chip.sel');
        if (active) active.click();
      });
    });

    root.querySelectorAll('[data-caso]').forEach(function(chip){
      chip.addEventListener('click', function(){
        root.querySelectorAll('.est-chip').forEach(function(x){x.classList.remove('sel');});
        chip.classList.add('sel');
        var caso = CASOS.filter(function(c){return c.id===chip.getAttribute('data-caso');})[0];
        var r = CDD.sugerirConAlternativa(caso.m3, suc);
        var b = r.sugerida, desde = CDD.desde(b, suc);
        var alt = '';
        if (r.holgada){
          alt = '<div class="est-alt">'+
            '<span class="est-alt-t">¿Preferís no quedarte corto?</span>'+
            '<p>La de <b>'+r.holgada.label+'</b> te deja lugar de sobra para acomodar, circular adentro y para lo que sumes más adelante — desde <b>'+CDD.fmt(CDD.desde(r.holgada,suc))+'</b>/mes.</p>'+
            '<a href="reservar.html?suc='+suc+'&size='+r.holgada.id+'">Ver la de '+r.holgada.label+' →</a>'+
          '</div>';
        }
        resultBox.hidden = false;
        resultBox.innerHTML =
          '<div class="est-card">'+
            '<div class="est-card-l">'+
              '<span class="est-tag">Te sugerimos</span>'+
              '<div class="est-size">'+b.label+' · '+b.nombre+'</div>'+
              '<p class="est-uso">'+b.uso+'</p>'+
              '<p class="est-margin">Calculado con margen para que entre cómodo y puedas moverte adentro.</p>'+
            '</div>'+
            '<div class="est-card-r">'+
              '<span class="est-desde">desde</span>'+
              '<span class="est-price">'+CDD.fmt(desde)+'</span>'+
              '<span class="est-mes">por mes · '+CDD.sucursales[suc].nombre+'</span>'+
              '<a class="btn btn--accent btn--block" href="reservar.html?suc='+suc+'&size='+b.id+'">Pre-reservar esta baulera</a>'+
            '</div>'+
          '</div>'+ alt;
      });
    });
  });

  /* ---------- FLUJO DE PRE-RESERVA ---------- */
  var host = document.querySelector('[data-reserve]');
  if (!host) return;

  var params = new URLSearchParams(location.search);
  var state = {
    suc: params.get('suc') || null,
    size: params.get('size') || null,
    nivel: null
  };

  function money(n){ return CDD.fmt(n); }
  function currentBaulera(){ return state.size ? CDD.getBaulera(state.size) : null; }
  function currentPrice(){
    var b = currentBaulera(); if(!b||!state.nivel||!state.suc) return null;
    return b.niveles[state.nivel] ? b.niveles[state.nivel][state.suc] : null;
  }

  var STEPS = ['suc','size','nivel','datos'];
  var LABELS = { suc:'Sucursal', size:'Tamaño', nivel:'Nivel', datos:'Tus datos' };
  var justAdvanced = false;

  function currentStep(){
    if(!state.suc) return 'suc';
    if(!state.size) return 'size';
    if(!state.nivel) return 'nivel';
    return 'datos';
  }

  function progressBar(){
    var cur = currentStep();
    var filled = { suc:!!state.suc, size:!!state.size, nivel:!!state.nivel, datos:false };
    return '<ol class="rz-progress">'+STEPS.map(function(k,i){
      var cls = (k===cur) ? 'active' : (filled[k] ? 'done' : 'todo');
      return '<li class="rz-pstep '+cls+'"><span class="rz-pnum">'+(filled[k]?'✓':(i+1))+'</span>'+
             '<span class="rz-plabel">'+LABELS[k]+'</span></li>';
    }).join('')+'</ol>';
  }

  function optList(items, current, attr, twoCol){
    return '<div class="rz-opts'+(twoCol?'':' rz-opts--col')+'">'+items.map(function(it){
      return '<button type="button" class="rz-opt'+(current===it.val?' sel':'')+'" '+attr+'="'+it.val+'">'+
        '<span class="rz-radio"></span>'+
        '<span class="rz-opt-txt"><b>'+it.title+'</b>'+(it.sub?'<span>'+it.sub+'</span>':'')+'</span>'+
        '<span class="rz-arrow" aria-hidden="true"></span>'+
      '</button>';
    }).join('')+'</div>';
  }

  function doneRow(step, label, value){
    return '<div class="rz-step rz-done"><div class="rz-done-row">'+
      '<span class="rz-check">✓</span>'+
      '<span class="rz-done-label">'+label+'</span>'+
      '<b class="rz-done-val">'+value+'</b>'+
      '<button type="button" class="rz-change" data-change="'+step+'">Cambiar</button>'+
    '</div></div>';
  }

  function lockedRow(n, label){
    return '<div class="rz-step rz-locked"><div class="rz-locked-row">'+
      '<span class="rz-lock">'+n+'</span><span class="rz-locked-label">'+label+'</span>'+
      '<span class="rz-lock-note">Se habilita al completar el paso anterior</span>'+
    '</div></div>';
  }

  function activeHead(n, title, help){
    return '<div class="rz-h"><span class="rz-step-of">Paso '+n+' de 4</span><h3>'+title+'</h3>'+
      '<p class="rz-help">'+help+'</p></div>';
  }

  function datosBody(b){
    return '<div class="rz-summary">'+
        '<div class="rz-sum-row"><span>Sucursal</span><b>'+CDD.sucursales[state.suc].nombre+'</b></div>'+
        '<div class="rz-sum-row"><span>Baulera</span><b>'+b.label+' · '+b.nombre+'</b></div>'+
        '<div class="rz-sum-row"><span>Nivel</span><b>'+CDD.nivelLabel[state.nivel]+'</b></div>'+
        '<div class="rz-sum-row rz-sum-total"><span>Precio</span><b>'+money(currentPrice())+' <small>/ mes</small></b></div>'+
      '</div>'+
      '<form class="rz-form" id="rz-form" novalidate>'+
        '<div class="field"><label for="rz-nombre">Nombre y apellido *</label><input id="rz-nombre" name="nombre" required></div>'+
        '<div class="form-row">'+
          '<div class="field"><label for="rz-tel">Teléfono / WhatsApp *</label><input id="rz-tel" name="tel" required></div>'+
          '<div class="field"><label for="rz-fecha">¿Desde cuándo?</label><input id="rz-fecha" name="fecha" type="date"></div>'+
        '</div>'+
        '<button type="submit" class="btn btn--accent btn--block rz-submit">Enviar pre-reserva por WhatsApp</button>'+
        '<p class="form-note">La reserva queda <b>sujeta a confirmación del local</b>. Te contactamos para confirmar disponibilidad y coordinar el ingreso.</p>'+
      '</form>';
  }

  function render(){
    var cur = currentStep();
    var b = currentBaulera();
    var html = progressBar();

    // Paso 1 — Sucursal
    if(state.suc){
      html += doneRow('suc','Sucursal', CDD.sucursales[state.suc].nombre);
    } else {
      var sucItems = Object.keys(CDD.sucursales).map(function(k){ var s=CDD.sucursales[k]; return {val:k,title:s.nombre,sub:s.dir}; });
      html += '<div class="rz-step rz-active">'+activeHead(1,'¿En qué sucursal querés tu baulera?','Tocá una de las dos opciones para continuar.')+optList(sucItems,state.suc,'data-suc',true)+'</div>';
    }

    // Paso 2 — Tamaño
    if(state.size){
      html += doneRow('size','Tamaño', b.label+' · '+b.nombre);
    } else if(cur==='size'){
      var disp = CDD.disponibles(state.suc).map(function(x){ return {val:x.id,title:x.label+' · '+x.nombre,sub:x.usoCorto+' — desde '+money(CDD.desde(x,state.suc))}; });
      html += '<div class="rz-step rz-active">'+activeHead(2,'¿Qué tamaño necesitás?','Tocá un tamaño. Si no sabés cuál, usá el estimador de arriba.')+optList(disp,state.size,'data-size',false)+'</div>';
    } else {
      html += lockedRow(2,'Tamaño de la baulera');
    }

    // Paso 3 — Nivel
    if(state.nivel){
      html += doneRow('nivel','Nivel', CDD.nivelLabel[state.nivel]);
    } else if(cur==='nivel'){
      var niv = Object.keys(b.niveles).filter(function(n){ return b.niveles[n][state.suc]!=null; }).map(function(n){ return {val:n,title:CDD.nivelLabel[n],sub:CDD.nivelNota[n]+' — '+money(b.niveles[n][state.suc])}; });
      html += '<div class="rz-step rz-active">'+activeHead(3,'¿Qué nivel preferís?','Tocá un nivel. El más alto sale menos; el bajo es más cómodo de acceder.')+optList(niv,state.nivel,'data-nivel',false)+'</div>';
    } else {
      html += lockedRow(3,'Nivel de la baulera');
    }

    // Paso 4 — Datos
    if(cur==='datos'){
      html += '<div class="rz-step rz-active">'+activeHead(4,'Últimos datos y listo','Completá tus datos y te contactamos para confirmar la reserva.')+datosBody(b)+'</div>';
    } else {
      html += lockedRow(4,'Tus datos');
    }

    host.innerHTML = html;
    wire();

    if(justAdvanced){
      var act = host.querySelector('.rz-active');
      if(act) act.scrollIntoView({block:'center', behavior:'smooth'});
      justAdvanced = false;
    }
  }

  function wire(){
    host.querySelectorAll('[data-suc]').forEach(function(b){ b.onclick=function(){ state.suc=b.getAttribute('data-suc');
      if(state.size && CDD.desde(CDD.getBaulera(state.size), state.suc)==null){ state.size=null; state.nivel=null; }
      justAdvanced=true; render(); }; });
    host.querySelectorAll('[data-size]').forEach(function(b){ b.onclick=function(){ state.size=b.getAttribute('data-size'); state.nivel=null; justAdvanced=true; render(); }; });
    host.querySelectorAll('[data-nivel]').forEach(function(b){ b.onclick=function(){ state.nivel=b.getAttribute('data-nivel'); justAdvanced=true; render(); }; });
    host.querySelectorAll('[data-change]').forEach(function(b){ b.onclick=function(){
      var step=b.getAttribute('data-change');
      if(step==='suc'){ state.suc=null; state.size=null; state.nivel=null; }
      else if(step==='size'){ state.size=null; state.nivel=null; }
      else if(step==='nivel'){ state.nivel=null; }
      justAdvanced=true; render();
    }; });

    var form = host.querySelector('#rz-form');
    if (form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var nombre=form.nombre.value.trim(), tel=form.tel.value.trim(), fecha=form.fecha.value;
        if(!nombre||!tel){ form.reportValidity(); return; }
        var b=currentBaulera();
        var lines=[
          'Hola Central de Depósitos, quiero hacer una PRE-RESERVA:',
          'Sucursal: '+CDD.sucursales[state.suc].nombre+' ('+CDD.sucursales[state.suc].dir+')',
          'Baulera: '+b.label+' · '+b.nombre,
          'Nivel: '+CDD.nivelLabel[state.nivel],
          'Precio: '+money(currentPrice())+' / mes',
          'Nombre: '+nombre,
          'Teléfono: '+tel
        ];
        if(fecha) lines.push('Ingreso estimado: '+fecha);
        lines.push('(Entiendo que queda sujeta a confirmación del local.)');
        window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
      });
    }
  }

  render();
})();
