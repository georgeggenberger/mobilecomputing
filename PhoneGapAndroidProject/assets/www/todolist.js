
// Storage functions (using Web SQL Database)
//
// todolistCreateDB:
//		Creates the database (without dropping it)
// todolistDropDB: 
// 		Drops the database if already created
// todolistPopulateDB:
//		Adds 2 example entries to the database
// todolistAddItemToDB(notebook, noteText, finished):
//		Adds an item to the DB with the arguments 'notebook', 'noteText', 'finished'
//		First 2 arguments are type of string (use empty string if no value given), last argument is integer (0 for unfinished, 1 for finished)
// todolistModifyItemText(id, newNoteText)
// 		Modifies the note text from the item with the given id.
// todolistModifyItemFinished(id, finished)
// 		Modifies the finished flag (0 or 1) for the item with the given id.
// todolistDeleteItemFromDB(id):
//		Deletes the item with the according 'id' from the DB
// todolistAddNotebook(notebook):
//		Adds an empty notebook to the DB
// todolistDeleteNotebook(notebook):
//		Deletes a notebook with all entries
// todolistGetAllItems:
//		Loops through all items in the database and writes the result to the 'todo-sql-result' HTML element
// todolistGetAllNotebooks:
//		Writes all available notebooks into the 'todo-sql-result' HTML element
// todolistGetItemsForNotebook(notebook)
//		Writes all items from given notebook into the 'todo-sql-result' HTML element

//Initial DB creation
function onCreateDB(tx)
{
	// UTC timestamp is used for ID
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, notebook, noteText, finished)');
} 

//JUST FOR TESTING PURPOSES
function onDropDB(tx)
{
    tx.executeSql('DROP TABLE IF EXISTS TODOLIST');
}

//JUST FOR TESTING PURPOSES
function todolistDropDB()
{
    db.transaction(onDropDB, onError, onSuccessManipulate);    
}

//DEMO-FUNCTION
function onPopulateDB(tx)
{
//    //CREATE Notebook Items
	tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime()+10 + ', "List 1", null, null)');
	tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime()+20 + ', "List 2", null, null)');
	tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime()+30 + ', "List 3", null, null)');
//	//JUST FOR TESTING INSERT ITEMS
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+1) + ', "List 1", "This is a demo text 2", 1)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+2) + ', "List 2", "This is yet another demo text", 0)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+3) + ', "List 2", "This is a demo text 3", 1)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+4) + ', "List 3", "This is a demo text 4", 0)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (12345, "List 1", "This is a demo text with hardcoded ID", 0)');
}

//Basic error functions
function onError(err)
{
   console.log("Error processing SQL statement, Error=" + err.code + ", Msg: " + err.message);
   //document.getElementById('todo-sql-result').innerHTML = "<strong>Error processing SQL statement: " + err.code + "</strong>";
}

function onSuccessManipulate()
{
   console.log("Success manipulating DB");
   //document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
}

/*
function onSuccessUpdateDOM() 
{
	console.log("Success manipulating DB");
	document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
} */

//-------------------------------------------------------------------------------------------------------------------
//UI INTERACTION FUNCTIONS
function confirmAddNotebook(name)
{
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			console.log("Notebook=" + name + " found!");
			//put error in dialog
			$("label.error").text("Name already exists!");
			//$("input#add-name").val('');
		} else {
			//add notebook and update DOM
			todolistAddNotebook(name); 
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		}
	};
	
	var onQueryItemsForNotebook = function(tx)
	{
	    tx.executeSql('SELECT DISTINCT(notebook) FROM TODOLIST WHERE notebook="' + name + '"', [], onSuccessCheck, onError);
	};

	db.transaction(onQueryItemsForNotebook, onError); 
	
	//document.getElementById('todo-sql-result').innerHTML = "<strong>Input from Dialog received: " + name + "</strong>";
}

