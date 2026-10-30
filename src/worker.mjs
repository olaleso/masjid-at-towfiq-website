// At-Towfiiq live MasjidBox parser, adapted from the uploaded Al-Hidaya route.
const SOURCE_URL = "https://masjidbox.com/prayer-times/masjid-at-towfiiq";
const ZONE="Europe/London";
const NAMES=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
const HOURS={Fajr:[0,12],Dhuhr:[10,16],Asr:[11,20],Maghrib:[14,23],Isha:[15,23],Jumuah:[10,17]};
export function londonDate(date) {
  const parts=new Intl.DateTimeFormat("en-GB",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:ZONE}).formatToParts(date);
  const p=Object.fromEntries(parts.map(item=>[item.type,item.value]));
  return p.year+"-"+p.month+"-"+p.day;
}
function londonMinutes(date) {
  const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:ZONE}).formatToParts(date).map(item=>[item.type,item.value]));
  return Number(p.hour)*60+Number(p.minute);
}
function dateKey(item) {
  const d=item?.hijri?.gregorian || item?.date;
  return typeof d==="string" ? d.slice(0,10) : "";
}
function following(iso) {
  const date=new Date(iso+"T12:00:00Z");
  date.setUTCDate(date.getUTCDate()+1);
  return date.toISOString().slice(0,10);
}
export function decodeMasjidboxState(source) {
  return decodeURIComponent(source.replace(/%u([0-9a-f]{4})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16))));
}
export function parseTime(value,prayer) {
  for(const item of (Array.isArray(value)?value:[value])) {
    if(typeof item!=="string") continue;
    const m=/(?:T|^)([0-2]\d):([0-5]\d)(?:\D|$)/.exec(item);
    if(!m) continue;
    const hour=Number(m[1]),minute=Number(m[2]);
    const [low,high]=HOURS[prayer]||[0,23];
    if(hour>23 || (hour===0&&minute===0) || hour<low || hour>high) continue;
    return String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0");
  }
  return null;
}
const minutes=time=>time?Number(time.slice(0,2))*60+Number(time.slice(3,5)):-1;
export function buildPayload(state,now=new Date()) {
  const feed=state?.masjidbox?.masjidboxAthany;
  if(!feed || !Array.isArray(feed.timetable) || feed.isStale===true) throw Error("MasjidBox timetable missing or stale");
  const today=londonDate(now);
  const current=feed.timetable.find(item=>dateKey(item)===today);
  if(!current) throw Error("No timetable for today's London date");
  const prayers=NAMES.map(name=>{
    const key=name.toLowerCase();
    return {name,begins:parseTime(current[key],name),jamaah:parseTime(current.iqamah?.[key],name)};
  });
  if(!prayers.some(p=>p.begins||p.jamaah)) throw Error("No usable prayer time values");
  let next=prayers.find(p=>p.jamaah&&minutes(p.jamaah)>londonMinutes(now));
  if(!next) {
    const tomorrow=feed.timetable.find(item=>dateKey(item)===following(today));
    const fajr=parseTime(tomorrow?.iqamah?.fajr,"Fajr");
    if(fajr) next={name:"Fajr tomorrow",jamaah:fajr};
  }
  const friday=feed.timetable.find(item=>{
    const key=dateKey(item);
    return key>=today && /^\d{4}-\d{2}-\d{2}$/.test(key) && new Date(key+"T12:00:00Z").getUTCDay()===5 && parseTime(item.iqamah?.jumuah||item.jumuah,"Jumuah");
  });
  return {
    date:today,
    displayDate:new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:ZONE}).format(now),
    prayers,jumuah:friday?parseTime(friday.iqamah?.jumuah||friday.jumuah,"Jumuah"):null,
    nextPrayer:next?{name:next.name,time:next.jamaah}:null,
    sourceUrl:SOURCE_URL,verified:feed.verified===true
  };
}
export function parseMasjidboxHtml(html,now=new Date()) {
  const encoded=html.match(/window\.REDUX_STATE\s*=\s*'([^']+)'/)?.[1];
  if(!encoded) throw Error("MasjidBox Redux state unavailable");
  return buildPayload(JSON.parse(decodeMasjidboxState(encoded)),now);
}
function json(body,status=200,cache="no-store") {
  return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":cache,"X-Content-Type-Options":"nosniff"}});
}
export default {
  async fetch(request,env) {
    if(new URL(request.url).pathname==="/api/public/prayer-times") {
      if(request.method!=="GET") return json({error:"Method not allowed"},405);
      try {
        const upstream=await fetch(SOURCE_URL,{headers:{Accept:"text/html,application/xhtml+xml"},signal:AbortSignal.timeout(10000)});
        if(!upstream.ok) throw Error("MasjidBox HTTP "+upstream.status);
        if(Number(upstream.headers.get("content-length")||0)>3_000_000) throw Error("Upstream page too large");
        const html=await upstream.text();
        if(html.length>3_000_000) throw Error("Upstream page too large");
        return json(parseMasjidboxHtml(html),200,"public, max-age=60, s-maxage=120");
      } catch(err) {
        console.error("At-Towfiiq prayer feed unavailable:",err instanceof Error?err.message:String(err));
        return json({error:"Live prayer timetable temporarily unavailable",sourceUrl:SOURCE_URL},503);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
