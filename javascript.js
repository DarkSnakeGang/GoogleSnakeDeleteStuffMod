//Change to false when releasing - turns on console.log printing
let deleteModDebug = false;

let checkboxes = {
  checkboxStatuses: {leftEye:true,rightEye:true,body:true,snoot:true,lightTiles:true,darkTiles:true,eatAnimation:true,fruit:true,shadow:true,border:true,die:true,lumps:true,portals:true,flashSnake:false,allButShadow:true,keys:true,walls:true,sokobanBox:true,sokobanGoal:true},
};

let flashSnakeStatus = {flashCount:0, currentlyFlashingSnake:false, durationMillisecond:1000};

let dragHandler = {
  dragItem:null,
  dragContainer:null,
  dragObject:null,
  active:false,
  currentX:0,
  currentY:0,
  initialX:0,
  initialY:0,
  xOffset:0,
  yOffset:0,
  dragStart:(e) => {
    if (e.target === dragHandler.dragItem) {
      dragHandler.initialX = e.clientX - dragHandler.xOffset;
      dragHandler.initialY = e.clientY - dragHandler.yOffset;
      dragHandler.active = true;
    }
  },
  dragEnd:(e) => {
    dragHandler.initialX = dragHandler.currentX;
    dragHandler.initialY = dragHandler.currentY;
    dragHandler.active = false;
  },
  drag:(e) => {
    if (dragHandler.active) {
      
      //Enforce coordinates being within viewport
      let restrictedClientX = Math.max(Math.min(e.clientX,window.innerWidth - 5),5);
      let restrictedClientY = Math.max(Math.min(e.clientY,window.innerHeight - 5),5);

      e.preventDefault();
      dragHandler.currentX = restrictedClientX - dragHandler.initialX;
      dragHandler.currentY = restrictedClientY - dragHandler.initialY;
      dragHandler.xOffset = dragHandler.currentX;
      dragHandler.yOffset = dragHandler.currentY;

      dragHandler.setTranslate(dragHandler.currentX, dragHandler.currentY, dragHandler.dragObject);
    }
  },
  setTranslate:function(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  },
  initialiseDragHandler: function() {
    this.dragItem = document.getElementById('drag-handle');
    this.dragContainer = window;
    this.dragObject = document.getElementById('delete-stuff-draggable');

    //If it isn't fbx snake, then start at the left edge
    if(!/fbx\?fbx=snake_arcade/.test(document.location.href)) {
      this.dragObject.style.left = '5px';
    }

    this.dragContainer.addEventListener("mousedown", this.dragStart, false);
    this.dragContainer.addEventListener("mouseup", this.dragEnd, false);
    this.dragContainer.addEventListener("mousemove", this.drag, false);
  }
};

