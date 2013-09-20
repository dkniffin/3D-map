<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 'on');

	ini_set('memory_limit', '256M');

	$data = simplexml_load_file('../../data/srtm.osm');

	//echo "<script> console.log(".json_encode($data).");</script>";

	$outData = [
		"minLat" => 180.0, // Default to max
		"maxLat" => -180.0, // Default to min
		"minLon" => 180.0, // Default to max
		"maxLon" => -180.0, // Default to min
		"minEle" => 8849.87, // Default to highest point
		"maxEle" => -414.0, // Default to lowest point
		"nodes" => [] 
	];
	$nodeData = [];


	foreach ($data->node as $node) {

		$nodeRef = intval($node->attributes()->id);
		$nodeLat = floatval($node->attributes()->lat);
		$nodeLon = floatval($node->attributes()->lon);

		// Update min/max lat/lon
		if($nodeLat < $outData['minLat']) { $outData['minLat'] = $nodeLat; }
		if($nodeLat > $outData['maxLat']) { $outData['maxLat'] = $nodeLat; }
		if($nodeLon < $outData['minLon']) { $outData['minLon'] = $nodeLon; }
		if($nodeLon > $outData['maxLon']) { $outData['maxLon'] = $nodeLon; }

		$nodeData["$nodeRef"]['lat'] = $nodeLat;
		$nodeData["$nodeRef"]['lon'] = $nodeLon;
		
	}

	foreach ($data->way as $way) {
		$ele = 0;
		foreach ($way->tag as $tag) {
			if ($tag->attributes()->k == 'ele'){
				$ele = intval($tag->attributes()->v);
				if($ele < $outData['minEle']) { $outData['minEle'] = $ele; }
				if($ele > $outData['maxEle']) { $outData['maxEle'] = $ele; }
				break;
			}
		}
		foreach ($way->nd as $nd) {
			$ref = intval($nd->attributes()->ref);
			$lat = $nodeData["$ref"]['lat'];
			$lon = $nodeData["$ref"]['lon'];
			$nodeData["$ref"]['ele'] = $ele;

			$outData['nodes']["$ref"] = $nodeData["$ref"];
			
			//$outData['nodes']["$lat"]["$lon"] = $ele;

			//echo "lat: $lat <br/>";
			//echo "lon: $lon <br/>";
			//echo "ele: $ele <br/>";
			//echo "<br/>";
		}
	}

	

	// Custom JSON Encode
	
	echo json_encode($outData);
		

?>
