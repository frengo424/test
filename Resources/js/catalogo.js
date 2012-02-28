//*****************************************************************
// Script di catalogo, proprietà di Pearson Italia s.p.a.
// È vietata la riproduzione, anche parziale, del codice seguente
//
//*****************************************************************

$(document).ready(function() { 
	
	var lastUpdateDate = getLastUpdate();
	
	$("#recordNumber").val('0');
	$("#dateUpdate").val(lastUpdateDate);
	$("#ultimoAggiornamento").html(printDate(lastUpdateDate));
	
	$( "#interrompi" ).button();
	$( "#interrompi" ).click(function() { $( "#finestraAggiornamento" ).dialog('close'); return false; });

	$( "#aggiorna" ).button();
	$( "#aggiorna" ).click(function() {

		var loaderHtml = "";
		loaderHtml = loaderHtml+"<p id=\"loader-header\">Aggiornamento in corso..</p>";
		loaderHtml = loaderHtml+"<p id=\"loader-exp\">Non chiudere l'applicazione o il collegamento ad Internet durante il processo di aggiornamento del listino</p>";
		loaderHtml = loaderHtml+"<img src=\"img/loader.gif\" id=\"loader-img\" name=\"loader-img\" />";
		loaderHtml = loaderHtml+"<p id=\"loader-action\">Download aggiornamento</p>";
			
		$("#breadcrumbs").html('');
		$("#ricerca").html('');
		$("#contenuto").html(loaderHtml);
			
		$( "#finestraAggiornamento" ).dialog('close');

		setTimeout("aggiorna()",100);
		
		return false;
	});

	if (Titanium.Network.online) {
		
		verificaUpdate();	
	}
});

/* Funzioni Aggiornamento */

	function verificaUpdate(){
		
		$("#recordNumber").val('0');
		
		if (Titanium.Network.online) {
			
			$.ajaxSetup({ async:false });
			
			var lastUpdateDate = getLastUpdate();
		
			/* Estrazione eventuali record da aggiornare */
			
			$.get('http://listino.pearsonitalia.it/sqliteRecordNumber.action.php?lastupdate='+lastUpdateDate, function(data) {
				
				$("#recordNumber").val(data);
			});
		
			$.ajaxSetup({ async:true });
			
			if(parseInt($("#recordNumber").val())!=0) {
				
				$( "#finestraAggiornamento" ).dialog({ modal: true, width: 500, height:280 }); 
				$( "#nAggiornamenti" ).html($("#recordNumber").val());
			}

		} else {
			
			alert("Per effettuare un aggiornamento e' necessario essere connessi ad Internet");
		}
	}
	
	function aggiorna() {
		
		var dataOra = $("#dateUpdate").val();

		if (Titanium.Network.online) {
			
			$.ajaxSetup({ async:false });

			$.get('http://listino.pearsonitalia.it/sqliteUpdater.action.php?lastupdate='+dataOra, function(data) {
				
				$("#loader-action").html('Download terminato. Installazione aggiornamento');
				
				if(data!="") {
				
					var updateInfo = data.split("[[SEP]]");
					
					/*
						updateInfo[1] : numero record da aggiornare
						updateInfo[0] : stringa contenente tutti i volume_id nel db master
						updateInfo[2] : query di inserimento/modifica
					*/

					var dbPath = getDbPath();

					if (dbPath.exists()) {
			
    					var db = Titanium.Database.openFile(dbPath);
    		
    					/* DELETE */
    					
    					var sql = "SELECT volume_id FROM catalogo";
    		
    					var rs = db.execute(sql);
    					
    					while(rs.isValidRow()){
			
				 			if (updateInfo[0].indexOf("-"+rs.fieldByName("volume_id")+"-")==-1) {
				 				
				 				/* Il record non esiste nel DB master, quindi va cancellato in SQLite */
				 				
				 				sql = "DELETE FROM catalogo WHERE volume_id='"+rs.fieldByName("volume_id")+"'";
				 				
				 				db.execute(sql);
				 			}

							rs.next();
						}

						/* INSERT/UPDATE */
						
						var insertSql = updateInfo[2].split("[[SQL-SEP]]");
						var queryNumber = insertSql.length;
						
						for(var i=0;i<queryNumber;i++) {
							
							db.execute(insertSql[i]);
						}
						
						rs.close();
		
						db.close();
						
						var lastUpdateDate = getLastUpdate();
	
						$("#recordNumber").val('0');
						$( "#ultimoAggiornamento" ).html(printDate(lastUpdateDate));

						backHome();

					} else {
			
						alert("Database non trovato");
					}

				} else {
					
					alert("Errore durante l'aggiornamento");
				}
			});

			$.ajaxSetup({ async:true });
		
		} else {
			
			alert("Per effettuare un aggiornamento e' necessario essere connessi ad Internet");
		}
	}

