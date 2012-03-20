var sql = "";
			
var matrice = "";
var numRecord = Titanium.App.numRecord;
var numQuery = 0;
var insertSql = "";
	
var dbPath = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDataDirectory(), 'catalogo.sqlite');

if (dbPath.exists()) {

	this.postMessage(0); /* DB agganciato */
	
	var db = Titanium.Database.openFile(dbPath);
	
	var filePath = Titanium.Filesystem.getApplicationDataDirectory().toString()+Titanium.Filesystem.getSeparator()+'aggiornamentoDB.sql';

		var fileStream = Titanium.Filesystem.getFileStream(filePath);

		fileStream.open(Titanium.Filesystem.MODE_READ,true);
			
		var linea = fileStream.readLine();

		if (linea.indexOf("[[SQL-START]]")!=-1) {
				
			matrice = linea.substring(0,linea.indexOf("[[SQL-START]]"));
				
			/* DELETE */
    					
    			sql = "SELECT volume_id FROM catalogo";
    		
    			var rs = db.execute(sql);
    					
    			while(rs.isValidRow()){
			
					if (matrice.indexOf("-"+rs.fieldByName("volume_id")+"-")==-1) {
				 				
						/* Il record non esiste nel DB master, quindi va cancellato in SQLite */
				 				
						sql = "DELETE FROM catalogo WHERE volume_id='"+rs.fieldByName("volume_id")+"'";
						db.execute(sql);
					}	

					rs.next();
				}
	
			/* INSERT/REPLACE */
			
				while(linea != null) {

					linea = fileStream.readLine();
					
					insertSql = insertSql+linea;

					if (linea.indexOf("[[SQL-END]]")!=-1) {

						/* Query di inserimento completa */
						
						sql = insertSql.replace("[[SQL-END]]","");

						db.execute(sql);
							
						numQuery = numQuery + 1;
						this.postMessage(numQuery); /* Query corrente */

						if (numQuery==numRecord) {

							this.postMessage(-2); /* Script terminato */
							break;
								
						} else {
								
							insertSql = "";	
						}
					}
				}

		} else {
				
			matrice = linea;
				
			while(linea != null) {

				linea = fileStream.readLine();
					
				if (linea.indexOf("[[SQL-START]]")!=-1) {

					matrice = matrice+linea.substring(0,linea.indexOf("[[SQL-START]]"));
					break;
						
				} else {
						
					matrice = matrice+linea;
				}
			}

    		/* DELETE */
    					
    			sql = "SELECT volume_id FROM catalogo";
    		
    			var rs = db.execute(sql);
    					
    			while(rs.isValidRow()){
			
					if (matrice.indexOf("-"+rs.fieldByName("volume_id")+"-")==-1) {
				 				
						/* Il record non esiste nel DB master, quindi va cancellato in SQLite */
				 				
						sql = "DELETE FROM catalogo WHERE volume_id='"+rs.fieldByName("volume_id")+"'";
						db.execute(sql);
					}

					rs.next();
				}

			/* INSERT/REPLACE */
			
				while(linea != null) {

					linea = fileStream.readLine();
					
					insertSql = insertSql+linea;

					if (linea.indexOf("[[SQL-END]]")!=-1) {

						/* Query di inserimento completa */
						
						sql = insertSql.replace("[[SQL-END]]","");
						
						db.execute(sql);

						numQuery = numQuery + 1;
						this.postMessage(numQuery); /* Query corrente */
						
						if (numQuery==numRecord) {
						
							this.postMessage(-2); /* Script terminato */		
							break;
								
						} else {
								
							insertSql = "";	
						}
					}
				}
		}
								
		matrice = "";
		insertSql = "";	

		rs.close();
		
		db.close();
				
		fileStream.close();
		
} else {
			
	this.postMessage(-1); /* Database non trovato */
}