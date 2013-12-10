Current Progress
================
What I have turned in is basically a terrain generator (with a couple of extraneous red lines, which I'll explain in a minute). The terrain  being generated is from Boulder and surrounding areas. The data comes from SRTM (a NASA project), as a binary file with a specific format, giving an elevation profile.

In the version of the program that I turned in, I am currently working on re-architecting how I'm doing some things. I found out that a major limitation with running graphics applications in a browser is that the browser is designed to be single-threaded. That wouldn't be so bad, except that the html/rendering portion runs in the same thread as the javascript. That is a problem because I am doing a lot of calculations in the javascript, and it interferese with being able to give useful information to the user via the gui.

However, I did find a way around this flaw. In the newer web standards, there's a feature called Web Workers. Essentially, what this lets you do is run a javascript program in another thread. The downside is that you have to send all your data back and forth between the browser thread and the other thread via messages. That meant that I had to rewrite a lot of my program, and I'm still working on that.

Before I started rewriting my program, however, I did have much more rendered. I have a couple of screenshots from that version (screenshots/Before-rebuild-*.PNG), and I put a copy of that version of the code online at http://oddityoverseer13.github.io/3D-map/ The load messages stop after "Finished loading premade models", because of the limitaions described above. You'll see that in that version, I have buildings, roads (sort of), and if you look closely, there are fire hydrants being loaded from a premade model.

A note about my code: I have separated out my code into two parts, because my intention is to release it as an open-source library on github. So, in lib/js/berries (Berries is the code-name I decided on for the library), I have all the real code that does the rendering of various features, using three.js. In the index.html file, I have what the "developer" would put in to make it work the way they want. 

What remains to be done
=======================
My current goal is to finish re-writing my code to the point where I have all of the functionality that I had before, including buildings, roads, and fire hydrants. Currently I'm working on buildings, and that's why there's the bright red lines in my model. Once I have finished that much, if I still have time, I plan to add water features (streams, ponds, etc), and possibly traffic signals.