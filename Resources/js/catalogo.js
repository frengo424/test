//*****************************************************************
// Script di catalogo, proprietà di Pearson Italia s.p.a.
// È vietata la riproduzione, anche parziale, del codice seguente
//
//*****************************************************************

$(document).ready(function() { 
	
	var lastUpdateDate = getLastUpdate();
	
	//Fogli stile condizionali per Mac
	if (navigator.platform.indexOf("Mac") != -1) {
		$('head').append('<link type="text/css" href="css/mac.css" rel="stylesheet" />');
	}
	
	$( "#breadcrumbs" ).hide();
	$( "#stampa" ).hide();
	$("#recordNumber").val('0');
	$("#dateUpdate").val(lastUpdateDate);
	$("#ultimoAggiornamento").html(printDate(lastUpdateDate));
	
	/* Tasti finestra download aggiornamento catalogo */
	
	$( "#interrompi" ).button();
	$( "#interrompi" ).click(function() { $( "#finestraAggiornamento" ).dialog('close'); return false; });

	$( "#aggiorna" ).button();
	$( "#aggiorna" ).click(function() {

		$( "#finestraAggiornamento" ).dialog('close');
		
		$("#downloadInfo").show();
		
		downloadFiles();
		
		return false;
	});

	/* Tasti finestra installazione aggiornamento catalogo */
	
	$( "#interrompi_inst" ).button();
	$( "#interrompi_inst" ).click(function() { $( "#finestraInstallazione" ).dialog('close'); return false; });

	$( "#installa" ).button();
	$( "#installa" ).click(function() {

		var loaderHtml = "";
		loaderHtml = loaderHtml+"<p id=\"loader-header\">Aggiornamento in corso..</p>";
		loaderHtml = loaderHtml+"<p id=\"loader-exp\">Non chiudere l'applicazione durante il processo di aggiornamento del listino.</p>";
		loaderHtml = loaderHtml+"<img src=\"img/loader.gif\" id=\"loader-img\" name=\"loader-img\" />";
		loaderHtml = loaderHtml+"<p id=\"loader-action\">Installazione aggiornamento <span id=\"currRecord\"></span> di "+$("#recordNumber").val()+"</p>";
			
		$("#breadcrumbs").html('');
		$("#ricerca").html('');
		$( "#contenuto" ).css('background-color', '#FFF');
		$("#contenuto").html(loaderHtml);
		
		$( "#finestraInstallazione" ).dialog('close');

		setTimeout("aggiorna()",100);

		return false;
	});
	
	/* Tasti finestra download aggiornamento applicazione */
	
	$( "#interrompi_na" ).button();
	$( "#interrompi_na" ).click(function() { $( "#finestraNuovaApp" ).dialog('close'); verificaUpdate(); return false; });

	$( "#scarica_na" ).button();
	$( "#scarica_na" ).click(function() {

		Titanium.Platform.openURL('http://www.pearson.it/catalogo_offline');
		
		$( "#finestraNuovaApp" ).dialog('close');

		Titanium.App.exit();
		
		return false;
	});
	
	if (Titanium.Network.online) {
		
		/* Controllo versione applicazione */
		
		verificaApp();
	}
	/*
	if (Titanium.Network.online) {
		
		verificaUpdate();	
	}
	*/
	//dato un set di div ne uniforma l'altezza adeguandosi al più alto
	$.fn.equalizeHeights = function(){
		return this.height(Math.max.apply(this, $(this).map(function(i,e){ return $(e).height() }).get() ) )
	}

	$(window).resize(function(){
		if ($('.volume-struttura').lenght() != 0) {
			$('.volume-struttura').height('auto');
			$('.struttura').each( function(i) { 
				$(this).find('.volume-struttura').equalizeHeights();
			});
		}
	});

	
});