function confirmAddItem(notebook, text)
{
	console.log("Add item to Notebook=" + notebook + ", text=" + text);

	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			//add item to notebook and update DOM
			todolistAddItemToDB(notebook, text, 0); 
			
            //we have to do this because new item won't show up in DOM after clicking the button an returning to the main page
            todolistGetItemsForNotebook(notebook);
            
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		} else {
			console.log("Notebook=" + notebook + " not found!");
			//put error in dialog
			$("label.error").text("Notebook doesn't exist!");
		}
	};
	
	var onQueryItemsForNotebook = function(tx)
	{
	    tx.executeSql('SELECT DISTINCT(notebook) FROM TODOLIST WHERE notebook="' + notebook + '"', [], onSuccessCheck, onError);
	};

	db.transaction(onQueryItemsForNotebook, onError); 
	
	//document.getElementById('todo-sql-result').innerHTML = "<strong>Add item to notebook " + notebook + ", Text: " + text + "</strong>";
}

function confirmModifyItem(id, text)
{
	console.log("Modify item with id=" + id + ", text=" + text);
	
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			//add item and update DOM
			todolistModifyItemText(id, text); 
			
			var notebook = $("#add-item").closest('div[data-role="content"]').attr('id');
            //we have to do this because new item won't refresh in DOM after clicking the button an returning to the main page
            todolistGetItemsForNotebook(notebook);
			
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		} else {
			// if id doesn't exists -> show error 
			$("label.error").text("Item with ID doesn't exist!");
		}
	};
	
	var onQueryItemsForId = function(tx)
	{
	    tx.executeSql('SELECT * FROM TODOLIST WHERE id=' + id + '', [], onSuccessCheck, onError);
	};

	db.transaction(onQueryItemsForId, onError); 
	
	//document.getElementById('todo-sql-result').innerHTML = "<strong>Modify item with id=" + id + ", Text: " + text + "</strong>";
}

function confirmDeleteItem(id)
{
	console.log("Delete item with id=" + id);
	
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			//delete item and update DOM
			todolistDeleteItemFromDB(id); 
			
			var notebook = $("#add-item").closest('div[data-role="content"]').attr('id');
			
			console.log("Delete and get items for Notebook=" + notebook )
			//we have to do this because new item won't refresh in DOM after clicking the button an returning to the main page
            todolistGetItemsForNotebook(notebook);
            
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		} else {
			// if id doesn't exists -> show error 
			$("label.error").text("Item with ID doesn't exist!");
		}
	};
	
	var onQueryItemsForId = function(tx)
	{
	    tx.executeSql('SELECT * FROM TODOLIST WHERE id=' + id + '', [], onSuccessCheck, onError);
	};

	db.transaction(onQueryItemsForId, onError); 
	
	//document.getElementById('todo-sql-result').innerHTML = "<strong>Delete item with id=" + id + ", Text: " + text + "</strong>";
}

// -------------------------------------------------------------------------------------------------------------------
// DATABASE FUNCTIONS -- SETTER
function todolistCreateDB()
{
    db.transaction(onCreateDB, onError, onSuccessManipulate);    
} 

//DEMO-FUNCTION
function todolistPopulateDB()
{
    db.transaction(onPopulateDB, onError, onSuccessManipulate);    
}

function todolistAddItemToDB(notebook, noteText, finished)
{
	var onAddItem = function(tx)
	{
		tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime() + ', "' + notebook + '", "' + noteText + '", ' + finished + ')');
	};
	
    db.transaction(onAddItem, onError, onSuccessManipulate);    
}

function todolistModifyItemText(id, newNoteText)
{
	var onModifyItem = function(tx)
	{
		tx.executeSql('UPDATE TODOLIST SET noteText="' + newNoteText + '" WHERE id=' + id + '');
	};
	
    db.transaction(onModifyItem, onError, onSuccessManipulate);    
}

function todolistModifyItemFinished(id, finished)
{
	var onModifyItem = function(tx)
	{
		tx.executeSql('UPDATE TODOLIST SET finished=' + finished + ' WHERE id=' + id + '');
	};
	
    db.transaction(onModifyItem, onError, onSuccessManipulate);    
}

function todolistDeleteItemFromDB(id)
{
	var onDeleteItem = function(tx)
	{
		tx.executeSql('DELETE FROM TODOLIST WHERE id=' + id + '');
	};
	
    db.transaction(onDeleteItem, onError, onSuccessManipulate);    
}