function setupEventListeners() {
  document.getElementById('delete-stuff-close').onclick = function() {
    document.getElementById('delete-stuff-popup').hidden = true;
  };

  document.addEventListener('keydown',function(event) {
    if(event.key == 'i') {
      document.getElementById('delete-stuff-popup').hidden = !document.getElementById('delete-stuff-popup').hidden;
    }
  });
  
  document.getElementById('left-eye').onchange = function() {
    checkboxes.checkboxStatuses.leftEye = this.checked;
  }

  document.getElementById('right-eye').onchange = function() {
    checkboxes.checkboxStatuses.rightEye = this.checked;
  }

  document.getElementById('snake-body').onchange = function() {
    checkboxes.checkboxStatuses.body = this.checked;
  }

  document.getElementById('snoot').onchange = function() {
    checkboxes.checkboxStatuses.snoot = this.checked;
  }

  document.getElementById('light-tiles').onchange = function() {
    checkboxes.checkboxStatuses.lightTiles = this.checked;
  }

  document.getElementById('dark-tiles').onchange = function() {
    checkboxes.checkboxStatuses.darkTiles = this.checked;
  }

  document.getElementById('eat-animation').onchange = function() {
    checkboxes.checkboxStatuses.eatAnimation = this.checked;
  }

  document.getElementById('tongue').onchange = function() {
    checkboxes.checkboxStatuses.tongue = this.checked;
  }
  document.getElementById('fruit').onchange = function() {
    checkboxes.checkboxStatuses.fruit = this.checked;
  }
  document.getElementById('shadow').onchange = function() {
    checkboxes.checkboxStatuses.shadow = this.checked;
  }
  document.getElementById('border').onchange = function() {
    checkboxes.checkboxStatuses.border = this.checked;
  }
  document.getElementById('die').onchange = function() {
    checkboxes.checkboxStatuses.die = this.checked;
  }
  document.getElementById('lumps').onchange = function() {
    checkboxes.checkboxStatuses.lumps = this.checked;
  }
  document.getElementById('portals').onchange = function() {
    checkboxes.checkboxStatuses.portals = this.checked;
  }
  document.getElementById('flash-snake').onchange = function() {
    checkboxes.checkboxStatuses.flashSnake = this.checked;
  }
  //Handle dropdown for controlling duration of snake flashes
  document.getElementById('flash-snake-timing').onchange = function() {
    flashSnakeStatus.durationMillisecond = this.value;
  }
  document.getElementById('all-but-shadow').onchange = function() {
    checkboxes.checkboxStatuses.allButShadow = this.checked;
  }
  document.getElementById('keys').onchange = function() {
    checkboxes.checkboxStatuses.keys = this.checked;
  }
  document.getElementById('walls').onchange = function() {
    checkboxes.checkboxStatuses.walls = this.checked;
  }
  document.getElementById('sokoban-box').onchange = function() {
    checkboxes.checkboxStatuses.sokobanBox = this.checked;
  }
  document.getElementById('sokoban-goal').onchange = function() {
    checkboxes.checkboxStatuses.sokobanGoal = this.checked;
  }
  document.getElementById('spin').onchange = spinHandler;
}