/* Funzioni Aggiornamento */

	function verificaApp(){
		
		if (Titanium.Network.online) {
			
			$.ajaxSetup({ async:false });
			
			$.get('http://listino.pearsonitalia.it/appVersion.action.php', function(data) {
				
				if (data!=Titanium.App.version) {
					
					$( "#finestraNuovaApp" ).dialog({ modal: true, width: 600, height:280, resizable: false }); 
					
				} else {
					
					verificaUpdate();
				}
			});
		
			$.ajaxSetup({ async:true });
			
		} else {
			
			alert("Per controllare l'esistenza di una nuova versione dell'applicazione è necessario disporre di una connessione a Internet.");
		}
	}

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
				
				$( "#finestraAggiornamento" ).dialog({ modal: true, width: 600, height:280, resizable: false }); 
				$( "#nAggiornamenti" ).html($("#recordNumber").val());
			}

		} else {
			
			alert("Per effettuare l'aggiornamento del catalogo è necessario disporre di una connessione a Internet.");
		}
	}

	function chiediUpdate(){
	
		verificaUpdate();

		if ($("#recordNumber").val()==0 && Titanium.Network.online) {
			alert("Il listino è aggiornato.");
		}
	}

	function aggiorna() {

		if (Titanium.Network.online) {
			
			Titanium.App.numRecord = parseInt($("#recordNumber").val());
			
			var $worker = Titanium.Worker.createWorker('js/updateDB.js');
 
			$worker.onmessage = function($event)
			{
				var newdl = parseInt($event.message);
				
				if(newdl == 0) {
					currRecord = 0; /* DB agganciato */
				} else if(newdl == -1) {
					alert("Database non trovato"); /* DB non trovato */
					$worker.terminate();
				} else if(newdl == -2) {		

					/* Script terminato */
					var lastUpdateDate = getLastUpdate();
	
					$("#recordNumber").val('0');
					$( "#ultimoAggiornamento" ).html(printDate(lastUpdateDate));

					backHome();
				
					$worker.terminate();
				} else {
					currRecord = newdl; /* Numero del record */
				}
				document.getElementById('currRecord').innerText = currRecord;
			};
 
			$worker.start();
			
		} else {
			
			alert("Per effettuare l'aggiornamento del catalogo è necessario disporre di una connessione a Internet.");
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
				var areaName = "Saggistica, Universit&agrave; e Professionale";
				break;
		}
	
		return areaName;
	}
	
	function switchArea(areaId) {
		
		var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > "+getAreaName(areaId)+"</p>";
		
		switch (areaId) {
			
			case '1':
				var ricercaContent = "<fieldset><legend>Ricerca</legend>";
				ricercaContent = ricercaContent+"<div id=\"back\"><a href=\"Javascript:startSearch()\"><img src=\"img/back.png\" onmouseover=\"this.src='img/back-hover.png'\" onmouseout=\"this.src='img/back.png'\" alt=\"\" title=\"\" id=\"back-icon\" /></a></div>";
				ricercaContent = ricercaContent+"<div id=\"strato\" onclick=\"switchArea('"+areaId+"')\"><img src=\"img/closeIcon.gif\" alt=\"\" title=\"\" onclick=\"switchArea('"+areaId+"')\" id=\"close-icon\" /><p onclick=\"switchArea('"+areaId+"')\">nuova ricerca</p></div>"; 
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"macrodestinazione\" name=\"macrodestinazione\" value=\"\" />";
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
				ricercaContent = ricercaContent+"<div id=\"back\"><a href=\"Javascript:startSearch()\"><img src=\"img/back.png\" onmouseover=\"this.src='img/back-hover.png'\" onmouseout=\"this.src='img/back.png'\" alt=\"\" title=\"\" id=\"back-icon\" /></a></div>";
				ricercaContent = ricercaContent+"<div id=\"strato\" onclick=\"switchArea('"+areaId+"')\"><img src=\"img/closeIcon.gif\" alt=\"\" title=\"\" onclick=\"switchArea('"+areaId+"')\" id=\"close-icon\" /><p onclick=\"switchArea('"+areaId+"')\">nuova ricerca</p></div>"; 
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<select id=\"macrodestinazione\" class=\"first\"><option value=\"\">Grado scuola</option><option value=\" primo grado -\">Primo grado</option><option value=\" secondo grado -\">Secondo grado</option></select>"; 
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
				ricercaContent = ricercaContent+"<div id=\"back\"><a href=\"Javascript:startSearch()\"><img src=\"img/back.png\" onmouseover=\"this.src='img/back-hover.png'\" onmouseout=\"this.src='img/back.png'\" alt=\"\" title=\"\" id=\"back-icon\" /></a></div>";
				ricercaContent = ricercaContent+"<div id=\"strato\" onclick=\"switchArea('"+areaId+"')\"><img src=\"img/closeIcon.gif\" alt=\"\" title=\"\" onclick=\"switchArea('"+areaId+"')\" id=\"close-icon\" /><p onclick=\"switchArea('"+areaId+"')\">nuova ricerca</p></div>"; 
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"areaId\" name=\"areaId\" value=\""+areaId+"\" />"; 
				ricercaContent = ricercaContent+"<select id=\"macrodestinazione\" class=\"first\"><option value=\"\">Settore</option><option value=\" varia -\">Saggistica e Professionale</option><option value=\" università -\">Università</option></select>"; 
				ricercaContent = ricercaContent+"<select id=\"marchio_id\"><option value=\"\">Marchio</option><option value=\"32324\">Bruno Mondadori</option><option value=\"69291\">Pearson</option></select>"; 
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"materiaStr\" name=\"materiaStr\" value=\"\" onclick=\"if ($(this).val()==$('#materiaStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#materiaStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"text\" id=\"searchStr\" name=\"searchStr\" value=\"\" onclick=\"if ($(this).val()==$('#searchStrLabel').val()) { $(this).val(''); }\" onblur=\"if ($(this).val()=='') { $(this).val($('#searchStrLabel').val()); }\" onkeypress = \"if (event.keyCode == 13) { startSearch() }\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"materiaStrLabel\" name=\"materiaStrLabel\" value=\"Materia\" />";
				ricercaContent = ricercaContent+"<input type=\"hidden\" id=\"searchStrLabel\" name=\"searchStrLabel\" value=\"ISBN, autore o titolo\" />";  
				ricercaContent = ricercaContent+"<input type=\"button\" id=\"searchBtt\" name=\"searchBtt\" value=\"cerca\" onclick=\"startSearch()\" />"; 
				ricercaContent = ricercaContent+"</fieldset>";
				break;
		}

		$( "#back" ).hide();
		$( "#back-icon" ).hide();
		$( "#breadcrumbs" ).html(breadcrumbsContent).show();
		$( "#stampa" ).show();
		$( "#ricerca" ).html(ricercaContent);
		$( "#materiaStr" ).val($('#materiaStrLabel').val());
		$( "#searchStr" ).val($('#searchStrLabel').val());
			
		switch (areaId) {

			case '555':
				var contenutoContent = "<h2>Imparare per vivere.<br />Imparare per crescere.<br />Imparare sempre.</h2>";
				contenutoContent = contenutoContent+"<p id=\"explain\">Pearson offre una ricca produzione di editoria professionale, saggistica e editoria universitaria,"; 
				contenutoContent = contenutoContent+"<br />per lettori che desiderano essere sempre aggiornati per il proprio lavoro,"; 
				contenutoContent = contenutoContent+"<br />studiano, amano approfondire le proprie conoscenze,"; 
				contenutoContent = contenutoContent+"<br />desiderano seguire le principali questioni del dibattito culturale contemporaneo.</p>"; 
				contenutoContent = contenutoContent+"<img src=\"img/uni-intro.gif\" id=\"img-intro\" alt=\"\" title=\"\" />";
				
				$( "#contenuto" ).css('background-color', '#FBF7EC');
				$( "#contenuto" ).html(contenutoContent).css('top', '140');
				
				break;
				
			default:
				var contenutoContent = "<h2>Pearson, a norma dal 2009</h2>";
				contenutoContent = contenutoContent+"<p id=\"explain\">Con DIGIlibro libro misto Pearson ha offerto fin dal 2009 la garanzia"; 
				contenutoContent = contenutoContent+"<br />che le proprie proposte sono a norma di legge, nella forma mista cartacea e digitale."; 
				contenutoContent = contenutoContent+"<br /><br />DIGIlibro libro misto e eTEXT fanno parte del Pearson Digital System:";  
				contenutoContent = contenutoContent+"<br />non solo libri misti o scaricabili da Internet, ma anche interattivi, piattaforme";  
				contenutoContent = contenutoContent+"<br />per l'apprendimento personalizzato, laboratori interattivi multimediali.";  
				contenutoContent = contenutoContent+"<br />E poi il libro sfogliabile e interattivo con materiali multimediali"; 
				contenutoContent = contenutoContent+"<br />per fare lezione con la LIM...</p>"; 
				contenutoContent = contenutoContent+"<img src=\"img/spss-intro.gif\" id=\"img-intro\" alt=\"\" title=\"\" />";
				
				$( "#contenuto" ).css('background-color', '#FBF7EC');
				$( "#contenuto" ).html(contenutoContent).css('top', '140');
		}
	}
	
	function backHome() {
	
		var contenutoContent = 	"<h1>Catalogo Pearson Italia</h1><ul id=\"sceltaScuola\">"+
								"<li><a href=\"Javascript:switchArea('1')\" id=\"scuolaPrimaria\">Scuola<BR />Primaria</a></li>"+
								"<li><a href=\"Javascript:switchArea('2')\" id=\"scuolaSecondaria\">Scuola<BR />Secondaria</a></li>"+
								"<li><a href=\"Javascript:switchArea('555')\" id=\"variaUniversita\">Saggistica,<BR />Universit&agrave;<BR />e Professionale</a></li>"+
								"</ul>";
			
		$( "#contenuto" ).css('background-color', '#FFFFFF');
		$( "#breadcrumbs" ).html('').hide();
		$( "#stampa" ).hide();
		$( "#ricerca" ).html('');
		$( "#contenuto" ).html(contenutoContent).css('top', '50');
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
		
		if (($("#searchStr").val()!="" & $("#searchStr").val()!=$("#searchStrLabel").val()) || ($("#materiaStr").val()!="" & $("#materiaStr").val()!=$("#materiaStrLabel").val()) || $("#marchio_id").val()!="" || $("#macrodestinazione").val()!="") {
			
		var dbPath = getDbPath();

		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
    		
    		var isFilter = false;
    		
    		var sql = "SELECT * from (SELECT volume_id, volume_isbn, volume_autori, volume_titolo, volume_sottotitolo, opera_marchio, percorsi_html, volume_anno_pubblicazione, hex_copertina FROM catalogo";
    		
    		if ($("#searchStr").val()!="" & $("#searchStr").val()!=$("#searchStrLabel").val()) {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND (";
    				
    			} else {
    				
    				sql = sql+" WHERE (";
    			}
    			
    			var stringaRicerca = $("#searchStr").val().replace(/['"]/gi, "_");
    			
    			sql = sql+" volume_isbn LIKE '%"+stringaRicerca+"%'";
    			sql = sql+" OR volume_titolo LIKE '%"+stringaRicerca+"%'";
    			sql = sql+" OR volume_autori LIKE '%"+stringaRicerca+"%'";
    			sql = sql+" )";
    			
    			isFilter = true;
    		}
    		
    		if ($("#materiaStr").val()!="" & $("#materiaStr").val()!=$("#materiaStrLabel").val()) {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND percorsi_html LIKE '%"+$("#materiaStr").val().replace(/['"]/gi, "_")+"%'";
    				
    			} else {
    				
    				sql = sql+" WHERE percorsi_html LIKE '%"+$("#materiaStr").val().replace(/['"]/gi, "_")+"%'";
    			}

    			isFilter = true;
    		}
    		
    		if ($("#marchio_id").val()!="") {
    			    			
    			if (isFilter) {
    				
    				sql = sql+" AND opera_marchio_id='"+$("#marchio_id").val().replace(/['"]/gi, "_")+"'";
    				
    			} else {
    				
    				sql = sql+" WHERE opera_marchio_id='"+$("#marchio_id").val().replace(/['"]/gi, "_")+"'";
    			}
    			
    			isFilter = true;
    		}
    		
    		if (document.getElementById('macrodestinazione')) {
    			
    			if ($("#macrodestinazione").val()!="") {
    				
    				if (isFilter) {
    				
    					sql = sql+" AND percorsi_html LIKE '%"+$("#macrodestinazione").val().replace(/['"]/gi, "_")+"%'";
    					
    				} else {
    				
    					sql = sql+" WHERE percorsi_html LIKE '%"+$("#macrodestinazione").val().replace(/['"]/gi, "_")+"%'";
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
    		
    		sql = sql+" ORDER BY volume_titolo ASC, volume_sottotitolo ASC) ORDER BY volume_anno_pubblicazione DESC";
    		
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
			
				//<a href=\"Javascript:cercaISBN('"+rs.fieldByName("volume_isbn")+"')\">"+   + </a>
			
				risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRiga\" onclick=\"Javascript:cercaISBN('"+rs.fieldByName("volume_isbn")+"')\">";
				if (rs.fieldByName("opera_marchio")!="") { risultatoRicercaHtml = risultatoRicercaHtml+immagineMarchio(rs.fieldByName("opera_marchio")); }
				//risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRigaSx\">";
				
				if (imgHexString!="") {
					
					risultatoRicercaHtml = risultatoRicercaHtml+"<img src=\"data:"+imgContentType+";base64,"+base64Encode(hex2bin(imgHexString))+"\" class=\"img-copertina\" />";
				}
				
				risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-isbn\">ISBN "+rs.fieldByName("volume_isbn")+"</p>";
				if (rs.fieldByName("volume_autori")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-autore\">"+rs.fieldByName("volume_autori")+"</p>"; }
				risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-titolo\">"+rs.fieldByName("volume_titolo")+"</p>";
				if (rs.fieldByName("volume_sottotitolo")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultato-sottotitolo\">"+rs.fieldByName("volume_sottotitolo")+"</div>"; }
				//risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultato-sottotitolo\">"+rs.fieldByName("volume_anno_pubblicazione")+"</div>";
				if (rs.fieldByName("percorsi_html")!="") { risultatoRicercaHtml = risultatoRicercaHtml+"<p class=\"risultato-percorso\">"+rs.fieldByName("percorsi_html")+"</p>"; }
				//risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				//risultatoRicercaHtml = risultatoRicercaHtml+"<div class=\"risultatoRigaDx\">";
				//risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				risultatoRicercaHtml = risultatoRicercaHtml+"</div>";
				
				rs.next();
			}
		
			rs.close();
		
			db.close();
		
			var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > <a href=\"Javascript:switchArea('"+$("#areaId").val()+"')\">"+getAreaName($("#areaId").val())+"</a> > Risultato ricerca</p>";

			$( "#contenuto" ).css('background-color', '#FFFFFF');
			$( "#back" ).hide();
			$( "#back-icon" ).hide();
			$( "#breadcrumbs" ).html(breadcrumbsContent);
			$( "#contenuto" ).html(risultatoRicercaHtml);
			$( "#strato" ).show();

		} else {
			
			alert("Database non trovato");
		}
		
		} else {
			//Qui dovremmo forse aprire un pop up!
			alert("Per effettuare una ricerca è necessario selezionare almeno un criterio di ricerca valido.");
		}
	}
	
	function immagineMarchio(marchio) {
		var immagine="";
		switch (marchio) {	
			case 'Edizioni Scolastiche Bruno Mondadori':
				immagine="esbmo.jpg";
				break;
			case 'Bruno Mondadori':
				immagine="bm.jpg";
				break;
			case 'Paravia':
				immagine="paravia.jpg";
				break;
			case 'Archimede Edizioni':
				immagine="ae.jpg";
				break;
			case 'Elmedi':
				immagine="elmedi.jpg";
				break;
			case 'Lang':
				immagine="lang.jpg";
				break;
			case 'Lang Pearson Longman':
				immagine="langlongman.jpg";
				break;
			case 'Linx Edizioni':
				immagine="linx.jpg";
				break;
			case 'Paramond':
				immagine="paramond.jpg";
				break;
			case 'Pearson':
				immagine="peducation.jpg";
				break;
			case 'Pearson Longman':
				immagine="plongman.jpg";
				break;
			case 'Thecna!':
				immagine="thecna.jpg";
				break;
		}
		return "<img class='risultato-marchio' src='img/marchi/"+immagine+"' />";
	}
	
	
	function cercaISBN(isbn) {
		
		var dbPath = getDbPath();

		if (dbPath.exists()) {
			
    		var db = Titanium.Database.openFile(dbPath);
    		
    		var sql = "SELECT volume_id, volume_isbn, volume_autori, volume_titolo, volume_sottotitolo, volume_descrizione, volume_pagine, volume_prezzo, volume_codice_digilibro, opera_id, opera_marchio, opera_proposta_sintetica, opera_proposta_editoriale, struttura_html, percorsi_html, hex_copertina FROM catalogo WHERE volume_isbn='"+isbn+"'";
    		
    		var rs = db.execute(sql);

			var schedaHtml = "";

			var imgHexString = "";
			var imgContentType = "";
			var titoloVolume = "";
			var isbnVolume = "";

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
				isbnVolume = rs.fieldByName("volume_isbn");
	
				schedaHtml = schedaHtml+"<div class=\"risultatoRigaScheda\">";
				
				schedaHtml = schedaHtml+"<div id=\"scheda-btt\">";
				
				if (rs.fieldByName("opera_marchio")!="") { schedaHtml = schedaHtml+immagineMarchio(rs.fieldByName("opera_marchio")); }
				
				
					
				if ($("#areaId").val()!=555 & rs.fieldByName("volume_codice_digilibro")=="x") {
					if (Titanium.Network.online) {
						schedaHtml = schedaHtml+"<img id=\"digilibro-logo\" src=\"img/digilibro.png\" onclick=\"Titanium.Platform.openURL('http://digilibro.pearson.it/dettaglio.php?idVolume="+rs.fieldByName("volume_id")+"')\" />{ETEXT-LOGO}";
						
						//schedaHtml = schedaHtml+"<input type=\"button\" id=\"digilibroBtt\" name=\"digilibroBtt\" onclick=\"Titanium.Platform.openURL('http://digilibro.pearson.it/dettaglio.php?idVolume="+rs.fieldByName("volume_id")+"')\" value=\"Materiale per il docente\" />";
						
						//if ($(".struttura-titolo:contains('scaricabile')").length>0) {
							// Il pulsante Sculabook finirà nella struttura 'versione online scaricabile da internet'?
							//schedaHtml = schedaHtml+"<input type=\"button\" id=\"scuolabookBtt\" name=\"scuolabookBtt\" onclick=\"Titanium.Platform.openURL('http://www.scuolabook.it/catalogsearch/result/?q="+rs.fieldByName("volume_isbn")+"')\" value=\"Scuolabook\" />";
						//}
					} else {
						schedaHtml = schedaHtml+"<img id=\"digilibro-logo\" src=\"img/digilibro.png\" />{ETEXT-LOGO}";
					}
				}
				
				/* Pulsante acquista online */

				if ($("#areaId").val()==555) {
					
					if (Titanium.Network.online) {
					
						var shopLink = "http://www.internetbookshop.it/ser/serdsp.asp?shop=1520&isbn="+rs.fieldByName("volume_isbn");
					
						if (titoloVolume.toLowerCase().indexOf("online")!=-1 || titoloVolume.toLowerCase().indexOf("on-line")!=-1) {
							var titoloBookRepublic = titoloVolume.toLowerCase().spiana().replace(/[:.'’,;\"”“]/gi,"").replace(/  /gi," ").replace(/  /gi," ").replace(/<br>/gi,"").replace(/<br\/>/gi,"").replace(/<br \/>/gi,"").replace(/   /gi," ").replace(/  /gi," ");
							titoloBookRepublic = $.trim(titoloBookRepublic.replace(/versione online/gi, "").replace(/   /gi," ").replace(/  /gi," "));
							titoloBookRepublic = titoloBookRepublic.replace(/ /gi,"-").replace(/---/gi,"-").replace(/--/gi,"-")+"/";				
							shopLink = "http://www.bookrepublic.it/book/"+rs.fieldByName("volume_isbn")+"-"+titoloBookRepublic;
						}

						schedaHtml = schedaHtml+"<input type=\"button\" id=\"shopOnlineBtt\" name=\"shopOnlineBtt\" onclick=\"Titanium.Platform.openURL('"+shopLink+"')\" value=\"Acquista on line\" />";
					}
				}
				
				schedaHtml = schedaHtml+"</div>";
				
				schedaHtml = schedaHtml+"<div class=\"risultatoRigaSx\">";
				
				if (imgHexString!="") {
					
					schedaHtml = schedaHtml+"<img src=\"data:"+imgContentType+";base64,"+base64Encode(hex2bin(imgHexString))+"\" />";
				}
				
				schedaHtml = schedaHtml+"</div>";
				schedaHtml = schedaHtml+"<div class=\"risultatoRigaDx\">";
				schedaHtml = schedaHtml+"<p class=\"risultato-isbn\">ISBN: "+rs.fieldByName("volume_isbn")+"</p>";
				if (rs.fieldByName("volume_autori")!="") { schedaHtml = schedaHtml+"<p class=\"risultato-autore\">"+rs.fieldByName("volume_autori")+"</p>"; }
				schedaHtml = schedaHtml+"<p class=\"risultato-titolo\">"+rs.fieldByName("volume_titolo")+"</p>";
				if (rs.fieldByName("volume_sottotitolo")!="") { schedaHtml = schedaHtml+"<div class=\"risultato-sottotitolo\">"+rs.fieldByName("volume_sottotitolo")+"</div>"; }
				if (rs.fieldByName("percorsi_html")!="") { schedaHtml = schedaHtml+"<p class=\"risultato-percorso\">"+rs.fieldByName("percorsi_html")+"</p>"; }
								
				if (rs.fieldByName("volume_descrizione")!="") {
					
					schedaHtml = schedaHtml+"<div class=\"volume-descrizione\">"+rs.fieldByName("volume_descrizione").replace(/<br \/><br \/>/gi, '<br />')+"</div>";
				}
				
				schedaHtml = schedaHtml+"<div class=\"risultato-pagine-prezzo\">";
				
				if (rs.fieldByName("volume_pagine")!=0) {
					
					schedaHtml = schedaHtml+"Pagg. "+rs.fieldByName("volume_pagine")+"<br />";
				}
				
				if (rs.fieldByName("volume_prezzo").toFixed(2)!="0.00") {
					
					schedaHtml = schedaHtml+"Euro "+decimalSeparator(rs.fieldByName("volume_prezzo").toFixed(2));
				}
				
				schedaHtml = schedaHtml+"</div>";
				schedaHtml = schedaHtml+"</div>";
				schedaHtml = schedaHtml+"</div>";
				
				schedaHtml = schedaHtml+"<div id=\"pannelli\">";
				
				if (rs.fieldByName("opera_proposta_sintetica")!="") {

					schedaHtml = schedaHtml+"<div class=\"sezione\">"+rs.fieldByName("opera_proposta_sintetica")+"</div>";
				}
				
				if (rs.fieldByName("opera_proposta_editoriale")!="") {
					
					if ($("#areaId").val()!=555) {
						
						schedaHtml = schedaHtml+"<p class=\"header-row\" onclick=\"$('#sezione-peditoriale').slideToggle('fast');if($(this).hasClass('header-row')){$(this).removeClass('header-row');$(this).addClass('header-row-expanded');} else {$(this).removeClass('header-row-expanded');$(this).addClass('header-row');}\">Proposta editoriale</p>";
					}
					schedaHtml = schedaHtml+"<div class=\"sezione\"";
					
					if ($("#areaId").val()!=555) {
						
						schedaHtml = schedaHtml+" id=\"sezione-peditoriale\"";
					}
					
					schedaHtml = schedaHtml+">"+rs.fieldByName("opera_proposta_editoriale").replace(/<a/gi, "<a target='_blank''")+"</div>";
				}
				
				schedaHtml = schedaHtml+"</div>";
				
				if (rs.fieldByName("struttura_html")!="" & $("#areaId").val()!=555) {

					schedaHtml = schedaHtml+"<p class=\"header-row\" onclick=\"$('#sezione-struttura').slideToggle('fast');if($(this).hasClass('header-row'))";
					schedaHtml = schedaHtml+"{$(this).removeClass('header-row');$(this).addClass('header-row-expanded');";
					schedaHtml = schedaHtml+"$('.struttura').each( function(i) { $(this).find('.volume-struttura').equalizeHeights(); } ); } ";
					schedaHtml = schedaHtml+"else {$(this).removeClass('header-row-expanded');$(this).addClass('header-row');}\" id=\"header-struttura\">Struttura dell'offerta</p>";
					schedaHtml = schedaHtml+"<div class=\"sezione\" id=\"sezione-struttura\">"+decimalSeparator(rs.fieldByName("struttura_html"))+"</div>";

					//$('.volume-struttura').equalizeHeights();


				}
			}

			var breadcrumbsContent = "<p><a href=\"Javascript:backHome()\">Inizio</a> > <a href=\"Javascript:switchArea('"+$("#areaId").val()+"')\">"+getAreaName($("#areaId").val())+"</a> > <a href=\"Javascript:startSearch()\">Risultato ricerca</a>";
			if (titoloVolume!="") { breadcrumbsContent = breadcrumbsContent+" > "+titoloVolume.replace(/<br \/>/gi, ' '); }
			breadcrumbsContent = breadcrumbsContent+"</p>";

			$( "#breadcrumbs" ).html(breadcrumbsContent);
			$( "#breadcrumbs" ).css("color","#888888");
			$( "#contenuto" ).html(schedaHtml);
			$( "#back" ).show();
			$( "#back-icon" ).show();
			
			var finestraBolliniHtml = $("#scheda-btt").html();
			
			if ($(".struttura-titolo:contains('ersione online scaricabile')").length>0) {
				if (Titanium.Network.online && rs.fieldByName("volume_titolo").indexOf("ersione online") != -1) { //verifica che lo stesso volume sia presente su scuolabook!
					$("#scheda-btt").html(finestraBolliniHtml.replace("{ETEXT-LOGO}","<img id=\"etext-logo\" src=\"img/etext.png\" onclick=\"Titanium.Platform.openURL('http://www.scuolabook.it/catalogsearch/result/?q="+rs.fieldByName("volume_isbn")+"')\" />"));
				} else {
					$("#scheda-btt").html(finestraBolliniHtml.replace("{ETEXT-LOGO}","<img id=\"etext-logo\" src=\"img/etext.png\" />"));					
				}
			} else {
				$("#scheda-btt").html(finestraBolliniHtml.replace("{ETEXT-LOGO}",""));
			}
			
			$(".struttura-titolo:contains('insegnante')").css("color", "#FFFFFF");
			$(".struttura-titolo:contains('insegnante')").css("background-color", "#ed6b06");
			
			$(".struttura-titolo:contains('ersione online scaricabile')").css("color", "#FFFFFF");
			$(".struttura-titolo:contains('ersione online scaricabile')").css("background-color", "#364395");


			rs.close();
			db.close();


			if ($("#sezione-struttura a").length>0) {

				var contenutoStruttura = $("#sezione-struttura").html();
				
				var db = Titanium.Database.openFile(dbPath);
    		
				for (i=0;i<$("#sezione-struttura a").length;i++) {
					
					isbn = $("#sezione-struttura a").get(i).innerHTML;

					var sql = "SELECT volume_id FROM catalogo WHERE volume_isbn='"+isbn+"'";
    		
    				var rs = db.execute(sql);
    				
					if(rs.rowCount()==0 || isbn==isbnVolume){

						contenutoStruttura = contenutoStruttura.replace("<a href=\"javascript:cercaISBN('"+isbn+"');\">"+isbn+"</a>",isbn);
					}
					
					rs.close();
				}
				
				db.close();
				
				$("#sezione-struttura").html(contenutoStruttura);
				
				//aggiungi l'ombra al volume selezionato all'interno della struttura
				$(".volume-struttura:contains('"+isbnVolume+"')").css("-webkit-box-shadow", "5px 5px 12px #333"); //.css("border", "2px solid #666")
			}
			
			$( "#contenuto" ).scrollTop(0);

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
		
			Titanium.App.lastUpdate = lastUpdateDate;
			
			return lastUpdateDate;

		} else {
			
			alert("Database non trovato");
			
			return "";
		}
	}	

	function getDbPath () {
		var db = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDataDirectory(), 'catalogo.sqlite');
		//alert (db.toString());
		if (!db.exists()) {
			//alert ("inizio copia DB");
			var sorgente = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDirectory(), 'Resources/catalogo.sqlite');
			sorgente.copy(db);
			//alert ("fine copia DB");
		}
		return db;
	}

	function decimalSeparator(numero){
		var s = numero.replace(/([0-9]+),([0-9]+)/g, '$1#$2').replace(/([0-9]+)\.([0-9]+)/g, '$1,$2').replace(/([0-9]+)#([0-9]+)/g, '$1.$2'); //inverte il punto con la virgola, se presenti
		return s
	}
	
	/* Funzioni per il download dell'aggiornamento */
	
	var BINARY_UNITS= [1024, 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yo'];
	var SI_UNITS= [1000, 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
 
	function unitify(n, units) {
	    for (var i= units.length; i-->1;) {
	        var unit= Math.pow(units[0], i);
	        if (n >= unit) {
		var result = n / unit; 
		return result.toFixed(2) + units[i];
		}
	    }
    	return n;
	}
 
	/* Numero di byte scaricati */
	var dlbytes = 0;
 
	function downloadFiles() {
		
		var $worker = Titanium.Worker.createWorker('js/download.js');
 
		$worker.onmessage = function($event)
		{
			var newdl = parseInt($event.message);
			if(newdl == 0) {
				dlbytes = 0;
			} else if(newdl == -1) {
				alert("Errore durante il download dell'aggiornamento");
				dlbytes = 0;
				$worker.terminate();
			} else if(newdl == -2) {		

				$("#downloadInfo").hide();
				$( "#finestraInstallazione" ).dialog({ modal: true, width: 600, height:280, resizable: false });
				
				$worker.terminate();
			} else {
				dlbytes += newdl;
			}
			document.getElementById('dlsize').innerText = unitify(dlbytes,BINARY_UNITS);
		};
		$worker.start();
	}

	/* Funzione per link Acquista online */
	
	var accentate = {
		",": " ",
		"ç": "c",
		"æ": "ae",
		"œ": "oe",
		"á": "a",
		"é": "e",
		"í": "i",
		"ó": "o",
		"ú": "u",
		"à": "a",
		"è": "e",
		"ì": "i",
		"ò": "o",
		"ù": "u",
		"ä": "a",
		"ë": "e",
		"ï": "i",
		"ö": "o",
		"ü": "u",
		"ÿ": "y",
		"â": "a",
		"ê": "e",
		"î": "i",
		"ô": "o",
		"û": "u",
		"å": "a",
		"e": "e",
		"i": "i",
		"ø": "o",
		"u": "u"
	};

	String.prototype.spiana = function() {
		return this.replace(/[^A-Za-z0-9]/g, function(x) { return accentate[x] || x; })
	};