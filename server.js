const https=require('https'),http=require('http');
const PORT=process.env.PORT||10000;
const KEY=process.env.ANTHROPIC_API_KEY||'';
http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(200);res.end();return;}
  if(req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'Cook N Joy Proxy OK',ready:!!KEY}));return;}
  if(!KEY){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{message:'ANTHROPIC_API_KEY manquant'}}));return;}
  let b='';req.on('data',c=>b+=c);
  req.on('end',()=>{
    let p;try{p=JSON.parse(b);}catch(e){res.writeHead(400);res.end();return;}
    const pl=JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:Math.min(p.max_tokens||1200,4096),messages:p.messages||[]});
    const r=https.request({hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(pl),'x-api-key':KEY,'anthropic-version':'2023-06-01'}},(pr)=>{
      let d='';pr.on('data',c=>d+=c);pr.on('end',()=>{res.writeHead(pr.statusCode,{'Content-Type':'application/json'});res.end(d);});
    });
    r.on('error',e=>{res.writeHead(500);res.end(JSON.stringify({error:{message:e.message}}));});
    r.write(pl);r.end();
  });
}).listen(PORT,()=>console.log('Proxy OK port '+PORT));
