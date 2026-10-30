interface ActionButton {textContent:string|null;disabled:boolean;hidden:boolean;classList:{remove(...tokens:string[]):void};}
export function resetBeamActionControls(enabled:boolean,grab:ActionButton,action:ActionButton){
 grab.textContent='GRAB · Space';action.textContent='ACTION';
 for(const button of [grab,action]){button.disabled=!enabled;button.hidden=!enabled;button.classList.remove('attached');}
}
