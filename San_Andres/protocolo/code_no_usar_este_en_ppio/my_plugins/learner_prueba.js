/*
 * Example plugin template
 */

jsPsych.plugins["learner_prueba"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "learner_prueba",
    parameters: {
      rectangle_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rectangle color',
        default: 'blue',
        description: 'The color of the rectangle'
      },
      number_of_examples: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of examples',
        default: 2,
        description: 'Number of examples to show'
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
      prueba:{
        type:jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Prueba',
        default: true,
        description: 'If true, this is the testing trial, the examples will be standard on screen'
      },
      escape_key: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'escape_key',
        default: 'q',
        //default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      number_of_circles:{
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Type of examples',
        default: "r", // define randomly
        description: 'How many of the examples shown will be circles'
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
        pointSize = trial.pointSize, // Change according to the size of the point.
        number_of_examples=trial.number_of_examples;



    margin=0.2; // margen relativo al tamaño del canvas sobre el cual no apareceran estimulos para minimizar efectos de borde
    min_size=0.2; // minimo tamaño del lado del rectangulo, relativo al canvas size

    // Define effective space
    x_min=margin*canvas_size[0];
    x_max=(1-margin)*canvas_size[0];
    y_min=margin*canvas_size[1];
    y_max=(1-margin)*canvas_size[1];




      // DEFINE THE NUMBER OF CIRCLES
      if(trial.number_of_circles=='r'){
        a=Math.random();
        new_flag=false;
        for (i=0;i<(number_of_examples+1);i++){
          if( a<((i+1)/(number_of_examples+1)) & !new_flag ) {
             number_of_circles=i;
             new_flag=true;
          }
        }
      }else{
        number_of_circles=Number(trial.number_of_circles)
        if(number_of_circles>number_of_examples){
          number_of_circles=number_of_examples
        }
      };

    var min_dist=0.1*Math.min(Number(canvas_size[0]),Number(canvas_size[1])),
        min_angle=15*Math.PI/180 ; // 20 degrees

    //var Examples=[{x:30,y:40,inside:true },{x:250,y:250,inside:false }];
    var consistent;

    var rect = {},
        drag = false;

    var trial_data = {
      Prueba: trial.prueba,
      // RECTANGLE DRAWN BY SUBJECT
      X_left:[],
      X_right:[],
      Y_top:[],
      Y_bottom:[],
      // EXAMPLES PRESENTED IN TRIAL
      Circles: [],
      Crosses:[],
      Consistency:[], // true if the rectangle drawn is consistent with the examples
      rt:[]
    };

    // Rectangle variables (This rectangle will not be drawn, it serves for drawing examples)
    var x_rect=Number(canvas_size[0])*margin+Math.random()*Number(canvas_size[0])*(1-2*margin-min_size),
        y_rect=Number(canvas_size[1])*margin+Math.random()*Number(canvas_size[1])*(1-2*margin-min_size),
        width=Math.max(Math.random()*(canvas_size[0]*(1-margin)-x_rect),canvas_size[0]*min_size),
        height=Math.max(Math.random()*(canvas_size[1]*(1-margin)-y_rect),canvas_size[1]*min_size)

  function draw_imaginary_rectangle(x,y,width,height){
          // Red rectangle
          ctx.beginPath();
          ctx.lineWidth = "3";
          ctx.strokeStyle = trial.rectangle_color;
          ctx.rect(x, y, width, height); // ctx.rect(distancia al borde izquierdo del canvas, distancia al borde superior, ancho, alto)
          ctx.stroke();
        };



    // Define examples
    var flag=[];
    var Examples=[];

    // Examples=[{x:1,y:1,inside:true},{x:699,y:1,inside:true}]

    // CIRCLES
    for (i=0; i<number_of_circles; i++){
      Examples[i]={inside: true};
      flag=false;
      while(!flag){
        Examples[i].x=x_rect+Math.random()*width;
        Examples[i].y=y_rect+Math.random()*height;
        flag=true;
        for(j=0;j<i;j++){
          if (measure_distance(Examples[i],Examples[j])< min_dist | measure_angle(Examples[i],Examples[j])<min_angle ){
             flag=false;
          }
        }
      };
      Examples[i].x=Math.round(Examples[i].x*100)/100; // redondear a dos decimales
      Examples[i].y=Math.round(Examples[i].y*100)/100;
      trial_data.Circles.push("["+[Examples[i].x,Examples[i].y]+"]")
    };

    // CROSSES
    for (i=number_of_circles; i<number_of_examples; i++){
      Examples[i]={inside:false};
      flag=false;
      while(!flag){  // ARREGLAR LAS CRUCES. A VECES NO APARECEN
        r=0.5*Math.sqrt(width*width+height*height); // size of the rectangle
        theta=Math.random()*2*Math.PI;
        x=r*Math.cos(theta)+x_rect+0.5*width;
        y=r*Math.sin(theta)+y_rect+0.5*height;
        if(x>=x_min & x<=x_max & y>=y_min & y <=y_max ){
          Examples[i].x=x;
          Examples[i].y=y;
          flag=true;
          for(j=0;j<i;j++){
            if (measure_distance(Examples[i],Examples[j])< min_dist | measure_angle(Examples[i],Examples[j])<min_angle ){
               flag=false;
            }
          }
        }
      };
      Examples[i].x=Math.round(Examples[i].x*100)/100; // redondear a dos decimales
      Examples[i].y=Math.round(Examples[i].y*100)/100;
      trial_data.Crosses.push("["+[Examples[i].x,Examples[i].y]+"]")
    };


    function measure_distance(A,B){
      return Math.sqrt((A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y))
    };

    function measure_angle(A,B){
      return Math.atan(Math.abs(A.y-B.y)/Math.abs(A.x-B.x))
    };

    ///////////////////////////// BEGIN TRIAL /////////////////////////////////////////

    display_element.innerHTML="<p id='text'></p><canvas width="+canvas_size[0]+ "px height="+canvas_size[1]+"px id='myCanvas' style=' margin-left:0px auto;  cursor:crosshair; border:1px solid #000000' ;></canvas><button id='myBtn' style= 'margin: auto ; font-size: 20px'; ></button>";

    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");
        document.getElementById("text").innerHTML ='';

    var button=document.getElementById("myBtn");
        // BUTTON PROPERTIES
        button.innerHTML="SIGUIENTE";
        button.style.position = "fixed";
        button.style.top = String(Math.ceil(Number(canvas_rect.bottom)))+ 'px';
        button.style.left = String(Math.ceil( Number(canvas_size[0])*0.5+Number(canvas_rect.left)-10 ))+ 'px';
        display_element.querySelector('#myBtn').disabled=true;
        display_element.querySelector('#myBtn').addEventListener('click', function(){
          trial_data.rt=Date.now()-start_time;
          save_response();
          end_trial();
        });

    // REDEFINIR CANVAS. SI NO LOS CLICKS APARECEN CON UN OFFSET
    var canvas = document.getElementById('myCanvas'),
        canvas_rect = canvas.getBoundingClientRect(),
        ctx = canvas.getContext("2d");


    var start_time=Date.now();
    draw_examples(Examples);
    // draw_imaginary_rectangle(x_rect,y_rect,width,height)

    init();
    // correct();


    function draw_examples(Examples){
      for(i=0; i<Examples.length; i++){
        x=Examples[i].x;
        y=Examples[i].y;
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



    function draw_rectangle() {
      ctx.beginPath();
      ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
      ctx.strokeStyle = "blue"; // Red color
      ctx.stroke();
      ctx.lineWidth = "3";
      ctx.closePath();
    };

    function mouseDown(e) {
      rect.startX = e.pageX - this.offsetLeft;
      rect.startY = e.pageY - this.offsetTop;
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


    function save_response(){
      trial_data.X_left.push(Math.min(rect.startX,rect.startX+rect.w));
      trial_data.X_right.push(Math.min(rect.startX,rect.startX+rect.w)+Math.abs(rect.w));
      trial_data.Y_top.push(Math.min(rect.startY,rect.startY+rect.h));
      trial_data.Y_bottom.push(Math.min(rect.startY,rect.startY+rect.h)+Math.abs(rect.h));
      trial_data.Consistency.push(consistent);
    };



    function check_if_inside(example){ // True if the example is inside the rectangle
      if( ( (example.x>=Math.min(rect.startX,rect.startX+rect.w))&(example.x<=Math.max(rect.startX,rect.startX+rect.w))
                           &(example.y>=Math.min(rect.startY,rect.startY+rect.h))&(example.y<=Math.max(rect.startY,rect.startY+rect.h)))){ // is inside
         flag=true;
      }else{
         flag=false;
      }
      return flag;
    };


    function mouseMove(e) {
      if (drag) {
        rect.w = (e.pageX - this.offsetLeft) - rect.startX;
        rect.h = (e.pageY - this.offsetTop) - rect.startY ;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        draw_examples(Examples);
        draw_rectangle();
      }
    };

  function mover(e){
    rect.startX=e.pageX-this.offsetLeft;
    rect.startY=e.pageY-this.offsetTop;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw_examples(Examples);
    draw_rectangle();
  }



  function init() {
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
  };

  // function correct(){
  //   canvas.addEventListener('mousedown',mover,true);
  // };




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
      // if (trial.stimulus_duration !== null) {
      //   jsPsych.pluginAPI.setTimeout(function() {
      //     display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      //   }, trial.stimulus_duration);
      // };

      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      };

  };

  return plugin;
})();
