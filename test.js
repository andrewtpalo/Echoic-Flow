var arDrone = require('ar-drone');
var client = arDrone.createClient();
var range = [];
var time = [];
var r_buf = [];
var t_buf = [];
stage = 'up'

//Parameters//

var filename = "/Users/justinkuric/Documents/MATLAB/Research Project/landing_tau_0_5.txt";
var start_height = 2.3;
var stop_height = 0.6;
var initial_velocity = -0.744*0.5+0.005
var buf_size = 8;

//////////////

client.takeoff(function() {

client.on('navdata',function() {

	if(data.demo.altitude) {

		current_range = data.demo.altitude;
		current_time = Date.now()/1000;

		switch(stage) {

			case 'up':
				FlyToHeight(current_range,current_time);
				break;
			case 'buf':
				FillBuffer(current_range,current_time);
				break;
			case 'ef':
				EchoicFlow(current_range,current_time);
				break;
			case 'stop'
				LandSave(current_range,current_time);
				break;
		}
	}

});

});

function FlyToHeight(current_range,current_time) {

	if(current_range <= start_height) {
		client.up(0.5);
	} else {
		client.stop()
		client.after(2000,function() {
			stage = 'buf';
		})
	}
}

function FillBuffer(current_range,current_time) {
	client.down(0.5)
	
	if (r_buf.length <= buf_size) {
		r_buf.push(current_range);
		t_buf.push(current_time);
	} else {
		stage = 'ef';
	}
}

function EchoicFlow(current_range,current_time) {

}




