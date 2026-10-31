/* Gallery is read-only on the public site. Photos are curated in the portal. */
(() => {
  'use strict';
  const grid=document.getElementById('masjidGallery');
  if(!grid)return;
  const dialog=document.getElementById('masjidGalleryDialog');
  const close=document.getElementById('masjidGalleryClose');
  const image=document.getElementById('masjidGalleryDialogImage');
  const heading=document.getElementById('masjidGalleryDialogTitle');
  const description=document.getElementById('masjidGalleryDialogDescription');
  close?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog?.addEventListener('close',()=>{image.removeAttribute('src');});

  function showPhoto(photo) {
    const url='/api/public/gallery/photo/'+encodeURIComponent(photo.id);
    image.src=url;
    image.alt=photo.alt;
    heading.textContent=photo.title;
    description.textContent=photo.alt;
    if(typeof dialog.showModal==='function')dialog.showModal();
    else window.open(url,'_blank','noopener,noreferrer');
  }
  function tile(photo,featured){
    const button=document.createElement('button');
    button.type='button';
    button.className='masjid-photo-card'+(featured?' is-featured':'');
    button.setAttribute('aria-label','View photograph: '+photo.title);
    const img=document.createElement('img');
    img.src='/api/public/gallery/photo/'+encodeURIComponent(photo.id);
    img.alt=photo.alt;
    img.loading=featured?'eager':'lazy';
    img.decoding='async';
    const caption=document.createElement('span');
    caption.className='masjid-photo-title';
    const label=document.createElement('span');
    label.className='masjid-photo-label';
    label.textContent='MASJID AT-TOWFIQ';
    caption.append(label,document.createTextNode(photo.title));
    button.append(img,caption);
    button.addEventListener('click',()=>showPhoto(photo));
    return button;
  }
  async function initialise(){
    try{
      const controller=new AbortController();
      const response=await fetch('/api/public/gallery',{signal:controller.signal,headers:{Accept:'application/json'}});
      if(!response.ok)throw Error('Gallery feed unavailable');
      const payload=await response.json();
      if(!Array.isArray(payload.items))throw Error('Invalid gallery response');
      const photos=payload.items.filter(p=>p&&/^[a-f0-9-]{36}$/.test(p.id)
        &&typeof p.title==='string'&&typeof p.alt==='string').slice(0,12);
      if(!photos.length)return;
      const preferred=photos.find(p=>p.featured)||photos[0];
      grid.replaceChildren();
      photos.forEach(p=>grid.appendChild(tile(p,photos.length>1&&p.id===preferred.id)));
      // Only a real, approved gallery photograph replaces the concept hero image.
      const hero=document.querySelector('.hero-photography');
      if(hero){
        hero.style.backgroundImage='linear-gradient(90deg,rgba(4,17,36,.98) 0%,rgba(5,27,57,.95) 34%,rgba(6,28,58,.57) 72%,rgba(5,17,37,.6)),url("/api/public/gallery/photo/'+encodeURIComponent(preferred.id)+'")';
        hero.style.backgroundPosition='center 46%';
      }
      const heroCredit=document.querySelector('.hero-photo-credit');
      if(heroCredit)heroCredit.textContent='Inside Masjid At-Towfiq · authentic community photography';
      const footerCredit=document.querySelector('.footer-credit');
      if(footerCredit)footerCredit.textContent='Authentic photography of Masjid At-Towfiq · published with permission.';
    }catch(err){
      // Gallery must never break prayer information, admissions or other masjid content.
      console.warn('Gallery images not available:',err);
    }
  }
  initialise();
})();