function injectInitialHtml() {
  let initialHtml = 
  `<div id="delete-stuff-popup" style="margin:0px;position:fixed;z-index:9001;width:100%;">
  <div id="delete-stuff-draggable" style="width:320px;background-color:khaki;z-index:9002;border-color:saddlebrown;border-style:solid;border-width:4px; border-radius:10px;box-shadow: 0 3px 10px rgba(0,0,0,0.4);position:fixed;left:600px;top:5px">
    <div id="drag-handle" style="width:22px;height:22px;background-color: #fff5d4;position:absolute;border-top-left-radius:4px;border-bottom-right-radius:18px;border-right:3px solid saddlebrown;border-bottom:3px solid saddlebrown;cursor:move"></div>
    <div style="padding:10px;width:300px;margin:0;">
      <div style="text-align:center;padding:5px;background-color:darkkhaki;color:black;font-family:impact;font-size:20px">Delete Stuff Mod</div>
      <div style="background-color:darkkhaki;margin-top:5px;padding:0px;padding-bottom:10px;font-family:impact;color:saddlebrown">
        <!--Begin test area-->
        <!--Snake body Section-->
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:left">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="left-eye" type="checkbox" checked>Left Eye</label>
            </li>
            <li>
              <label><input id="right-eye" type="checkbox" checked>Right Eye</label>
            </li>
            <li>
              <label><input id="snoot" type="checkbox" checked>Snoot</label>
            </li>
            <li>
              <label><input id="snake-body" type="checkbox" checked>Body</label>
            </li>
            <li>
              <label><input id="lumps" type="checkbox" checked>Lumps</label>
            </li>
          </ul>
        </div>
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:right;">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="eat-animation" type="checkbox" checked>Eat Anim.</label>
            </li>
            <li>
              <label><input id="tongue" type="checkbox" checked>Tongue</label>
            </li>
            <li>
              <label><input id="die" type="checkbox" checked>Die Anim.</label>
            </li>
            <li>
              <label><input id="shadow" type="checkbox" checked>Shadow</label>
            </li>
            <li>
              <label><input id="all-but-shadow" type="checkbox" checked>Not Shadow</label>
            </li>
          </ul>
        </div>
        <hr style="clear:both;width:90%;margin-bottom:0">
        <!--Background Section-->
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:left">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="light-tiles" type="checkbox" checked>Light Tiles</label>
            </li>
            <li>
              <label><input id="dark-tiles" type="checkbox" checked>Dark Tiles</label>
            </li>
          </ul>
        </div>
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:right;">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="border" type="checkbox" checked>Border</label>
            </li>
            <li style="display:none">
              <label><input id="spin" type="checkbox">???</label>
            </li>
          </ul>
        </div>
        <hr style="clear:both;width:90%;margin-bottom:0">
        <!--Fruits Section-->
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:left">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="fruit" type="checkbox" checked>Fruit</label>
            </li>
            <li>
              <label><input id="portals" type="checkbox" checked>Portals</label>
            </li>
            <li>
              <label><input id="keys" type="checkbox" checked>Keys</label>
            </li>
          </ul>
        </div>
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:right;">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="walls" type="checkbox" checked>Walls/Locks</label>
            </li>
            <li>
              <label><input id="sokoban-box" type="checkbox" checked>Sokoban box</label>
            </li>
            <li>
              <label><input id="sokoban-goal" type="checkbox" checked>Sokoban goal</label>
            </li>
          </ul>
        </div>
        <hr style="clear:both;width:90%;margin-bottom:0">
        <!--Flash Section-->
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:left">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li>
              <label><input id="flash-snake" type="checkbox">Flash on eat</label>
            </li>  
          </ul>
        </div>
        <div style="box-sizing: border-box;padding:5px;margin: 0px;width: 50%;display:inline-block;float:right;">
          <ul style="list-style-type: none;padding:5px;margin-top:0;margin-bottom:0">
            <li><select id="flash-snake-timing">
              <option value="20">0.05s</option>
              <option value="200">0.2s</option>
              <option value="500">0.5s</option>
              <option value="1000" selected="">1s</option>
              <option value="2000">2s</option>
              <option value="3000">3s</option>
            </select> Flash time
            </li>
          </ul>
        </div>
        <!--End test area-->
        <div style="text-align:center; clear:both"><a id="delete-stuff-close" href="#">Close</a> (Press i to show again)</div>
      </div>

    </div>

  </div>
</div>
<template id="tooltiptemplate">
  <div style="position:relative;display:inline-block;color: #c44a4a;float:right;background-color: #f7f6d9;border-radius:50%;width:1em;height:1em;text-align:center;font-family:calibri;font-weight:bold;line-height:1em;" class="tooltip">
  ?
  <div style="position:absolute;top:0;left:120%;background-color:black;color:white;border-radius:0.5em;padding:0.5em;font-weight:normal;box-shadow:0 3px 10px rgba(0,0,0,0.4);width:110px;z-index:9003;visibility:hidden;opacity:0;transition: opacity 0.8s;" class="tooltiptext">
  </div>
  </div>
</template>`;

  let intialElement = document.createElement('div');
  intialElement.style.backgroundColor = 'transparent';
  intialElement.style.position = 'fixed';
  intialElement.style.zIndex = '9001';
  intialElement.innerHTML = initialHtml;

  document.getElementsByTagName('body')[0].prepend(intialElement);
};

function setupCss() {
  let customStyle  = document.createElement('style');
  customStyle.type = 'text/css';
  customStyle.innerHTML = `.tooltip:hover .tooltiptext:not(:hover){visibility:visible!important;opacity:1!important;}
  #drag-handle:hover{background-color:#f2e4b8!important;}
  #delete-stuff-popup label,#delete-stuff-popup div{user-select:none;}
  
  :root {--rotation-period: 30s;}
  .cer0Bd[data-spin='true']{animation: spin var(--rotation-period) linear infinite;}
  .cer0Bd[data-spin='x']{animation: spinx var(--rotation-period) linear infinite;} 
  @keyframes spin { 100% { transform:rotate(360deg); } }
  @keyframes spinx { 100% { transform:rotateX(360deg); } }
  `;
  document.getElementsByTagName('head')[0].appendChild(customStyle);
}

