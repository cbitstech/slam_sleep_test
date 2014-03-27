var PurpleRobotClient = {};



// PurpleRobotClient.serverUrl = "http://165.124.199.39:12345/json/submit";
// PurpleRobotClient.serverUrl = "http://165.124.198.95:12345/json/submit";
PurpleRobotClient.serverUrl = "http://localhost:12345/json/submit";


PurpleRobotClient.launchRequest = "PurpleRobot.fetchString(\'app_config\')";
PurpleRobotClient.lastResponse = null;
PurpleRobotClient.loadPrompt = null;


//QUEUE FUNCTIONS
PurpleRobotClient.transmissionQueue = {};

PurpleRobotClient.transmissionQueue.contents = function(){
    if (!localStorage["prc_outgoing_queue"]){
        localStorage["prc_outgoing_queue"] = '[]';
    }

    return JSON.parse(localStorage["prc_outgoing_queue"]);
};

PurpleRobotClient.transmissionQueue.add = function(js_to_execute){
    
    var local_queue_copy = PurpleRobotClient.transmissionQueue.contents();

    // console.log(js_to_execute);
    local_queue_copy.push(js_to_execute);

    localStorage["prc_outgoing_queue"] = JSON.stringify(local_queue_copy);
    
};

PurpleRobotClient.transmissionQueue.send = function(){
    var js_to_execute = "";
       _.each(PurpleRobotClient.transmissionQueue.contents(), function (i) {
        js_to_execute = js_to_execute + i;
    });
    console.log("QUEUE SPOOLED | transmission queue contents:", js_to_execute);
    PurpleRobotClient.transmitScript(js_to_execute,"queue");
    
};

PurpleRobotClient.transmissionQueue.clear = function(){
     localStorage["prc_outgoing_queue"] = '[]';
     console.log("QUEUE CLEARED | transmission queue contents:", PurpleRobotClient.transmissionQueue.contents());
};




//UTILITY FUNCTIONS
PurpleRobotClient.postJSON = function (json, emission_type) {

    var post_data = {};
    post_data.json = JSON.stringify(json);

    console.log("TRANSMISSION ATTEMPT | Purple Robot Transmission [PurpleRobotClient.postJSON()]: ", post_data);

    $.ajax(PurpleRobotClient.serverUrl, {
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: post_data,
        success: function (data) {
            // alert("Trigger created. It will launch shortly after " + fire_date + "...");
            //            alert("GOT DATA: " + JSON.stringify(data));
            console.log("SUCCESS | Purple Robot Transmission [PurpleRobotClient.postJSON()]: ", data);

             switch (emission_type)
                {
                    case "queue":
                    PurpleRobotClient.transmissionQueue.clear();
                    break;
                    default:
                    break;
                };
            PurpleRobotClient.lastResponse = data;

            if (PurpleRobotClient.lastResponse = 'loadPrompt'){
                PurpleRobotClient.loadPrompt = true;
            }


        },
        error: function (jqXHR, textStatus, errorThrown) {
            //alert("Error - Transmission to Purple Robot: " + textStatus + " --- " + errorThrown);
            
            console.log("ERROR | Purple Robot Transmission [PurpleRobotClient.postJSON()]: " + textStatus + " --- " + errorThrown); 
        }
    });

};

PurpleRobotClient.transmitScript = function (js_to_execute,emission_type) {

    var emission_style = "";
    var json = {};
    json.command = "execute_script";
    json.script = js_to_execute;


    switch (emission_type)
    {
        case "queue":
        emission_style = "queue";
        return PurpleRobotClient.postJSON(json, emission_style);
        break;
        case "generateString":
        return json;
        break;
        default:
        emission_style = "";
        return PurpleRobotClient.postJSON(json, emission_style);
        break;
    };
    
    
    
};


PurpleRobotClient.actionHandler = function(js_to_execute, emission_format){
    
    switch (emission_format)
    {
        case "generateString":
        return js_to_execute;
        break;
        case "addToQueue":
        return PurpleRobotClient.transmissionQueue.add(js_to_execute);
        break;
        default:
        return PurpleRobotClient.transmitScript(js_to_execute);
        break;
    };

};



//PASSTHROUGH FUNCTIONS
//
//these passthrough functions take the form of the functions that exist in PR with the addition of an emission_format parameter
//the emission_format current options are:
//[null] : transmit immediately
//addToQueue : adds to the outgoing execute queue to transmit when that queue is spooled
//generateString : returns only the string to be transmitted
//

PurpleRobotClient.emitReading = function (name,value,emission_format,options) {
    options = options || {};
    name = name || "app_eav";
    js_to_execute = 'PurpleRobot.emitReading(\"' + name + '\",' + JSON.stringify(value) + ');'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.playDefaultTone = function (emission_format) {
    js_to_execute = 'PurpleRobot.playDefaultTone();';
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.enableBackgroundImage = function (emission_format) {
    js_to_execute = 'PurpleRobot.enableBackgroundImage();'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.disableBackgroundImage = function (emission_format) {
    js_to_execute = 'PurpleRobot.disableBackgroundImage();'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.restoreDefaultId = function (emission_format) {
    js_to_execute = 'PurpleRobot.restoreDefaultId();'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.updateTrigger = function (triggerId, triggerObject, emission_format) {
    js_to_execute = 'PurpleRobot.updateTrigger(\"' + triggerId + '\",' + triggerObject + ');'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.setUserId = function (name,emission_format) {
    js_to_execute = 'PurpleRobot.setUserId(\"' + name + '\");'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.persistString = function (string, value, emission_format) {
    // PurpleRobotClient.persistString("load_prompt",JSON.stringify('{\"load_prompt\":true}'));

    js_to_execute = 'PurpleRobot.persistString(\"' + string + '\",' + value + ');'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.fetchString = function (name,emission_format) {
    js_to_execute = 'PurpleRobot.fetchString(\"' + name + '\");'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}

PurpleRobotClient.emitToast = function (contents,emission_format) {
    js_to_execute = 'PurpleRobot.setUserId(\"' + contents + '\");'
    return PurpleRobotClient.actionHandler(js_to_execute, emission_format);
}
