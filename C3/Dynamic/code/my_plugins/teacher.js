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
      rectangle_learner_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rectangle color for learner response',
        default: 'red',
        description: 'The color of the rectangle for learner response'
      },
      prompt_espera: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'prompt espera',
        default: "ESPERANDO QUE JUEGUE TU COMPAÑERX",
        description: 'Message displayed'
      },
      prompt_jugar: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'prompt jugar',
        default: "ELEGÍ UNA NUEVA PISTA",
        description: 'Message displayed'
      },
      allowed_error_rate: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'allowed error rate',
        default: 0.05,
        description: 'From 0 (100% acurracy) to 1(0% accuracy), how accurate should the rectangle be'
      },
      number_of_examples: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of examples',
        default: 1,
        description: 'Number of examples to draw'
      },
      rectangles_limit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of rectangles',
        default: 8,
        description: 'Number of rectangles from learner'
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

    var x_rect=Math.round(Number(canvas_size[0])*0.1+Math.random()*Number(canvas_size[0])*0.7);
    var y_rect=Math.round(Number(canvas_size[1])*0.1+Math.random()*Number(canvas_size[1])*0.7);
    var width=Math.round(Math.max(Math.random()*(0.9*Number(canvas_size[0])-x_rect),0.1*Number(canvas_size[0])));
    var height=Math.round(Math.max(Math.random()*(0.9*Number(canvas_size[1])-y_rect),0.1*Number(canvas_size[1])));






    var drawn_examples=0;
    var inside=false;

    var trial_data = {
      Examples:[],
      Inside:[],
      Examples_times:[],
      Teachers_Box:[],
      Learners_Guess:[],
      Learners_Guess_time:[],
      rt:[],
      canvas_size:[],
      won: false
    };

    trial_data.Teachers_Box="["+[Math.round(x_rect*100)/100,Math.round((x_rect+width)*100)/100,Math.round(y_rect*100)/100,Math.round((y_rect+height)*100)/100]+"]"
    trial_data.canvas_size="["+[canvas_size[0],canvas_size[1]]+"]";
    trial_data.start_time=Date.now();

    display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  cursor:crosshair; border:1px solid #000000' ;></canvas>";

    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");

    document.getElementById("text").innerHTML = trial.prompt_jugar;
    document.getElementById("text").classList.add("blink_me");

    // REDEFINIR CANVAS. SI NO LOS CLICKS APARECEN CON UN OFFSET
    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");


    canvas_size[0]=canvas.width;
    canvas_size[1]=canvas.height;

    function draw_main_rectangle(){
      draw_examples(Examples);
      draw_rectangle(x_rect,y_rect,width,height,trial.rectangle_color)
    }

    draw_main_rectangle();
    var start_time=Date.now();


    canvas.addEventListener("click",getPosition);

    jsPsych.node.socket.on('rectangle', function(message){
      //var x = message.x_left.slice(-1)[0];
      //var y = message.y_top.slice(-1)[0];
      //var xr = message.x_right.slice(-1)[0];
      //var yb = message.y_bottom.slice(-1)[0];
      var x = message.x_left;
      var y = message.y_top;
      var xr = message.x_right;
      var yb = message.y_bottom;
      var consistent = message.consistent;
      trial_data.Learners_Guess.push("["+[x,xr,y,yb]+"]");
      trial_data.Learners_Guess_time.push(message.time);

      ctx.clearRect(0,0,canvas.width,canvas.height);
      draw_rectangle(x,y,xr-x,yb-y,trial.rectangle_learner_color);
      draw_main_rectangle();


      var difx1 = Math.abs(x - x_rect) / canvas.width;
      var difx2 = Math.abs((xr-x) - width) / canvas.width;
      var dify1 = Math.abs(y - y_rect) / canvas.height;
      var dify2 = Math.abs((yb-y) - height) / canvas.height;

//      var difx1 = Math.abs(x - x_rect) / width;
//      var difx2 = Math.abs((xr-x)-width) / width;
//      var dify1 = Math.abs(y - y_rect) / height;
//      var dify2 = Math.abs((yb-y)-height) / height;

      var won = difx1 <= trial.allowed_error_rate &&
        difx2 <= trial.allowed_error_rate &&
        dify1 <= trial.allowed_error_rate &&
        dify2 <= trial.allowed_error_rate &&
        consistent;

      var limit = (Examples.length/trial.number_of_examples) >= trial.rectangles_limit;
      if(won || limit){
        //pasar de nivel
        trial_data.won = won;
        jsPsych.node.socket.emit('end_trial', {won: won});
        end_trial();
      }else{
        //nuevos puntos
        drawn_examples = 0;
        document.getElementById("text").innerHTML = trial.prompt_jugar;
        document.getElementById("text").classList.add("blink_me");
        display_element.querySelector('#myCanvas').style.cursor="crosshair";
        canvas.addEventListener("click",getPosition);
      }
      start_time=Date.now();
    });

    jsPsych.node.socket.on('end_trial', function(message){
      end_trial();
    });

    // USAR ESTO PARA CHEQUEAR QUE LOS CLICKS ESTÉN BIEN
    //
    // document.addEventListener("click", printMousePos);
    // function printMousePos(event) {
    //   document.getElementById("text").innerHTML =
    //     "clientX: " + Number (event.clientX - canvas_rect.left) +
    //     " - clientY: " + Number(event.clientY - canvas_rect.top);
    // }


    function draw_rectangle(x,y,width,height,color){
      ctx.beginPath();
      ctx.lineWidth = "3";
      ctx.strokeStyle = color;
      ctx.rect(x, y, width, height); // ctx.rect(distancia al borde izquierdo del canvas, distancia al borde superior, ancho, alto)
      ctx.stroke();
    };


    function drawCoordinates(example){
        var x=example.x;
        var y=example.y;
        if(example.inside){
            ctx.fillStyle = "green"; // Red color
            ctx.beginPath(); //Start path
            ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
            ctx.fill(); // Close the path and fill.
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
            x=Math.round(x*100)/100;
            y=Math.round(y*100)/100;
        };

        drawn_examples ++;
        if(drawn_examples == number_of_examples){  // STOP GATHERING EXAMPLES
          canvas.removeEventListener("click",getPosition);
          display_element.querySelector('#myCanvas').style.cursor="default";
          var end_time=Date.now();
          trial_data.rt.push(end_time - start_time);
          jsPsych.node.socket.emit('points', {
            examples: Examples,
            teachers_box: trial_data.Teachers_Box
          });
          document.getElementById("text").innerHTML = trial.prompt_espera;
          document.getElementById("text").classList.remove("blink_me");
        };

    };

    function check_if_inside(x,y){ // True if the example is inside the rectangle
      if(x>x_rect & x<(x_rect+width) & y>y_rect & y< (y_rect+height)){ // is inside
         return true;
      }else{
         return false;
      }
    };

    function getPosition(event){
         var event_time=Date.now()
         var rect = canvas.getBoundingClientRect();
         var x = event.clientX - canvas_rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
         var y = event.clientY - canvas_rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
         // This method will handle the coordinates and will draw them in the canvas.
         x=Math.round(x*10)/10; // un decimal
         y=Math.round(y*10)/10;
         var inside = check_if_inside(x,y);
         Examples.push({x:x,y:y,inside:inside,time:event_time});
         trial_data.Examples.push("["+[x,y]+"]");
         trial_data.Inside.push(inside);
         trial_data.Examples_times.push(event_time);
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

    };

    function draw_examples(examples){
      for(var i=0; i<examples.length; i++){
        var x = examples[i].x;
        var y = examples[i].y;
        if(examples[i].inside){
          ctx.beginPath(); //Start path
          ctx.fillStyle = "green"; //  color
          ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
          ctx.fill(); // Close the path and fill.
          ctx.closePath();
        } else{
          ctx.beginPath();
          ctx.lineWidth = "3";
          ctx.strokeStyle = "black"; // Red color
          ctx.moveTo(x - pointSize, y - pointSize);
          ctx.lineTo(x + pointSize, y + pointSize);
          ctx.moveTo(x + pointSize, y - pointSize);
          ctx.lineTo(x - pointSize, y + pointSize);
          ctx.stroke();
          ctx.closePath();
        };
      };
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

      //disable all socket calls
      jsPsych.node.socket.off();

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
        jsPsych.node.socket.emit('end_trial', {won: false});
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
