#Simple Map generator
##What it is
A procedural map generator built in JS and HTML.

##How it works
Utilizes seeded OpenSimplex noise for the base noise generation. The resulting noise is run through fractional Brownian Motion to give it more depth and then "trimmed" around the edges with circular masking giving us a height map. Simple biomes are created by "layering" a temperature map and moisture map over the height map and sampling each pixel.

##Plans
Future plans include better defining the temperature and moisture map creation, adding rivers based on height map slope and moisture, moving rendering to ThreeJS for some 3D goodness.
