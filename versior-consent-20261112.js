'use strict';
(function(){
  const storageKey='versior_cookie_consent';
  const banner=document.querySelector('#cookie-banner');
  let previousFocus=null;
  function emit(event,details={}){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...details});}
  function applyChoice(choice){
    const permission=choice==='accepted'?'granted':'denied';
    if(typeof window.gtag==='function')window.gtag('consent','update',{ad_storage:permission,analytics_storage:permission,ad_user_data:permission,ad_personalization:permission});
    if(choice==='accepted'&&typeof window.loadGoogleTagManager==='function')window.loadGoogleTagManager();
  }
  let savedChoice=null;
  try{savedChoice=localStorage.getItem(storageKey);}catch(error){savedChoice=null;}
  if(savedChoice==='accepted'||savedChoice==='essential'){applyChoice(savedChoice);if(banner)banner.hidden=true;}
  else if(banner)banner.hidden=false;
  document.querySelectorAll('[data-cookie-choice]').forEach(button=>button.addEventListener('click',()=>{
    const choice=button.dataset.cookieChoice;if(choice!=='essential'&&choice!=='accepted')return;
    try{localStorage.setItem(storageKey,choice);}catch(error){/* The choice still applies for this page. */}
    applyChoice(choice);emit('cookie_consent_update',{consent_choice:choice});if(banner)banner.hidden=true;
    if(previousFocus&&previousFocus.isConnected){previousFocus.focus({preventScroll:true});previousFocus=null;}
  }));
  document.querySelectorAll('[data-cookie-preferences]').forEach(button=>button.addEventListener('click',()=>{
    if(!banner)return;previousFocus=button;banner.hidden=false;banner.querySelector('button')?.focus({preventScroll:true});
  }));
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const product=target.closest('button[data-product]');
    if(product)emit('view_item',{item_id:product.dataset.product,item_name:product.querySelector('h3')?.textContent||product.dataset.product});
    const link=target.closest('a[href]');if(!link)return;const href=link.getAttribute('href')||'';
    if(href.startsWith('https://wa.me/'))emit('generate_lead',{source:link.id==='dialog-quote'?'product_quote':(link.closest('section')?.id||'site')+'_whatsapp',channel:'whatsapp'});
    else if(href==='CatalogoVersior_compressed.pdf')emit('file_download',{file_name:'CatalogoVersior_compressed.pdf'});
    else if(href.startsWith('#'))emit('section_navigation',{to_section:href.slice(1)});
  });
  document.querySelector('#contact-form')?.addEventListener('submit',event=>{
    const form=event.currentTarget;if(form.checkValidity()&&form.querySelector('[name="name"]').value.trim())emit('generate_lead',{source:'contact_form_whatsapp',channel:'whatsapp'});
  });
  const collection=document.querySelector('#equipos');
  if(collection){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){emit('view_item_list',{item_list_name:'equipos_versior'});observer.disconnect();}},{threshold:.2});observer.observe(collection);}
  const tab=new URLSearchParams(window.location.search).get('tab');
  if(tab==='privacidad'&&!window.location.pathname.endsWith('privacidad.html')){window.location.replace(new URL('privacidad.html',window.location.href).href);return;}
  const destinations={nosotros:'inicio',productos:'equipos',servicios:'servicios',contacto:'contacto'};
  if(destinations[tab]&&!window.location.hash){
    const scrollToLegacy=()=>document.querySelector('#'+destinations[tab])?.scrollIntoView({block:'start',behavior:'auto'});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(scrollToLegacy);else window.addEventListener('load',scrollToLegacy,{once:true});
  }
})();