/* Funzioni Navigazione */

	function getAreaName(areaId) {
		
		switch (areaId) {
			
			case '1':
				var areaName = "Scuola Primaria";
				break;
			case '2':
				var areaName = "Scuola Secondaria";
				break;
			case '555':
				var areaName = "Varia / Universit&agrave;";
				break;
		}
	
		return areaName;
	}
	
	function switchArea(areaId) {
		
		var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > "+getAreaName(areaId)+"</p>";
		
		switch (areaId) {
			
			case '1':
				var ricercaContent = "<fieldset><legend>Ricerca</legend>";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<select id=\"marchio_id\" class=\"first\"><option value=\"\">Marchio</option>"+printMarchio(areaId)+"</select>"; 
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"materiaStr\" name=\"materiaStr\" value=\"\" onclick=\"if ($(this).val()==$('#materiaStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#materiaStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />"; 
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"searchStr\" name=\"searchStr\" value=\"\" onclick=\"if ($(this).val()==$('#searchStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#searchStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"materiaStrLabel\" name=\"materiaStrLabel\" value=\"Materia\" />"; 
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"searchStrLabel\" name=\"searchStrLabel\" value=\"ISBN, autore o titolo\" />";  
				ricercaContent = ricercaContent+"<input type=\"button\" id=\"searchBtt\" name=\"searchBtt\" value=\"cerca\" onclick=\"startSearch()\" />"; 
				ricercaContent = ricercaContent+"</fieldset>";
				break;
			case '2':
				var ricercaContent = "<fieldset><legend>Ricerca</legend>";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<select id=\"macrodestinazione\" class=\"first\"><option value=\"\">Grado</option><option value=\" primo grado -\">Primo grado</option><option value=\" secondo grado -\">Secondo grado</option></select>"; 
				ricercaContent = ricercaContent+"<select id=\"marchio_id\"><option value=\"\">Marchio</option>"+printMarchio(areaId)+"</select>"; 
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"materiaStr\" name=\"materiaStr\" value=\"\" onclick=\"if ($(this).val()==$('#materiaStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#materiaStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"searchStr\" name=\"searchStr\" value=\"\" onclick=\"if ($(this).val()==$('#searchStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#searchStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"materiaStrLabel\" name=\"materiaStrLabel\" value=\"Materia\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"searchStrLabel\" name=\"searchStrLabel\" value=\"ISBN, autore o titolo\" />";  
				ricercaContent = ricercaContent+"<input type=\"button\" id=\"searchBtt\" name=\"searchBtt\" value=\"cerca\" onclick=\"startSearch()\" />"; 
				ricercaContent = ricercaContent+"</fieldset>";
				break;
			case '555':
				var ricercaContent = "<fieldset><legend>Ricerca</legend>";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<select id=\"macrodestinazione\" class=\"first\"><option value=\"\">Scegli</option><option value=\" varia -\">Varia</option><option value=\" università -\">Università</option></select>"; 
				ricercaContent = ricercaContent+"<select id=\"marchio_id\"><option value=\"\">Marchio</option><option value=\"32324\">Bruno Mondadori</option><option value=\"69291\">Pearson</option></select>"; 
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"materiaStr\" name=\"materiaStr\" value=\"\" onclick=\"if ($(this).val()==$('#materiaStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#materiaStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"searchStr\" name=\"searchStr\" value=\"\" onclick=\"if ($(this).val()==$('#searchStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#searchStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"materiaStrLabel\" name=\"materiaStrLabel\" value=\"Materia\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"searchStrLabel\" name=\"searchStrLabel\" value=\"ISBN, autore o titolo\" />";  
				ricercaContent = ricercaContent+"<input type=\"button\" id=\"searchBtt\" name=\"searchBtt\" value=\"cerca\" onclick=\"startSearch()\" />"; 
				ricercaContent = ricercaContent+"</fieldset>";
				break;
		}
			
		$( "#breadcrumbs" ).html(breadcrumbsContent);
		$( "#ricerca" ).html(ricercaContent);
		$( "#materiaStr" ).val($('#materiaStrLabel').val());
		$( "#searchStr" ).val($('#searchStrLabel').val());
		$( "#contenuto" ).html('');
	}
	
	function backHome() {
	
		var contenutoContent = "<h1>Catalogo Pearson Italia</h1><ul id=\"sceltaScuola\"><li><a href=\"Javascript:switchArea('1')\" id=\"scuolaPrimaria\">Scuola Primaria</a></li><li><a href=\"Javascript:switchArea('2')\" id=\"scuolaSecondaria\">Scuola Secondaria</a></li><li><a href=\"Javascript:switchArea('555')\" id=\"variaUniversita\">Varia / Universit&agrave;</a></li></ul>";
		
		$( "#breadcrumbs" ).html('');
		$( "#ricerca" ).html('');
		$( "#contenuto" ).html(contenutoContent);
	}
	
