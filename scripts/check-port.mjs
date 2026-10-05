import net from 'node:net';
const port=Number(process.argv[2]||2571);
const probe=net.createServer();
probe.once('error',error=>{
  console.error(`Beam Crew has NOT started: port ${port} is unavailable (${error.code}).`);
  console.error('Close the existing Beam Crew server window with Ctrl+C, then run Start-BeamCrew.cmd again.');
  console.error(`Opening http://localhost:${port} now would still connect to the already-running server.`);
  process.exitCode=1;
});
probe.listen(port,'0.0.0.0',()=>probe.close());
