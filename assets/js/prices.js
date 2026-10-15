/* Central de Depósitos — precios y catálogo de bauleras
   ÚNICO lugar para editar precios. Todas las páginas y el flujo de reserva lo consumen.
   Valores leídos de la lista de precios (oct 2026). Niveles: baja / alta / tercer.
   NOTA: confirmar "TN-M $145.000" (no incluido aún) y centavos exactos. */
var CDD = window.CDD = window.CDD || {};

CDD.wa = '5491128449907'; // WhatsApp general (Palermo)

CDD.sucursales = {
  palermo:  { id:'palermo',  nombre:'Palermo',        dir:'Concepción Arenal 2630', tel:'541147792424', wa:'5491128449907', waDisplay:'+54 9 11 2844-9907' },
  urquiza:  { id:'urquiza',  nombre:'Villa Urquiza',  dir:'14 de Julio 554',        tel:'541145524727', wa:'5491123808157', waDisplay:'+54 9 11 2380-8157' }
};

/* Cada tamaño: m3, dimensiones, para qué sirve, y precio por nivel y sucursal.
   null = esa sucursal no ofrece ese tamaño. */
CDD.bauleras = [
  { id:'4', box:{w:1.6, d:1.6, h:1.6},  m3:4,  label:'4 m³',  nombre:'Chica',
    dims:'1,60 × 1,60 × 1,60 m', usoCorto:'Cajas, bolsos y valijas',
    uso:'Ideal para artículos medianos, cajas, bolsos, valijas o el guardado de un ambiente chico.',
    niveles:{ baja:{palermo:105000, urquiza:96000}, alta:{palermo:105000, urquiza:96000} } },

  { id:'5', box:{w:1.6, d:2.0, h:1.6},  m3:5,  label:'5 m³',  nombre:'Chica Plus',
    dims:'Referencia estimativa', usoCorto:'Ambiente chico con margen',
    uso:'Un poco más de aire que la de 4 m³, para que las cosas entren cómodas y puedas moverte adentro.',
    niveles:{ baja:{palermo:115000, urquiza:null}, alta:{palermo:115000, urquiza:null} } },

  { id:'10', box:{w:1.6, d:3.2, h:2.0}, m3:10, nombre:'Standard', label:'10 m³',
    dims:'1,60 × 2,00 × 3,20 m', usoCorto:'Depto de 2 a 3 ambientes',
    uso:'El tamaño más elegido: entra cómodo un departamento de 2 o 3 ambientes con muebles.',
    niveles:{ baja:{palermo:214000, urquiza:206000}, alta:{palermo:192000, urquiza:185000}, tercer:{palermo:170000, urquiza:164000} } },

  { id:'15', box:{w:2.4, d:3.2, h:2.0}, m3:15, nombre:'Standard Plus', label:'15 m³',
    dims:'Referencia estimativa', usoCorto:'Depto de 3 ambientes holgado',
    uso:'Para un 3 ambientes con lugar de sobra, o un 2/3 ambientes al que se le suman cosas con el tiempo.',
    niveles:{ baja:{palermo:319000, urquiza:null}, alta:{palermo:296000, urquiza:null} } },

  { id:'20', box:{w:3.0, d:3.2, h:2.0}, m3:20, nombre:'Doble Standard', label:'20 m³',
    dims:'3,00 × 2,00 × 3,20 m', usoCorto:'Depto de 3 a 4 ambientes',
    uso:'Un departamento grande o casa chica completa, o stock de un comercio.',
    niveles:{ baja:{palermo:428000, urquiza:412000}, alta:{palermo:384000, urquiza:370000} } },

  { id:'30', box:{w:4.7, d:3.2, h:2.0}, m3:30, nombre:'Triple Standard', label:'30 m³',
    dims:'Referencia estimativa', usoCorto:'Casa de 4 a 5 ambientes',
    uso:'Para una casa entera de 4 o 5 ambientes, o volumen de mercadería de empresa.',
    niveles:{ baja:{palermo:642000, urquiza:618000}, alta:{palermo:576000, urquiza:555000} } }
];

CDD.nivelLabel = { baja:'Nivel bajo', alta:'Nivel alto', tercer:'Tercer nivel' };
CDD.nivelNota  = {
  baja:'Acceso más cómodo, a nivel del piso.',
  alta:'Nivel superior, mejor precio.',
  tercer:'Tercer nivel, el más económico.'
};

/* helpers */
CDD.fmt = function(n){ return n==null ? '—' : '$' + n.toLocaleString('es-AR'); };

CDD.getBaulera = function(id){ return CDD.bauleras.find(b=>b.id===id) || null; };

// nivel más barato disponible de un tamaño en una sucursal
CDD.desde = function(baulera, suc){
  var vals = Object.keys(baulera.niveles)
    .map(function(k){ return baulera.niveles[k][suc]; })
    .filter(function(v){ return v!=null; });
  return vals.length ? Math.min.apply(null, vals) : null;
};

// tamaños disponibles en una sucursal
CDD.disponibles = function(suc){
  return CDD.bauleras.filter(function(b){ return CDD.desde(b, suc)!=null; });
};

// sugerir baulera por m³ estimados (con margen cómodo: redondea hacia arriba)
CDD.sugerir = function(m3, suc){
  var disp = CDD.disponibles(suc || 'palermo').slice().sort(function(a,b){return a.m3-b.m3;});
  // primer tamaño que cubre el volumen con algo de aire
  for (var i=0;i<disp.length;i++){ if (disp[i].m3 >= m3) return disp[i]; }
  return disp[disp.length-1]; // si se pasa del máximo, el más grande
};

// devuelve la sugerida + la inmediata superior (opción holgada), si existe
CDD.sugerirConAlternativa = function(m3, suc){
  suc = suc || 'palermo';
  var disp = CDD.disponibles(suc).slice().sort(function(a,b){return a.m3-b.m3;});
  var sug = CDD.sugerir(m3, suc);
  var idx = disp.findIndex(function(b){ return b.id===sug.id; });
  return { sugerida: sug, holgada: (idx > -1 && idx < disp.length-1) ? disp[idx+1] : null };
};