function addTooltip(id, helpText) {
  let tooltipTemplate = document.getElementById('tooltiptemplate').content;
  let tooltipToInsert = tooltipTemplate.cloneNode(true);
  tooltipToInsert.querySelector('.tooltiptext').textContent = helpText;
  document.getElementById(id).parentElement.parentElement.appendChild(tooltipToInsert);
}

function loadTooltips() {
  let tooltipText = {
    'left-eye': "Left eye of snake. Looks towards the nearest fruit.",
    'right-eye': "Right eye of snake. Looks towards the nearest fruit.",
    'snoot': "Nose of snake.",
    'snake-body': "The lines and curves that make up the snake's body.",
    'lumps': "The swallowed fruit that pass through the snake.",
    'eat-animation': "The snake's mouth when eating. Also the snake's nostrils.",
    'tongue': "Animation when the snake sticks out it's tongue.",
    'die': "Animation when the snake dies. Also used in sokoban mode.",
    'shadow': "Used to hide the shadow for the snake and fruit. Hiding parts of the snake also hides the corresponding bit of shadow. The shadow's default colour is dark green.",
    'all-but-shadow': "Used if you want to only show the shadow for the snake/fruit.",
    'light-tiles': "The light tiles used for the background. You may need to restart (press esc and then play) for this to take effect. This is actually just a big rectangle that the dark tiles get drawn on top of. Has a glitchy visual effect when removed.",
    'dark-tiles': "The dark tiles used for the background. You may need to restart (press esc and then play) for this to take effect. These are individually drawn squares that get drawn on top of the light tile background.",
    'border': "The dark green border wall. You may need to restart (press esc and then play) for this to take effect. This is one big rectangle that gets drawn behind the light and dark tiles. Has a glitchy visual effect when removed in infinity mode.",
    'fruit': "The fruit.",
    'portals': "The portals that can be found in portal mode.",
    'keys': "The keys that can be found in key mode.",
    'walls': "The walls that can be found in wall mode, and also the locks that can be found in key mode.",
    'sokoban-box': "The box that can be found in the mode where you push around a box into a goal.",
    'sokoban-goal': "The goal that can be found in the mode where you push around a box into a goal.",
    'flash-snake': "When this setting is turned on, the snake will briefly show whenever a fruit is eaten. The amount of time it shows for is controlled by the Flash Time setting. This only has a noticable effect if parts of the snake are hidden to begin with.",
  };

  for(let inputElementId in tooltipText) {
    addTooltip(inputElementId, tooltipText[inputElementId]);
  }
}

function brieflyShowSnake() {
  if(flashSnakeStatus.flashCount < 0) {
    throw new Error('Error with flashing snake');
  }
  flashSnakeStatus.flashCount++;
  flashSnakeStatus.currentlyFlashingSnake = true;

  //Clear flashed snake after a duration
  setTimeout(
    function() {
      flashSnakeStatus.flashCount--;if(flashSnakeStatus.flashCount === 0) {flashSnakeStatus.currentlyFlashingSnake = false;}
    },
    flashSnakeStatus.durationMillisecond
  );
}

