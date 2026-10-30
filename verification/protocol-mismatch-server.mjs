import express from 'express';
const app=express();app.get('/health',(_req,res)=>res.json({ok:true,protocol:16,build:'Compatibility test fixture'}));app.use(express.static('dist'));const server=app.listen(2617,'127.0.0.1',()=>console.log('Protocol mismatch fixture on 2617'));process.on('SIGTERM',()=>server.close());
