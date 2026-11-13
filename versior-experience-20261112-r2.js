'use strict';
document.documentElement.classList.add('js');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const menuButton=document.querySelector('.menu-toggle'),mobileNav=document.querySelector('.mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú');mobileNav.hidden=true;document.body.classList.remove('menu-open');}
menuButton.addEventListener('click',()=>{const opened=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!opened));menuButton.setAttribute('aria-label',opened?'Abrir menú':'Cerrar menú');mobileNav.hidden=opened;document.body.classList.toggle('menu-open',!opened);});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
matchMedia('(min-width: 981px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -25px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const portraitBounds={eli:[281,314,568,625],laura:[286,339,513,625],julieta:[346,313,526,625],alexander:[273,265,474,625]};
const portraitSizer=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>{
  const [x1,y1,x2,y2]=portraitBounds[target.dataset.portrait],scale=contentRect.height*.98/(y2-y1),size=800*scale;
  target.style.setProperty('--portrait-size',`${size.toFixed(1)}px ${size.toFixed(1)}px`);
  target.style.setProperty('--portrait-position',`${(contentRect.width/2-(x1+x2)*scale/2).toFixed(1)}px ${(contentRect.height+8-y2*scale).toFixed(1)}px`);
}));
document.querySelectorAll('[data-portrait]').forEach(portrait=>{
  const base=document.createElement('span');base.className='portrait-base';base.setAttribute('aria-hidden','true');portrait.append(base);
  portraitSizer.observe(portrait);
});
// People use a whole-photo focus reveal, never product slices or particles.
const support = document.querySelector('.service-people');
const supportTabs = [...support.querySelectorAll('[role="tab"]')];
const supportPanels = [...support.querySelectorAll('[role="tabpanel"]')];
const supportToggle = support.querySelector('[data-support-toggle]');
let supportIndex = 0, supportInView = false, supportHovered = false, supportFocused = false;
let supportPaused = motion.matches, supportTimer;
function scheduleSupport() {
  clearTimeout(supportTimer);
  if (supportInView && !supportPaused && !supportHovered && !supportFocused && !document.hidden && !motion.matches && !document.body.classList.contains('chat-open'))
    supportTimer = setTimeout(() => selectSupport((supportIndex + 1) % supportTabs.length), 6500);
}
function selectSupport(index, announce = false) {
  supportIndex = index;
  supportTabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    supportPanels[i].hidden = i !== index;
  });
  if (announce) support.querySelector('#support-status').textContent = supportTabs[index].querySelector('strong').textContent;
  scheduleSupport();
}
supportTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectSupport(i, true));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % supportTabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + supportTabs.length) % supportTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = supportTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault(); selectSupport(next, true); supportTabs[next].focus();
  });
});
function updateSupportToggle() {
  supportToggle.hidden = motion.matches;
  supportToggle.textContent = supportPaused ? '▶ Reproducir presentación' : 'Ⅱ Pausar presentación';
  supportToggle.setAttribute('aria-label', supportPaused ? 'Reproducir la presentación de nuestro equipo' : 'Pausar la presentación de nuestro equipo');
  scheduleSupport();
}
updateSupportToggle();
supportToggle.addEventListener('click', () => { supportPaused = !supportPaused; updateSupportToggle(); });
support.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { supportHovered = true; scheduleSupport(); } });
support.addEventListener('pointerleave', () => { supportHovered = false; scheduleSupport(); });
support.addEventListener('focusin', () => { supportFocused = true; scheduleSupport(); });
support.addEventListener('focusout', event => { supportFocused = support.contains(event.relatedTarget); scheduleSupport(); });
new IntersectionObserver(entries => {
  supportInView = entries[0].isIntersecting;
  support.classList.toggle('is-in-view', supportInView);
  scheduleSupport();
}, { threshold: .2 }).observe(support);
document.addEventListener('visibilitychange', scheduleSupport);
document.addEventListener('versior:chat-toggle', scheduleSupport);
motion.addEventListener('change', () => { supportPaused = motion.matches; updateSupportToggle(); });

const rail=document.querySelector('.equipment-rail'),railButtons=[...document.querySelectorAll('[data-rail]')];
railButtons.forEach(button=>button.addEventListener('click',()=>{const step=rail.querySelector('.equipment-item').getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap);rail.scrollBy({left:step*Number(button.dataset.rail),behavior:motion.matches?'auto':'smooth'});}));
function railState(){railButtons[0].disabled=rail.scrollLeft<8;railButtons[1].disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-8;}
rail.addEventListener('scroll',railState,{passive:true});addEventListener('resize',railState);railState();

