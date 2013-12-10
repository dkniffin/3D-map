To run the program
==================
 1 - Unzip the files somewhere
 2 - Open a browser with security settings disabled (See below for details)
 3 - Open the index.html (in the root of the unzipped directory) in the browser

Controls
========
Up arrow - Pan north
Down arrow - Pan south
Left arrow - Pan west
Right arrow - Pan east
Page up - Zoom up (higher elevation)
Page down - Zoom down (lower elevation)
Home - Zoom to max zoom
End - Zoome to min zoom
Ctrl + Up arrow - Rotate pitch up
Ctrl + Down arrow - Rotate pitch down
` (accent) - Open logger window

Security settings
=================
The reason security settings need to be disabled is that the web standards say it's insecure to load files from localhost. When this program would be used in a real capacity, it would be hosted on a web server, so this wouldn't be a problem.

To disable the setting in chrome, run it with the following flag:
 --allow-file-access-from-files

 Details about the project
 =========================
 See DESCRIPTION.md