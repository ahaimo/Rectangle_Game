/*
 * Example plugin template
 */

jsPsych.plugins["teacher"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "teacher",
    parameters: {
      rectangle_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rectangle color',
        default: 'blue',
        description: 'The color of the rectangle'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'prompt',
        default: '',
        description: 'Message displayed'
      },
      number_of_examples: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of examples',
        default: 2,
        description: 'Number of examples to draw'
      },
      canvas_size:{
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Canvas size',
        default: ['500','500'],
        description: 'Size of canvas'
      },
      pointSize:{
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Point size',
        default: 3,
        description: 'size of the examples'
      },
      prueba:{
        type:jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Prueba',
        default: false,
        description: 'If true, this is the testing trial, the rectangle will be a standard one in the midle of the screen'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button html',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      escape_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'escape_key',
        default: 'q',
        //default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {


    var canvas_size=trial.canvas_size,
        number_of_examples=trial.number_of_examples,
        pointSize = trial.pointSize;

    var Examples=[];



    x_rect=Number(canvas_size[0])*0.1+Math.random()*Number(canvas_size[0])*0.7;
    y_rect=Number(canvas_size[1])*0.1+Math.random()*Number(canvas_size[1])*0.7;
    width=Math.max(Math.random()*(0.9*Number(canvas_size[0])-x_rect),0.1*Number(canvas_size[0]));
    height=Math.max(Math.random()*(0.9*Number(canvas_size[1])-y_rect),0.1*Number(canvas_size[1]));



    var drawn_examples=0;
    var inside=false;


    var trial_data = {
      Prueba: trial.prueba,
      X_left:[],
      X_right:[],
      Y_top:[],
      Y_bottom:[],
      Circles:[],
      Crosses:[],
      rt:[]
    };
    trial_data.X_left.push(Math.round(x_rect*100)/100);
    trial_data.X_right.push(Math.round((x_rect+width)*100)/100);
    trial_data.Y_top.push(Math.round(y_rect*100)/100);
    trial_data.Y_bottom.push(Math.round((y_rect+height)*100)/100);


    display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  cursor:crosshair; border:1px solid #000000' ;></canvas><button id='myBtn' style= 'margin: auto ; font-size: 20px'; ></button>";

    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");
        document.getElementById("text").innerHTML =trial.prompt;

    var button=document.getElementById("myBtn");
        // BUTTON PROPERTIES
        button.innerHTML="SIGUIENTE";
        button.style.position = "fixed";
        button.style.top = String(Math.ceil(Number(canvas_rect.bottom)))+ 'px';
        button.style.left = String(Math.ceil( Number(canvas_size[0])*0.5+Number(canvas_rect.left)-10 ))+ 'px';
        display_element.querySelector('#myBtn').disabled=true;
        display_element.querySelector('#myBtn').addEventListener('click', function(){
          if(trial.prueba){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for(i=0;i<number_of_examples;i++){
              drawCoordinates(Examples[i])
            }
            display_element.querySelector('#myBtn').addEventListener('click', function(){end_trial()});
            //drawCoordinates(x,y);
          }else{
            end_trial();
          }

        });

    // REDEFINIR CANVAS. SI NO LOS CLICKS APARECEN CON UN OFFSET
    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");


    canvas_size[0]=canvas.width;
    canvas_size[1]=canvas.height;

    draw_rectangle(x_rect,y_rect,width,height)
    var start_time=Date.now();

    canvas.addEventListener("click",getPosition);

    // USAR ESTO PARA CHEQUEAR QUE LOS CLICKS ESTÉN BIEN
    //
    // document.addEventListener("click", printMousePos);
    // function printMousePos(event) {
    //   document.getElementById("text").innerHTML =
    //     "clientX: " + Number (event.clientX - canvas_rect.left) +
    //     " - clientY: " + Number(event.clientY - canvas_rect.top);
    // }


    function draw_rectangle(x,y,width,height){
      ctx.beginPath();
      ctx.lineWidth = "3";
      ctx.strokeStyle = trial.rectangle_color;
      ctx.rect(x, y, width, height); // ctx.rect(distancia al borde izquierdo del canvas, distancia al borde superior, ancho, alto)
      ctx.stroke();
    };


    function drawCoordinates(Example){
        x=Example.x;
        y=Example.y;
        if(Example.inside){
            ctx.fillStyle = "green"; // Red color
            ctx.beginPath(); //Start path
            ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
            ctx.fill(); // Close the path and fill.
            inside=true;
            x=Math.round(x*100)/100;
            y=Math.round(y*100)/100;
        } else{
            ctx.strokeStyle = "black"; // Red color
            ctx.beginPath();
            ctx.moveTo(x - pointSize, y - pointSize);
            ctx.lineTo(x + pointSize, y + pointSize);
            ctx.moveTo(x + pointSize, y - pointSize);
            ctx.lineTo(x - pointSize, y + pointSize);
            ctx.stroke();
            inside=false;
            x=Math.round(x*100)/100;
            y=Math.round(y*100)/100;
        };
        // trial_data.Examples.push({x:x,y:y,inside:inside}) ;
        drawn_examples ++;
        if(drawn_examples == number_of_examples){  // STOP GATHERING EXAMPLES
          canvas.removeEventListener("click",getPosition);
          display_element.querySelector('#myCanvas').style.cursor="default";
          display_element.querySelector('#myBtn').disabled=false;
          var end_time=Date.now();
          trial_data.rt= end_time - start_time;
        };

    };

    function check_if_inside(x,y){ // True if the example is inside the rectangle
      if(x>x_rect & x<(x_rect+width) & y>y_rect & y< (y_rect+height)){ // is inside
         flag=true;
      }else{
         flag=false;
      }
      return flag;
    };

    function getPosition(event){
         var rect = canvas.getBoundingClientRect();
         x = event.clientX - canvas_rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
         y = event.clientY - canvas_rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
         // This method will handle the coordinates and will draw them in the canvas.
         inside=check_if_inside(x,y);
         Examples.push({x:x,y:y,inside:inside})
         if(inside){
           trial_data.Circles.push("["+[x,y]+"]");
         }else{
           trial_data.Crosses.push("["+[x,y]+"]");
         }
         drawCoordinates(Examples[Examples.length-1]);
    };


    // store response
    var response = {
      rt: null,
      key: null
    };



    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#jspsych-image-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();
      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      // clear the display
      display_element.innerHTML = '';
      trial_data.key_press=response.key;
      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };



    // start the response listener
    if (trial.escape_key != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.escape_key,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    };

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
