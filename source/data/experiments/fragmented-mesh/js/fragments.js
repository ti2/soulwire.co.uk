
var MAX_ROT_SPEED  = 0.035;
var NUM_PARTICLES  = 500;
var CAM_DIST       = 60;
var OFFSET         = 50;

var paused = false;

var camera, scene, renderer, projector = new THREE.Projector(),
        width, height,
        theta = 1.3237537954761474,
        phi = 5.78174981265281,
        age = 0;
        
var material = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        shading: THREE.FlatShading,
        opacity: 0.5
});

// Create geometry
var geometry = new THREE.Geometry();

geometry.vertices.push(
    new THREE.Vertex( new THREE.Vector3( 0, -2, 0 ) ),
    new THREE.Vertex( new THREE.Vector3( 2, 2, 0 ) ),
    new THREE.Vertex( new THREE.Vector3( -2, 2, 0 ) )
);

geometry.faces.push(
    new THREE.Face3( 0, 1, 2 )
);

geometry.computeCentroids();
geometry.computeFaceNormals();
    
/**
    ------------------------------
    PARTICLE
    ------------------------------
*/

var Particle = function() {
    
    this.age = 0;
    this.checkOn = Math.floor(Math.random() * 10);
    
    this.velocity = new THREE.Vector3(
        0.0,
        random(0.02, 0.3),
        0.0
    );
    
    this.rotSpeed = new THREE.Vector3(
        random(-MAX_ROT_SPEED, MAX_ROT_SPEED),
        random(-MAX_ROT_SPEED, MAX_ROT_SPEED),
        random(-MAX_ROT_SPEED, MAX_ROT_SPEED)
    );
    
    // Extend Mesh
    THREE.Mesh.call(this, geometry, material);
    
    this.doubleSided = true;
    
    this.position.x = random(-OFFSET,OFFSET);
    this.position.y = random(-200,200);
    this.position.z = random(-OFFSET,OFFSET);
    
    this.rotation.x = Math.random() * Math.PI * 2;
    this.rotation.y = Math.random() * Math.PI * 2;
    this.rotation.z = Math.random() * Math.PI * 2;
    
    var scale = random(0.3, 1);
    this.scale.set(scale, scale, scale);
}

Particle.prototype = new THREE.Mesh();
Particle.prototype.constructor = Particle;
Particle.prototype.supr = THREE.Mesh.prototype;
Particle.prototype.update = function(parentMatrixWorld, forceUpdate, camera) {
    
    if( this.age % 10 === this.checkOn ) {
        var screenPos = projector.projectVector( this.position.clone(), camera );

        if( screenPos.y > 1.5 ) {
            screenPos.y = -1.5;
            projector.unprojectVector( screenPos, camera );
            this.position.y = screenPos.y;
            this.age = 0;
        }    
    }
    
    this.position.addSelf(this.velocity);
    this.rotation.addSelf(this.rotSpeed);
    this.supr.update.call(this, parentMatrixWorld, forceUpdate, camera);
    
    this.age++;
};

/**
    ------------------------------
    SKETCH
    ------------------------------
*/

function random(min, max) {
    
    if(isNaN(max)) {
        max = min;
        min = 0;
    }
    
    return min + Math.random() * (max - min);
}

function init3D() {
    
    renderer = new THREE.WebGLRenderer({antialias:true});
    camera = new THREE.Camera(120, width / height, 1, 2000);
    scene = new THREE.Scene();
    
    scene.fog = new THREE.FogExp2( 0x111111, 0.01 );
    
    // Lights
    
    var lightA = new THREE.AmbientLight( 0x444444 );
    
    var lightB = new THREE.DirectionalLight( 0xFFFFFF );
    lightB.position.set(1,1,1);
    
    var lightC = new THREE.DirectionalLight( 0x000000 );
    lightC.position.set(-1,1,-1);
    
    scene.addChild( lightA );
    scene.addChild( lightB );
    //scene.addChild( lightC );
    
    /*
    light1 = new THREE.PointLight( 0xFF0000 );
    light1.position.set(0,-400,0);
    
    light2 = new THREE.AmbientLight( 0x888888 );
    
    light3 = new THREE.DirectionalLight( 0x00FF00 );
    light3.position.y = -60;
    light3.position.z = 100;
    light3.position.normalize();
    
    scene.addLight(light1);
    scene.addLight(light2);
    scene.addLight(light3);
    */
    
    // Scene
    camera.position.z = 100;
    
    for( var i = 0; i < NUM_PARTICLES; i++ ) {
        scene.addChild( new Particle() );
    }
    
    $('#container').append(renderer.domElement);
}

function init() {
    $('.loading').remove();
    $(window).bind( 'resize', resize );
    init3D();
    resize();
}

function draw() {
    
    if( paused ) {
        return;
    }
    
    camera.position.x = Math.cos( theta ) * CAM_DIST;
    camera.position.z = Math.sin( phi ) * CAM_DIST;
    //camera.position.y = Math.cos( theta ) * Math.sin( phi ) * CAM_DIST;
    theta += 0.005;
    phi += 0.001;

    renderer.render(scene, camera);
    requestAnimationFrame(draw);
    age++;
}

function resize() {
    height = window.innerHeight;
    width = window.innerWidth;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

window.__pause = function() {
    $(renderer.domElement).remove();
    pause = true;
}

init();
draw();