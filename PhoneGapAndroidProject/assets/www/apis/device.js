/* Copyright (c) 2012 Mobile Developer Solutions. All rights reserved.
 * This software is available under the MIT License:
 * The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function onBackbutton() {
	console.log("onBackButton entered");
	
    // the intro div is considered home, so exit if user
    // wants to go back with button from there
    if (document.getElementById('api-intro').style.display === 'block') {
        console.log("Exiting app");
        navigator.app.exitApp();
    } else {    
        var divs = document.getElementsByClassName('api-div');   
        for(var i=0; i<divs.length; i++) { 
            divs[i].style.display='none';
        }
        document.getElementById('api-intro').style.display = 'block';
        scroll(0,0);
    }
}

//global db connection variable
var db = 0;

var onDeviceReady = function() {
    console.log("deviceready event fired");
    // api-device
    // ***IMPORTANT: access device object only AFTER "deviceready" event    
//    document.getElementById("name").innerHTML = device.name;
//    document.getElementById("pgversion").innerHTML = device.cordova ? device.cordova : device.phonegap;
//    document.getElementById("platform").innerHTML = device.platform;
//    document.getElementById("uuid").innerHTML = device.uuid;
//    document.getElementById("version").innerHTML = device.version;
    // screen information  ***Not necessary to wait for deviceready event
//    document.getElementById("width").innerHTML = screen.width;
//    document.getElementById("height").innerHTML = screen.height;
//    document.getElementById("availwidth").innerHTML = screen.availWidth;
//    document.getElementById("availheight").innerHTML = screen.availHeight;
//    document.getElementById("colorDepth").innerHTML = screen.colorDepth;  
    
    // api-events - see events.js for handler implementations
    // ***IMPORTANT: add event listeners only AFTER "deviceready" event    
    document.addEventListener("searchbutton", onSearchKeyDown, false);   
    document.addEventListener("menubutton", onMenuButtonDown, false);
    document.addEventListener("pause", onEventFired, false);
    document.addEventListener("resume", onEventFired, false);
    document.addEventListener("online", onEventFired, false);
    document.addEventListener("offline", onEventFired, false);
    // using callback for backbutton event may interfere with expected behavior
    document.addEventListener("backbutton", onBackbutton, false);
    document.addEventListener("batterycritical", onEventFired, false);
    document.addEventListener("batterylow", onEventFired, false);
    document.addEventListener("batterystatus", onEventFired, false);
    document.addEventListener("startcallbutton", onEventFired, false);
    document.addEventListener("endcallbutton", onEventFired, false);
    document.addEventListener("volumedownbutton", onEventFired, false);
    document.addEventListener("volumeupbutton", onEventFired, false);
   
    // api-camera  Photo URI
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
    
    // The Samsung Galaxy Tab 10.1 is currently the only device known to
    // support orientation/change correctly and reliably.
//    if (device.name === "GT-P7510") {
//        var updateScreen = function() {
//            document.getElementById("width").innerHTML = screen.width;
//            document.getElementById("height").innerHTML = screen.height;
//            document.getElementById("availwidth").innerHTML = screen.availWidth;
//            document.getElementById("availheight").innerHTML = screen.availHeight;        
//        };         
//        window.addEventListener("orientationchange", function(e){
//            //console.log("window.orientation: " + window.orientation);
//            updateScreen();
//        }, false);
//    }
    
    //opening the db connection and creating the TODO-list table
    if (!db)
    {
        db = window.openDatabase("Database", "1.0", "Yet another TODO-List", 500000);
        
        //only for testing purposes (whipes out old database)
        console.log("init: drop old DB");
        todolistDropDB();
        
        //creating table for TODO-Lists
        console.log("init: create DB");
        todolistCreateDB();
        
        //only for testing purposes (is adding items on each start)
        console.log("init: populate DB");
        todolistPopulateDB();
        
        //initializes initial view of todo-items
        console.log("init: get all notebooks");
        todolistGetAllNotebooks();
    }
    
    // TODO document.bind pageinit, maybe necessary because of timing
};

function init() {
    console.log("entered init");
    document.addEventListener("deviceready", onDeviceReady, true);

    document.getElementById('api-intro').style.display = 'block';
    
    $("[data-role=header]").fixedtoolbar({ tapToggle: false });
    $("[data-role=footer]").fixedtoolbar({ tapToggle: false });
    
    console.log("registering add-item click event");
    
    //Event for Adding a List
    $("#add-list").click(function (e) {
        e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
        $("#add-list").removeClass("ui-btn-active");
        
        var addName = $("#add-name").val();
        
        if(addName == '') {
            // No text entered (empty string)
             $("label.error").text("Please enter a name!");
        } else if (addName.match(/^[a-zA-Z0-9\s\.]{3,100}$/)) { // Matches alphanumeric characters, space and .
        	$("label.error").text("");
        	// Entered text is valid
            onSuccessConfirmNotebook($("#add-name").val());
        } else {
            // Entered text is invalid (too short, too long or forbidden characters).
            $("label.error").text("Entered text is invalid!");
        }
    });
    
    $("#add-cancel").click(function (e) {
    	$("label.error").text("");
    });
    
    //everytime the input field gets focus, remove previous errors
    $('input#add-name').focus(function() {
    	$("label.error").text("");
    });
    
    //Event for adding a TODO Item (Testing)
    $("#add-item").click(function (e) {
    	e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
        $("#add-item").removeClass("ui-btn-active");

		var notebook = "List 1"; // TODO assign current notebook value here        
        var text = $("#add-text").val();
        
        if(text == '') {
            // No text entered (empty string)
             $("label.error").text("Please enter text for content!");
             // TODO AL: adjust regex below (add special characters like ?, !, etc.)
        } else if (text.match(/^[a-zA-Z0-9\s\.]{10,200}$/)) { // Matches alphanumeric characters, space and .
        	$("label.error").text("");
        	// Entered text is valid
            onSuccessConfirmAddItem(notebook, text);
        } else {
            // Entered text is invalid (too short, too long or forbidden characters).
            $("label.error").text("Entered text is invalid!");
        }
    });
    
  //everytime the input field gets focus, remove previous errors
    $('input#add-item').focus(function() {
    	$("label.error").text("");
    });
    
 /*   var showApi = function(e) {
        var apiId = this.id;
        var divs = document.getElementsByClassName('api-div');   
        for(var j=0; j<divs.length; j++) { 
            divs[j].style.display='none';
        }
        var apiEl = document.getElementById('api-' + apiId);
        apiEl.style.display = 'block';
        scroll(0,0);
    };
    // add click to each api name / div
    var apiList = document.getElementById('sidebar').getElementsByTagName('a');
    for(var i=0; i< apiList.length; i++) { 
        apiList[i].addEventListener('click', showApi, false);
    }

    var $select = document.getElementById('subheader').getElementsByTagName('select')[0];
    if ($select) {
        $select.addEventListener('change', function(e) {
            var api = this.options[this.selectedIndex].value;
            //alert("value: " + api);
            
            var divs = document.getElementsByClassName('api-div');   
            for(var j=0; j<divs.length; j++) { 
                divs[j].style.display='none';
            }
            document.getElementById('api-' + api).style.display = 'block';
            
        }, false);
    } else { alert("no select here"); } */
}
