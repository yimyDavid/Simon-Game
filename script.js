/* This function object helps to display on the screen the scores
 * and if there is a winner
 */
function UI(){
  
  this.displaySequenceCount = function(score){
    var formatScore = score;
    if(typeof score === "number" && score < 10)
      formatScore = "0" + score
  
    $('.score p').text(formatScore);    
  } 
  
  //ANNOUNCES THE WINNER AND RESETS EVERYTHING
  this.winner = function(){
    myGame.resetSequence();
    maxScore = 0;
    removeButtonEvents();
    
    $('.score p').text(":-)");
    $('#win')[0].play();
    $('#applause')[0].play();
    setTimeout(function(){
      $('.button').click();
    },3000);
  }
}

myUI = new UI();
myUI.displaySequenceCount(00);

/* Game contains functions to control the different behaviors of the 
 * game.
*/
var maxScore = 0;           //Used to display the elements in the sequence.
var timeWaitInterval = 0;   //Decided to use a global time elapse controller 
var matchPushCounter = 0;   //Sequence counter as button are pressed
var timeOut = 0;            //To stop the activation of button events           
function Game(){
  var sequence = [];
  
  this.strict = false;      
  this.on = false;
 
  this.addElement = function(){
    var value = Math.floor(Math.random() * 4) + 1;
    sequence.push(value);
  };
  
  this.getSequence = function(){
    return sequence;
  };
  
  this.resetSequence = function(){
    sequence = [];
  }
  
  this.playSequence = function(sequence){
    var len = myGame.getSequence();
    myUI.displaySequenceCount(maxScore)
    removeButtonEvents();
    
    //Wait until all the sequence has been played, then add
    //the button events. 
    //Perhaps it was not necessary but just in case any of the button are pressed
    //accidently.
    timeOut = setTimeout(function(){
        addButtonEvents();
      },len.length * 700);
    
    //Loop to play the sequence
    for (i = 0; i < sequence.length; i++) {
    // create a closure to preserve the value of "i"
      (function(i){
        var currentButton = $('#' + sequence[i]).parent().attr('class').split(' ')[0];
        window.setTimeout(function(){
          //If the game is switch to OFF, stop everything as soon as posible.
          if(myGame.on === false){
            removeButtonEvents();
            myGame.clearTimeWait();
            return;
          }
          
          $('.' + currentButton).addClass('led' + currentButton).removeClass('off' + currentButton);
       
          $('#' + sequence[i])[0].play();
          window.setTimeout(function(){
           $('.' + currentButton).addClass('off' +  currentButton).removeClass('led' + currentButton);
          }, 700);
        }, i * 1000);
      }(i));
    }
  }; /* end playsequence */

  this.setTimeWait = function(){
    var baseTime = 2000;
    //The time interval needs to increase as the sequence increases. This is necessary
    //to let the sequence repeat and still give the player enought time to respond before
    //the buzz error.
    timeWaitInterval = setInterval(this.errorSound, baseTime * (sequence.length+1));
  };
  
  this.errorSound = function(){
    //play sound of bad sequence or no response
   $('#error')[0].play();
   //display exclamation marks on score box
   myGame.clearTimeWait();
   myUI.displaySequenceCount("!!");
    
    if(myGame.strict === true){
        myGame.resetSequence();
        maxScore = 0;
        myGame.addElement();
        maxScore++;
    }
   
    //count call the function directly. It has to be on a timer
    setTimeout(function(){
      myGame.playSequence(sequence);
    }, 2000);
    myGame.setTimeWait();
 };
  
 
  this.clearTimeWait = function(){
    clearInterval(timeWaitInterval);
  }
 
} /* End game object*/




/* Instantiate game methods */
var myGame = new Game();

function gameState(){
  var WINSCORE = 20;
  
  this.turn = function(){ 
    
    if(matchPushCounter+1 === WINSCORE){
      myUI.winner();
    }else{
      maxScore++;
      
      myGame.addElement();
      myGame.playSequence(myGame.getSequence());
      myGame.setTimeWait();
    }
    
  }
}

var pcGame = new gameState();

/* Literal Notation Object. Player interaction */
//

var player = {
  sequence: [],
  pushButton: function(buttonPushed){
    
    if(typeof buttonPushed !== "undefined"){
      myGame.clearTimeWait();  //clear the interval set before
    //check if the next button in the sequence is right
     // console.log(this.sequence[matchPushCounter] + " " + buttonPushed + " m " + matchPushCounter);
      if(Number.parseInt(buttonPushed) === this.sequence[matchPushCounter]){  
        if(matchPushCounter === this.sequence.length-1){
          
          setTimeout(function(){
            pcGame.turn();
            matchPushCounter = 0;
            
          }, 1000);
            
        }else{                          
        // advance a position;       
          matchPushCounter++;
        //maxScore++;
          myGame.setTimeWait();
        }
      
      }else{ 
          myGame.errorSound();
          //pcGame.turn();
          matchPushCounter = 0;
          clearTimeout(timeOut);
      }
    }
    
  },
  
  correctSequence: function(){
    
  }
}

