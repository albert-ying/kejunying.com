let pending;
export function boot(api){return pending??=(async()=>{
 const response=await fetch('/bench-360/inscene/host.js.gz');
 if(!response.ok)throw Error('Room reader HTTP '+response.status);
 const source=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
 // round24: the host preserves and restores the complete initial address.
 try{return await(await import(url)).boot(api);}
 finally{URL.revokeObjectURL(url)}
})().catch(error=>{pending=null;throw error})}