/* Funzioni accessorie */

	function printDate(dataOra) {
		
		/* Formatta dataOra */
		
		var dPart = dataOra.split("-");
		
		var formatDate = dPart[2]+"/"+dPart[1]+"/"+dPart[0];
		
		return formatDate;
	}
	
	function base64Encode(data){
		
		if (typeof(btoa) == 'function') return btoa(data);
		var b64_map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var byte1, byte2, byte3;
		var ch1, ch2, ch3, ch4;
		var result = new Array();
		var j=0;
		for (var i=0; i<data.length; i+=3) {
			byte1 = data.charCodeAt(i);
			byte2 = data.charCodeAt(i+1);
			byte3 = data.charCodeAt(i+2);
			ch1 = byte1 >> 2;
			ch2 = ((byte1 & 3) << 4) | (byte2 >> 4);
			ch3 = ((byte2 & 15) << 2) | (byte3 >> 6);
			ch4 = byte3 & 63;
		
			if (isNaN(byte2)) {
				ch3 = ch4 = 64;
			} else if (isNaN(byte3)) {
				ch4 = 64;
			}

			result[j++] = b64_map.charAt(ch1)+b64_map.charAt(ch2)+b64_map.charAt(ch3)+b64_map.charAt(ch4);
		}

		return result.join('');
	}

