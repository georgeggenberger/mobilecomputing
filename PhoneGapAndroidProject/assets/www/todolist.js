
// Storage functions (using Web SQL Database)
//
// todolistCreateDB:
//		Creates the database (without dropping it)
// todolistDropDB: 
// 		Drops the database if already created
// todolistPopulateDB:
//		Adds 2 example entries to the database
// todolistAddItemToDB(notebook, title, noteText):
//		Adds an item to the DB with the arguments 'notebook', 'title', 'noteText'
//		All arguments are type of string, use empty string if no value given
// todolistModifyItemFromDB(id, newNoteText):
// 		Modifies the note text from the item with the given id.
// todolistDeleteItemFromDB:
//		Deletes the item with the according 'id' from the DB
// todolistGetAllItems:
//		Loops through all items in the database and writes the result to the 'todo-sql-result' HTML element
// todolistGetAllNotebooks:
//		Writes all available notebooks into the 'todo-sql-result' HTML element
// todolistGetItemsForNotebook(notebook)
//		Writes all items from given notebook into the 'todo-sql-result' HTML element

/*
var db = 0;
function todolistOpenDB()
{
    if (!db)
    {
        db = window.openDatabase("Database", "1.0", "Yet another TODO-List", 500000);
    }
} */

function onCreateDB(tx)
{
	// UTC timestamp is used for ID
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, notebook, title, noteText)');
} 

/*
function onDropDB(tx)
{
    tx.executeSql('DROP TABLE IF EXISTS TODOLIST');
} */

//DEMO-FUNCTION
function onPopulateDB(tx)
{
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, title, noteText) VALUES (' + new Date().getTime() + ', "List 1", "Demo entry", "This is a demo text 1")');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, title, noteText) VALUES (' + (new Date().getTime()+1) + ', "List 1", "Another entry", "This is a demo text 2")');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, title, noteText) VALUES (' + (new Date().getTime()+2) + ', "List 2", "Yet Another entry", "This is a demo text 2")');
    tx.executeSql('INSERT INTO TODOLIST (id, notebook, title, noteText) VALUES (' + (new Date().getTime()+3) + ', "List 2", "Yet Another entry 2", "This is a demo text 3")');
}

function onError(err)
{
   console.log("Error processing SQL statement: " + err.code);
   document.getElementById('todo-sql-result').innerHTML = "<strong>Error processing SQL statement: " + err.code + "</strong>";
}

function onSuccessManipulate()
{
   console.log("Success creating DB");
   document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
}

// -------------------------------------------------------------------------------------------------------------------
// ACTION FUNCTIONS
function todolistCreateDB()
{
    //todolistOpenDB();
    db.transaction(onCreateDB, onError, onSuccessManipulate);    
} 

/*
function todolistDropDB()
{
    //todolistOpenDB();
    db.transaction(onDropDB, onError, onSuccessManipulate);    
}
*/

//DEMO-FUNCTION
function todolistPopulateDB()
{
    //todolistOpenDB();
    db.transaction(onPopulateDB, onError, onSuccessManipulate);    
}

function todolistAddItemToDB(notebook, title, noteText)
{
	var onAddItem = function(tx)
	{
		tx.executeSql('INSERT INTO TODOLIST (id, notebook, title, noteText) VALUES (' + new Date().getTime() + ', "' + notebook + '", "' + title + '", "' + noteText + '")');
	};
	
    //todolistOpenDB();
    db.transaction(onAddItem, onError, onSuccessManipulate);    
}

function todolistModifyItemFromDB(id, newNoteText)
{
	var onModifyItem = function(tx)
	{
		tx.executeSql('UPDATE TODOLIST SET noteText="' + newNoteText + '" WHERE id=' + id);
	};
	
	//todolistOpenDB();
    db.transaction(onModifyItem, onError, onSuccessManipulate);    
}

function todolistDeleteItemFromDB(id)
{
	var onDeleteItem = function(tx)
	{
		tx.executeSql('DELETE FROM TODOLIST WHERE id=' + id);
	};
	
    //todolistOpenDB();
    db.transaction(onDeleteItem, onError, onSuccessManipulate);    
}

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
	        ", Title = " + results.rows.item(i).title +
	        ", NoteText = " + results.rows.item(i).noteText + " ]<br/>";
    }
    document.getElementById('todo-sql-result').innerHTML = resultString;
}

//creation of accordion items: http://jquerymobile.com/demos/1.2.1/docs/content/content-collapsible-set.html
function onSuccessSelectLists(tx, results)
{
    console.log("Num. Rows Returned = " + results.rows.length);
    var resultString = "";
    
    for (var i = 0; i < results.rows.length; i++)
    {
    	resultString = resultString +
    		"<div data-role='collapsible'><h3>" + results.rows.item(i).notebook + "</h3>" +
    		"<p>[ Row " + i +
	        ", ResultObject = " + results.rows.item(i) +
	        ", ID (Timestamp) = " + results.rows.item(i).id +
	        ", Notebook = " + results.rows.item(i).notebook +
	        ", Title = " + results.rows.item(i).title +
	        ", NoteText = " + results.rows.item(i).noteText + " ]</p></div>";
    }
   
    document.getElementById('view-block').innerHTML = resultString;
    
    $("div[data-role='collapsible-set']").collapsibleset('refresh');
}

function todolistGetAllItems()
{
	var onQueryAllItems = function(tx)
	{
	    tx.executeSql('SELECT * FROM TODOLIST', [], onSuccessSelect, onError);
	}

    //todolistOpenDB();
    db.transaction(onQueryAllItems, onError);    
}

function todolistGetAllNotebooks()
{
	var onQueryNotebooks = function(tx)
	{
	    tx.executeSql('SELECT DISTINCT(notebook) FROM TODOLIST', [], onSuccessSelectLists, onError);
	};

    //todolistOpenDB();
    db.transaction(onQueryNotebooks, onError);    
}

function todolistGetItemsForNotebook(notebook)
{
	var onQueryItemsForNotebook = function(tx)
	{
	    tx.executeSql('SELECT * FROM TODOLIST WHERE notebook="' + notebook + '"', [], onSuccessSelect, onError);
	};

    //todolistOpenDB();
    db.transaction(onQueryItemsForNotebook, onError);    
}

