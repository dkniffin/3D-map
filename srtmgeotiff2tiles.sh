#!/usr/bin/bash

INPUTFILE=/srv/http/geotiffs/SRTM_W_250m.tif
OUTPUT_DIR=/srv/http/geotiffs/tiles/

size=$(gdalinfo ${INPUTFILE} | grep ^Size | awk '{print $3 $4}' | sed -e 's/,/ /')
sizex=$(echo "${size}" | awk '{print $1}')
sizey=$(echo "${size}" | awk '{print $2}')

for (( i=0; i<$sizex; i=$((i+7201))))
#for i in {0..$sizex..7201} 
do
	for (( j=0; j<$sizey; j=$((j+5761))))
	#for j in {0..$sizey..5671} 
	do
		echo $i
		echo $j
		if [ ! -f ${OUTPUT_DIR}/${i}_${j}.tif ]; then
			gdal_translate -srcwin ${i} ${j} 7201 5761 ${INPUTFILE} ${OUTPUT_DIR}/${i}_${j}.tif 
		fi
	done
done