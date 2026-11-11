// Build replaces this value with local assets. No credentials belong in this file.
const ASSETS = /* EMBED_ASSETS */ {};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const secureEqual=(a,b)=>{if(!a||!b||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;};
const securityHeaders={'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()','content-security-policy':"default-src 'self'; script-src 'self' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"};
export default {
 async fetch(request,env={}){
  const url=new URL(request.url);
  if(url.pathname==='/api/health')return json({ok:true,stage:'prototype',registration:false,publishing:false});
  if(url.pathname==='/api/listings'&&request.method==='POST')return json({error:'registration_required',message:'Размещение пока недоступно. Нужны регистрация и модерация.'},401);
  if(url.pathname==='/api/register')return json({error:'not_available_yet',message:'Регистрация появится на следующем этапе.'},503);
  if(url.pathname==='/telegram/webhook'){
   if(request.method!=='POST')return json({error:'method_not_allowed'},405);
   if(!secureEqual(request.headers.get('X-Telegram-Bot-Api-Secret-Token'),env.WEBHOOK_SECRET))return json({error:'unauthorized'},401);
   const raw=await request.text();if(raw.length>32768)return json({error:'too_large'},413);
   let update;try{update=JSON.parse(raw);}catch{return json({error:'invalid_json'},400);}
   const message=update.message;
   if(message?.chat?.type!=='private'||!/^\/start(?:@\w+)?(?:\s|$)/.test(message?.text||''))return json({ok:true});
   if(!env.APP_URL?.startsWith('https://'))return json({error:'not_configured'},503);
   // Telegram executes a Bot API method returned in a webhook response.
   // The deployed app does not need the bot token.
   return json({method:'sendMessage',chat_id:message.chat.id,text:'Недвижимость Магнитогорска и окрестностей.\n\nОткройте каталог: карта, дома, участки и квартиры. Сейчас доступен прототип с демонстрационными объявлениями.',reply_markup:{inline_keyboard:[[{text:'Открыть каталог',web_app:{url:env.APP_URL}}]]}});
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'method_not_allowed'},405);
  const asset=ASSETS[url.pathname==='/'?'/index.html':url.pathname];
  if(!asset)return new Response('Not found',{status:404,headers:securityHeaders});
  const content=asset.binary?Uint8Array.from(atob(asset.content),char=>char.charCodeAt(0)):asset.content;
  return new Response(request.method==='HEAD'?null:content,{headers:{...securityHeaders,'content-type':asset.type,'cache-control':url.pathname==='/'||url.pathname==='/index.html'?'no-cache':'public, max-age=3600'}});
 }
};
