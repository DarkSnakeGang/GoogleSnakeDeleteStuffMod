window.VisibilityMod = {};

////////////////////////////////////////////////////////////////////
//RUNCODEBEFORE
////////////////////////////////////////////////////////////////////

window.VisibilityMod.runCodeBefore = function() {
    
    window.PuddingMod.runCodeBefore();
    window.VisibilityModCode.runCodeBefore();

}

////////////////////////////////////////////////////////////////////
//ALTERSNAKECODE
////////////////////////////////////////////////////////////////////

window.VisibilityMod.alterSnakeCode = function(code) {
  return window.VisibilityModCode.alterSnakeCode(window.PuddingMod.alterSnakeCode(code));;
}


window.VisibilityMod.runCodeAfter = function() {

  let modIndicator = document.createElement('div');
  modIndicator.style='position:absolute;font-family:roboto;color:white;font-size:14px;padding-top:4px;padding-left:30px;user-select: none;';
  modIndicator.textContent = 'Visibility Mod';
  let canvasNode = document.getElementsByClassName('jNB0Ic')[0];
  document.getElementsByClassName('EjCLSb')[0].insertBefore(modIndicator, canvasNode);
};
