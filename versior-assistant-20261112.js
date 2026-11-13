'use strict';
(function (root) {
  const PHONE = '593987654320';
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿¡]/g, '').toLowerCase().trim();
  const equipment = [
    ['rk-600', /\brk[\s-]?600\b/, 'RK–600: autorrefractómetro y queratómetro.'],
    ['ark-7610', /\bark[\s-]?7610\b/, 'ARK–7610: autorrefractómetro y queratómetro.'],
    ['lm-260', /\blm[\s-]?260\b/, 'LM–260: lensómetro digital.'],
    ['vc-235', /\bvc[\s-]?235\b/, 'VC–235: pantalla de optotipos.'],
    ['ls-4', /\bls[\s-]?4\b/, 'LS–4: lámpara de hendidura.'],
    ['c-190a', /\bc[\s-]?190\s?a\b/, 'C–190A: unidad de diagnóstico con mesa de trabajo.'],
    ['cp-266', /\bcp[\s-]?266\b|266.*lentill|caja de pruebas/, 'Caja de pruebas de 266 lentillas.']
  ];
  function handoff(question, label = 'Continuar con un asesor por WhatsApp') {
    const text = 'Hola VERSIOR, me gustaría recibir atención. Mi consulta es: ' + String(question).slice(0, 500);
    return { label, href: 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text), handoff: true };
  }
  function decide(question) {
    const q = normalize(question);
    const human = handoff(question);
    const model = equipment.find(item => item[1].test(q));
    if (/sintoma|medicamento|tratamiento|me duele|dolor de ojo|diagnosticar|vision borrosa/.test(q))
      return { kind: 'health', text: 'Este asistente brinda información comercial de VERSIOR. No evalúa síntomas ni indica tratamientos. Para cuestiones de salud, consulta a un profesional habilitado. Si necesitas información de nuestros equipos, un asesor puede orientarte.', actions: [human] };
    if (/compr|cotiz|precio|costo|coste|reserv|stock|disponib|proforma|pago|tarjeta|financi|factura|cuanto/.test(q))
      return { kind: 'purchase', text: 'Para precios, disponibilidad y condiciones de compra te conecto con nuestro equipo al +593 98 765 4320' + (model ? '. Equipo: ' + model[0].toUpperCase() : '') + '. El enlace abre WhatsApp con un borrador; tú decides si lo envías.', actions: [handoff(question, 'Comprar o cotizar por WhatsApp')] };
    if (/horario|a que hora|abren|cierran|domingo|sabado/.test(q))
      return { kind: 'unknown', text: 'No tengo un horario de atención confirmado. Consulta con un asesor antes de visitarnos para coordinar tu atención.', actions: [human] };
    if (/garantia|mantenim|reparacion|soporte|posventa|postventa|falla|no funciona/.test(q))
      return { kind: 'warranty', text: 'Nuestros equipos se presentan con 2 años de garantía. Alex te acompaña con soporte de marca y atención posventa. El alcance, las condiciones y cada caso se confirman directamente con él.', actions: [handoff(question, 'Consultar garantía con Alex')] };
    if (/capacit|aprender|entrenamiento|curso|usar.*equipo|uso.*equipo/.test(q))
      return { kind: 'training', text: 'La Dra. Julieta Siguencia acompaña la capacitación profesional de los equipos. Laura Herrera aporta al diseño y aprovechamiento de los espacios ópticos. Un asesor te ayuda a coordinar el servicio que necesitas.', actions: [human] };
    if (/arquitect|disen|remodel|construccion|espacio/.test(q))
      return { kind: 'design', text: 'Laura Herrera acompaña el diseño, construcción y remodelación de ópticas: espacios funcionales, cómodos y coherentes con tu marca. Cuéntanos tu proyecto para coordinar una atención personalizada.', actions: [human] };
    if (/ubicacion|ubicaciones|direccion|donde|mapa|visitar|locales|sucursal/.test(q))
      return { kind: 'locations', text: 'Nos encuentras en Quito principal (Giovani Calles y Palermo, urbanización UTE), La Luz en Quito (El Morlán y De los Álamos, barrio Damer II) y Biblián (Av. Mariscal Sucre y Benjamín Ochoa). Abre Contacto para ver los enlaces a los mapas.', actions: [{ label: 'Ver ubicaciones y mapas', href: '#contacto' }, human] };
    if (/responsabilidad|obra.*social|mision|2\s*%|dos por ciento/.test(q))
      return { kind: 'purpose', text: 'VERSIOR destina el 2 % de sus ventas a misiones y obras sociales en beneficio de personas de escasos recursos.', actions: [{ label: 'Conocer nuestro propósito', href: '#proposito' }, human] };
    if (model)
      return { kind: 'equipment', text: model[2] + ' Puedes explorar el equipo en nuestro catálogo. Para confirmar detalles, disponibilidad y condiciones, conversa con un asesor.', actions: [{ label: 'Explorar los equipos', href: '#equipos' }, human] };
    if (/equipo|producto|catalogo|ofrecen|autorrefract|lensomet|lampara|optotipo|lentilla/.test(q))
      return { kind: 'catalog', text: 'Contamos con RK–600, ARK–7610, lensómetro LM–260, pantalla VC–235, lámpara LS–4, unidad C–190A y caja de pruebas de 266 lentillas. Explora el catálogo o pide una cotización personalizada.', actions: [{ label: 'Explorar equipos', href: '#equipos' }, { label: 'Abrir catálogo PDF', href: 'CatalogoVersior_compressed.pdf' }, human] };
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|ayuda|menu|gracias)[!?.\s]*$/.test(q))
      return { kind: 'welcome', text: '¡Hola! Soy el asistente automático de VERSIOR. Puedo orientarte sobre equipos, garantía, capacitación y ubicaciones. Para comprar o para información que no tenga confirmada, te conectaré con un asesor por WhatsApp.', actions: [human] };
    return { kind: 'unknown', text: 'No tengo esa información confirmada. Para no darte un dato incorrecto, te conecto con un asesor de VERSIOR al +593 98 765 4320.', actions: [human] };
  }
  // Pure routing is independently testable; no network, credentials or message storage.
  if (typeof module === 'object' && module.exports) { module.exports = { decide, handoff, normalize, PHONE }; return; }
  if (!root || !root.document) return;
  const document = root.document;
  const launcher = document.querySelector('#chat-launcher');
  const dialog = document.querySelector('#versior-chat');
  const messages = document.querySelector('#chat-messages');
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  if (!launcher || !dialog || !form) return;
  let greeted = false;
  function event(name) {
    root.dataLayer = root.dataLayer || [];
    root.dataLayer.push({ event: name, channel: 'site_assistant' });
  }
  function addMessage(text, from, actions = []) {
    const entry = document.createElement('div');
    entry.className = 'chat-message chat-message-' + from;
    const author = document.createElement('span');
    author.className = 'chat-author';
    author.textContent = from === 'user' ? 'Tú' : 'Asistente automático';
    const body = document.createElement('p');
    body.textContent = text;
    entry.append(author, body);
    if (actions.length) {
      const links = document.createElement('div');
      links.className = 'chat-actions';
      actions.forEach(action => {
        const link = document.createElement('a');
        link.textContent = action.label;
        link.href = action.href;
        if (!action.href.startsWith('#')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        if (action.handoff) link.dataset.chatHandoff = 'true';
        links.append(link);
      });
      entry.append(links);
    }
    messages.append(entry);
    messages.scrollTop = messages.scrollHeight;
  }
  function ask(question) {
    const clean = question.trim().slice(0, 500);
    if (!clean) return;
    addMessage(clean, 'user');
    const reply = decide(clean);
    addMessage(reply.text, 'bot', reply.actions);
    dialog.dataset.lastAnswer = reply.kind;
  }
  function closeChat() { dialog.close(); }
  launcher.hidden = false;
  launcher.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('chat-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      addMessage('¡Hola! Soy el asistente automático de VERSIOR. Te ayudo con equipos, garantía, capacitación y ubicaciones. Si deseas comprar o no tengo una respuesta confirmada, te conecto con un asesor por WhatsApp.', 'bot');
      greeted = true;
    }
    input.focus({ preventScroll: true });
    event('chat_open');
    document.dispatchEvent(new Event('versior:chat-toggle'));
  });
  document.querySelector('#chat-close').addEventListener('click', closeChat);
  dialog.addEventListener('close', () => {
    document.body.classList.remove('chat-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus({ preventScroll: true });
    document.dispatchEvent(new Event('versior:chat-toggle'));
  });
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closeChat();
    }
    const link = e.target.closest('a[href]');
    if (link?.getAttribute('href')?.startsWith('#')) closeChat();
    if (link?.dataset.chatHandoff) event('chat_handoff');
  });
  document.querySelectorAll('[data-chat-topic]').forEach(button => button.addEventListener('click', () => {
    const labels = { equipos: '¿Qué equipos ofrecen?', comprar: 'Quiero comprar o cotizar', garantia: '¿Qué garantía tienen?', capacitacion: 'Quiero información de capacitación', ubicaciones: '¿Dónde están sus ubicaciones?' };
    ask(labels[button.dataset.chatTopic]);
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
    input.focus({ preventScroll: true });
  });
})(typeof window !== 'undefined' ? window : null);
