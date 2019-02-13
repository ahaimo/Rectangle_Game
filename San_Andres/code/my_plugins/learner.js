/*
 * Example plugin template
 */

jsPsych.plugins["learner"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "learner",
    parameters: {
      rectangle_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rectangle color',
        default: 'blue',
        description: 'The color of the rectangle'
      },
      previous_rectangle_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Previous rectangle color',
        default: 'red',
        description: 'The color of the rectangle from previous step'
      },
      prompt_espera: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'prompt espera',
        default: 'ESPERANDO PISTAS',
        description: 'Message displayed'
      },
      prompt_jugar: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'prompt jugar',
        default: 'ADIVINÁ EN DÓNDE ESTÁ LA CAJA!',
        description: 'Message displayed'
      },
      canvas_size:{
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Canvas size',
        default: ['500','500'],
        description: 'The color of the rectangle'
      },
      check_consistency: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: '',
        default: false,
        description: 'If false, the subject may draw any rectangle regardless of its consistency with the examples. If true, the rectangle drawn must be consistent with the examples.'
      },
      pointSize: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Example point size',
        default: 3,
        description: ''
      },
      escape_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'escape_key',
        default: 'q',
        //default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var canvas_size=trial.canvas_size,
        check_consistency=trial.check_consistency,
        pointSize = trial.pointSize; // Change according to the size of the point.



    var margin=0.2; // margen relativo al tamaño del canvas sobre el cual no apareceran estimulos para minimizar efectos de borde
    var min_size=0.2; // minimo tamaño del lado del rectangulo, relativo al canvas size

    // Define effective space
    var x_min=margin*canvas_size[0];
    var x_max=(1-margin)*canvas_size[0];
    var y_min=margin*canvas_size[1];
    var y_max=(1-margin)*canvas_size[1];

    var min_dist=0.1*Math.min(Number(canvas_size[0]),Number(canvas_size[1])),
        min_angle=15*Math.PI/180 ; // 20 degrees

    //var Examples=[{x:30,y:40,inside:true },{x:250,y:250,inside:false }];
    var consistent;

    var rect = {},
        drag = false;

    var trial_data = {
      // RECTANGLE DRAWN BY SUBJECT
      Teachers_Box:[],
      Learners_Guess:[],
      Learners_Guess_time:[],
      // EXAMPLES PRESENTED IN TRIAL
      Examples:[],
      Examples_times:[],
      Inside:[],
      Consistency:[], // true if the rectangle drawn is consistent with the examples
      rt:[],
      canvas_size:[],
      start_time:[],
      escape_trial:false,
      won: false,
      score: 0
    };

    trial_data.start_time=Date.now();
    trial_data.canvas_size="["+[canvas_size[0],canvas_size[1]]+"]";

    // Rectangle variables (This rectangle will not be drawn, it serves for drawing examples)
    var x_rect=Number(canvas_size[0])*margin+Math.random()*Number(canvas_size[0])*(1-2*margin-min_size),
        y_rect=Number(canvas_size[1])*margin+Math.random()*Number(canvas_size[1])*(1-2*margin-min_size),
        width=Math.max(Math.random()*(canvas_size[0]*(1-margin)-x_rect),canvas_size[0]*min_size),
        height=Math.max(Math.random()*(canvas_size[1]*(1-margin)-y_rect),canvas_size[1]*min_size);


    // Define examples
    var flag=[];
    var Examples=[];

    // Examples=[{x:1,y:1,inside:true},{x:699,y:1,inside:true}]

    ///////////////////////////// BEGIN TRIAL /////////////////////////////////////////

    display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  border:1px solid #000000' ;></canvas><button id='myBtn' style= 'margin: auto ; font-size: 20px'; ></button>";
    document.getElementById("text").innerHTML = trial.prompt_espera;

    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");



    var button=document.getElementById("myBtn");
        // BUTTON PROPERTIES
        button.innerHTML="ENVIAR RESPUESTA";
        button.style.position = "fixed";
        button.style.top = String(Math.ceil(Number(canvas_rect.bottom)))+ 'px';
        button.style.left = String(Math.ceil( Number(canvas_size[0])*0.5+Number(canvas_rect.left)-10 ))+ 'px';
        display_element.querySelector('#myBtn').disabled=true;
        display_element.querySelector('#myBtn').addEventListener('click', function(){
          display_element.querySelector('#myBtn').disabled=true;
          document.getElementById("text").innerHTML = trial.prompt_espera;
          document.getElementById("text").classList.remove("blink_me");
          canvas.style.cursor="default";
          pause();
          trial_data.rt.push(Date.now()-start_time);
          send_response();
        });

    // REDEFINIR CANVAS. SI NO LOS CLICKS APARECEN CON UN OFFSET
    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");

    var start_time;



    jsPsych.node.socket.on('escape_trial', function(message){
      trial_data.escape_trial=true;
      end_trial();
    });


    jsPsych.node.socket.on('end_trial', function(message){
      trial_data.won = message.won;
      trial_data.score=message.score;
      end_trial();
    });

    jsPsych.node.socket.on('points', function(message){
      document.getElementById("text").innerHTML = trial.prompt_jugar;
      document.getElementById("text").classList.add("blink_me");
      canvas.style.cursor="crosshair";
      start_time=Date.now();
      Examples = message.examples;
      last_example=Examples.slice(-1)[0];

      trial_data.Teachers_Box=message.teachers_box;
      trial_data.Examples.push("["+[last_example.x,last_example.y]+"]");
      trial_data.Inside.push(last_example.inside);
      trial_data.Examples_times.push(last_example.time);

      ctx.clearRect(0,0,canvas.width,canvas.height);
      draw_examples(Examples);
      if(rect.startX != undefined)
        draw_rectangle(trial.previous_rectangle_color);
      init();
    });


    function draw_examples(Examples){
      for(var i=0; i<Examples.length; i++){
        var x = Examples[i].x;
        var y = Examples[i].y;
        if(Examples[i].inside){
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


    function draw_rectangle(color) {
      ctx.beginPath();
      ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.lineWidth = "3";
      ctx.closePath();
    };

    var tempX;
    var tempY;

    function mouseDown(e) {
      tempX = e.pageX - this.offsetLeft;
      tempY = e.pageY - this.offsetTop;
      drag = true;
    };

    function mouseUp() {
      drag = false;
      consistent=true; // check consistency
      for(i=0;i<Examples.length;i++){
        if( (Examples[i].inside & !check_if_inside(Examples[i])) | (!Examples[i].inside & check_if_inside(Examples[i])) ){
          consistent=false;
        };
      };
      if(check_consistency){ // it true inconsistent rectangles will not be allowed
        if(!consistent){
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          draw_examples(Examples);
        } else{
          display_element.querySelector('#myBtn').disabled=false;
        };
      }else{
          display_element.querySelector('#myBtn').disabled=false;
      };
      //trial_data.Rectangle.push({x_left: Math.min(rect.startX,rect.startX+rect.w),y_top: Math.min(rect.startY,rect.startY+rect.h) ,width: Math.abs(rect.w),height:Math.abs(rect.h), consistent:consistent }) ;
    };


    function send_response(){
      var x_left=Math.min(rect.startX,rect.startX+rect.w);
      var x_right=Math.min(rect.startX,rect.startX+rect.w)+Math.abs(rect.w);
      var y_top=Math.min(rect.startY,rect.startY+rect.h);
      var y_bottom=Math.min(rect.startY,rect.startY+rect.h)+Math.abs(rect.h);
      var response_time=Date.now();
      trial_data.Learners_Guess.push("["+[x_left,x_right,y_top,y_bottom]+"]");
      trial_data.Learners_Guess_time.push(response_time);
      //trial_data.X_left.push(Math.min(rect.startX,rect.startX+rect.w));
      //trial_data.X_right.push(Math.min(rect.startX,rect.startX+rect.w)+Math.abs(rect.w));
      //trial_data.Y_top.push(Math.min(rect.startY,rect.startY+rect.h));
      //trial_data.Y_bottom.push(Math.min(rect.startY,rect.startY+rect.h)+Math.abs(rect.h));
      trial_data.Consistency.push(consistent);
      jsPsych.node.socket.emit('rectangle', {
        x_left: x_left,
        x_right: x_right,
        y_top: y_top,
        y_bottom: y_bottom,
        //x_left: trial_data.X_left,
        //x_right: trial_data.X_right,
        //y_top: trial_data.Y_top,
        //y_bottom: trial_data.Y_bottom,
        consistent: consistent,
        time: response_time
      });
    };



    function check_if_inside(example){ // True if the example is inside the rectangle
      if( ( (example.x>=Math.min(rect.startX,rect.startX+rect.w))&(example.x<=Math.max(rect.startX,rect.startX+rect.w))
                           &(example.y>=Math.min(rect.startY,rect.startY+rect.h))&(example.y<=Math.max(rect.startY,rect.startY+rect.h)))){ // is inside
         return true;
      }else{
         return false;
      }
    };


    function mouseMove(e) {
      if (drag) {
        rect.startX = tempX;
        rect.startY = tempY;
        rect.w = (e.pageX - this.offsetLeft) - rect.startX;
        rect.h = (e.pageY - this.offsetTop) - rect.startY ;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        draw_examples(Examples);
        draw_rectangle(trial.rectangle_color);
      }
    };

  function mover(e){
    rect.startX=e.pageX-this.offsetLeft;
    rect.startY=e.pageY-this.offsetTop;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw_examples(Examples);
    draw_rectangle(trial.rectangle_color);
  }


  function pause(){
    canvas.removeEventListener('mousedown', mouseDown, false);
    canvas.removeEventListener('mouseup', mouseUp, false);
    canvas.removeEventListener('mousemove', mouseMove, false);
  }

  function init() {
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
  };


  // store response
  var response = {
    rt: null,
    key: null
  };


  var escape_trial = function(){
    trial_data.escape_trial=true;
    //jsPsych.node.socket.emit('escape_trial');
    end_trial();
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
          callback_function: escape_trial,
          valid_responses: trial.escape_key,
          rt_method: 'date',
          persist: false,
          allow_held_key: false
        });
      };

      // hide stimulus if stimulus_duration is set
      // if (trial.stimulus_duration !== null) {
      //   jsPsych.pluginAPI.setTimeout(function() {
      //     display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      //   }, trial.stimulus_duration);
      // };

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          jsPsych.node.socket.emit('end_trial', {won: false});
          end_trial();
        }, trial.trial_duration);
      };

  };

  return plugin;
})();
