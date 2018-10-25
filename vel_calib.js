var arDrone = require('ar-drone');
var fs = require('fs');
var client = arDrone.createClient();
var sent_land = false;
var stop_computing = false;
var file_return = [];
var stage_flag = 0;  
//0 -> Rise to start_height
//1 -> Start landing

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CHANGE THESE PARAMETERS////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

var filename = "recent.txt"
var mtrcomm = 0.52;
var start_height = 2.3;
var stop_height = 0.5;

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////Data Loop////////////////////////////////////
client.takeoff(function() {

client.on('navdata', function (data) {
	
	if (data.demo.altitude) {

		if(stop_computing === false && stage_flag === 1) {
			LogandSave(data.demo.altitude, Date.now());
		}
		
		CheckDrone(data.demo.altitude);
	}

});

});

/////////////////////////////////////Functions////////////////////////////////////

function WriteFile() {

	fs.writeFile(filename,file_return,function(err)  {
		if(err){
			return console.log(err);
		}

		console.log("The file was saved!");
		Exit(); 
	});
}

var Exit = function() {


	throw new Error('Landed, exiting program');
	
}

function LogandSave(alt, time) {

		file_return.push(alt,time);
	 
		return;
}

function CheckDrone(altitude) {
		
		if(stage_flag === 0) {

				if(altitude <= start_height) {
					client.up(0.3);
					//client.front(0.05);
				} else {
					client.stop();
					client.after(2000, function () {
						stage_flag = 1;
						client.down(mtrcomm);
					})
				}
		} else {

				if(altitude <= stop_height && sent_land === false) { 

					sent_land = true; //keeps program from repeatedly sending landing command
					client.stop();
					client.land(WriteFile);
				
				}
			
		}
		
}