/*   ======= Event handlers =======   */

function getTarget(e){
  if(!e){
    e = window.event;
  } 
  
  return e.target || e.srcElement;
}


function changeColor(e){
  var target;
 
  target = getTarget(e);
  
  if($(target).hasClass('green')){
    
     $(target).removeClass('offgreen').addClass('ledgreen');
  }else if($(target).hasClass('red')){
    
     $(target).removeClass('offred').addClass('ledred');
  }else if($(target).hasClass('yellow')){
     $(target).removeClass('offyellow').addClass('ledyellow');
  }else if($(target).hasClass('blue')){
    $(target).removeClass('offblue').addClass('ledblue');
  }
}


function changeColorOut(e){
  var target;
 
  target = getTarget(e);
  
  if($(target).hasClass('green')){
    
     $(target).addClass('offgreen').removeClass('ledgreen');
  }else if($(target).hasClass('red')){
    
      $(target).addClass('offred').removeClass('ledred');
  }else if($(target).hasClass('yellow')){
      $(target).addClass('offyellow').removeClass('ledyellow');
  }else if($(target).hasClass('blue')){
     $(target).addClass('offblue').removeClass('ledblue');
  }
}
function playSound(e){
  var target, elChild;
  target = getTarget(e);
  
  // get all the nodes declared. childNodes: get all the nodes, including 'text's
  elChild = target.children;
  var buttonTouched = $(elChild[0]).attr('id');
  player.sequence = myGame.getSequence();
  player.pushButton(buttonTouched);
  
  if(typeof elChild[0] !== "undefined"){
    if(elChild[0].paused)
      elChild[0].play();
    else
      elChild[0].currentTime = 0;
    
  }
  
  // Prevent the link from taking you elsewhere
  if(e.preventDefault){
    e.preventDefault();
  }else{
    e.returnValue = false;
  }
}

var el = document.getElementById('squares');

function removeButtonEvents(){//PONER TODO LOS EVENT EN OTRA FUNCTION PARA REMOVERLOS
   if(el.removeEventListener){
      el.removeEventListener('mousedown', colorAndSoundEvents, false);

      el.removeEventListener('mouseup', restoreColorButton, false);

    }else{
      el.detachEvent('onmousedown', colorAndSoundEvents);

      el.detachEvent('onmouseup', restoreColorButton);
    }
}

//Functions used for some events and most importantly to be able
//to remove them all at once. These where use to disable the button
//when the computer was re/playing the sequence.
function colorAndSoundEvents(e){
        changeColor(e);
        playSound(e);
};

function restoreColorButton(e){
        changeColorOut(e);   
      };


function addButtonEvents(){
  //Add events
    if(el.addEventListener){
      el.addEventListener('mousedown', colorAndSoundEvents,false);
      el.addEventListener('mouseup', restoreColorButton, false);
    }else{
      el.attachEvent('onmousedown', colorAndSoundEvents);

      el.attachEvent('onmouseup', restoreColorButton);
    }
}/* end add events*/

/* TURN ON-OFF SWITCH BUTTON */

$('.button').click(function(){
  $(this).toggleClass('switchOn');
  if(myGame.on === true){
    myGame.on = false;
    myGame.strict = false;
    $('.start').css("background-color","#9B0000");
    $('.strict-mode').css("background-color", "#333");
    removeButtonEvents();
    myGame.clearTimeWait();
    myGame.resetSequence();//FORMAT SCORE TO DISPLAY TWO DIGITS ALL THE TIME AND ADD OR REMOVE EVENTS
    maxScore = 0;
    myUI.displaySequenceCount(maxScore);    
  }
  else{
    myGame.on = true;
  }
});

//Starts the game.
$('.start').click(function(){
  if(myGame.on === true){
    $(this).css("background-color","red");
    //FIRES UP THE GAME FOR THE FIRST TIME
    pcGame.turn();
  }else{
    removeButtonEvents();
  }
    
});

//Enables/disable strict mode
$('.strict-mode').click(function(){
   if(myGame.on === true){  
     if(myGame.strict === true){
        $(this).css("background-color","#333");
        myGame.strict = false;
     }else{
       $(this).css("background-color","yellow");
       myGame.strict = true;
     }
  }
});




