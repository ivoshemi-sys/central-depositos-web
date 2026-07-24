/* Central de Depósitos — diagramas isométricos de bauleras, a escala real entre sí.
   Todos los tamaños comparten el mismo viewBox, así una 30 m³ se ve realmente
   más grande que una 4 m³. Monta en [data-diagram="<idTamaño>"]. */
(function(){
  if (!window.CDD) return;

  var COS30 = Math.cos(Math.PI/6), SIN30 = 0.5;
  var S = 34;      // px por metro
  var PAD = 10;

  function iso(x,y,z){ return [ (x-y)*COS30*S, ((x+y)*SIN30 - z)*S ]; }

  // extensión global a partir de la baulera más grande (para escala compartida)
  function extent(){
    var xs=[], ys=[];
    CDD.bauleras.forEach(function(b){
      if(!b.box) return;
      var w=b.box.w, d=b.box.d, h=b.box.h;
      [[0,0,0],[w,0,0],[w,d,0],[0,d,0],[0,0,h],[w,0,h],[w,d,h],[0,d,h]].forEach(function(p){
        var q=iso(p[0],p[1],p[2]); xs.push(q[0]); ys.push(q[1]);
      });
    });
    return { minX:Math.min.apply(null,xs), maxX:Math.max.apply(null,xs),
             minY:Math.min.apply(null,ys), maxY:Math.max.apply(null,ys) };
  }

  var E = extent();
  var VW = (E.maxX-E.minX)+PAD*2, VH = (E.maxY-E.minY)+PAD*2;
  function tx(p){ return [ (p[0]-E.minX)+PAD, (p[1]-E.minY)+PAD ]; }
  function poly(pts){ return pts.map(function(p){ var q=tx(iso(p[0],p[1],p[2])); return q[0].toFixed(1)+','+q[1].toFixed(1); }).join(' '); }

  // huella máxima (la baulera más grande) como referencia de escala
  var MAXW = Math.max.apply(null, CDD.bauleras.map(function(b){return b.box?b.box.w:0;}));
  var MAXD = Math.max.apply(null, CDD.bauleras.map(function(b){return b.box?b.box.d:0;}));

  CDD.renderDiagram = function(b){
    if(!b || !b.box) return '';
    var w=b.box.w, d=b.box.d, h=b.box.h;
    var ground = poly([[0,0,0],[MAXW,0,0],[MAXW,MAXD,0],[0,MAXD,0]]);
    var top   = poly([[0,0,h],[w,0,h],[w,d,h],[0,d,h]]);
    var front = poly([[0,0,0],[w,0,0],[w,0,h],[0,0,h]]);
    var side  = poly([[w,0,0],[w,d,0],[w,d,h],[w,0,h]]);
    return '<svg class="iso" viewBox="0 0 '+VW.toFixed(0)+' '+VH.toFixed(0)+'" role="img" '+
      'aria-label="Baulera de '+b.label+': '+w+' por '+d+' por '+h+' metros, comparada con la más grande">'+
      // piso de referencia = huella de la baulera más grande
      '<polygon points="'+ground+'" fill="none" stroke="#c9c5b8" stroke-width="1" stroke-dasharray="4 4"/>'+
      '<polygon points="'+side +'" fill="#161616"/>'+
      '<polygon points="'+front+'" fill="#393939"/>'+
      '<polygon points="'+top  +'" fill="#c2d919"/>'+
      '<polygon points="'+top  +'" fill="none" stroke="#161616" stroke-width="1"/>'+
      '<polygon points="'+front+'" fill="none" stroke="#161616" stroke-width="1"/>'+
      '<polygon points="'+side +'" fill="none" stroke="#161616" stroke-width="1"/>'+
      '</svg>';
  };

  document.querySelectorAll('[data-diagram]').forEach(function(el){
    var b = CDD.getBaulera(el.getAttribute('data-diagram'));
    el.innerHTML = CDD.renderDiagram(b);
  });
})();
