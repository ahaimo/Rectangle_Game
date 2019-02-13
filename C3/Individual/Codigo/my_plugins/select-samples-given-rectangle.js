/*
 * Example plugin template
 */

jsPsych.plugins["select-samples-given-rectangle"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "select-samples-given-rectangle",
    parameters: {
      parameter_name: {
        type: jsPsych.plugins.parameterType.INT, // INT, IMAGE, KEYCODE, STRING, FUNCTION, FLOAT
        default_value: undefined
      },
      parameter_name: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default_value: undefined
      }
    }
  }





  plugin.trial = function(display_element, trial) {
    var html_content = '<p>This is the first paragraph</p>';
    html_content += '<p>This is the second paragraph</p>';

    display_element.innerHTML = html_content;

    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    jsPsych.finishTrial(html_content,trial_data);
  };

  return plugin;
})();
