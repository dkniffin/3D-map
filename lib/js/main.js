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

// Initialize everything needed for the scene
function init(){
	// Get the container to render into
	container = document.getElementById('mapContainer');

	// Create the scene
	scene = new THREE.Scene();

	// Create the camera
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20000 );

	// Set up controls

	// Orbit controls
	//controls = new THREE.OrbitControls( camera );
	//controls.addEventListener( 'change', render);

	// First person controls
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 3000;
	controls.lookSpeed = 0.1;
	//controls.noFly = true;

	// Set up the plane geometry w/ width, depth, numWidthGridPoints, and
	// numDepthGridPoints  
	// BIG NOTE: the number of grid points must be even! It took me about 
	// 3 days of troubleshooting to figure that out.
	var geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );


	console.log(geometry);

	// Set the height of each gridpoint in the geometry
	populateDataIntoGeometry(SRTMData.nodes, geometry);

	console.log(geometry);

	// Display the geometry as a mesh
	//mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xa0a0a0 } ) );
	mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { 
		map: THREE.ImageUtils.loadTexture('lib/textures/seamless-dirt.jpg')
	} ) );
	scene.add( mesh );

	// Display the geometry as a particle system
	//var material = new THREE.ParticleBasicMaterial({color: 0x000000, size: 10});
	//var particleSystem = new THREE.ParticleSystem( geometry, material);
	//scene.add(particleSystem);

	// Position the camera
	camera.position.x = -3750;
	camera.position.y = 3750;
	camera.position.z = 3000;

	// Lighting
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(-3750,6000,3000).normalize();
	scene.add(directionalLight);


	// Initialize the Renderer
	renderer = new THREE.WebGLRenderer();
	//renderer.setClearColor(0xFFFFFF,1);
	//renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Empty the rendering container
	container.innerHTML = "";

	// Append the renderer to the container
	container.appendChild( renderer.domElement );

	console.log(scene);
	// Set up a window resize listener
	//window.addEventListener( 'resize', onWindowResize, false );
}

