var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// var group = new THREE.Group();
var geometry = new THREE.BoxGeometry(1, 1, 1)
var material = new THREE.MeshPhongMaterial( { color: '#ffffff' } );
// var linematerial = new THREE.MeshBasicMaterial( { color: '#ffffff', wireframe: true} ); // 線稿的材質
var cube = new THREE.Mesh( geometry, material );
// var linecube = new THREE.Mesh( geometry, linematerial );
// group.add( cube );
// group.add( linecube );
// scene.add( group );
scene.add( cube );

var ambientLight = new THREE.AmbientLight( '#0c0c0c' );
scene.add( ambientLight );

var spoltLight  = new THREE.SpotLight( '#FF0000' );

spoltLight.position.set(3, 3, 3);
spoltLight.target = cube;

scene.add( spoltLight );


camera.position.z = 5;

var animate = function () {
  requestAnimationFrame( animate );

  // group.rotation.x += 0.01;
  // group.rotation.y += 0.01;
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
};

animate();