function spinHandler() {
  let canvasElement = document.getElementsByClassName('cer0Bd')[0];
  if(!this.checked) {
    canvasElement.dataset.spin = 'false';
  } else {
    let r = document.querySelector(':root');
    let promptResponse = prompt('How many seconds should a spin take? Enter a number','30');
    promptResponse = parseFloat(promptResponse);
    if(isNaN(promptResponse) || promptResponse <= 0) {
      alert('Invalid value entered. Defaulting to 30');
      r.style.setProperty('--rotation-period', '30s');
    } else {
      alert(`Spinning every ${promptResponse} seconds.`);
      r.style.setProperty('--rotation-period', promptResponse + 's');
    }
    let spinAroundZ = confirm('Spin around z axis?');//Spin around x or z axis.
    canvasElement.dataset.spin = spinAroundZ ? 'true' : 'x';
  }
}

window.snake.deleteStuffMod = function(){
  injectInitialHtml();
  setupCss();
  loadTooltips();
  setupEventListeners();
  dragHandler.initialiseDragHandler();
  const scripts = document.body.getElementsByTagName('script');
  for(let script of scripts) {
    if(script.src == "" || script.src.indexOf('apis.google.com') != -1){
      continue;
    }
    const req = new XMLHttpRequest();
    req.open('GET', script.src);
    req.onload = function() {
      if(this.responseText.indexOf('trophy') !== -1)
        processCode(this.responseText);
    };
    req.send();
  }
  
};

