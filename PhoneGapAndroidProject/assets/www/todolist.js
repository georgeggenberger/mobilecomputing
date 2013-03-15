
// Storage functions (using Web SQL Database)

var db = 0;
function todolistOpenDB()
{
    if (!db)
    {
        db = window.openDatabase("Database", "1.0", "Yet another TODO-List", 500000);
    }
}

function todolistPopulateDB(tx)
{
    //tx.executeSql('DROP TABLE IF EXISTS DEMO');
    tx.executeSql('CREATE TABLE IF NOT EXISTS TODOLIST (id unique, data, dayOfWeek)');
    tx.executeSql('INSERT INTO TODOLIST (id, data, dayOfWeek) VALUES (1, "Demo entry", "Tuesday")');
    //tx.executeSql('INSERT INTO TODOLIST (id, data, dayOfWeek) VALUES (1, "Another entry", null)');
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
    db.transaction(todolistPopulateDB, onError, onSuccessCreate);    
}

function todolistQuerySuccess(tx, results)
{
    // this will be empty since no rows were inserted.
    //console.log("Insert ID = " + results.insertId);
    // this will be 0 since it is a select statement
    //console.log("Rows Affected = " + results.rowAffected);
    // the number of rows returned by the select statement
    console.log("Num. Rows Returned = " + results.rows.length);
    document.getElementById('todo-sql-result').innerHTML = 
        "<strong>Rows Returned = " + results.rows.length +
        ", ResultObject = " + results.rows.item(0) +
        ", Id = " + results.rows.item(0).id +
        ", data = " + results.rows.item(0).data +
        ", DayOfWeek = " + results.rows.item(0).dayOfWeek +
        "</strong>";
}

function todolistQueryAllItems(tx)
{
    tx.executeSql('SELECT * FROM TODOLIST', [], todolistQuerySuccess, onError);
}
function todolistGetSqlResultSet()
{
    todolistOpenDB();
    db.transaction(todolistQueryAllItems, onError);    
}