const products={
  'rk-600':{name:'RK–600',category:'Refracción',type:'Autorrefractómetro y Queratómetro',description:'Diseñado para un flujo de alto volumen, minimiza el tiempo de acomodación gracias a su sistema inteligente de enfoque (Autotracking).',features:['Sistema LIO (lente intraocular).','Autotracking: enfoque automático.','Mentonera robótica.','Tiempo de medición inferior a 0,5 segundos.']},
  'ark-7610':{name:'ARK–7610',category:'Refracción',type:'Autorrefractómetro / Queratómetro',description:'Equipo robusto con nuevo sistema óptico que incorpora la exclusiva impresión de imagen de Hartmann, garantizando mediciones rápidas y seguras.',features:['Pantalla táctil LCD TFT de 7 pulgadas con ángulo ajustable.','Medición de energía luminosa segura: <30 uW.','Medición en pupila mínima de 2,0 mm.']},
  'lm-260':{name:'LM–260',category:'Agudeza visual',type:'Lensómetro digital',description:'Mediciones rápidas y eficientes sin compensación de Abbe, incorporando una cámara de alta resolución.',features:['Cámara de alta resolución Hartmann de 150 puntos.','Medición de transmitancia ultravioleta UV400–UVA.','Dos tipos de bolígrafos de puntos: recargable y tinta.']},
  'vc-235':{name:'VC–235',category:'Agudeza visual',type:'Pantalla optotipo digital',description:'Sustituye proyectores tradicionales con una pantalla de diseño delgado y liviano para exámenes precisos.',features:['Monitor de 23,5 o 19,5 pulgadas HD.','Precisión de medición de 2,0 m a 6,5 m.','Pruebas de daltonismo y entrenamiento de ambliopía.']},
  'ls-4':{name:'LS–4',category:'Biomicroscopía',type:'Lámpara de hendidura',description:'Óptica premium que proporciona una luz brillante y nítida, ideal para diagnósticos confiables y detallados.',features:['Cinco niveles de aumento.','Iluminación LED de alto rendimiento: más de 50.000 horas.','Filtro amarillo integrado y control continuo.']},
  'c-190a':{name:'C–190A',category:'Unidades clínicas',type:'Unidad de diagnóstico',description:'Unidad integral diseñada con estructura robusta y estable para brindar comodidad al paciente y precisión al profesional.',features:['Silla con elevación eléctrica.','Brazo giratorio tipo bull eye con ajuste de 180 grados.','Mesa de trabajo deslizante con cajón y luz optométrica.']},
  'cp-266':{name:'266 LENTILLAS',category:'Diagnóstico',type:'Caja de pruebas profesional',description:'Set profesional y completo con esferas, cilindros, prismas y accesorios en vidrio óptico premium.',features:['Vidrio óptico de alta calidad.','Lentillas con incrementos precisos de 0,25 D a 20,0 D.','Incluye estuche resistente.']}
};
const hero = document.querySelector('.hero');
const heroDevices = hero.querySelector('.hero-devices');
const heroBackdrops = [...hero.querySelectorAll('.hero-backdrop')];
const heroControls = hero.querySelector('.hero-carousel-controls');
const heroToggle = heroControls.querySelector('[data-hero-toggle]');
const heroName = hero.querySelector('#hero-model-name');
const heroType = hero.querySelector('#hero-model-type');
const heroStatus = hero.querySelector('#hero-carousel-status');
const productButtons = [...document.querySelectorAll('.equipment-open')];
const heroSlides = productButtons.map((button, index) => {
  const product = products[button.dataset.product];
  const photo = index === 0 ? heroDevices.querySelector('img') : button.querySelector('img').cloneNode();

  if (index > 0) {
    photo.className = 'hero-equipment';
    photo.loading = 'eager';
    photo.fetchPriority = 'low';
    photo.setAttribute('aria-hidden', 'true');
    heroDevices.append(photo);
  }

  return { product, photo };
});

let heroIndex = 0;
let heroInView = false;
let heroPlaying = !motion.matches;
let heroTimer;
const slideDuration = 4700;

function scheduleHeroAdvance() {
  clearTimeout(heroTimer);
  if (heroPlaying && heroInView && !document.hidden) {
    heroTimer = setTimeout(() => selectHeroSlide(heroIndex + 1), slideDuration);
  }
}

