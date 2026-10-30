/* Masjid At-Towfiq curated YouTube library, published from the separate portal. */
(() => {
  "use strict";
  const grid=document.getElementById("masjidVideosGrid");
  const status=document.getElementById("masjidVideosStatus");
  const filters=document.getElementById("masjidVideoFilters");
  const more=document.getElementById("masjidVideoMore");
  const dialog=document.getElementById("masjidVideoDialog");
  const frame=document.getElementById("masjidVideoFrame");
  const dialogTitle=document.getElementById("masjidVideoDialogTitle");
  const channel="https://www.youtube.com/@AttowfiqmasjidBolton";
  let items=[],active="All",expanded=false;
  const safeId=v=>typeof v==="string"&&/^[A-Za-z0-9_-]{11}$/.test(v);
  const make=(tag,cls,text)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  const channelLink=()=>{
    const a=make("a","masjid-videos-channel-link","Visit At-Towfiq on YouTube ↗");
    a.href=channel;a.target="_blank";a.rel="noopener noreferrer";return a;
  };
  function render(){
    const matches=items.filter(v=>active==="All"||v.category===active);
    const visible=expanded?matches:matches.slice(0,8);
    grid.replaceChildren();
    if(!matches.length){
      const empty=make("div","masjid-videos-empty");
      empty.append(make("strong","",items.length?"No videos in this category yet.":"New lectures and khutbahs will appear here."),
        make("p","","Follow the masjid’s YouTube channel for the latest recordings."),channelLink());
      grid.append(empty);
    }
    for(const [index,video] of visible.entries()){
      // Compact, consistent YouTube-style tiles. Metadata stays in the CMS
      // but descriptions and large action buttons do not fill the homepage.
      const card=make("article","masjid-video-card"+(video.featured&&active==="All"&&index===0?" is-featured":""));
      const picture=make("button","masjid-video-poster");
      picture.type="button";
      picture.dataset.videoId=video.youtube_id;
      picture.setAttribute("aria-label","Play "+video.title);
      const image=make("img");
      image.src="https://i.ytimg.com/vi/"+video.youtube_id+"/hqdefault.jpg";
      image.alt="";image.loading=index>3?"lazy":"eager";
      image.decoding="async";image.width=480;image.height=270;
      const play=make("span","masjid-video-play","▶");
      play.setAttribute("aria-hidden","true");
      picture.append(image,play);
      const title=make("h3","masjid-video-title");
      const titleButton=make("button","masjid-video-title-button",video.title);
      titleButton.type="button";titleButton.dataset.videoId=video.youtube_id;
      titleButton.setAttribute("aria-label","Play "+video.title);
      title.append(titleButton);
      card.append(picture,title);
      grid.append(card);
    }
    more.hidden=matches.length<=8;
    more.textContent=expanded?"Show fewer videos":"Show all "+matches.length+" videos";
  }
  function openPlayer(id){
    const video=items.find(v=>v.youtube_id===id);
    if(!video||!safeId(id))return;
    dialogTitle.textContent=video.title;
    frame.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0";
    frame.title=video.title+" — YouTube video player";
    if(typeof dialog.showModal==="function")dialog.showModal();
    else window.open("https://www.youtube.com/watch?v="+id,"_blank","noopener");
  }
  function closePlayer(){
    frame.removeAttribute("src");
  }
  grid.addEventListener("click",e=>{
    const node=e.target.closest("[data-video-id]");
    if(node)openPlayer(node.dataset.videoId);
  });
  filters.addEventListener("click",e=>{
    const button=e.target.closest("[data-video-category]");
    if(!button)return;
    active=button.dataset.videoCategory;expanded=false;
    filters.querySelectorAll("button").forEach(el=>el.setAttribute("aria-pressed",String(el===button)));
    render();
  });
  more.addEventListener("click",()=>{expanded=!expanded;render();});
  dialog.addEventListener("close",closePlayer);
  document.getElementById("masjidVideoClose").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  async function refresh(){
    try{
      const response=await fetch("/api/public/videos",{cache:"no-store"});
      if(!response.ok)throw new Error("Video feed unavailable");
      const payload=await response.json();
      if(!Array.isArray(payload.items))throw new Error("Invalid video feed");
      items=payload.items.filter(v=>safeId(v.youtube_id)&&typeof v.title==="string");
      items.sort((a,b)=>Number(b.featured)-Number(a.featured));
      status.textContent=items.length?items.length+" recordings available from Masjid At-Towfiiq.":"";
      render();
    }catch(e){
      status.textContent="Video library temporarily unavailable. Visit the masjid’s YouTube channel for current recordings.";
      grid.replaceChildren(channelLink());more.hidden=true;
    }
  }
  refresh();
})();