function processCode(code) {
  //Function for body parts
let rightEyeRegex = /\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\),/;

  let funcWithBodyParts = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\(a,b,c,d,e\)$/,
  rightEyeRegex, 
  deleteModDebug);

  funcWithBodyParts = assertReplace(funcWithBodyParts, rightEyeRegex,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.rightEye) && $&');

  funcWithBodyParts = assertReplace(funcWithBodyParts,/\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\([$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_]{0,6}\)\);/,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.leftEye) && $&');

  funcWithBodyParts = assertReplace(funcWithBodyParts,/\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\(Math\.floor\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\),[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\);/,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.eatAnimation) && $&');

  funcWithBodyParts = assertReplace(funcWithBodyParts,/\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)\)}/,
  'checkboxes.checkboxStatuses.tongue && $&');

  funcWithBodyParts = assertReplace(funcWithBodyParts,/\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6}\),/,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.die) && $&');

  funcWithBodyParts = assertReplace(funcWithBodyParts,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fill\(\)\);/,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.snoot) && $&');

  eval(funcWithBodyParts);

  //Function for fruit
  let fruitRegex = /[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6},0,0,128,128,[$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)/;

  let funcWithFruit = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}\.prototype\.render=function\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)$/,
  fruitRegex, 
  deleteModDebug);

  //Fruit
  funcWithFruit = assertReplace(funcWithFruit,fruitRegex,
  'checkboxes.checkboxStatuses.fruit && $&');
  
  //Poison mode fruit disappearing animation
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.drawImage\(this\.[$a-zA-Z0-9_]{0,6}\[[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\]\.[$a-zA-Z0-9_]{0,6}\.canvas,0,0,128,128,-\(this\.[$a-zA-Z0-9_]{0,6}\/2\)\*[$a-zA-Z0-9_]{0,6},-\(this\.[$a-zA-Z0-9_]{0,6}\/2\)\*\n?[$a-zA-Z0-9_]{0,6},this\.[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6},this\.[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6}\)/,
    'checkboxes.checkboxStatuses.fruit && $&');

  //Background for infinity is also contained in funcWithFruit
  //For outer wall
  funcWithFruit = assertReplace(funcWithFruit,/this\.context\.fillRect\(0,0,this\.context\.canvas\.width,this\.context\.canvas\.height\);/,
  'checkboxes.checkboxStatuses.border && $&');

  //For light tiles (infinity)
  funcWithFruit = assertReplace(funcWithFruit,/(?<="#AAD751";)this\.context\.fillRect\(0,0,this\.context\.canvas\.width,this\.context\.canvas\.height\);/,
  'checkboxes.checkboxStatuses.lightTiles && $&');
  
  //For dark tiles (infinity)
  funcWithFruit = assertReplace(funcWithFruit,/this\.context\.fillRect\([$a-zA-Z0-9_]{0,6}\*this\.[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6}\.x\+[$a-zA-Z0-9_]{0,6}\.x,[$a-zA-Z0-9_]{0,6}\*this\.[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6}\.y\+[$a-zA-Z0-9_]{0,6}\.y,this\.[$a-zA-Z0-9_]{0,6},this\.[$a-zA-Z0-9_]{0,6}\);/,
  'checkboxes.checkboxStatuses.darkTiles && $&');

  //Also has a canvas that we can delete to hide all but shadow
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.drawImage\(this\.[$a-zA-Z0-9_]{0,6}\.canvas,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\);if/,
  'checkboxes.checkboxStatuses.allButShadow && $&');

  //all but shadow, but only for infinity
  funcWithFruit = assertReplace(funcWithFruit,/this\.context\.drawImage\(this\.[$a-zA-Z0-9_]{0,6}\.canvas,\n?[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6}\)}else/,
  'checkboxes.checkboxStatuses.allButShadow && $&');

  //for walls/locks
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.fillRect\([$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\),/,
  'checkboxes.checkboxStatuses.walls && $&');

  //background for falling lock piece
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.fillRect\(-\(this\.[$a-zA-Z0-9_]{0,6}\/2\)\*[$a-zA-Z0-9_]{0,6},-\(this\.[$a-zA-Z0-9_]{0,6}\/2\)\*[$a-zA-Z0-9_]{0,6},this\.[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6},this\.[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6}\)\),/,
  'checkboxes.checkboxStatuses.walls && $&');

  //lock icon
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6}\(this\.[$a-zA-Z0-9_]{0,6}\),128\*[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6},0,128,128,[$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)\);/,
  'checkboxes.checkboxStatuses.walls && $&');

  //lock icon and sokoban icon falling
  funcWithFruit = assertReplace(funcWithFruit,/(drawImage\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\?)([$a-zA-Z0-9_]{0,6}\(this\.[$a-zA-Z0-9_]{0,6}\)):([$a-zA-Z0-9_]{0,6}\(this\.[$a-zA-Z0-9_]{0,6}\))/,
  '$1 (checkboxes.checkboxStatuses.walls ? $2 : new Image()) : (checkboxes.checkboxStatuses.sokobanBox ? $3 : new Image())');

  //keys
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6}\(this\.[$a-zA-Z0-9_]{0,6}\),128\*[$a-zA-Z0-9_]{0,6}\.type,0,128,128,[$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\),/,
  'checkboxes.checkboxStatuses.keys && $&');

  //keys upside down
  funcWithFruit = assertReplace(funcWithFruit,/this\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6}\(this\.[$a-zA-Z0-9_]{0,6}\),128\*[$a-zA-Z0-9_]{0,6}\.type,0,128,128,-\([$a-zA-Z0-9_]{0,6}\/2\),-\([$a-zA-Z0-9_]{0,6}\/2\),[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\),/,
  'checkboxes.checkboxStatuses.keys && $&');
  
  eval(funcWithFruit);

  //Sokoban box
  let funcWithSokoban = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)$/,
  /[$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6},7\)&&![$a-zA-Z0-9_]{0,6}&&\([$a-zA-Z0-9_]{0,6}=new [$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.width\*[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6}\.x,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.height\*[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}-[$a-zA-Z0-9_]{0,6}\.y\),/,
  deleteModDebug);

  //Sokoban
  funcWithSokoban = assertReplace(funcWithSokoban,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\),128,0,128,\n?128,[$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)/,
  'checkboxes.checkboxStatuses.sokobanBox && $&');

  //Sokoban
  funcWithSokoban = assertReplace(funcWithSokoban,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\),0,0,128,128,[$a-zA-Z0-9_]{0,6}\.x-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6}\.y-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_]{0,6}\)/,
  'checkboxes.checkboxStatuses.sokobanBox && $&');

  eval(funcWithSokoban);

  //Sokoban goal func
  let funcWithSokobanGoal = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\([$a-zA-Z0-9_]{0,6}\)$/,
  /[$a-zA-Z0-9_]{0,6}=2\+\([$a-zA-Z0-9_]{0,6}\.x\+[$a-zA-Z0-9_]{0,6}\.y\)%2\+\(2===a\.[$a-zA-Z0-9_]{0,6}\?2:0\);/,
  deleteModDebug);

  //Sokoban goal
  funcWithSokobanGoal = assertReplaceAll(funcWithSokobanGoal,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.drawImage/g,
  'checkboxes.checkboxStatuses.sokobanGoal && $&');

  eval(funcWithSokobanGoal);

  //Shadow
  let funcWithShadow = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\([$a-zA-Z0-9_]{0,6}\)$/,/destination-atop/,deleteModDebug);
  
  funcWithShadow = assertReplace(funcWithShadow,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.globalCompositeOperation="destination-atop";/,'if(!checkboxes.checkboxStatuses.shadow){return}$&')
  
  eval(funcWithShadow);

  //Normal background (i.e not on infinity)

  let funcWithBackground = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}\.prototype\.[$a-zA-Z0-9_]{0,6}=function\(\)$/,
    /[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillStyle="#AAD751";[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillRect\(0,0,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.width,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.height\);/,
    deleteModDebug);

  funcWithBackground = assertReplace(funcWithBackground,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillRect\(0,0,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.width,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.height\);/,
  'if(checkboxes.checkboxStatuses.lightTiles){$&}');

  funcWithBackground = assertReplace(funcWithBackground,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillRect\([$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\*[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)/,
  'checkboxes.checkboxStatuses.darkTiles && $&');

  eval(funcWithBackground);

  let funcWithBodyLines = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\(a,b,c\)$/,
  /quadraticCurveTo/,
  deleteModDebug);

  funcWithBodyLines = assertReplace(funcWithBodyLines,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fill\(\);/,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.lumps) && $&');

  funcWithBodyLines = assertReplaceAll(funcWithBodyLines,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.lineTo\([$a-zA-Z0-9_]{0,6}\.x,[$a-zA-Z0-9_]{0,6}\.y\)/g,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.body) && $&');

  funcWithBodyLines = assertReplaceAll(funcWithBodyLines,/[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.quadraticCurveTo\([$a-zA-Z0-9_]{0,6}\.x,[$a-zA-Z0-9_]{0,6}\.y,[$a-zA-Z0-9_]{0,6}\.x,[$a-zA-Z0-9_]{0,6}\.y\)\)/g,
  '(flashSnakeStatus.currentlyFlashingSnake || checkboxes.checkboxStatuses.body) && $&');

  eval(funcWithBodyLines);

  //Portals
  let funcWithPortals = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}=function\(a,b,\n?c\)$/,
  /[$a-zA-Z0-9_]{0,6}=new [$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\*Math\.cos\(2\*[$a-zA-Z0-9_]{0,6}\*Math\.PI\),[$a-zA-Z0-9_]{0,6}\*Math\.sin\(2\*[$a-zA-Z0-9_]{0,6}\*Math\.PI\)\);/,
  deleteModDebug);

  funcWithPortals = assertReplaceAll(funcWithPortals,/[$a-zA-Z0-9_]{0,6}\.fill\(\)/g,
  'checkboxes.checkboxStatuses.portals && $&');

  eval(funcWithPortals);

  //For flashing snake body when we eat an apple
  let funcWithEat = findFunctionInCode(code, /[$a-zA-Z0-9_]{0,6}\.prototype\.update=function\(\)$/,
  /if\([$a-zA-Z0-9_]{0,6}\|\|[$a-zA-Z0-9_]{0,6}\){[$a-zA-Z0-9_]{0,6}=[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6};[$a-zA-Z0-9_]{0,6}\|\|\([$a-zA-Z0-9_]{0,6}=!0,[$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.play\(\)/,
  deleteModDebug);

  funcWithEat = assertReplace(funcWithEat,/if\([$a-zA-Z0-9_]{0,6}\|\|[$a-zA-Z0-9_]{0,6}\){/,
  '$& checkboxes.checkboxStatuses.flashSnake && brieflyShowSnake();');

  eval(funcWithEat);
}

/*
This function will search for a function/method in some code and return this function as a string

code will usually be the snake source code

functionSignature will be regex matching the beginning of the function/method (must end in $),
for example if we are trying to find a function like s_xD = function(a, b, c, d, e) {......}
then put functionSignature = /[$a-zA-Z0-9_]{0,6}=function\(a,b,c,d,e\)$/

somethingInsideFunction will be regex matching something in the function
for example if we are trying to find a function like s_xD = function(a, b, c, d, e) {...a.Xa&&10!==a.Qb...}
then put somethingInsideFunction = /a\.[$a-zA-Z0-9_]{0,6}&&10!==a\.[$a-zA-Z0-9_]{0,6}/

levelsToGoUp tells us how many "layers" of curly brackets we need to go up before we get to our function

*/
function findFunctionInCode(code, functionSignature, somethingInsideFunction, logging = false) {
  /*Check functionSignature ends in $*/
  if(functionSignature.toString()[functionSignature.toString().length-2] !== "$") {
    throw new Error("functionSignature regex should end in $");
  }

  /*get the position of somethingInsideFunction*/
  let indexWithinFunction = code.search(somethingInsideFunction);
  if(indexWithinFunction == -1) {
    throw new Error("couldn't find a match for somethingInsideFunction");
  }

  /*expand outwards from somethingInsideFunction until we get to the function signature, then count brackets
  to find the end of the function*/
  startIndex = 0;
  for(let i = indexWithinFunction; i >= 0; i--) {
    let startOfCode = code.substring(0,i);
    startIndex = startOfCode.search(functionSignature);
    if(startIndex !== -1) {
      break;
    }
    if(i == 0) {
      throw new Error("Couldn't find function signature");
    }
  }

  let bracketCount = 0;
  let foundFirstBracket = false;
  let endIndex = 0;
  /*Use bracket counting to find the whole function*/
  let codeLength = code.length;
  for(let i = startIndex; i<=codeLength; i++){
    if(!foundFirstBracket && code[i] == "{") {
      foundFirstBracket = true;
    }

    if(code[i] == "{") {
      bracketCount++;
    }
    if(code[i] == "}") {
      bracketCount--;
    }
    if(foundFirstBracket && bracketCount == 0) {
      endIndex = i;
      break;
    }

    if(i == codeLength) {
      throw new Error("Couldn't pair up brackets");
    }
  }
  
  let fullFunction = code.substring(startIndex,endIndex + 1);

  /*throw error if fullFunction doesn't contain something inside function - i.e. function signature was wrong*/
  if(fullFunction.search(somethingInsideFunction) === -1) {
    throw new Error("Function signature does not belong to the same function as somethingInsideFunction");
  }

  if(logging) {
    console.log(fullFunction);
  }

  return fullFunction;
}

/*
Same as replace, but throws an error if nothing is changed
*/
function assertReplace(baseText, regex, replacement) {
  if(typeof baseText !== 'string') {
    throw new Error('String argument expected for assertReplace');
  }
  let outputText = baseText.replace(regex, replacement);

  if(baseText === outputText) {
    throw new Error('Failed to make any changes with replace');
  }

  return outputText;
}

/*
Same as replaceAll, but throws an error if nothing is changed
*/
function assertReplaceAll(baseText, regex, replacement) {
  if(typeof baseText !== 'string') {
    throw new Error('String argument expected for assertReplace');
  }
  let outputText = baseText.replaceAll(regex, replacement);

  if(baseText === outputText) {
    throw new Error('Failed to make any changes with replace');
  }

  return outputText;
}

snake.deleteStuffMod();