function selectHeroSlide(index, announce = false) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  const { product } = heroSlides[heroIndex];

  heroSlides.forEach(({ photo }, photoIndex) => {
    const current = photoIndex === heroIndex;
    photo.classList.toggle('is-current', current);
    photo.setAttribute('aria-hidden', String(!current));
  });
  heroBackdrops.forEach((backdrop, backdropIndex) => {
    backdrop.classList.toggle('is-current', backdropIndex === heroIndex % heroBackdrops.length);
  });

  heroName.textContent = product.name;
  heroType.textContent = product.type;
  if (announce) heroStatus.textContent = product.name + ', ' + product.type;
  scheduleHeroAdvance();
}

function updateHeroControls() {
  heroToggle.classList.toggle('is-paused', !heroPlaying);
  heroToggle.setAttribute('aria-label', heroPlaying ? 'Pausar el carrusel' : 'Reproducir el carrusel');
  scheduleHeroAdvance();
}

heroControls.querySelectorAll('[data-hero-step]').forEach(button => {
  button.addEventListener('click', () => selectHeroSlide(heroIndex + Number(button.dataset.heroStep), true));
});
heroToggle.addEventListener('click', () => {
  heroPlaying = !heroPlaying;
  updateHeroControls();
});
heroControls.hidden = false;
updateHeroControls();
document.addEventListener('visibilitychange', scheduleHeroAdvance);

const story = document.querySelector('.scroll-story');
const storyStage = story.querySelector('.story-stage');
const storyBeats = [...story.querySelectorAll('.story-beat')];
const storyDevices = [...story.querySelectorAll('.story-device')];
const storySegments = [...story.querySelectorAll('.story-progress i')];
const storyWord = story.querySelector('.story-word');
const storyModel = story.querySelector('.story-model');
const storyIndex = story.querySelector('.story-index');
const storyFormation = window.createVersiorFormation?.(story);
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const progressBar = document.querySelector('.reading-progress i');
const experience = document.querySelector('.experience');
const floatingContact = document.querySelector('.floating-contact');
const contact = document.querySelector('.contact');
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

let storyAnimated;
let currentBeat = -1;
let scrollFrame = 0;

function showStoryBeat(index) {
  currentBeat = index;
  storyBeats.forEach((beat, beatIndex) => {
    const current = beatIndex === index;
    const inactive = storyAnimated && !current;
    beat.classList.toggle('is-current', current);
    beat.toggleAttribute('inert', inactive);
    if (inactive) beat.setAttribute('aria-hidden', 'true');
    else beat.removeAttribute('aria-hidden');
    storyDevices[beatIndex].classList.toggle('is-current', current);
  });

  const { storyWord: word, storyModel: model } = storyBeats[index].dataset;
  storyWord.textContent = word;
  storyModel.textContent = model;
  storyIndex.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(storyBeats.length).padStart(2, '0');
}

function updateStoryMode() {
  // Available on desktop and mobile, including short laptop windows.
  storyAnimated = !motion.matches;
  story.classList.toggle('is-animated', storyAnimated);
  storyFormation?.setMode(storyAnimated);
  showStoryBeat(0);
  scheduleScroll();
}

function updateStory(bounds) {
  if (!storyAnimated) return;

  const travel = Math.max(1, bounds.height - storyStage.offsetHeight);
  const progress = clamp(-bounds.top / travel);
  const chapterProgress = progress * storyBeats.length;
  const nextBeat = Math.min(storyBeats.length - 1, Math.floor(chapterProgress));

  if (nextBeat !== currentBeat) showStoryBeat(nextBeat);

  // A reversible word → network → product transformation, driven only by scroll.
  const localProgress = clamp(chapterProgress - nextBeat);
  storyFormation?.render(nextBeat, localProgress);
  storySegments.forEach((segment, index) => {
    segment.style.setProperty('--segment-progress', clamp(chapterProgress - index).toFixed(4));
  });
}

function updateScroll() {
  const viewport = innerHeight;
  const heroBounds = hero.getBoundingClientRect();
  const storyBounds = story.getBoundingClientRect();
  const railBounds = rail.getBoundingClientRect();
  const experienceBounds = experience.getBoundingClientRect();
  const heroVisible = heroBounds.top < viewport && heroBounds.bottom > viewport * .18;

  if (heroVisible !== heroInView) {
    heroInView = heroVisible;
    scheduleHeroAdvance();
  }

  if (!motion.matches) {
    const heroProgress = clamp(-heroBounds.top / heroBounds.height);
    const equipmentDepth = clamp((viewport * .52 - railBounds.top - railBounds.height * .43) / (viewport * .68), -1, 1);
    const experienceProgress = clamp((viewport - experienceBounds.top) / (viewport + experienceBounds.height));
    hero.style.setProperty('--hero-progress', heroProgress.toFixed(4));
    rail.style.setProperty('--equipment-depth', equipmentDepth.toFixed(4));
    experience.style.setProperty('--scene', experienceProgress.toFixed(4));
    updateStory(storyBounds);
  }

  const scrollProgress = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - viewport));
  progressBar.style.transform = 'scaleX(' + scrollProgress + ')';
  floatingContact.classList.remove('is-hidden');
}