function todolistAddNotebook(notebook)
{
	var onAddNotebook = function(tx)
	{		
		tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime() + ', "' + notebook + '", null, null)');
	};
	
	var onSuccessUpdate = function()
	{
		var resultString = 
    		"<div id='" + notebook + "' data-role='collapsible'><h3>" + 
    		notebook + "</h3><p>" +
    		"</p></div>"; 
    	
    	$("div[data-role='collapsible-set']").prepend(resultString);
    	
    	//binding event to notebook element
    	bindListEvent(notebook);
    	
	    $("div[data-role='collapsible-set']").find('div[data-role=collapsible]').collapsible();  
	    $("div[id='"+ notebook + "']").trigger('expand');
	    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
		
		console.log("Notebook=" + notebook + " added!");
	    //document.getElementById('todo-sql-result').innerHTML = "<strong>Notebook: " + notebook + " added!</strong>";
	    
	};
	
	db.transaction(onAddNotebook, onError, onSuccessUpdate);
}

function todolistDeleteNotebook(notebook)
{
	var onSuccessUpdate = function(tx)
	{
		console.log("Noteboook " + notebook + " deleted!");
		//removing the notebook from DOM
		$("div[id='" + notebook + "']").remove();
		$("div[data-role='collapsible-set']").collapsibleset('refresh'); 
	}
	
	var onDeleteNotebook = function(tx)
	{
		tx.executeSql('DELETE FROM TODOLIST WHERE notebook="' + notebook + '"');
	};
	
    db.transaction(onDeleteNotebook, onError, onSuccessUpdate);    
}

//-------------------------------------------------------------------------------------------------------------------
//DATABASE FUNCTIONS -- GETTER

function todolistGetAllNotebooks()
{
	var onQueryNotebooks = function(tx)
	{
	    tx.executeSql('SELECT DISTINCT(notebook) FROM TODOLIST ORDER BY id DESC', [], onSuccessSelectLists, onError);
	};

  db.transaction(onQueryNotebooks, onError);    
}

function todolistGetItemsForNotebook(notebook)
{
	var onQueryItemsForNotebook = function(tx)
	{
	    //tx.executeSql('SELECT * FROM TODOLIST WHERE title IS NOT NULL AND notebook="' + notebook + '" ORDER BY id DESC', [], onSuccessSelectItems, onError);
	    tx.executeSql('SELECT * FROM TODOLIST WHERE notebook="' + notebook + '" ORDER BY id DESC', [], onSuccessSelectItems, onError);
	};

  db.transaction(onQueryItemsForNotebook, onError);    
}

//-------------------------------------------------------------------------------------------------------------------
//EVENT FUNCTIONS

