//*****************************************************************
// Script di catalogo, proprietà di Pearson Italia s.p.a.
// È vietata la riproduzione, anche parziale, del codice seguente
//
//*****************************************************************

$(document).ready(function() { 
	
	function nascondiDiv() {
		$('div[id!=pearson]').hide();
	}
	
	$( "#interrompi" ).button();
	$( "#interrompi" ).click(function() {nascondiDiv();return false; });
	
	$( "#aggiorna" ).button();
	$( "#aggiorna" ).click(function() {nascondiDiv(); aggiorna('12/10/2012');return false; });
	
	// PER CRI: ecco qulche funzione utile!
	
	Titanium.API.info('apro il DB'); // Per scrivere nella finestra di debug
	
	//Scrive e legge variabili in modo da risordarsele da una sessione a quella successiva
	//comodissimo! una sola riga a salvi in JSON interi oggetti!
	/*
	Ti.App.Properties.setString("parVar", JSON.stringify(par.vars)); //scrivi preferenze
	par.vars = JSON.parse(Ti.App.Properties.getString("parVar")); //leggi preferenze
	*/

	//Apertura di un DB:
	//Il File di SQLite va copiato in Resources, lo puoi creare usando SQLite Manager plugin per FireFox
	//È bene richiamare il DB subito in apertura in modo da evitare il piccolo lag alla prima ricerca

	function aggiorna(dataOra) {
		alert("E che cavolo sto aggiornando!");
		$.get('http://catalogo.pearsonitalia.it/aggiorna.php?dataOra='+dataOra, function(data) {
			var dbf = Titanium.Database.install("catalogo.db", "catalogo"); // Installa il DB
			//var rs = dbf.execute("SELECT prezzo FROM catalogo WHERE id=0 LIMIT 1"); // testa una query
			var rs = dbf.execute(data); // esegui la query
			dbf.close();
		});
	}
});

