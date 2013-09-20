var container;
var camera, controls, scene, renderer;
var mesh, texture;

var closestHelper = [];

var gridSpace = 50; // In meters

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
	controls.movementSpeed = 70;
	controls.lookSpeed = 0.75;
	controls.noFly = true;

	console.log(worldWidth);
	var geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );


	populateDataIntoGeometry(SRTMData.nodes, geometry);

	console.log(geometry);

	//mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xFFFFFF } ) );
	//scene.add( mesh );

	var material = new THREE.ParticleBasicMaterial({color: 0xFFFFFF});
	var particleSystem = new THREE.ParticleSystem( geometry, material);
	scene.add(particleSystem);


	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.y = 0;

	// Initialize the Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x000000,1);
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


function populateDataIntoGeometry(inData, geo) {
	var index = 0;
	for ( var i = 0; i < worldWidth; i++ ) {
		console.log('i:'+i);
		var iAbs = originXInMeters + i*gridSpace;
	    for ( var j = 0; j < worldDepth; j++ ){
	    	console.log('j:'+j);
	    	var jAbs = originYInMeters + j*gridSpace;
	    	var closest = {
	    			i:0,
		    		x:0,
		    		y:0,
		    		z:0,
		    		d:40075160 // Start with the circumference of the Earth
		    	};
	    	//for (var k = 0; k < Object.keys(inData).length; k++) {
	    		/*
	    	for (var k in inData) {
	    		//var xym = latlon2meters(inData[k]['lat'], inData[k]['lon']);
	    		var d = distance(iAbs,jAbs,inData[k]['xm'],inData[k]['ym']);
	    		if (d < closest.d) {
	    			console.log('blech');
	    			closest.i = k;
	    			closest.x = inData[k]['xm'];
	    			closest.y = inData[k]['ym'];
	    			closest.z = inData[k]['ele'];
	    			closest.d = d;
	    		}
	        }
	        */
	        var possibleClosestPoints = findPossibleClosestPoints(iAbs,jAbs);

	        for (var k in possibleClosestPoints) {
	        	var d = distance(iAbs,jAbs,inData[k]['xm'],inData[k]['ym']);
	    		if (d < closest.d) {
	    			console.log('blech');
	    			closest.i = k;
	    			closest.x = inData[k]['xm'];
	    			closest.y = inData[k]['ym'];
	    			closest.z = inData[k]['ele'];
	    			closest.d = d;
	    		}
	    	}
	        
	        geo.vertices[index].x = closest.x;
	        geo.vertices[index].y = closest.y;
	        geo.vertices[index].z = closest.z;
	        //geo.vertices[index] = new THREE.Vector3(closest.x,closest.y,closest.z);
	    }
	}
}

function findPossibleClosestPoints(iAbs,jAbs) {
	
    if (typeof closestHelper[iAbs] === 'undefined') {
    	closestHelper[iAbs] = [];
    }
    if (typeof closestHelper[iAbs][jAbs] === 'undefined'){
    	closestHelper[iAbs][jAbs] = [];
    }
    if (closestHelper[iAbs][jAbs].length === 0){
    	console.log('here');
    	var retVal = [];
    	var foundEm = false;
    	
    	console.log(jAbs);
    	console.log(iAbs);
    	console.log(minX);
    	console.log(minY);
    	console.log(maxX);
    	console.log(maxY);

		if (iAbs+gridSpace <= maxX) {console.log('meh3');retVal.push(closestHelper[iAbs+gridSpace][jAbs]);}
		if (iAbs-gridSpace >= minX) {console.log('meh4');retVal.push(closestHelper[iAbs-gridSpace][jAbs]);}
    	if (jAbs+gridSpace <= maxY) {console.log('meh1');retVal.push(closestHelper[iAbs][jAbs+gridSpace]);}
		if (jAbs-gridSpace >= minY) {console.log('meh2');retVal.push(closestHelper[iAbs][jAbs-gridSpace]);}

		if (retVal.length === 0) {
			console.log('here2');
			retVal.push(findPossibleClosestPoints(iAbs,jAbs+gridSpace));
			retVal.push(findPossibleClosestPoints(iAbs,jAbs-gridSpace));
			retVal.push(findPossibleClosestPoints(iAbs+gridSpace,jAbs));
			retVal.push(findPossibleClosestPoints(iAbs-gridSpace,jAbs));
			
		}
		return retVal;
    } else  {
    	return closestHelper[iAbs][jAbs];
    }
}


function populateDataIntoGeometryOld(inData, geometry, precision) {
	for (var key in inData['nodes']) {
		geometry.vertices.push( 
			new THREE.Vector3( 
				inData['nodes'][key]['lat']*111000, // Convert to meters 
				inData['nodes'][key]['lon']*85000, // Convert to meters TODO: Fix this...
				inData['nodes'][key]['ele']
			)
		);
	}
	//generateFaces(geometry);
	console.log(geometry);
}

function populateDataIntoGeometryOlder(inData, geometry, precision) {
	// The precision defines how precise the data should be 
	// (ie: the distance between "height points"). 

	var decPlaces = precision.toFixed(15).toString().replace(/0*$/, '').split('.')[1].length;
	console.log(decPlaces);
	console.log(precision);

	/* data interpolation algorithm */

	// Create an incrementer for the geometry vertices, which 
	// will be a one dimensional array
	var vindex = 0; 

	var cachedEle = 0;
	// Loop from minLat->maxLat, incrementing by precision
	var minLat = Number(inData.minLat.toFixed(decPlaces));
	var maxLat = Number(inData.maxLat.toFixed(decPlaces));
	var minLon = Number(inData.minLon.toFixed(decPlaces));
	var maxLon = Number(inData.maxLon.toFixed(decPlaces));

	
	for (var lat = minLat; lat <= maxLat; lat += precision) {
		// Loop from minLon->maxLon, incrementing by precision
		for (var lon = minLon; lon <= maxLon; lon += precision) {
			if (typeof inData['nodes'][lat] != 'undefined'){
				if (typeof inData['nodes'][lat][lon] != 'undefined'){
					cachedEle = inData['nodes'][lat][lon];
				}
			}
			// Add a new entry to data for that point
			geometry.vertices[vindex].x = lat;
			geometry.vertices[vindex].y = lon;
			geometry.vertices[vindex].z = cachedEle;
			vindex++;
		}
	}

	console.log(geometry);
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
	worldWidth = Math.round((Math.abs(maxInMeters.x - minInMeters.x))/gridSpace);
	worldDepth = Math.round((Math.abs(maxInMeters.y - minInMeters.y))/gridSpace);
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

		var xNearestGridpoint = originXInMeters + customRound(xym.x,gridSpace);
		var yNearestGridpoint = originYInMeters + customRound(xym.y,gridSpace);

		if (typeof closestHelper[xNearestGridpoint] === 'undefined') {
			closestHelper[xNearestGridpoint] = [];
		}
		if (typeof closestHelper[xNearestGridpoint][yNearestGridpoint] === 'undefined') {
			closestHelper[xNearestGridpoint][yNearestGridpoint] = [];
		}
		closestHelper[xNearestGridpoint][yNearestGridpoint] = i;

	}

}

// Rounds value to the nearest multiple of "nearest"
function customRound(value,nearest) {
    return (value % nearest) >= nearest/2 ? parseInt(value / nearest) * nearest + nearest : parseInt(value / nearest) * nearest;
}

function animate() {

	requestAnimationFrame( animate );

	render();
}

function render() {

	controls.update( clock.getDelta() );
	renderer.render( scene, camera );

}
