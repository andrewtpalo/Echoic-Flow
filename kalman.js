
var plotly = require('plotly')('palo.14','TH5SMw69JFkbte5gHzy4');
var math = require('mathjs');
var methods = {};


var t = [];

var xtrue = [];
var i;
var velTrue = [];
for(i=0;i<nsamples;i++){
	t.push(dt*i);
	xtrue.push(xinitial+vtrue*t[i]);
	velTrue.push(vtrue);
}

var xk_prev = math.matrix([[0],[vtrue*0.5]]);
var xk = [];
var phi = math.matrix([[1, dt], [0, 1]]);

var sigma_model = 1;
var sigma_meas = 1;
var p = math.matrix([[sigma_model*sigma_model, 0], [0, sigma_model*sigma_model]]);
var q = math.matrix([[0,0],[0,0]]);
var r = sigma_meas*sigma_meas;
var m = math.matrix([1, 0]);
var mt = math.matrix([[1],[0]]);

var xk_buffer = xk_prev;
var z_buffer =[];
var z;
var p1;
var s;
var k;
var test;
var xkbufplot = [];
var xkbufplotV = [];
var instantV = [];
instantV.push(0.0);

methods.filtering = function(nsamples, vtrue, xinitial, dt){
	for(i=0; i<nsamples; i++){
		z = xtrue[i+1] + sigma_meas*Math.random();
		z_buffer.push(z);
		instantV.push((z-z_buffer[i-1])/dt);
		p1 = math.add(math.multiply(math.multiply(phi, p), math.transpose(phi)),q); //2x2
		s = math.add(math.multiply(math.multiply(m, p1), mt),r); //1x1
		k = math.multiply(math.multiply(p1, mt),math.inv(s)); //2x1
		k = math.matrix([[math.subset(k, math.index(0))],[math.subset(k, math.index(1))]]);	;
		p = math.subtract(p1,math.multiply(math.multiply(k, math.transpose(mt)), p1)); //2x2
		test = math.multiply(k, math.subtract(z, math.multiply(math.multiply(m, phi), xk_prev)));
		test = math.matrix([[math.subset(test, math.index(0))],[math.subset(test, math.index(1))]]);	
		xk = math.add(math.multiply(phi, xk_prev), test);
		xk_buffer = math.concat(xk_buffer, xk);
		xkbufplot.push(math.subset(xk_buffer, math.index(0,i)));
		xkbufplotV.push(math.subset(xk_buffer, math.index(1,i)));
		xk_prev = xk;
	}
}

methods.displayChoice = function(display){
	switch(display){
			
		//PLOT
		case 1:
			var trace1 = {
			  x: t,
			  y: xtrue,
			  name: "xTrue",
			  type: "scatter"
			};
			var trace2 = {
			  x: t,
			  y: z_buffer,
			  xaxis: "x2",
			  yaxis: "y2",
			  name: "Measured Position",
			  type: "scatter"
			};
			var trace3 = {
			  x: t,
			  y: xkbufplot,
			  xaxis: "x3",
			  yaxis: "y3",
			  name: "Filtered Position",
			  type: "scatter"
			};
			var data = [trace1, trace2, trace3];
			var layout = {
			  yaxis: {anchor: "x", title: "xTrue"},
			  xaxis: {domain: [0, 0.25], title: "time(s)"},
			  yaxis2: {anchor: "x2", title: "measured Pos"},
			  xaxis2: {domain: [0.375,0.625], title: "time(s)"},
			  yaxis3: {anchor: "x3", title: "filtered Pos"},
			  xaxis3: {domain: [0.75,1], title: "time(s)"}
			};
			var graphOptions = {layout: layout, filename: "stacked-coupled-subplots", fileopt: "overwrite"};
			plotly.plot(data, graphOptions, function (err, msg) {
				console.log(msg);
			});
			break;
		case 2:
			var trace1 = {
			  x: t,
			  y: velTrue,
			  xaxis: "x",
			  yaxis: "y",
			  name: "True Velocity",
			  type: "scatter"
			};
			var trace2 = {
			  x: t,
			  y: instantV,
			  xaxis: "x2",
			  yaxis: "y2",
			  name: "instantaneous Vel",
			  type: "scatter"
			};
			var trace3 = {
			  x: t,
			  y: xkbufplotV,
			  xaxis: "x3",
			  yaxis: "y3",
			  name: "Filtered Vel",
			  type: "scatter"
			};
			var data = [trace1, trace2, trace3];
			var layout = {
			  yaxis: {anchor: "x", title: "velTrue"},
			  xaxis: {domain: [0, 0.25], title: "time(s)"},
			  yaxis2: {anchor: "x2", title: "instantaneous Vel"},
			  xaxis2: {domain: [0.375,0.625], title: "time(s)"},
			  yaxis3: {anchor: "x3", title: "filtered vel"},
			  xaxis3: {domain: [0.75,1], title: "time(s)"}
			};
			var graphOptions = {layout: layout, filename: "stacked-coupled-subplots", fileopt: "overwrite"};
			plotly.plot(data, graphOptions, function (err, msg) {
				console.log(msg);
			});
			break;
		default:
			console.log("No Display Selected");
			break;
	}
}

module.exports = methods;