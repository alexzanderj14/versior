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
  for(let i=0;i<8;i++){const slice=document.createElement('span');slice.className='portrait-slice';slice.style.setProperty('--strip',i);slice.setAttribute('aria-hidden','true');portrait.append(slice);}
  portraitSizer.observe(portrait);
});
const portraitObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting&&entry.intersectionRatio>=.28)entry.target.classList.add('is-revealed');
  else if(entry.boundingClientRect.top>innerHeight||entry.boundingClientRect.bottom<0)entry.target.classList.remove('is-revealed');
}),{threshold:[0,.28],rootMargin:'0px 0px -5% 0px'});
document.querySelectorAll('.person-portrait').forEach(el=>portraitObserver.observe(el));

const runway=document.querySelector('.precision-runway'),sticky=document.querySelector('.precision-sticky'),beats=[...document.querySelectorAll('.precision-beat')],segments=[...document.querySelectorAll('.runway-progress i')],scene=document.querySelector('.experience'),progressBar=document.querySelector('.reading-progress i'),floating=document.querySelector('.floating-contact'),contact=document.querySelector('.contact');
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
let scrollFrame=0,activeBeat=-1;
function updateScroll(){
  const vh=innerHeight,rect=runway.getBoundingClientRect(),progress=clamp(-rect.top/Math.max(1,rect.height-sticky.offsetHeight));
  if(!motion.matches&&!matchMedia('(max-height:590px) and (orientation:landscape)').matches){runway.style.setProperty('--progress',progress.toFixed(4));const next=Math.min(2,Math.floor(progress*3));if(activeBeat!==next){activeBeat=next;beats.forEach((beat,i)=>{beat.classList.toggle('is-active',i===next);beat.setAttribute('aria-hidden',String(i!==next));});document.querySelector('.runway-index').innerHTML=`0${next+1} <small>/ 03</small>`;}segments.forEach((s,i)=>s.style.transform=`scaleX(${clamp(progress*3-i)})`);}
  else beats.forEach(b=>b.removeAttribute('aria-hidden'));
  const sr=scene.getBoundingClientRect();scene.style.setProperty('--scene',clamp((vh-sr.top)/(vh+sr.height)).toFixed(4));
  progressBar.style.transform=`scaleX(${clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-vh))})`;
  floating.classList.toggle('is-hidden',scrollY<vh*.65||contact.getBoundingClientRect().top<vh*.5);
}
function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateScroll();});}
addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll,{passive:true});motion.addEventListener('change',()=>{activeBeat=-1;scheduleScroll();});scheduleScroll();

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

const canvas=document.querySelector('#light-field'),ctx=canvas.getContext('2d');
let canvasW=0,canvasH=0,points=[],heroVisible=true,canvasFrame=0,lastPaint=0;
function sizeCanvas(){const box=canvas.getBoundingClientRect();canvasW=box.width;canvasH=box.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(canvasW*dpr);canvas.height=Math.round(canvasH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:innerWidth<760?26:55},()=>({x:Math.random()*canvasW,y:Math.random()*canvasH,r:Math.random()*1+.25,s:Math.random()*.13+.04,a:Math.random()*.3+.05}));}
function paint(time){canvasFrame=0;if(motion.matches||document.hidden||!heroVisible)return;if(time-lastPaint>33){lastPaint=time;ctx.clearRect(0,0,canvasW,canvasH);for(const p of points){p.y-=p.s;p.x+=Math.sin(time*.0002+p.y*.002)*.025;if(p.y<0)p.y=canvasH;ctx.beginPath();ctx.fillStyle=`rgba(31,180,250,${p.a})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}canvasFrame=requestAnimationFrame(paint);}
function resumeCanvas(){if(!canvasFrame&&!motion.matches&&!document.hidden&&heroVisible)canvasFrame=requestAnimationFrame(paint);}
sizeCanvas();new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(!heroVisible&&canvasFrame){cancelAnimationFrame(canvasFrame);canvasFrame=0;}resumeCanvas();}).observe(document.querySelector('.hero'));
addEventListener('resize',()=>{sizeCanvas();resumeCanvas();},{passive:true});document.addEventListener('visibilitychange',resumeCanvas);motion.addEventListener('change',resumeCanvas);resumeCanvas();

// Perspective is applied to the existing photograph, not a synthetic 3D replica.
const depthHero=document.querySelector('.hero'),depthScene=document.querySelector('.product-scene'),finePointer=matchMedia('(hover:hover) and (pointer:fine)');
let tiltFrame=0,tiltTargetX=0,tiltTargetY=0,tiltX=0,tiltY=0;
function renderTilt(){
  tiltFrame=0;
  if(motion.matches||!finePointer.matches||document.hidden){tiltX=tiltY=tiltTargetX=tiltTargetY=0;depthScene.style.removeProperty('--tilt-x');depthScene.style.removeProperty('--tilt-y');return;}
  tiltX+=(tiltTargetX-tiltX)*.1;tiltY+=(tiltTargetY-tiltY)*.1;
  depthScene.style.setProperty('--tilt-x',`${tiltX.toFixed(3)}deg`);depthScene.style.setProperty('--tilt-y',`${tiltY.toFixed(3)}deg`);
  if(Math.abs(tiltTargetX-tiltX)+Math.abs(tiltTargetY-tiltY)>.012)tiltFrame=requestAnimationFrame(renderTilt);
}
function queueTilt(){if(!tiltFrame)tiltFrame=requestAnimationFrame(renderTilt);}
depthHero.addEventListener('pointermove',e=>{if(motion.matches||!finePointer.matches)return;const r=depthHero.getBoundingClientRect();tiltTargetX=(.5-clamp((e.clientY-r.top)/r.height))*5;tiltTargetY=(clamp((e.clientX-r.left)/r.width)-.5)*8;queueTilt();},{passive:true});
function resetTilt(){tiltTargetX=tiltTargetY=0;queueTilt();}
depthHero.addEventListener('pointerleave',resetTilt,{passive:true});motion.addEventListener('change',resetTilt);finePointer.addEventListener('change',resetTilt);document.addEventListener('visibilitychange',resetTilt);
