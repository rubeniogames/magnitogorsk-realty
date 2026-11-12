const enc=new TextEncoder();
async function hmac(key,data){const k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(data)));}
export async function verifyTelegramInitData(raw,botToken,now=Math.floor(Date.now()/1000)){
 if(typeof raw!=='string'||raw.length>8192||!botToken)return null;
 const p=new URLSearchParams(raw);const hash=p.get('hash');
 if(!hash||!/^[a-f0-9]{64}$/i.test(hash)||p.getAll('hash').length!==1)return null;
 const entries=[...p.entries()].filter(([key])=>key!=='hash');
 if(new Set(entries.map(([key])=>key)).size!==entries.length)return null;
 const date=Number(p.get('auth_date'));
 if(!Number.isInteger(date)||date>now+30||now-date>3600)return null;
 entries.sort(([a],[b])=>a<b?-1:a>b?1:0);
 const secret=await hmac(enc.encode('WebAppData'),botToken);
 const bytes=await hmac(secret,entries.map(([k,v])=>k+'='+v).join('\n'));
 const expected=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
 let diff=0;for(let i=0;i<64;i++)diff|=hash.toLowerCase().charCodeAt(i)^expected.charCodeAt(i);
 if(diff)return null;
 try{const user=JSON.parse(p.get('user'));if(!Number.isSafeInteger(user.id)||user.id<=0)return null;return {id:user.id,firstName:String(user.first_name||'').slice(0,100),username:user.username?String(user.username).slice(0,32):null};}catch{return null;}
}