/* Estrazione dati da DB */

	function printMarchio(areaId) {
		
		var dbPath = getDbPath();

		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
  	
  			var sql = "SELECT DISTINCT opera_marchio_id, opera_marchio FROM catalogo";
  			
			switch (areaId) {
			
				case '1':
					sql = sql+" WHERE percorsi_html LIKE 'Scuola primaria%'";
    				break;
				case '2':
					sql = sql+" WHERE percorsi_html LIKE 'Scuola secondaria%'";
    				break;
				case '555':
						
					break;
			}

			var rs = db.execute(sql);

			var marchioHtml = "";
		
			while(rs.isValidRow()){
			
				marchioHtml = marchioHtml+"<option value=\""+rs.fieldByName("opera_marchio_id")+"\">"+rs.fieldByName("opera_marchio")+"</option>";

				rs.next();
			}
		
			rs.close();
		
			db.close();
		
			return marchioHtml;

		} else {
			
			alert("Database non trovato");
			
			return "";
		}
	}
	
	function startSearch() {
		
		var dbPath = getDbPath();

		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
    		
    		var isFilter = false;
    		
    		var sql = "SELECT volume_id, volume_isbn, volume_autori, volume_titolo, volume_sottotitolo, opera_marchio, percorsi_html, hex_copertina FROM catalogo";
    		
    		if ($("#searchStr").val()!="" & $("#searchStr").val()!=$("#searchStrLabel").val()) {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND (";
    				
    			} else {
    				
    				sql = sql+" WHERE (";
    			}
    			
    			sql = sql+" volume_isbn LIKE '%"+$("#searchStr").val()+"%'";
    			sql = sql+" OR volume_titolo LIKE '%"+$("#searchStr").val()+"%'";
    			sql = sql+" OR volume_autori LIKE '%"+$("#searchStr").val()+"%'";
    			sql = sql+" )";
    			
    			isFilter = true;
    		}
    		
    		if ($("#materiaStr").val()!="" & $("#materiaStr").val()!=$("#materiaStrLabel").val()) {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND percorsi_html LIKE '%"+$("#materiaStr").val()+"%'";
    				
    			} else {
    				
    				sql = sql+" WHERE percorsi_html LIKE '%"+$("#materiaStr").val()+"%'";
    			}

    			isFilter = true;
    		}
    		
    		if ($("#marchio_id").val()!="") {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND opera_marchio_id='"+$("#marchio_id").val()+"'";
    				
    			} else {
    				
    				sql = sql+" WHERE opera_marchio_id='"+$("#marchio_id").val()+"'";
    			}
    			
    			isFilter = true;
    		}
    		
    		if (document.getElementById('macrodestinazione')) {
    			
    			if ($("#macrodestinazione").val()!="") {
    				
    				if (isFilter) {
    				
    					sql = sql+" AND percorsi_html LIKE '%"+$("#macrodestinazione").val()+"%'";
    					
    				} else {
    				
    					sql = sql+" WHERE percorsi_html LIKE '%"+$("#macrodestinazione").val()+"%'";
    				}
    			
    				isFilter = true;
    			}
    		}
    		
    		if ($("#areaId").val()!="") {
  	
				switch ($("#areaId").val()) {
			
					case '1':

						if (isFilter) {
    				
    						sql = sql+" AND percorsi_html LIKE 'Scuola primaria%'";
    				
    					} else {
    				
    						sql = sql+" WHERE percorsi_html LIKE 'Scuola primaria%'";
    					}
    			
    					isFilter = true;
    			
						break;
					case '2':
						
						if (isFilter) {
    				
    						sql = sql+" AND percorsi_html LIKE 'Scuola secondaria%'";
    				
    					} else {
    				
    						sql = sql+" WHERE percorsi_html LIKE 'Scuola secondaria%'";
    					}
    			
    					isFilter = true;
    			
						break;
					case '555':
						
						if (isFilter) {
    				
    						sql = sql+" AND percorsi_html LIKE 'Università, varia e professionale%'";
    				
    					} else {
    				
    						sql = sql+" WHERE percorsi_html LIKE 'Università, varia e professionale%'";
    					}
    			
    					isFilter = true;
    			
						break;
				}
    		}
    		
    		sql = sql+" ORDER BY volume_titolo ASC, volume_sottotitolo ASC, volume_anno_pubblicazione DESC, volume_isbn ASC";

			var rs = db.execute(sql);

			var risultatoRicercaHtml = "";

			var rowNumber = rs.rowCount();
			
			var imgHexString = "";
			var imgContentType = "";

			switch(rowNumber) {
				
				case 0:
				
					risultatoRicercaHtml = risultatoRicercaHtml+"<p id=\"rowNumber\">La ricerca non ha prodotto alcun risultato</p>";
					break;
					
				case 1:
				
					risultatoRicercaHtml = risultatoRicercaHtml+"<p id=\"rowNumber\">Trovato "+rowNumber+" risultato</p>";
					break;
					
				default:
				
					risultatoRicercaHtml = risultatoRicercaHtml+"<p id=\"rowNumber\">Trovati "+rowNumber+" risultati</p>";
			}
			
			while(rs.isValidRow()){
			
				imgHexString = rs.fieldByName("hex_copertina");
				 
				switch (imgHexString.substring(0,2).toUpperCase()) {

					case 'FF':
					
						imgContentType = "image/jpeg";
						break;

					case '47':
					
						imgContentType = "image/gif";
						break;

					default:
					
						imgContentType = "image/png";
						break;
				}
			
				risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRiga\">";
				risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRigaSx\">";
				risultatoRicercaHtml = risultatoRicercaHtml+"<img src=\"data:"+imgContentType+";base64,"+base64Encode(hex2bin(imgHexString))+"\" />";
				risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-isbn\">ISBN: <a href=\"Javascript:cercaISBN('"+rs.fieldByName("volume_isbn")+"')\">"+rs.fieldByName("volume_isbn")+"</a></p>";
				if (rs.fieldByName("volume_autori")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-autore\">"+rs.fieldByName("volume_autori")+"</p>"; }
				risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-titolo\">"+rs.fieldByName("volume_titolo")+"</p>";
				if (rs.fieldByName("volume_sottotitolo")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultato-sottotitolo\">"+rs.fieldByName("volume_sottotitolo")+"</div>"; }
				risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRigaDx\">";
				if (rs.fieldByName("percorsi_html")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-percorso\">"+rs.fieldByName("percorsi_html")+"</p>"; }
				if (rs.fieldByName("opera_marchio")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-marchio\">"+rs.fieldByName("opera_marchio")+"</p>"; }
				risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				
				rs.next();
			}
		
			rs.close();
		
			db.close();
		
			var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > <a href=\"Javascript:switchArea('"+$("#areaId").val()+"')\">"+getAreaName($("#areaId").val())+"</a> > Risultato ricerca</p>";
		
			$( "#breadcrumbs" ).html(breadcrumbsContent);
			$( "#contenuto" ).html(risultatoRicercaHtml);

		} else {
			
			alert("Database non trovato");
		}
	}
	
	function cercaISBN(isbn) {
		
		var dbPath = getDbPath();

		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
    		
    		var sql = "SELECT volume_id, volume_isbn, volume_autori, volume_titolo, volume_sottotitolo, volume_descrizione, volume_pagine, volume_prezzo, opera_id, opera_marchio, opera_proposta_sintetica, opera_proposta_editoriale, struttura_html, percorsi_html, hex_copertina FROM catalogo WHERE volume_isbn='"+isbn+"'";
    		
    		var rs = db.execute(sql);

			var schedaHtml = "";

			var imgHexString = "";
			var imgContentType = "";
			var titoloVolume = "";

			if(rs.rowCount()>0){
			
				imgHexString = rs.fieldByName("hex_copertina");
				 
				switch (imgHexString.substring(0,2).toUpperCase()) {

					case 'FF':
					
						imgContentType = "image/jpeg";
						break;

					case '47':
					
						imgContentType = "image/gif";
						break;

					default:
					
						imgContentType = "image/png";
						break;
				}
				
				titoloVolume = rs.fieldByName("volume_titolo");
			
				schedaHtml = schedaHtml+"<div class=\"risultatoRiga\">";
				schedaHtml = schedaHtml+"<div class=\"risultatoRigaSx\">";
				schedaHtml = schedaHtml+"<img src=\"data:"+imgContentType+";base64,"+base64Encode(hex2bin(imgHexString))+"\" />";
				schedaHtml = schedaHtml+"<p class=\"risultato-isbn\">ISBN: <a href=\"Javascript:cercaISBN('"+rs.fieldByName("volume_isbn")+"')\">"+rs.fieldByName("volume_isbn")+"</a></p>";
				if (rs.fieldByName("volume_autori")!="") { schedaHtml = schedaHtml+"<p class=\"risultato-autore\">"+rs.fieldByName("volume_autori")+"</p>"; }
				schedaHtml = schedaHtml+"<p class=\"risultato-titolo\">"+rs.fieldByName("volume_titolo")+"</p>";
				if (rs.fieldByName("volume_sottotitolo")!="") { schedaHtml = schedaHtml+"<div class=\"risultato-sottotitolo\">"+rs.fieldByName("volume_sottotitolo")+"</div>"; }
				
				if (Titanium.Network.online) {
					
					schedaHtml = schedaHtml+"<input type=\"button\" id=\"digilibroBtt\" name=\"digilibroBtt\" onclick=\"location.href='http://digilibro.pearson.it/dettaglio.php?idVolume="+rs.fieldByName("volume_id")+"'\" value=\"Scarica il materiale per il docente\" />";
				}
				
				schedaHtml = schedaHtml+"</div>";
				schedaHtml = schedaHtml+"<div class=\"risultatoRigaDx\">";
				if (rs.fieldByName("percorsi_html")!="") { schedaHtml = schedaHtml+"<p class=\"risultato-percorso\">"+rs.fieldByName("percorsi_html")+"</p>"; }
				if (rs.fieldByName("opera_marchio")!="") { schedaHtml = schedaHtml+"<p class=\"risultato-marchio\">"+rs.fieldByName("opera_marchio")+"</p>"; }
				schedaHtml = schedaHtml+"<p class=\"risultato-pagine-prezzo\">Pagg. "+rs.fieldByName("volume_pagine")+"<br /><br />Euro "+rs.fieldByName("volume_prezzo").toFixed(2)+"</p>";
				schedaHtml = schedaHtml+"</div>";
				schedaHtml = schedaHtml+"</div>";
				
				schedaHtml = schedaHtml+"<div id=\"pannelli\">";
				
				if (rs.fieldByName("volume_descrizione")!="") {
					
					schedaHtml = schedaHtml+"<p class=\"header\">Descrizione volume</p>";
					schedaHtml = schedaHtml+"<div class=\"sezione\">"+rs.fieldByName("volume_descrizione")+"</div>";
				}
				
				if (rs.fieldByName("opera_proposta_sintetica")!="") {
					
					schedaHtml = schedaHtml+"<p class=\"header\">Proposta sintetica</p>";
					schedaHtml = schedaHtml+"<div class=\"sezione\">"+rs.fieldByName("opera_proposta_sintetica")+"</div>";
				}
				
				if (rs.fieldByName("opera_proposta_editoriale")!="") {
					
					schedaHtml = schedaHtml+"<p class=\"header\">Proposta editoriale</p>";
					schedaHtml = schedaHtml+"<div class=\"sezione\">"+rs.fieldByName("opera_proposta_editoriale")+"</div>";
				}
				
				schedaHtml = schedaHtml+"</div>";
				
				if (rs.fieldByName("struttura_html")!="") {
					
					schedaHtml = schedaHtml+"<p class=\"header\">Struttura</p>";
					schedaHtml = schedaHtml+"<div class=\"sezione\" id=\"sezione-struttura\">"+rs.fieldByName("struttura_html")+"</div>";
				}
			}

			rs.close();
		
			db.close();
		
			var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > <a href=\"Javascript:switchArea('"+$("#areaId").val()+"')\">"+getAreaName($("#areaId").val())+"</a> > <a href=\"Javascript:startSearch()\">Risultato ricerca</a>";
			if (titoloVolume!="") { breadcrumbsContent = breadcrumbsContent+" > "+titoloVolume; }
			breadcrumbsContent = breadcrumbsContent+"</p>";
		
			$( "#breadcrumbs" ).html(breadcrumbsContent);
			$( "#contenuto" ).html(schedaHtml);

		} else {
			
			alert("Database non trovato");
		}
	}
		
	function getLastUpdate() {
		
		var dbPath = getDbPath();
		
		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
    		
    		var sql = "SELECT MAX(last_update_date) AS last_update FROM catalogo";
    		
    		var rs = db.execute(sql);

			if(rs.rowCount()>0){
			
				var lastUpdateDate = rs.fieldByName("last_update").replace(/:/gi,"-").replace(/ /gi,"-");
				
			} else {
				
				var lastUpdateDate = "2000-01-01-12-00-00";
			}

			rs.close();
		
			db.close();
		
			return lastUpdateDate;

		} else {
			
			alert("Database non trovato");
			
			return "";
		}
	}	

	function getDbPath () {
		
		return Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDirectory(), 'Resources/catalogo.sqlite');
	}
