const { log } = require('console');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const ejs = require('ejs');
const port = 3000;

app.set('view engine','ejs')

let db = new sqlite3.Database("Bookings.db" , (err) => {
	if(err)
	{
		console.log("Errore - " + err.message);
	}
	else
	{
		console.log("DataBase Bookings connesso");
	}
})

db.run('CREATE TABLE if not exists Biglietti (customername text, show text, num_ticket integer, posto text, tipo text, day text)')


app.use(express.static('public'));

app.use(express.static('public/media'));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/public/main_page.html'))
  });
 
// Inserisco i dati del form nella biglietteria all'interno del database
app.get('/confirm', (req, res) => {

	let sql = "INSERT INTO Biglietti VALUES(?,?,?,?,?,?)";
	db.run(sql,[req.query.customername,req.query.show,req.query.num_ticket,req.query.posto,req.query.tipo,req.query.day])
	
    res.render('risposta.ejs',req.query)

});

// Faccio una chiamata in modo tale da poter vedere lo storico delle prenotazioni 
// semplicemente digitando sulla barra dell'URL "/admin/bookings/"

// db.serialize mi serve per serializzare i dati del db
// db.all mi fa ritornare tutta la tabella biglietti siccome faccio select *

// Utilizzo il db.all al posto dell'each semplicemente perchè ritorno tutto in una volta
// mentre l'each avrebbe ritornato una riga alla volta (ma sarebbe andato bene lo stesso)

// Con il render inserisco nella pagina internet booking.ejs la variabile rows contenente la tabella

app.get('/admin/bookings', (req, res) => {
	
	db.serialize(() => {
		db.all("SELECT * FROM Biglietti", (err, rows) => {
			if (err){
				console.error(err.message);
			}
			res.render('bookings.ejs',{rows:rows});
		});
	});
	
});


app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
});
  