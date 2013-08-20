/* spines is an array of arrays of THREE.Vertex3 objects containing representations of spinal channel centerlines*/

THREE.myConvexGeometry = function( spines ) {

    THREE.Geometry.call( this );
    
    var numSpines = spines.length;
    var numVerticesPerSpine = spines[0].length;
    // initialize levels as 2dim array
    var levels = new Array(numVerticesPerSpine);
    for(var i=0; i<numVerticesPerSpine;i++){
        levels[i]=new Array(numSpines);
    }
    
    var faces = new Array();
	var vertices = new Array();

	// split spines horizontally into levels
    for ( var i = 0; i < numSpines; i++ ) {
        for ( var j = 0; j < numVerticesPerSpine; j++) {
            levels[j][i] = spines[i][j];
        }
    }
    
    function isLeft(p0, p1, p2) {
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
		level.sort(function(a,b) {return a.x > b.x});
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
		var lowerHull = new Array();
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
		var upperHull = new Array();
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
        lowerHull.pop();
        upperHull.pop();
		hull = lowerHull.concat(upperHull);
		return hull;
	}
	

	
	function indexOfVertex(arr, v0) {
		for (var i = 0; i < arr.length; ++i) {
			if ( i in arr && arr[i].equals(v0)) {
				return i;
			}
		}
		return -1;
	}

	// returns the indices of the two points in listOfCandidates closest to target
	function findTwoClosestVertices(target, listOfCandidates) {
		var closest = 0;
		var closestDistance = distance(target, listOfCandidates[0]);
		var secondClosest = 0;
		var secondClosestDistance = distance(target, listOfCandidates[0]);
		for (var i = 1; i < listOfCandidates.length; i++) {
			var d = distance(target, listOfCandidates[i]);
			if ( d < closestDistance) {
				secondClosestDistance = closestDistance;
				secondClosest = closest;
				closestDistance = d;
				closest = i;	
			} else if ( d < secondClosestDistance ) {
				secondClosestDistance = d;
				secondClosest = i;
			}
		}	
		return [closest, secondClosest];
	}
	
	function distance(p0, p1) {
		var d = Math.sqrt(
			Math.pow(p0.x-p1.x,2)
			+ Math.pow(p0.y-p1.y,2)
			+ Math.pow(p0.z-p1.z,2)
			);
		return d;
	}
    
	// per level compute convex hull
	var newLevels = new Array();
	for (var i = 0; i < levels.length; i++) {
		newLevels[i] = perLevelConvexHull(levels[i]);
	}
    
	// step through levels and compute faces
	// lowest level
	for (var i = 2; i < newLevels[0].length; i++) {
		faces.push([
			newLevels[0][0],
			newLevels[0][i-1],
			newLevels[0][i]
        ]);
	}
	for (var i = 0; i < newLevels[0].length; i++) {
		var p = findTwoClosestVertices(newLevels[0][i], newLevels[1]);
		faces.push([
			newLevels[0][i],
			newLevels[1][p[0]],
			newLevels[1][p[1]]
			]);
	}
	
	// middle levels
	for (var i = 1; i < newLevels.length-1; i++) {
		for ( var j=0; j < newLevels[i].length; j++) {
			var p = findTwoClosestVertices(newLevels[i][j], newLevels[i-1]);
			faces.push([
				newLevels[i][j],
				newLevels[i-1][p[0]],
				newLevels[i-1][p[1]]
				]);
			p = findTwoClosestVertices(newLevels[i][j], newLevels[i+1]);
			faces.push([
				newLevels[i][j],
				newLevels[i+1][p[0]],
				newLevels[i+1][p[1]]
				]);
		}
	}
	//uppermost level
	for (var i = 2; i < newLevels[newLevels.length-1].length; i++) {
		faces.push([
			newLevels[newLevels.length-1][0],
			newLevels[newLevels.length-1][i],
			newLevels[newLevels.length-1][i-1]
			]);
	}
	for (var i = 0; i < newLevels[newLevels.length-1].length; i++) {
		p=findTwoClosestVertices(newLevels[newLevels.length-1][i],newLevels[newLevels.length-2]);
		faces.push([
			newLevels[newLevels.length-1][i],
			newLevels[newLevels.length-2][p[0]],
			newLevels[newLevels.length-2][p[1]]
			]);
	}
	// push all vertices into same array
    //console.log("line 203"); console.log(newLevels[0]);
	for (var i = 0; i < newLevels.length; i++) {
        for(var j = 0; j < newLevels[i].length; j++) {
		  this.vertices.push(newLevels[i][j]);
        }
	}
    //console.log("line 206"); console.log(this.vertices);
    
	// translate faces to vertex indices
    //console.log("faces.length = " + faces.length);
    //console.log(faces);
	for ( var i = 0; i < faces.length; i++) {
        //console.log("inside translate faces to vertex indices; i = " + i);
        //console.log(faces[i][0]);
		this.faces.push(new THREE.Face3(
			indexOfVertex(this.vertices,faces[i][0]),
			indexOfVertex(this.vertices,faces[i][1]),
			indexOfVertex(this.vertices,faces[i][2])
            ));
	}
    
    //console.log("line 214"); console.log(this.faces[0]);

    
    // Compute UVs
    //console.log(this.faces.length);
	for ( var i = 0; i < this.faces.length; i++ ) {
		var face = this.faces[ i ];
        //console.log("inside loop");
        //console.log(face);
		this.faceVertexUvs[ 0 ].push( [
			vertexUv( this.vertices[ face.a ] ),
			vertexUv( this.vertices[ face.b ] ),
			vertexUv( this.vertices[ face.c ])
		] );   
    }
    console.log("nach  Compute UVs");
    this.computeCentroids();
    this.computeFaceNormals();
    this.computeVertexNormals();
    
};

THREE.myConvexGeometry.prototype = Object.create( THREE.Geometry.prototype );