// This function takes input data (inData) and fills it into a geometry (geo),
// by setting the height of each vertex in the geometry
function populateDataIntoGeometry(inData,geo) {

	//console.log('worldWidth:'+worldWidth);
	//console.log('worldDepth:'+worldDepth);
	//console.log('originXInMeters:'+originXInMeters);
	//console.log('originYInMeters:'+originYInMeters);

	// The algorithm used here is as follows: 

	// 1: Sort each input data point into a "grid approximation box";
	// basically round it to the nearest gridpoint.

	// 2: Loop over each vertex in the geometry, find the closest point to
	// that vertex. The way it does this is by first looking for points in the
	// grid- approximation-box for that vertex, and then searching each vertex
	// progressively farther out

	//3: Once it's found the closest data point, it sets the height of the
	//vertex to the height of that point.


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
	
    for ( var i = 0; i < worldDepth; i++ ){
    	var iAbs = originYInMeters + i*gridSpace;
    	for ( var j = 0; j < worldWidth; j++ ) {
			var jAbs = originXInMeters + j*gridSpace;
	    	
	    	var radius = 1;
    	  	
	    	var points = [];

	    	// Find the possible closest points
	    	while (points.length === 0) {
	    		minXindex = j-(radius-1);
	    		minYindex = i-(radius-1);
	    	  	maxXindex = j+radius;
	    	  	maxYindex = i+radius;

	    	  	if (typeof gridApproximationBoxes[minXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[minXindex][minYindex] !== 'undefined'){
	    	  		for (var nii in gridApproximationBoxes[minXindex][minYindex]) {
	    	  			var ni = gridApproximationBoxes[minXindex][minYindex][nii];
	    	  			points.push(inData[ni]);
	    	  		}
	    			
	    		}
	    		if (typeof gridApproximationBoxes[minXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[minXindex][maxYindex] !== 'undefined'){
	    			for (var nii in gridApproximationBoxes[minXindex][maxYindex]) {
	    				var ni = gridApproximationBoxes[minXindex][maxYindex][nii];
	    				points.push(inData[ni]);
	    			}
	    				
	    		}
	    		if (typeof gridApproximationBoxes[maxXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[maxXindex][minYindex] !== 'undefined'){
	    			for (var nii in gridApproximationBoxes[maxXindex][minYindex]) {
	    				var ni = gridApproximationBoxes[maxXindex][minYindex][nii];
	    				points.push(inData[ni]);
	    			}
	    		}
	    		if (typeof gridApproximationBoxes[maxXindex] !== 'undefined' &&
	    	  		typeof gridApproximationBoxes[maxXindex][maxYindex] !== 'undefined'){
	    			for (var nii in gridApproximationBoxes[maxXindex][maxYindex]) {
	    				var ni = gridApproximationBoxes[maxXindex][maxYindex][nii];
	    				points.push(inData[ni]);
	    			}
	    		}
	    		radius++;
	    	}
    	  			    
		    var closest = findNearest(jAbs,iAbs,points);
		    geo.vertices[Vindex].y = closest.z;
		    Vindex++;
		}
	}
}

// Find the closest point to x,y in the given set of points
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
	/*
	if (limit < 150) {
		console.log(points);
		console.log("the closest point to x="+x+",y="+y+" is");
		console.log(closest);
		limit++;
	}
	*/
	return closest;
}

// Convert a lat,lon set to a x,y (in meters) set
function latlon2meters(lat,lon){
	// TODO: Fix this. Lon doesn't convert that easily. This 
	// value is specific to locations at about 40 N or S
	return {
		x: lat*111000,
		y: lon*85000 
	}
}


// Update the world dimensions
function updateWorldDimensions(minLat, maxLat, minLon, maxLon){
	minInMeters = latlon2meters(minLat,minLon);
	maxInMeters = latlon2meters(maxLat,maxLon);

	minX = minInMeters.x;
	minY = minInMeters.y;
	maxX = maxInMeters.x;
	maxY = maxInMeters.y;

	// The logic used below is: find the distance between max and min in
	// degrees, convert to meters, and divide by the spacing between grid
	// points, then round to the nearest 2, to get the number of grid points.
	worldWidth = customRound((Math.abs(maxInMeters.x - minInMeters.x))/gridSpace,'nearest',2);
	worldDepth = customRound((Math.abs(maxInMeters.y - minInMeters.y))/gridSpace,'nearest',2);
	worldHalfWidth = worldWidth/2;
	worldHalfDepth = worldDepth/2;

	originXInMeters = minInMeters.x;
	originYInMeters = minInMeters.y;
}

// This function takes "raw" SRTM data (in JSON format) and sets up the
// variables based on that.
function populateSRTMData(data){
	SRTMData = data; // Save the data in a global variable

	// Update the world dimensions based on the data
	updateWorldDimensions(SRTMData.minLat, SRTMData.maxLat, SRTMData.minLon, SRTMData.maxLon);

	// Convert the lat and lon values to x and y values in meters, and store that in the data variable
	for (var i in SRTMData.nodes) {
		var xym = latlon2meters(SRTMData.nodes[i]['lat'], SRTMData.nodes[i]['lon']);
		SRTMData.nodes[i]['xm'] = xym.x;
		SRTMData.nodes[i]['ym'] = xym.y;

	}
}

// Rounds the value to the multiple, using the given mode
// ie: round 5 up to a mupltiple of 10 (10)
// or: round 36 down to a multiple of 5 (35)
// or: round 44 to the nearest multiple of 3 (45)
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

// Distance formula
function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
}

// Animate the scene
function animate() {
	requestAnimationFrame( animate );

	render();
}

// Render the scene
function render() {

	controls.update( clock.getDelta() ); // Update the controls based on a clock
	renderer.render( scene, camera ); // render the scene

}
