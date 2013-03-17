
// Storage functions (using Web SQL Database)
//
// todolistCreateDB:
//		Creates the database (without dropping it)
// todolistDropDB: 
// 		Drops the database if already created
// todolistPopulateDB:
//		Adds 2 example entries to the database
// todolistAddItemToDB:
//		Adds an item to the DB with the arguments 'title', 'noteText', 'dayOfWeek' and 'location'
//		All arguments are type of string, use empty string if no value given
// todolistGetSqlResultSet:
//		Loops through all items in the database and writes the result to the 'todo-sql-result' HTML element

var db = 0;
function todolistOpenDB()
{
    if (!db)
    {
        db = window.openDatabase("Database", "1.0", "Yet another TODO-List", 500000);
    }
}

function onCreateDB(tx)
{
	// UTC timestamp is used for ID
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, title, noteText, dayOfWeek, location)');
}
function onDropDB(tx)
{
    tx.executeSql('DROP TABLE IF EXISTS TODOLIST');
}
function onPopulateDB(tx)
{
    tx.executeSql('INSERT INTO TODOLIST (id, title, noteText, dayOfWeek, location) VALUES (' + new Date().getTime() + ', "Demo entry", "This is a demo text", "Tuesday", "")');
    tx.executeSql('INSERT INTO TODOLIST (id, title, noteText, dayOfWeek, location) VALUES (' + new Date().getTime() + ', "Another entry", "Test 1 2", "", "")');
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

function todolistCreateDB()
{
    todolistOpenDB();
    db.transaction(onCreateDB, onError, onSuccessManipulate);    
}
function todolistDropDB()
{
    todolistOpenDB();
    db.transaction(onDropDB, onError, onSuccessManipulate);    
}
function todolistPopulateDB()
{
    todolistOpenDB();
    db.transaction(onPopulateDB, onError, onSuccessManipulate);    
}

function todolistAddItemToDB(title, noteText, dayOfWeek, location)
{
	var onAddItem = function(tx)
	{
		tx.executeSql('INSERT INTO TODOLIST (id, title, noteText, dayOfWeek, location) VALUES (' + new Date().getTime() + ', "' + title + '", "' + noteText + '", "' + dayOfWeek + '", "' + location + '")');
	};
	
    todolistOpenDB();
    db.transaction(onAddItem, onError, onSuccessManipulate);    
}

function onSuccessSelect(tx, results)
{
    console.log("Num. Rows Returned = " + results.rows.length);
    var resultString = "<strong>Rows Returned = " + results.rows.length;
    for (var i = 0; i < results.rows.length; i++)
    {
    	resultString = resultString +
    		" [ Row " + i +
	        //", ResultObject = " + results.rows.item(i) +
	        ", ID (Timestamp) = " + results.rows.item(i).id +
	        ", Title = " + results.rows.item(i).title +
	        ", NoteText = " + results.rows.item(i).noteText +
	        ", DayOfWeek = " + results.rows.item(i).dayOfWeek + " ]";
    }
    resultString = resultString + "</strong>"
    document.getElementById('todo-sql-result').innerHTML = resultString;
}

function onQueryAllItems(tx)
{
    tx.executeSql('SELECT * FROM TODOLIST', [], onSuccessSelect, onError);
}
function todolistGetSqlResultSet()
{
    todolistOpenDB();
    db.transaction(onQueryAllItems, onError);    
}
