
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
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, data, dayOfWeek)');
}
function onPopulateDB(tx)
{
    tx.executeSql('INSERT INTO TODOLIST (id, data, dayOfWeek) VALUES (1, "Demo entry", "Tuesday")');
    tx.executeSql('INSERT INTO TODOLIST (id, data, dayOfWeek) VALUES (2, "Another entry", null)');
}
function onError(err)
{
   console.log("Error processing SQL statement: " + err.code);
   document.getElementById('todo-sql-result').innerHTML = "<strong>Error processing SQL statement: " + err.code + "</strong>";
}
function onSuccessCreate()
{
   console.log("Success creating DB");
   document.getElementById('todo-sql-result').innerHTML = "<strong>Success creating Database 1.0</strong>";
}

function todolistCreateDB()
{
    todolistOpenDB();
    db.transaction(onCreateDB, onError, onSuccessCreate);    
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
	        ", Data = " + results.rows.item(i).data +
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
