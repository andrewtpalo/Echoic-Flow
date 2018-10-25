var arDrone = require('ar-drone');
var fs = require('fs');
var keypress = require('keypress')

var client = arDrone.createClient();
var r = [];
var t = [];
var r_filt = [];
var v = [];
var tau = [];
var a_need = [];
var v_need = [];
var cmnd = [];
var marker = [];
var header = [];
var file_return = [];
var stage = 'up';
var timer = 'unset';

//Parameters//

var filename = "text.txt";
var start_height = 2.0;
var stop_height = 0.4;
var start_point = 12;
var v0 = -0.4;
var tau_dot = 0.75;
var buf_size = 1;
var order = 1;

// Velocity Equation //

// C = 2.602*(Sqrt(0.712-V)-0.846)

// Marker notation //
//0 -> no EF, trying to reach constant velocity
//1 -> starting EF from filtered data

//Loop
client.takeoff(function() {

	// listen for the "keypress" event 
	keypress(process.stdin);

	process.stdin.on('keypress', function (ch, key) {

	  //land the drone
	  if (ch == 'l'){
		client.removeAllListeners('navdata')
		console.log('landing...');
		client.land();
	  }

	  if (key && key.ctrl && key.name == 'l') {
		Write();
	  }
	});

	process.stdin.setRawMode(true);
	process.stdin.resume();

	// start listening for altitude information
	client.on('navdata', function (data) {

		if(data.demo.altitude) {

			current_range = data.demo.altitude-stop_height;
			current_time = Date.now()/1000;

			switch(stage) {

				case 'up':
					FlyToHeight(current_range,current_time);
					break;
				case 'pause':
					Pause(current_range,current_time);
					break;
				case 'dec':
					StartDecent(current_range,current_time);
					break;
				case 'buf':
					FillBuffer(current_range,current_time);
					break;
				case 'ef':
					EchoicFlow(current_range,current_time);
					break;
				case 'stop':
					LandSave(current_range,current_time);
					break;
			}
		}

	});

});

//Functions
function FlyToHeight(current_range,current_time) {

	if(current_range <= start_height-stop_height) {
		client.front(0.05);
		client.up(0.5);
	} else {
		stage = 'pause';
	}
}

function Pause(current_range,current_time) {

	//stop the drone and wait
	client.stop();

	if (timer === 'unset') {
		setTimeout(function(){stage = 'dec';},2500);
		timer = 'set';
	}
}

function StartDecent(current_range,current_time) {
	//save initial range and time
	r.push(current_range);
	t.push(current_time);
	r_filt.push(current_range);
	v.push(0.0);
	tau.push(0.0);
	a_need.push(0.0);
	v_need.push(0.0);
	cmnd.push(GetMotorCommand(v0));
	marker.push(0.0);
	

	//begin decent at initial velocity
	client.down(GetMotorCommand(v0));
	
	//change stage to start controlling decent
	stage = 'buf';
}

function FillBuffer(current_range,current_time) {
	//save data
	r.push(current_range);
	t.push(current_time);
	
	//what is the current sample?
	var cur = r.length-1;
	var prev = r.length-2;

	//save the rest of the data
	r_filt.push(current_range);
	v.push(ComputeVelocity(r_filt[prev],r_filt[cur],t[prev],t[cur]));
	tau.push(ComputeTau(r[cur],v[cur]));
	a_need.push(0.0);
	v_need.push(0.0);
	cmnd.push(GetMotorCommand(v0));
	marker.push(0.0);

	//if we have reached the starting sample...begin EF!
	if (r.length == start_point) {
		stage = 'ef';
	}
}

function EchoicFlow(current_range,current_time) {
	//save current range and time
	r.push(current_range);
	t.push(current_time);

	//what is the current sample?
	var cur = r.length-1;
	var prev = r.length-2;

	//filter the range data
	r_filt.push(current_range);

	//compute current velocity
	v.push(ComputeVelocity(r_filt[prev],r_filt[cur],t[prev],t[cur]));
	
	//compute current tau
	tau.push(ComputeTau(r_filt[cur],v[cur]));

	//compute needed acceleration
	a_need.push(v[cur]*(1-tau_dot)/tau[cur]);

	//compute needed velocity
	v_need.push(v[cur]+a_need[cur]*1/15);
	
	//set speed to needed velocity
	cmnd.push(GetMotorCommand(v_need[cur]));
	client.down(cmnd[cur]);

	//save the marker
	marker.push(1);

	//check if desitnation is reached
	if(current_range <= 0)
	{
		stage = 'stop';

	}
}

function LandSave(current_range,current_time) {
	client.land(Write);
}

function Write() {
	header = [start_height,stop_height,start_point,v0,tau_dot,buf_size,order,r.length];
	filereturn = [header,r,t,r_filt,v,tau,v_need,a_need,cmnd,marker];
	fs.writeFile(filename,filereturn,function(err){
		if(err){
			return console.log(err);
		}

		console.log("the file was saved...");
		Exit(); 
	});
}

function Exit() {

	console.log('exiting...')
	process.exit();
	
}

function GetMotorCommand(velocity) {

	var command = Math.round(2.602*(Math.sqrt(0.712-velocity)-0.846)*1000)/1000

	if (command <= 0) {
		return 0.01;
	} 
	else if (command >= 1) {
		return 1;
	}
	else {
		return command;
	}

}

function ComputeVelocity(r1,r2,t1,t2) {
	if (t2 === t1) {
		return 0;
	}

	return (r2-r1)/(t2-t1);
}

function ComputeTau(r,v) {

	if(v===0.0){
		v = -0.001;
	}

	return r/v;
}




