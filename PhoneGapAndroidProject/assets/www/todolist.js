
// Storage functions (using Web SQL Database)

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
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, title, noteText, dayOfWeek, location)');
}
function onDropDB(tx)
{
    tx.executeSql('DROP TABLE IF EXISTS TODOLIST');
}
function onPopulateDB(tx)
{
    tx.executeSql('INSERT INTO TODOLIST (id, title, noteText, dayOfWeek, location) VALUES (' + new Date().getTime() + ', "Demo entry", "This is a demo text", "Tuesday", null)');
    tx.executeSql('INSERT INTO TODOLIST (id, title, noteText, dayOfWeek, location) VALUES (' + new Date().getTime() + ', "Another entry", "Test 1 2", null, null)');
}
function onError(err)
{
   console.log("Error processing SQL statement: " + err.code);
   document.getElementById('todo-sql-result').innerHTML = "<strong>Error processing SQL statement: " + err.code + "</strong>";
}
function onSuccessCreate()
{
   console.log("Success creating DB");
   document.getElementById('todo-sql-result').innerHTML = "<strong>Success manipulating DB</strong>";
}

function todolistCreateDB()
{
    todolistOpenDB();
    db.transaction(onCreateDB, onError, onSuccessCreate);    
}
function todolistDropDB()
{
    todolistOpenDB();
    db.transaction(onDropDB, onError, onSuccessCreate);    
}
function todolistPopulateDB()
{
    todolistOpenDB();
    db.transaction(onPopulateDB, onError, onSuccessCreate);    
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
	        ", ID = " + results.rows.item(i).id +
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
