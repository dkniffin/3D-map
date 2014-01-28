Overview
========
As I've mentioned before, the project uses terrain data from SRTM, and feature data from OSM. It is generating and rendering the ground, buildings, roads, fire hydrants, and trees for Boulder, CO.


Details to keep in mind/look for:

Terrain/Ground
==============
The ground is generated from a height map. Essentially, the input data is a 2D array of elevation points separated by a set distance. I map that to a three.js PlaneGeometry, so that the Z (up) coordinate is the corresponding height from the data. From there, I simply map a texture on to the surface.

Buildings
=========
The buildings are being generated from outline vectors with associated tags (key-value pairs). Currently, the building generation functionality is creating a basic extrusion from the outline vector. To do this, I used the three.js ExtrudeGeometry object.

The tags are used to determine the height of the building. There's an OSM tag for the height of the building, so it first looks for that. If that's not there, there's another OSM tag for how many floors the building has. If that's present, it'll estimate the height based on a standard height for each floor. If neither of those are present, it will look at the type of building (house, hotel, etc) and guess the number of floors and height from that. For example, houses default to 2 floors; hotels to 10.

The tags are also used to determine the colors for the building. There's are OSM tag for the wall material and roof material (things like metal, brick, sandstone, etc). I planned to use textures for these, but ran into some issues with my UVs. So instead, I'm using basic colors.

Shadows/Lighting
================
I decided against having one giant directional light to emulate the sun, for performanace and quality reasons. Instead, I'm doing something kind of clever. I have attached my light object to my camera object, so that when the camera moves, so does the light. By doing this, I can project the light only on what the user is seing. However, there is a bug in this functionality at the moment. If you rotate the camera view (ctrl+up or down), it rotates the lighting with it. That is not the intended effect. However, it does provide a useful side-effect by allowing you to change the lighting angle.

Roads
=====
The roads are generated as a cross section extruded along a vector (from OSM). The cross section is a simple rectangle.

The width of the road is determined from the lanes tag in OSM. There is an issue in doing it like this if different parts of the same road have different number of lanes. I did not have time to figure out a way to gradually change from one to the other.

Fire Hydrants
=============
The fire hydrant model was pre-made in blender. I exported the model as a Collada file. (I had issues using OBJ and materials). Then in my workflow, when I need to add a fire hydrant, I simply clone the loaded model and place it into the scene at the correct spot.

Trees
=====
The trees are imported from a pre-made blender model I made myself. Like the fire hydrants, I simple clone the model and place the copy where it's needed.