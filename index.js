var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dateFormat = require('dateformat');
var dbConnect = false;
datas = [0,0,0,0,0,0,0];
dataSense = [
[0,0],
[0,0],
[0,0,0],
[0,0,0],
[0,0],
[0,0],
[0,0]
];
var cahaya;
var rpm;
// ================================ >> DATABASE << ===========================================
var con = mysql.createConnection({
  host: "db4free.net",
  user: "powermonitor",
  password: "powermonitor",
  database: "powermonitor"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  dbConnect = true;
  readLimit(1);
  /*
  for(var i = 0; i < 200; i++){
	  insertDB("pln", 220, 1, 220, 1);
  }
  */
});
function insertDB(table, tegangan, arus, daya, kondisi){
	var now = new Date();
	var date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
	sql= "INSERT INTO "+table+" (time,tegangan,arus,daya,kondisi) VALUES ('"+date+"','"+tegangan+"','"+arus+"','"+daya+"','"+kondisi+"')";
	con.query(sql, function (err, result) {
		if (err) throw err;
	 });
}
function insertDB(d, tegangan, arus, daya, chy, kondisi){
	var now = new Date();
	var date = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
	if(d == 0){
		sql= "INSERT INTO "+table+" (time,tegangan,arus,daya,cahaya,kondisi) VALUES ('"+date+"','"+tegangan+"','"+arus+"','"+daya+"','"+chy+"','"+kondisi+"')";
	} else {
		sql= "INSERT INTO "+table+" (time,tegangan,arus,daya,rpm,kondisi) VALUES ('"+date+"','"+tegangan+"','"+arus+"','"+daya+"','"+chy+"','"+kondisi+"')";
	}
	con.query(sql, function (err, result) {
		if (err) throw err;
	 });
}
function readLimit(iLoad){
	var buf = 0;
	sql = "SELECT * FROM cfg ORDER BY no ASC";
	con.query(sql, function (err, result) {
		if (err) throw err;
		if (iLoad == 1){
			buf = parseFloat(result[0].limitbeban1);
			if(dataSense[4,1] > buf) datas[4] = 0;
		} else if (iLoad == 2){
			buf = parseFloat(result[0].limitbeban2);
			if(dataSense[5,1] > buf) datas[5] = 0;
		} else if (iLoad == 3){
			buf = parseFloat(result[0].limitbeban3);
			if(dataSense[6,1] > buf) datas[6] = 0;
		}
	});
}
// ===========================================================================================
var port = process.env.PORT || 8099;
var datas= new Array();

http.listen(port, function() {
    console.log('Server Started. Listening on *:' + port);
	setInterval(updateDBbyInterval, 60000);
});

var sense = new Object();
sense.tegangan = [dataSense[0][0], dataSense[1][0], dataSense[2][0], dataSense[3][0], dataSense[4][0], dataSense[5][0], dataSense[6][0]];
sense.arus = [dataSense[0][1], dataSense[1][1], dataSense[2][1], dataSense[3][1], dataSense[4][1], dataSense[5][1], dataSense[6][1]];
cahaya = dataSense[3][2];
rpm = dataSense[2][2];
function updateSense(){
	sense.tegangan = [dataSense[0][0], dataSense[1][0], dataSense[2][0], dataSense[3][0], dataSense[4][0], dataSense[5][0], dataSense[6][0]];
	sense.arus = [dataSense[0][1], dataSense[1][1], dataSense[2][1], dataSense[3][1], dataSense[4][1], dataSense[5][1], dataSense[6][1]];
	cahaya = dataSense[3][2];
	rpm = dataSense[2][2];
}
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/data', function(req,res,next){
	res.set('Content-Type', 'text/html');
	var buf = new String;
	for (var i = 0; i<7; i++){
		buf += String(datas[i]);
		buf += i < 6 ? ',' : '';
	}
    res.status(200).send(String(buf));
})
app.post('/data', function(req,res,next){
	var buf = new String;
	for (var i = 0; i<7; i++){
		buf += String(datas[i]);
		buf += i < 6 ? ',' : '';
	}
    res.status(200).send(String(buf));
})
app.get('/set', function(req,res,next){
    //pub.publish('sensor', req.query.tg);
    dataSense[Number(req.query.node)][0] = Number(req.query.tg);
	dataSense[Number(req.query.node)][1] = Number(req.query.ars);
	for (var i = 1; i < 4; i++){
		readLimit(i);
	}
	updateSense();
	//console.log(dataSense);
    //var y = JSON.stringify(req.query.da);
    res.send("ok");
})

app.get('/dio', function(req,res,next){
    //pub.publish('sensor', req.query.tg);
    datas[0] = req.query.s1;
    datas[1] = req.query.s2;
    datas[2] = req.query.s3;
    datas[3] = req.query.s4;
    datas[4] = req.query.b1;
    datas[5] = req.query.b2;
    datas[6] = req.query.b3;
	var asd = new String;
	for (var i = 0; i< 7; i++){
		asd+= String(datas[i]);
		asd+= ", ";
	}
	console.log("DIO: UPDATE [" + asd + "]");
    res.status(200).send("ok");
})

app.get('/read', function(req,res,next){
	console.log("READ DATA");
    res.status(200).send(sense);
})

app.get('/serial', function(req,res,next){
	console.log(req.query.msg);
    res.status(200).send("ok");
})
function updateDBbyInterval(){
	insertDB("pln", sense.tegangan[0], sense.arus[0], sense.tegangan[0] * sense.arus[0], datas[0]);
	insertDB("genset", sense.tegangan[1], sense.arus[1], sense.tegangan[1] * sense.arus[1], datas[1]);
	insertDB(0, sense.tegangan[3], sense.arus[3], sense.tegangan[3] * sense.arus[3], cahaya, datas[3]); // solar
	insertDB("beban1", sense.tegangan[4], sense.arus[4], sense.tegangan[4] * sense.arus[4], datas[4]);
	insertDB("beban2", sense.tegangan[5], sense.arus[5], sense.tegangan[5] * sense.arus[5], datas[5]);
	insertDB("beban3", sense.tegangan[6], sense.arus[6], sense.tegangan[6] * sense.arus[6], datas[6]);
	
}
