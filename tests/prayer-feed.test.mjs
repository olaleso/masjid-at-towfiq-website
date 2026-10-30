import test from "node:test";
import assert from "node:assert/strict";
import {londonDate,decodeMasjidboxState,parseTime,buildPayload,parseMasjidboxHtml} from "../src/worker.mjs";
const make=(date,bad=false)=>({
  hijri:{gregorian:date},
  fajr:date+"T05:12:00",dhuhr:date+"T12:01:00",asr:date+"T14:59:00",
  maghrib:date+(bad?"T00:00:00":"T16:42:00"),isha:date+"T18:31:00",
  iqamah:{fajr:date+"T05:35:00",dhuhr:date+"T12:45:00",asr:date+"T15:15:00",
    maghrib:date+(bad?"T00:00:00":"T16:45:00"),isha:date+"T18:45:00",jumuah:[date+"T13:35:00"]}
});
const state=entries=>({masjidbox:{masjidboxAthany:{verified:true,isStale:false,timetable:entries}}});
test("MasjidBox unicode state decoding",()=>assert.equal(decodeMasjidboxState("%7B%22x%22%3A%22%u0627%22%7D"),'{"x":"ا"}'));
test("00:00 and implausible times are never displayed",()=>{
  assert.equal(parseTime("2026-10-30T00:00:00","Maghrib"),null);
  assert.equal(parseTime("2026-10-30T12:00:00","Maghrib"),null);
  assert.equal(parseTime("2026-10-30T16:42:00","Maghrib"),"16:42");
  assert.equal(parseTime(["2026-10-30T00:00:00","2026-10-30T13:35:00"],"Jumuah"),"13:35");
});
test("uses London date and next published iqamah",()=>{
  const p=buildPayload(state([make("2026-10-30",true),make("2026-10-31")]),new Date("2026-10-30T12:00:00Z"));
  assert.equal(p.date,"2026-10-30");
  assert.equal(p.nextPrayer.name,"Dhuhr");
  assert.equal(p.prayers.find(x=>x.name==="Maghrib").begins,null);
  assert.equal(p.prayers.find(x=>x.name==="Maghrib").jamaah,null);
  assert.equal(p.jumuah,"13:35");
});
test("extracts actual encoded redux state from HTML",()=>{
  const encoded=encodeURIComponent(JSON.stringify(state([make("2026-10-30")])));
  const p=parseMasjidboxHtml("<script>window.REDUX_STATE = '"+encoded+"';</script>",new Date("2026-10-30T12:00:00Z"));
  assert.equal(p.prayers[0].jamaah,"05:35");
});
test("stale and missing data fail closed",()=>{
  assert.throws(()=>buildPayload(state([make("2026-10-29")]),new Date("2026-10-30T12:00:00Z")));
  const stale=state([make("2026-10-30")]);
  stale.masjidbox.masjidboxAthany.isStale=true;
  assert.throws(()=>buildPayload(stale,new Date("2026-10-30T12:00:00Z")));
});
test("date remains correct in London in late October",()=>assert.equal(londonDate(new Date("2026-10-30T23:30:00Z")),"2026-10-30"));
