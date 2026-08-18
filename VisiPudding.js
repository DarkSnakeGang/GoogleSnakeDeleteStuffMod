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
  if (!window.__visiPatchedPuddingAlterV13 && window.PuddingMod && typeof window.PuddingMod.alterSnakeCode === 'function') {
    window.__visiOriginalPuddingAlterSnakeCode = window.PuddingMod.alterSnakeCode;
    window.PuddingMod.alterSnakeCode = function (code) {
      if (window.NepDebug) {
        console.log(code);
      }

      code = code.replaceAll(/\$\$/gm, 'doubleD');
      code = code.replaceAll(/\$\&/gm, '$ &');

      window.Libraries.forEach(function (LibName) {
        console.log("Alter code with library: " + LibName);
        try {
          eval("code = window." + LibName + ".alterCode(code);");
        } catch (e) {
          console.warn("Skipping broken Pudding library on this build:", LibName, e.message);
        }
      });

      console.log("Done, enjoy Pudding Mod!");
      if (window.NepDebug) {
        console.log(code);
      }
      return code;
    };
    window.__visiPatchedPuddingAlterV13 = true;
  }

  // Upstream Pudding's Counter.alterCode still assumes the older wall-spawn snippet exists.
  // On v13 that match disappears, so guard just that optional block before running Pudding.
  if (!window.__visiPatchedCounterV13 && window.Counter && typeof window.Counter.alterCode === 'function') {
    let counterSource = String(window.Counter.alterCode);
    if (counterSource.includes("wall_pos = code.match(wall_spawn_regex)[0].split('=')[0].split(' ')[1]")) {
      counterSource = counterSource.replace(
        /wall_pos = code\.match\(wall_spawn_regex\)\[0\]\.split\('='\)\[0\]\.split\(' '\)\[1\][\s\S]*?code = code\.assertReplace\(wall_spawn_regex, wall_counter_code\);/,
        `let wall_spawn_match = code.match(wall_spawn_regex);
    if (wall_spawn_match) {
        wall_pos = wall_spawn_match[0].split('=')[0].split(' ')[1]

        wall_counter_code = \`\${wall_spawn_match[0]}
    if(\${wall_pos}){stats.walls.game++;
    window.wallCoords.push([\${wall_pos}.x, \${wall_pos}.y]);
    updateCounterDisplay();}
    \`
        if (window.NepDebug) {
            console.log("Wall thing: " + wall_pos)
            console.log("Wall thing 2: " + wall_counter_code)
        }
        code = code.assertReplace(wall_spawn_regex, wall_counter_code);
    }`
      );
      eval("window.Counter.alterCode = " + counterSource);
    }
    window.__visiPatchedCounterV13 = true;
  }
  return window.VisibilityModCode.alterSnakeCode(window.PuddingMod.alterSnakeCode(code));
}


window.VisibilityMod.runCodeAfter = function() {

  let modIndicator = document.createElement('div');
  modIndicator.style='position:absolute;font-family:Arial,sans-serif;color:white;font-size:14px;padding-top:4px;padding-left:30px;user-select: none;';
  modIndicator.textContent = 'Visibility Mod';
  let canvasNode = document.getElementsByClassName('jNB0Ic')[0];
  document.getElementsByClassName('EjCLSb')[0].insertBefore(modIndicator, canvasNode);
};
