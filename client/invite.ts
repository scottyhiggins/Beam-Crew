/** Keep fallback outside live status text: room updates must not erase a shared link. */
export async function copyInvite(url:string, trigger:HTMLElement){
  let box=document.getElementById('inviteFallback');
  if(!box){
    box=document.createElement('section');box.id='inviteFallback';
    box.innerHTML='<p id="inviteMessage" role="status"></p><label>Invite link<input id="inviteUrl" readonly aria-label="Invite link"></label><button type="button" id="inviteDone">Done</button>';
    trigger.insertAdjacentElement('afterend',box);
    box.querySelector<HTMLButtonElement>('#inviteDone')!.onclick=()=>{box!.hidden=true;trigger.focus();};
  }
  const input=box.querySelector<HTMLInputElement>('#inviteUrl')!;input.value=url;box.hidden=false;
  try{
    await navigator.clipboard.writeText(url);
    box.querySelector('#inviteMessage')!.textContent='Invite copied! Send it to your crew.';
  }catch{
    box.querySelector('#inviteMessage')!.textContent='Copy is unavailable. Select and copy this link, or share the room code above. On a phone, press and hold the link.';
    input.focus();input.select();
  }
}