function scheduleScroll() {
  if (scrollFrame) return;

  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScroll();
  });
}

addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll, { passive: true });
motion.addEventListener('change', () => {
  heroPlaying = !motion.matches;
  updateHeroControls();
  updateStoryMode();
});
updateStoryMode();

function addPointerTilt(hitArea, styleTarget, xProperty, yProperty, range) {
  hitArea.addEventListener('pointermove', event => {
    if (!finePointer.matches || motion.matches || event.pointerType !== 'mouse') return;

    const bounds = hitArea.getBoundingClientRect();
    const x = .5 - clamp((event.clientY - bounds.top) / bounds.height);
    const y = clamp((event.clientX - bounds.left) / bounds.width) - .5;
    styleTarget.style.setProperty(xProperty, (x * range * .7).toFixed(2) + 'deg');
    styleTarget.style.setProperty(yProperty, (y * range).toFixed(2) + 'deg');
  }, { passive: true });

  hitArea.addEventListener('pointerleave', () => {
    styleTarget.style.removeProperty(xProperty);
    styleTarget.style.removeProperty(yProperty);
  }, { passive: true });
}

addPointerTilt(hero, heroDevices, '--tilt-x', '--tilt-y', 13);
productButtons.forEach(button => {
  const image = button.querySelector('.equipment-image');
  addPointerTilt(image, image, '--device-x', '--device-y', 22);
});

document.querySelectorAll('.beliefs > .belief').forEach(belief => {
  const summary = belief.querySelector('summary');
  let openedOnHover = false;

  belief.addEventListener('pointerenter', event => {
    if (!finePointer.matches || event.pointerType !== 'mouse' || belief.open) return;

    openedOnHover = true;
    belief.open = true;
  });

  belief.addEventListener('pointerleave', () => {
    if (!openedOnHover) return;

    openedOnHover = false;
    belief.open = false;
  });

  summary.addEventListener('click', event => {
    if (!openedOnHover) return;

    event.preventDefault();
    openedOnHover = false;
  });
});

const dialog=document.querySelector('#product-dialog');let lastProductButton;
document.querySelectorAll('.equipment-open').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.product,p=products[id];if(!p)return;lastProductButton=button;
  document.querySelector('#dialog-image').src=`assets/products/${id}.webp`;document.querySelector('#dialog-image').alt=p.name;
  document.querySelector('#dialog-category').textContent=p.category;document.querySelector('#dialog-title').textContent=p.name;document.querySelector('#dialog-type').textContent=p.type;document.querySelector('#dialog-description').textContent=p.description;
  document.querySelector('#dialog-features').replaceChildren(...p.features.map(feature=>{const li=document.createElement('li');li.textContent=feature;return li;}));
  document.querySelector('#dialog-quote').href=`https://wa.me/593963223843?text=${encodeURIComponent(`Hola VERSIOR, me gustaría cotizar el equipo ${p.name}. ¿Me pueden ayudar con disponibilidad y condiciones?`)}`;
  dialog.showModal();document.body.classList.add('dialog-open');
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');lastProductButton?.focus({preventScroll:true});});
document.querySelector('#contact-form').addEventListener('submit',e=>{
  e.preventDefault();const input=document.querySelector('#client-name'),name=input.value.trim();
  if(!name){input.setCustomValidity('Escribe tu nombre para continuar.');input.reportValidity();return;}
  const interest=document.querySelector('#client-interest').value,numbers={'diseñar o remodelar mi óptica':'593990331482','capacitación para mi equipo':'593958951408','soporte posventa':'593987654320'};
  window.open(`https://wa.me/${numbers[interest]||'593963223843'}?text=${encodeURIComponent(`Hola VERSIOR, soy ${name}. Me gustaría conocer más sobre ${interest}.`)}`,'_blank','noopener,noreferrer');
});
document.querySelector('#client-name').addEventListener('input',e=>e.target.setCustomValidity(''));
document.querySelector('#year').textContent=new Date().getFullYear();
