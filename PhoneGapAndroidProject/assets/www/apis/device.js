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
	
	//if page is not main, then go back in history, else exit the app!
	if($.mobile.activePage.attr('id') != 'main')
		 navigator.app.backHistory();
	else
		navigator.app.exitApp();
}

//Confirm Dialog (very cool callback)
function areYouSure(callback) {
	  $("#sure .sure-do").unbind("click.sure").on("click.sure", function() {
	    callback();
	    $(this).off("click.sure");
	  });
	  $.mobile.changePage("#sure", { transition: "flip" });
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
        //console.log("init: drop old DB");
        //todolistDropDB();
        
        //creating table for TODO-Lists
        console.log("init: create DB");
        todolistCreateDB();
        
        //only for testing purposes (is adding items on each start)
        //console.log("init: populate DB");
        //todolistPopulateDB();
        
        //initializes initial view of todo-items
        console.log("init: get all notebooks");
        todolistGetAllNotebooks();
    }
};

//init() replaced by JQM event (TODO test this on real device)
//This section is loaded at the pages
$(document).on('pageinit', 'div:jqmData(role="page")', function(e) { 
    console.log("entered init for pages");
    
    document.addEventListener("deviceready", onDeviceReady, true);

    document.getElementById('api-intro').style.display = 'block';
    
    $("[data-role=header]").fixedtoolbar({ tapToggle: false });
    $("[data-role=footer]").fixedtoolbar({ tapToggle: false });
    
    //pageshow Event for the Main Page
    $("#main").live('pageshow', function () {
    	
    	//remove content of dialog inputs
    	$("input#add-name").val('');
    	$("input#add-text").val('');
    	//remove errors from label
    	$("label.error").text("");
    	
    	//testing scrolling to expanded list:
		//console.log("TESTING SCROLL: " + $('div[class^="ui-collapsible"]:not(.ui-collapsible-collapsed)').offset().top);
    	
		//scroll to expanded accordion item
		$.mobile.silentScroll($('div[class^="ui-collapsible"]:not(.ui-collapsible-collapsed)').offset().top);
    });
    
    //pageshow Event for Adding List Dialog
    $("#add-dialog-list").live('pageshow',function() {
    	$("#add-name").focus();
    });
    
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
        } else if (addName.match(/^[a-zA-ZäöüßÄÖÜ0-9\s\.]{3,100}$/)) { // Matches alphanumeric characters, space and .
        	$("label.error").text("");
        	// Entered text is valid, interaction function is called
            confirmAddNotebook(addName);
        } else {
            // Entered text is invalid (too short, too long or forbidden characters).
            $("label.error").text("Entered text is invalid!");
        }
    });
    
    //pageshow Event for adding a TODO Dialog
    $("#add-dialog-item").live('pageshow',function() {
    	$("#add-text").focus();
    });
    
    //Event for adding a TODO Item
    $("#add-item").click(function (e) {
    	e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
        $("#add-item").removeClass("ui-btn-active");

		var notebook = $("#add-item").closest('div[data-role="content"]').attr('id');
		console.log("Notebook to add to " + notebook);
        var text = $("#add-text").val();
        
        if(text == '') {
            // No text entered (empty string)
             $("label.error").text("Please enter text for content!");
             // TODO AL: adjust regex below (add special characters like ?, !, etc.)
        } else if (text.match(/^[a-zA-ZäöüßÄÖÜ0-9\s\.\,\@\#\&\%\;\:\+\-\_\*\(\)\[\]\'\"\?\!\\\/]{5,200}$/)) {
        	// Matches alphanumeric characters (5-200), space and following special characters: .,'"-_@#&%;:+-*/()[]?!
        	$("label.error").text("");
        	// Entered text is valid, interaction function is called
            confirmAddItem(notebook, text);
            
        } else {
            // Entered text is invalid (too short, too long or forbidden characters).
            $("label.error").text("Entered text is invalid!");
        }
    });
    
    //pageshow Event for editing a TODO Dialog
    $("#edit-dialog-item").live('pageshow',function() {
    	$("#edit-text").focus();
    });
    
    //Event for editing a TODO Item
    $("#edit-item").click(function (e) {
    	e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
        $("#edit-item").removeClass("ui-btn-active");
        
		var todoId = $("#edit-item").closest('div[data-role="content"]').attr('id');
		console.log("Id to edit " + todoId);
        var text = $("#edit-text").val();
        
        if(text == '') {
            // No text entered (empty string)
             $("label.error").text("Please enter text for content!");
             // TODO AL: adjust regex below (add special characters like ?, !, etc.)
        } else if (text.match(/^[a-zA-ZäöüßÄÖÜ0-9\s\.\,\@\#\&\%\;\:\+\-\_\*\(\)\[\]\'\"\?\!\\\/]{5,200}$/)) {
        	// Matches alphanumeric characters (5-200), space and following special characters: .,'"-_@#&%;:+-*/()[]?!
        	$("label.error").text("");
        	// Entered text is valid
        	confirmModifyItem(todoId, text);
            
        } else {
            // Entered text is invalid (too short, too long or forbidden characters).
            $("label.error").text("Entered text is invalid!");
        }
    });
    
    //Event for deleting a TODO Item
    $('#delete-item').click(function (e) {
    	e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
    	console.log("Delete event fired!");
    	$("#delete-item").removeClass("ui-btn-active");
    	 
    	var todoId = $("#edit-item").closest('div[data-role="content"]').attr('id');
    	
    	areYouSure(function() {
    		confirmDeleteItem(todoId);
    	});
    });
});

//init() replaced by JQM event (TODO test this on real device)
//This section is loaded at the dialogs
$(document).on('pageinit', 'div:jqmData(role="dialog")', function(e) { 
    console.log("entered init for dialogs");
    
	//Everytime the dialog is cancelled, empty error label
	$("#add-cancel").click(function (e) {
		$("label.error").text("");
	});
	
	//Everytime the input fields get focus, remove previous errors
	$('input#add-name, input#add-text, input#edit-text').focus(function() {
		$("label.error").text("");
	});
});
