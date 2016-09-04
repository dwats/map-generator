A procedural map generator built in JS and HTML. 

Utilizes seeded OpenSimplex noise for the base noise generation. The resulting noise is run through fractional Brownian Motion to give it more depth and then "trimmed" around the edges with circular masking giving us a height map. Simple biomes are created by "layering" a temperature map and moisture map over the height map and sampling each pixel. 

Still a lot of work to do but it's coming along. 
