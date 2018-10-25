var plotly = require('plotly')('palo.14','TH5SMw69JFkbte5gHzy4');
var math = require('mathjs');
var nsamples = 100;
var dt = 0.1;
var t = [];
var vtrue = 10;

var xinitial = 0;
var xtrue = [];
var i;
var velTrue = [];
for(i=0;i<nsamples;i++){
	t.push(dt*i);
	xtrue.push(xinitial+vtrue*t[i]);
	velTrue.push(vtrue);
}

var xk_prev = math.matrix([[-1.3],[vtrue*0.5]]);
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
for(i=0; i<nsamples; i++){
	z = xtrue[i+1] + sigma_meas*Math.random();
	z_buffer.push(z);
	instantV.push((z-z_buffer[i-1])/dt);

	p1 = math.add(math.multiply(math.multiply(phi, p), math.transpose(phi)),q); //2x2
	s = math.add(math.multiply(math.multiply(m, p1), mt),r); //1x1
	k = math.multiply(math.multiply(p1, mt),math.inv(s)); //2x1

	p = math.subtract(p1, math.multiply(math.multiply(k, m), p1)); //2x2
	k = math.matrix([[math.subset(k, math.index(0))],[math.subset(k, math.index(1))]]);	
	test = math.multiply(k, math.subtract(z, math.multiply(math.multiply(m, phi), xk_prev)));
	test = math.matrix([[math.subset(test, math.index(0))],[math.subset(test, math.index(1))]]);	
	xk = math.add(math.multiply(phi, xk_prev), test);
	console.log(xk);
	xk_buffer = math.concat(xk_buffer, xk);
	xkbufplot.push(math.subset(xk_buffer, math.index(0,i))+1.3);
	xkbufplotV.push(math.subset(xk_buffer, math.index(1,i)));
	xk_prev = xk;
}


//PLOT
var trace1 = {
  x: t,
  y: xtrue,
  type: "scatter"
};
var trace2 = {
  x: t,
  y: z_buffer,
  xaxis: "x2",
  yaxis: "y2",
  type: "scatter"
};
var trace3 = {
  x: t,
  y: xkbufplot,
  xaxis: "x3",
  yaxis: "y3",
  type: "scatter"
};
var data = [trace1, trace2, trace3];
var layout = {
  xaxis: {domain: [0, 0.33]},
  yaxis2: {anchor: "x2"},
  xaxis2: {domain: [0.34, 0.66]},
  yaxis3: {anchor: "x3"},
  xaxis3: {domain: [0.67, 1]}
};
var graphOptions = {layout: layout, filename: "stacked-coupled-subplots", fileopt: "overwrite"};
plotly.plot(data, graphOptions, function (err, msg) {
    console.log(msg);
}); 

/*var trace1 = {
  x: t,
  y: velTrue,
  type: "scatter"
};
var trace2 = {
  x: t,
  y: instantV,
  xaxis: "x2",
  yaxis: "y2",
  type: "scatter"
};
var trace3 = {
  x: t,
  y: xkbufplotV,
  xaxis: "x3",
  yaxis: "y3",
  type: "scatter"
};
var data = [trace1, trace2, trace3];
var layout = {
  xaxis: {domain: [0, 0.33]},
  yaxis2: {anchor: "x2"},
  xaxis2: {domain: [0.34, 0.66]},
  yaxis3: {anchor: "x3"},
  xaxis3: {domain: [0.67, 1]}
};
var graphOptions = {layout: layout, filename: "stacked-coupled-subplots", fileopt: "overwrite"};
plotly.plot(data, graphOptions, function (err, msg) {
    console.log(msg);
});*/