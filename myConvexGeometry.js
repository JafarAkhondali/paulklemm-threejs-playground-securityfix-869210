/* spines is an array of THREE.geometry objects containing representations of spinal channel centerlines*/

myConvexGeometry = function( spines ) {

    THREE.Geometry.call( this );
    
    //var faces = [ [ 0, 1, 2 ], [ 0, 2, 1 ] ];
    var faces = undefined;
	var levels = undefined;
	var vertices = undefined;
    
    for ( var i = 0; i < spines.length; i++ ) {
        for ( var j = 0; j < spines[0].vertices.length; i++) {
            levels[j][i] = spines[i].vertices[j];
        }
    }
    
    
    
	function addPoint( vertexId ) {
    
        var vertex = vertices[ vertexId ].clone();
        
        var mag = vertex.length();
        vertex.x += mag * randomOffset();
        vertex.y += mag * randomOffset();
        vertex.z += mag * randomOffset();
        
        var hole = [];
    
        for ( var f = 0; f < faces.length; ) {
    
            var face = faces[ f ];
    
            // for each face, if the vertex can see it,
            // then we try to add the face's edges into the hole.
            if ( visible( face, vertex ) ) {
    
                for ( var e = 0; e < 3; e++ ) {
    
                    var edge = [ face[ e ], face[ ( e + 1 ) % 3 ] ];
                    var boundary = true;
    
                    // remove duplicated edges.
                    for ( var h = 0; h < hole.length; h++ ) {
    
                        if ( equalEdge( hole[ h ], edge ) ) {
    
                            hole[ h ] = hole[ hole.length - 1 ];
                            hole.pop();
                            boundary = false;
                            break;
    
                        }
    
                    }
    
                    if ( boundary ) {
    
                        hole.push( edge );
    
                    }
    
                }
    
                // remove faces[ f ]
                faces[ f ] = faces[ faces.length - 1 ];
                faces.pop();
    
            } else { // not visible
    
                f++;
    
            }
        }
    
        // construct the new faces formed by the edges of the hole and the vertex
        for ( var h = 0; h < hole.length; h++ ) {
        
            faces.push( [
        hole[ h ][ 0 ],
                hole[ h ][ 1 ],
                vertexId
            ] );
    
        }
        }
		
        
        /**
        * Whether the face is visible from the vertex
        */
    function visible( face, vertex ) {
                
		var va = vertices[ face[ 0 ] ];
		var vb = vertices[ face[ 1 ] ];
		var vc = vertices[ face[ 2 ] ];

		var n = normal( va, vb, vc );

		// distance from face to origin
		var dist = n.dot( va );

		return n.dot( vertex ) >= dist;

	}
    
	/**
	* Face normal
	*/
	function normal( va, vb, vc ) {
		
		var cb = new THREE.Vector3();
		var ab = new THREE.Vector3();

		cb.subVectors( vc, vb );
		ab.subVectors( va, vb );
		cb.cross( ab );

		cb.normalize();

		return cb;

	}
    
	/**
	* Detect whether two edges are equal.
	* Note that when constructing the convex hull, two same edges can only
	* be of the negative direction.
	*/
	function equalEdge( ea, eb ) {
		
		return ea[ 0 ] === eb[ 1 ] && ea[ 1 ] === eb[ 0 ];
		
	}
        
	/**
	* Create a random offset between -1e-6 and 1e-6.
	*/
	function randomOffset() {
		
		return ( Math.random() - 0.5 ) * 2 * 1e-6;

	}
    
    function isLeft(p1, p2, p3) {
		return ((p1.x-p0.x)*(p2.y-p0.y) - (p2.x-p0.x)*(p1.y-p0.y));
	}
	/**
	* XXX: Not sure if this is the correct approach. Need someone to review.
	*/
	function vertexUv( vertex ) {
			
		var mag = vertex.length();
		return new THREE.Vector2( vertex.x / mag, vertex.y / mag );
		
	}
    
	function perLevelConvexHull(level) {
		//sort vertices in level according to x coordinate 
		level.sort(function(a,b) {return a.x > b.x};
		// set z coordinate to level average
		var sumZ = 0;
		for (var i = 0; i < level.length; i++) {
			sumZ = sumZ + level[i].z;
		}
		var avgZ = sumZ/level.length;
		for (var i = 0; i < level.length; i++) {
			level[i].z = avgZ;
		}
		// compute lower half of convex hull
		var lowerHull = undefined;
		lowerHull.push(level[0]);
		lowerHull.push(level[1]);
		var numVertsInHull = 2;
		for (var i = 2; i < level.length; i++) {
			var p1 = lowerHull[numVertsInHull-2];
			var p2 = lowerHull[numVertsInHull-1];
			var p3 = level[i];
			// if new point is strictly left of two previous points, add to list
			if (isLeft(p1,p2,p3)) {
				lowerHull.push(p3);
				numVertsInHull++;
			} else {
				lowerHull[numVertsInHull-1] = p3;
			}
		}
		// compute upper half of convex hull
		var upperHull = undefined;
		upperHull.push(level[level.length-1]);
		upperHull.push(level[level.length-2]);
		numVertsInHull = 2;
		for (var i = level.length-3; i > 0; i--) {
			var p1 = upperHull[numVertsInHull-2];
			var p2 = upperHull[numVertsInHull-1];
			var p3 = level[i];
			// if new point is strictly left of two previous points, add to list
			if (isLeft(p1,p2,p3)) {
				upperHull.push(p3);
				numVertsInHull++;
			} else {
				upperHull[numVertsInHull-1] = p3;
			}
		}
		//join halves
		hull = lowerHull.pop().concat(upperHull.pop());
		return hull;
	}
	
	
	// per level compute convex hull
	
	var newLevels = undefined;
	for (var i = 0, i < levels.length; i++) {
		newLevels[i] = perLevelConvexHull(levels[i]);
	}
	// step through levels and compute faces
	// lowest level
	
	vertices.concat newLevels[0];
	for (var i=2;i>vertices.length;i++) {
		faces.push(new THREE.Face3(0,i-1,i));
	}
	for (var i = 
	// Push vertices into `this.vertices`, skipping those inside the hull
	var id = 0;
	var newId = new Array( vertices.length ); // map from old vertex id to new id
	
	for ( var i = 0; i < faces.length; i++ ) {		
		var face = faces[ i ];
		for ( var j = 0; j < 3; j++ ) {
			if ( newId[ face[ j ] ] === undefined ) {
				newId[ face[ j ] ] = id++;
				this.vertices.push( vertices[ face[ j ] ] );
			}
			face[ j ] = newId[ face[ j ] ];
		}
	}
    
	// Convert faces into instances of THREE.Face3
	for ( var i = 0; i < faces.length; i++ ) {
		this.faces.push( new THREE.Face3(
			faces[ i ][ 0 ],
			faces[ i ][ 1 ],
			faces[ i ][ 2 ]
		) );
	}
    
    // Compute UVs
	for ( var i = 0; i < this.faces.length; i++ ) {
		var face = this.faces[ i ];
		this.faceVertexUvs[ 0 ].push( [
			vertexUv( this.vertices[ face.a ] ),
			vertexUv( this.vertices[ face.b ] ),
			vertexUv( this.vertices[ face.c ])
		] );   
    }
     
    this.computeCentroids();
    this.computeFaceNormals();
    this.computeVertexNormals();
    
};

THREE.ConvexGeometry.prototype = Object.create( THREE.Geometry.prototype );