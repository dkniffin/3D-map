var container;
var camera, controls, scene, renderer;
var mesh, texture;

var closestHelper = [];

var gridSpace = 100; // In meters

var SRTMData;


var worldWidth, worldDepth, // Number of grid points in each direction.
worldHalfWidth, worldHalfDepth;

var minX, maxX, minY, maxY;

var originXInMeters, originYInMeters;

var clock = new THREE.Clock();

function init(){
	container = document.getElementById('mapContainer');

	// Create the scene
	scene = new THREE.Scene();

	// Create the camera
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );

	// Set up controls

	// Orbit controls
	//controls = new THREE.OrbitControls( camera );
	//controls.addEventListener( 'change', render);
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 3000;
	controls.lookSpeed = 0.1;
	//controls.noFly = true;

	var geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	console.log(geometry);
	populateDataIntoGeometry(SRTMData.nodes, geometry);

	console.log(geometry);

	mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xa0a0a0 } ) );
	scene.add( mesh );

	var material = new THREE.ParticleBasicMaterial({color: 0x000000, size: 10});
	var particleSystem = new THREE.ParticleSystem( geometry, material);
	scene.add(particleSystem);

	camera.position.x = -3750;
	//camera.position.x = 4426736;
	camera.position.y = 3750;
	//camera.position.z = -8947843;
	camera.position.z = 3000;

	// Initialize the Renderer
	renderer = new THREE.WebGLRenderer();
	//renderer.setClearColor(0xFFFFFF,1);
	//renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Empty the rendering container
	container.innerHTML = "";

	// Append the renderer to the container
	container.appendChild( renderer.domElement );

	// Set up a window resize listener
	//window.addEventListener( 'resize', onWindowResize, false );
}

function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
}


