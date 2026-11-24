// round14-links: one synchronous handoff, shared by the room and the computer.
export function openRoomTab(raw){
 try{
  const url=new URL(raw,location.href);
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return false;
  window.open(url.href,'_blank','noopener,noreferrer');
  let note=document.getElementById('room-link-note');
  if(!note){
   note=document.createElement('div');note.id='room-link-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
   // Colours and type follow the existing room hint capsule in interact.js.
   note.style.cssText='position:fixed;left:50%;bottom:74px;transform:translateX(-50%);z-index:20;padding:7px 12px;color:#f1e6d2;background:#0b1214ed;border:1px solid #d9a46a66;border-radius:16px;font:12px/1.4 ui-monospace,monospace;pointer-events:none';
   document.body.append(note);
  }
  clearTimeout(note.dismiss);note.hidden=false;note.textContent='Opened in a new tab';note.dismiss=setTimeout(()=>{note.hidden=true;note.textContent=''},2000);
  return true;
 }catch(error){console.warn('Could not open source tab',error.message);return false;}
}
export function outsideRoom(raw){try{const u=new URL(raw,location.href);return ['http:','https:'].includes(u.protocol)&&u.origin!==location.origin;}catch{return false;}}
export function paperSource(r){const f=r.fields||r;return f.link||f.sourceLink||(f.doi?'https://doi.org/'+f.doi:null)||r.canonicalPath||null;}
export function paperPDF(r){const f=r.fields||r,v=f.pdf||f.pdfLink||f.pdfUrl;return typeof v==='string'?v:v?.href||null;}
