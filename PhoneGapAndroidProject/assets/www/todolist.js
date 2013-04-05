
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
// todolistGetAllItems:
//		Loops through all items in the database and writes the result to the 'todo-sql-result' HTML element
// todolistGetAllNotebooks:
//		Writes all available notebooks into the 'todo-sql-result' HTML element
// todolistGetItemsForNotebook(notebook)
//		Writes all items from given notebook into the 'todo-sql-result' HTML element


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

function todolistDropDB()
{
    db.transaction(onDropDB, onError, onSuccessManipulate);    
}

//DEMO-FUNCTION
function onPopulateDB(tx)
{
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + new Date().getTime() + ', "List 1", "This is a demo text 1", 0)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+1) + ', "List 1", "This is a demo text 2", 1)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+2) + ', "List 2", "This is yet another demo text", 0)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+3) + ', "List 2", "This is a demo text 3", 1)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (' + (new Date().getTime()+4) + ', "List 3", "This is a demo text 4", 0)');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, noteText, finished) VALUES (12345, "List 1", "This is a demo text with hardcoded ID", 0)');
}

function onError(err)
{
   console.log("Error processing SQL statement, Error=" + err.code + ", Msg: " + err.message);
   document.getElementById('todo-sql-result').innerHTML = "<strong>Error processing SQL statement: " + err.code + "</strong>";
}

function onSuccessManipulate()
{
   console.log("Success manipulating DB");
   document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
}

function onSuccessUpdateDOM() 
{
	console.log("Success manipulating DB");
	document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
}


function onSuccessConfirmNotebook(name)
{
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			console.log("Notebook found! " + name);
			//put error in dialog
			$("label.error").text("Name already exists!");
			//$("input#add-name").val('');
		}
		else
		{
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

function onSuccessConfirmAddItem(notebook, text)
{
	console.log("Add item to Notebook=" + notebook + ", Text:" + text);

	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			// add item to notebook and update DOM
			todolistAddItemToDB(notebook, text, 0); 
            //we have to do this because new item won't show up in DOM after clicking the button an returning to the main page
            todolistGetItemsForNotebook(notebook);
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });

			//testing scrolling to expanded list:
			console.log("TESTING: " + $('div[class^="ui-collapsible"]:not(.ui-collapsible-collapsed)').offset().top);
			
			//TODO: scrolling does not work
			//$.mobile.silentScroll($('div[class^="ui-collapsible"]:not(.ui-collapsible-collapsed)').offset().top);
		}
		else {
			console.log("Notebook not found: " + notebook);
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

function onSuccessConfirmModifyItem(id, text)
{
	console.log("Modify item with id=" + id + ", Text:" + text);
	
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			//add item and update DOM
			todolistModifyItemText(id, text); 
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		}
		else
		{
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

function onSuccessConfirmDeleteItem(id)
{
	console.log("Delete item with id=" + id);
	
	var onSuccessCheck = function (tx, results)
	{
		if (results.rows.length > 0)
		{
			//delete item and update DOM
			todolistDeleteItemFromDB(id); 
			//change to main page
			$.mobile.changePage("#main", {
		        transition: "slide",
		        reverse: true
		    });
		}
		else
		{
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
		// TODO we need to check if the name is already taken, we must not have same names here!
		// either exiting here or after input validation
		
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
	    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
		
		console.log("Notebook: " + notebook + " added!");
	    document.getElementById('todo-sql-result').innerHTML = "<strong>Notebook: " + notebook + " added!</strong>";
	    
	};
	
	db.transaction(onAddNotebook, onError, onSuccessUpdate);
}

//-------------------------------------------------------------------------------------------------------------------
//DATABASE FUNCTIONS -- GETTER
function todolistGetAllItems()
{
	var onQueryAllItems = function(tx)
	{
	    tx.executeSql('SELECT * FROM TODOLIST WHERE noteText IS NOT NULL ORDER BY id DESC', [], onSuccessSelect, onError);
	};

  db.transaction(onQueryAllItems, onError);    
}

// TODO sort by date, newest first?
function todolistGetAllNotebooks()
{
	var onQueryNotebooks = function(tx)
	{
	    tx.executeSql('SELECT DISTINCT(notebook) FROM TODOLIST', [], onSuccessSelectLists, onError);
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
function onSuccessSelect(tx, results)
{
    console.log("Num. Rows Returned = " + results.rows.length);
    var resultString = "<strong>Rows Returned = " + results.rows.length + "</strong><br/>";
    for (var i = 0; i < results.rows.length; i++)
    {
    	resultString = resultString +
    		" [ Row " + i +
	        //", ResultObject = " + results.rows.item(i) +
	        ", ID (Timestamp) = " + results.rows.item(i).id +
	        ", Notebook = " + results.rows.item(i).notebook +
	        ", NoteText = " + results.rows.item(i).noteText +
	        ", Finished = " + results.rows.item(i).finished +
	        " ]<br/>";
    }
    document.getElementById('todo-sql-result').innerHTML = resultString;
}

//creating of accordion content of expanded item dynamically
function onSuccessSelectItems(tx, results)
{
    console.log("Items - Num. Rows Returned = " + results.rows.length);
    
    var notebookName = results.rows.item(0).notebook;
    
	$("div[id='" + notebookName + "']").find('div[class="ui-collapsible-content"]').empty();
       
    var resultString = "<p><a data-role='button' data-corners='false' data-icon='plus' data-theme='b' data-iconpos='right' " + 
	"href='#add-dialog-item' data-rel='dialog' data-transition='slide' data-mini='true'>Add TODO-Item</a></p><p>";	
	
    for (var i = 0; i < results.rows.length; i++)
    {
    	// Remark: if 'results.rows.item(i).title' is null, then it's a placeholder item for a notebook and could be ignored
    	
    	resultString += " [ Row " + i +
	        //", ResultObject = " + results.rows.item(i) +
	        ", ID (Timestamp) = " + results.rows.item(i).id +
	        ", Notebook = " + results.rows.item(i).notebook +
	        ", NoteText = " + results.rows.item(i).noteText +
	        ", Finished = " + results.rows.item(i).finished +
	        " ] <br/>";
    }
    resultString += "</p>";
    
    $("div[id='" + notebookName + "']").find('div[class="ui-collapsible-content"]').append(resultString);
    $("div[id='" + notebookName + "']").find('a[data-role="button"]').button();
    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
    
    //adding id to content, we need the notebook name afterwards (a bit dirty)
    $("#add-dialog-item").find('div[data-role="content"]').attr('id', notebookName);
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
    		results.rows.item(i).notebook + "</h3><p>" +
    		"</p></div>"; 
    	
    	$("div[data-role='collapsible-set']").append(resultString); 
    	
    	//binding event to notebook element
    	bindListEvent(results.rows.item(i).notebook);
    }
    
    $("div[data-role='collapsible-set']").collapsibleset('refresh'); 
    
}

//Event-listener for expand
function bindListEvent(notebook)
{
	//BOTH EVENTS are working
	$("div[id='" + notebook + "']").bind('expand', function () {
	//$("div[id='" + notebook + "']").bind('tap taphold swipe swiperight swipeleft', function(event, ui) {
		
		console.log("Event Content = " + notebook);
			
		todolistGetItemsForNotebook(notebook);
	 });
}