function populateDataIntoGeometry(inData,geo) {

	//console.log('worldWidth:'+worldWidth);
	//console.log('worldDepth:'+worldDepth);
	//console.log('originXInMeters:'+originXInMeters);
	//console.log('originYInMeters:'+originYInMeters);
	// Set up our boxes for organizing the points
	var gridApproximationBoxes = new Array(worldWidth+5);
	for (var i=0; i<gridApproximationBoxes.length; i++) {
		gridApproximationBoxes[i] = new Array(worldDepth+5);
		for (var j=0; j<gridApproximationBoxes[i].length; j++) {
			gridApproximationBoxes[i][j] = new Array();
		}
	}
	//console.log(gridApproximationBoxes);

	// Sort each node into a box
	for (var ptIndex in inData) {
		// Set local variable for X and Y point coords
		var ptX = inData[ptIndex]['xm'];
		var ptY = inData[ptIndex]['ym'];

		// Find the containing box
		//console.log('without origin:'+(ptX-originXInMeters));
		//console.log('without origin:'+(ptY-originYInMeters));
		//console.log('rounded down:'+customRound(ptX-originXInMeters,'down',gridSpace));
		//console.log('rounded down:'+customRound(ptY-originYInMeters,'down',gridSpace));
		var gabX = customRound(ptX-originXInMeters,'down',gridSpace)/gridSpace;
		var gabY = customRound(ptY-originYInMeters,'down',gridSpace)/gridSpace;
		//console.log('Point: '+ptX+', '+ptY+' is in box '+gabX+', '+gabY);

		gridApproximationBoxes[gabX][gabY].push(ptIndex);

	}
	//console.log(gridApproximationBoxes);

	var Vindex = 0;
	// Find the closest point to each vertex
	for ( var i = 0; i < worldWidth-1; i++ ) {
		var iAbs = originXInMeters + i*gridSpace;
	    for ( var j = 0; j < worldDepth-1; j++ ){
	    	Vindex++;
	    	//console.log('i:'+i);
	    	//console.log('j:'+j);
	    	var jAbs = originYInMeters + j*gridSpace;

/*
	    	var minXindex = i,
	    		minYindex = j,
	    	  	maxXindex = i+1,
	    	  	maxYindex = j+1;
	    	  	*/

	    	var radius = 1;
    	  	
	    	var points = [];

	    	// Find the possible closest points
	    	while (points.length === 0 /*&& radius <= 50*/) {
	    		//console.log('radius:'+radius);
	    		minXindex = i-(radius-1);
	    		minYindex = j-(radius-1);
	    	  	maxXindex = i+radius;
	    	  	maxYindex = j+radius;

	    	  	//console.log(minXindex);
	    		//console.log(minYindex);
	    	  	//console.log(maxXindex);
	    	  	//console.log(maxYindex);

	    	  	if (typeof gridApproximationBoxes[minXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[minXindex][minYindex] !== 'undefined'){
	    	  		//console.log('meh');
	    	  		for (var nii in gridApproximationBoxes[minXindex][minYindex]) {
	    	  			var ni = gridApproximationBoxes[minXindex][minYindex][nii];
	    	  			//console.log(ni);
	    	  			points.push(inData[ni]);
	    	  		}
	    			
	    		}
	    		if (typeof gridApproximationBoxes[minXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[minXindex][maxYindex] !== 'undefined'){
	    			//console.log('meh');
	    			for (var nii in gridApproximationBoxes[minXindex][maxYindex]) {
	    				var ni = gridApproximationBoxes[minXindex][maxYindex][nii];
	    				//console.log(ni);
	    				points.push(inData[ni]);
	    			}
	    				
	    		}
	    		if (typeof gridApproximationBoxes[maxXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[maxXindex][minYindex] !== 'undefined'){
	    			//console.log('meh');
	    			for (var nii in gridApproximationBoxes[maxXindex][minYindex]) {
	    				var ni = gridApproximationBoxes[maxXindex][minYindex][nii];
	    				//console.log(ni);
	    				points.push(inData[ni]);
	    			}
	    		}
	    		if (typeof gridApproximationBoxes[maxXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[maxXindex][maxYindex] !== 'undefined'){
	    			//console.log(gridApproximationBoxes[maxXindex][maxYindex]);
	    			for (var nii in gridApproximationBoxes[maxXindex][maxYindex]) {
	    				var ni = gridApproximationBoxes[maxXindex][maxYindex][nii];
	    				//console.log(ni);
	    				points.push(inData[ni]);
	    			}
	    		}
	    		radius++;
	    	}
    	  	
    	  	//console.log(points);

    	  	
		    
		    //var closest = findNearest(iAbs,jAbs,inData);
		    var closest = findNearest(iAbs,jAbs,points);
		    //console.log(Vindex);
		    //console.log(closest);
		    //geo.vertices[Vindex].x = closest.x;
		    //geo.vertices[Vindex].z = closest.y;
		    geo.vertices[Vindex].y = closest.z;

		}
	}
}

var limit = 0;
function findNearest(x, y, points) {

	var closest = {
		i:0,
		x:0,
		y:0,
		z:0,
		d:40075160 // Start with the circumference of the Earth
	};
	for (var k in points) {
		//console.log(points[k]);
    	var d = distance(x,y,points[k]['xm'],points[k]['ym']);
		if (d < closest.d) {
			//console.log('blech');
			closest.i = k;
			closest.x = points[k]['xm'];
			closest.y = points[k]['ym'];
			closest.z = points[k]['ele'];
			closest.d = d;
		}
	}
	if (limit < 100) {
		console.log(points);
		console.log("the closest point to x="+x+",y="+y+" is");
		console.log(closest);
		limit++;
	}
	return closest;
}


function dataMiddle(inData){
	var midLat = (inData.maxLat + inData.minLat)/2;
	var midLon = (inData.maxLon + inData.minLon)/2;
	var midEle = (inData.maxEle + inData.minEle)/2;
	return new THREE.Vector3(midLat,midLon,midEle);
}

function latlon2meters(lat,lon){
	// TODO: Fix this. Lon doesn't convert that easily. This 
	// value is specific to locations at about 40 N or S
	return {
		x: lat*111000,
		y: lon*85000 
	}
}

function updateWorldDimensions(minLat, maxLat, minLon, maxLon){
	minInMeters = latlon2meters(minLat,minLon);
	maxInMeters = latlon2meters(maxLat,maxLon);

	minX = minInMeters.x;
	minY = minInMeters.y;
	maxX = maxInMeters.x;
	maxY = maxInMeters.y;

	// The logic used below is: find the distance between max and min in degrees,
	// convert to meters, and divide by the spacing between grid points, to get 
	// the number of grid points.
	worldWidth = customRound((Math.abs(maxInMeters.x - minInMeters.x))/gridSpace,'nearest',2);
	worldDepth = customRound((Math.abs(maxInMeters.y - minInMeters.y))/gridSpace,'nearest',2);
	worldHalfWidth = worldWidth/2;
	worldHalfDepth = worldDepth/2;

	originXInMeters = minInMeters.x;
	originYInMeters = minInMeters.y;
}

function populateSRTMData(data){
	SRTMData = data;

	
	updateWorldDimensions(SRTMData.minLat, SRTMData.maxLat, SRTMData.minLon, SRTMData.maxLon);

	// Help make the "closest" calculation quicker
	for (var i in SRTMData.nodes) {
		var xym = latlon2meters(SRTMData.nodes[i]['lat'], SRTMData.nodes[i]['lon']);
		SRTMData.nodes[i]['xm'] = xym.x;
		SRTMData.nodes[i]['ym'] = xym.y;

	}
}

// Rounds value to the nearest multiple of "nearest"
function customRound(value, mode, multiple) {
	switch(mode){
	case 'nearest':
		return (value % multiple) >= multiple/2 ? parseInt(value / multiple) * multiple + multiple : parseInt(value / multiple) * multiple;
	case 'down':
		return (multiple * Math.floor(value / multiple));
	case 'up':
		return (multiple * Math.ceil(value / multiple));
	}
    
}

function animate() {

	requestAnimationFrame( animate );

	render();
}

function render() {

	controls.update( clock.getDelta() );
	renderer.render( scene, camera );

}