//creating of accordion content of expanded item dynamically
//TODO this is too complex and already creates some little sideeffects
function onSuccessSelectItems(tx, results)
{
    console.log("Items returned=" + results.rows.length);
    
    var notebookName = results.rows.item(0).notebook;
    
	$("div[id='" + notebookName + "']").find('div[class="ui-collapsible-content"]').empty();
       
    var resultString = "<fieldset data-role='controlgroup'>";	
	
    for (var i = 0; i < results.rows.length; i++)
    {
    	// Remark: if 'results.rows.item(i).title' is null, then it's a placeholder item for a notebook and could be ignored
    	if (results.rows.item(i).noteText != null)
    	{
    		var checked = '';
    		if(results.rows.item(i).finished)
    			checked = 'checked="checked"';
    		
    		var idDate = new Date(results.rows.item(i).id);
    		var datePrefix = idDate.toLocaleDateString();
    		if (datePrefix == new Date().toLocaleDateString()) // if note was created today
    		{
    			datePrefix = idDate.toLocaleTimeString();
    		}
    		
    		//Attention: Please keep container (in this case <p>) for each item
    		// we need that for getting the text for edit!
		     resultString += 
		     	'<p class="todo-item">' + 
		     	'<input type="checkbox" name="checkbox" id="' + 
		     	results.rows.item(i).id + '" ' + checked + '>' +
		     	'<span>' + datePrefix + ' </span>' +
		     	'<label for="checkbox">' +
		     	results.rows.item(i).noteText +
		     	'</label>' + 
		     	'<a href="#" data-role="button" data-icon="edit" data-iconpos="notext" class="check-icon" id="Item_' + results.rows.item(i).id +
		     	'" rel="external">EDIT</a></p>';
		     	/*
		     	'<a href="#" id="Item_' + results.rows.item(i).id +
		     	'" rel="external">EDIT</a></p>';
		     	*/
		 }
    }
    resultString += "</fieldset>";
    resultString += "<a data-role='button' data-corners='false' data-icon='plus' data-theme='b' data-iconpos='right' " + 
	"href='#add-dialog-item' data-rel='dialog' data-transition='slide' data-mini='true'>Add TODO-Item</a>";
    /* button for delete List */
    resultString += "<p><a data-role='button' data-corners='false' data-icon='minus' data-theme='e' data-iconpos='right' " + 
	"href='#' data-transition='flip' data-mini='true' id='delete-list'>Delete " + notebookName + "</a><p>";
    
    $("div[id='" + notebookName + "']").find('div[class="ui-collapsible-content"]').append(resultString);
    $("div[id='" + notebookName + "']").find('a[data-role="button"]').button();
    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
    
    //adding id to content, we need the notebook name afterwards (a bit dirty)
    $("#add-dialog-item").find('div[data-role="content"]').attr('id', notebookName);
    
    //here we add an event to TODO-item checkboxes
    $('input[name="checkbox"]').click(function(e) {
    	if ($(this).is(":checked")) {
    		todolistModifyItemFinished($(this).attr('id'), 1);
    	} else {
    		todolistModifyItemFinished($(this).attr('id'), 0);
    	}
    });
    
    //here we add an event for EDIT button
    $('a[id^="Item_"]').click( function(e) {
    	//extract id from item with split
        var todoId = $(this).attr('id').split("_")[1];
        //extract text from item
        var todoText = $(this).siblings('label[for="checkbox"]').text();
        
    	console.log("Current Id= " + todoId);
    	console.log("Current Text=" + todoText);
    	$("#edit-dialog-item").find('input[name="name"]').val(todoText);
    	
        //adding id to content, we need the todo id afterwards (a bit dirty)
        $("#edit-dialog-item").find('div[data-role="content"]').attr('id', todoId);
        	
    	$.mobile.changePage("#edit-dialog-item", { transition: "slide"});	
    });
    
    //Event for Deleting a List
    $("div[id='" + notebookName + "']").find("#delete-list").click(function(e){
    	e.stopImmediatePropagation();
        //stop default action every time
        e.preventDefault();
    	console.log("Delete event fired!");
    	$(this).removeClass("ui-btn-active");
    	
    	//see callback function in device.js
    	areYouSure(function() {
    		todolistDeleteNotebook(notebookName);
    	});
    });
}

//creation of accordion items: http://jquerymobile.com/demos/1.2.1/docs/content/content-collapsible-set.html
function onSuccessSelectLists(tx, results)
{
    console.log("Lists - Num. Rows Returned = " + results.rows.length);
    
    $("div[data-role='collapsible-set']").empty();
    
    for (var i = 0; i < results.rows.length; i++)
    {
    	 var resultString = 
    		"<div id='" + results.rows.item(i).notebook + "' data-role='collapsible'><h3>" + 
    		results.rows.item(i).notebook + "</h3>" +
    		"</div>"; 
    	
    	$("div[data-role='collapsible-set']").append(resultString); 
    	
    	//binding event to notebook element
    	bindListEvent(results.rows.item(i).notebook);
    }
    
    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
}

//-------------------------------------------------------------------------------------------------------------------
//Event-listener for expanding Notebook
//=> used in todolistAddNotebook
//=> used in onSucessSelectLists
function bindListEvent(notebook)
{
	//BOTH EVENTS are working
	$("div[id='" + notebook + "']").bind('expand', function () {
	//$("div[id='" + notebook + "']").bind('tap taphold swipe swiperight swipeleft', function(event, ui) {
		
		console.log("Event expand Notebook=" + notebook);
			
		todolistGetItemsForNotebook(notebook);
	});
}
