
$( document ).ready(function() {
 	var cash = 100000; //available cash in customer portfolio
 	var availCash = $("#cash"); 
 	var data1; //global variable for JSON data
 	var symbol1; //global variable for JSON data 
 	var map = new Map(); //Map to store Company stock data
 	var boughtAt; // ask Price for a stock

 	// function to look up for a symbol in API
 	$("#lookup").click(function(){
		var symbol = $("#symbol").val();
		var resultData = $("#resultTable"); //html element to display extracted data
		
		//ajax call to the API
		$.ajax ({
			url: "https://data.benzinga.com/rest/richquoteDelayed",
			method: 'get',
			data: {symbols: symbol},
			dataType: 'jsonp',
			success: function(data){
				data1 = data;
				symbol1 = symbol;
				if(data.message!=null){
					resultData.html(data.mesage);
				}
					else{
					resultData.html('<h3 align="center">' + data[symbol]["name"] + '<br>(' + data[symbol]["symbol"] +')' + '</h3><table align="center"><tr><th>Bid</th><th>Ask</th></tr><tr><td>' + data[symbol]["bidPrice"] + '</td><td>' +data[symbol]["askPrice"] + '</td></tr>');
					
					}
			}
		});

	});

	// function to buy a stock
	$("#buy").click(function(){
		var data = data1;
		var quantity = parseInt($("#quantity").val());
		var buyAmnt= quantity * data[symbol1]["askPrice"]; //calculating total amount spent on this stock
		buyAmnt = parseFloat(buyAmnt.toFixed(2)); //truncating decimals of the float value
		var key = data[symbol1]["name"]; //Company's name is stored as key for Map entries
		boughtAt = data[symbol1]["askPrice"]; // ask price of stock to buy it
		alert("Your total amount to buy " +data[symbol1]["name"] + " is: " + buyAmnt);

			if (cash>buyAmnt){
				cash = (parseFloat(cash - buyAmnt)).toFixed(2); //calculating available cash 
				alert("Your available Cash balance is: " + cash);
				availCash.html('<h4 align="right"><b>Cash:</b>$' +cash+ '</h4>');	

				if(map.has(key)){
					var stock = map.get(key);
					stock.set("quantity", parseInt(stock.get("quantity")) + parseInt(quantity));
					stock.set("buyamount", parseFloat(stock.get("buyamount")) + buyAmnt);
					stock.set("boughtat", boughtAt);
					
				}
					else{
						var stockData = new Map();
						stockData.set("quantity", parseInt(quantity));
						stockData.set("buyamount", parseFloat(buyAmnt));
						stockData.set("boughtat", parseFloat(boughtAt));
						map.set(key, stockData);
					}	
				function appendTable(value, key, map){
				var stock = map.get(key);
				$('#custStock table tr:last').after('<tr><td>' + key + '</td><td id= "quant">'+ stock.get("quantity")+ '</td><td>' +stock.get("boughtat")+ '</td><td>'+ stock.get("buyamount") + '</td></tr>');
				}
	
				$("#custStock table").empty();
				$("#custStock table").append("<tr><th>Company</th><th> Quantity</th><th>Price paid for share</th><th> Total</th></tr>");
				$("#currentStock").hide();
				map.forEach(appendTable);
			}
				else{
					alert("OOPS!! You don't have enough cash to buy these shares!")
				}
	});			
		
	$("#sell").click(function(){
		var data = data1;
		var key = data[symbol1]["name"];
		var quantity = $("#quantity").val();

			// condition for existing key in map
			if(map.has(key)){
				var stock = map.get(key);

				if(parseInt(quantity) <= parseInt(stock.get("quantity")) ){

					var sellAmnt= quantity * data[symbol1]["bidPrice"]; //calculating total amount to sell this stock
					sellAmnt=parseFloat(sellAmnt.toFixed(2));
					alert("You will receive " + sellAmnt + " to sell " +data[symbol1]["name"]);
					cash=parseFloat(cash);
					cash = cash + sellAmnt; //adding amount received to the available cash
					cash = cash.toFixed(2);
					alert("Your available Cash balance is: " + cash);
					availCash.html('<h4 align="right"><b>Cash:</b>$' +cash+ '</h4>');
					 //store map entries
					stock.set("quantity", (parseInt(stock.get("quantity")) - quantity));
					stock.set("buyamount", stock.get("buyamount") - parseInt(sellAmnt));
					stock.set("boughtat", stock.get("boughtat"));

				}
				//not enough quantity
				else{

					alert("You don't have enough shares to sell!!");
				}
				
			}
			// condition of non-existing key in map
			else{
				alert("You can't make this transaction!");
			}
			// delete entry from map when quantity is zero
			if(stock.get("quantity")<=0){
						map.delete(key);
			}
			
		//function to append modified values
		function appendTable(value, key, map) {
		var stock = map.get(key);
		$('#custStock table tr:last').after('<tr><td>' + key + '</td><td id= "quant">'+ stock.get("quantity")+ '</td><td>' +stock.get("boughtat")+ '</td><td>'+ stock.get("buyamount") + '</td></tr>');
		}
		$("#custStock table").empty(); //empty table
			if(map.size!=0 ){
				$("#custStock table").append("<tr><th>Company</th><th> Quantity</th><th>Price paid for share</th><th> Total</th></tr>");
				map.forEach(appendTable);
			}
			else {	
				$("#currentStock").show();
			}

	});
});
