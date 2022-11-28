// Art 109 Three.js Demo Site
// client7.js
// A three.js scene which uses planes and texture loading to generate a scene with images which can be traversed with basic WASD and mouse controls, this scene is full screen with an overlay.

// Import required source code
// Import three.js core
import * as THREE from "../build/three.module.js";
// Import pointer lock controls
import {
  PointerLockControls
} from "../src/PointerLockControls.js";
import {
    GLTFLoader
} from "../src/GLTFLoader.js";
import {
  FontLoader
} from "../src/FontLoader.js"

// Establish variables
let camera, renderer, controls, material;

var scene = new THREE.Scene(); // initialising the scene
scene.background = new THREE.Color(0xff0000);


const objects = [];
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

// Initialization and animation function calls
init();
animate();

// Initialize the scene
function init() {
  // Establish the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  // Define basic scene parameters
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9DE5E5);
  scene.fog = new THREE.Fog(0x9DE5E5, 15, 100);

  // Define scene lighting
  const light = new THREE.HemisphereLight(0xFFF8A2, 0xAE72E5, 0.75);
  light.position.set(0.5, 10, 0.75);
  scene.add(light);

  // Define controls
  controls = new PointerLockControls(camera, document.body);

  // Identify the html divs for the overlays
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  // Listen for clicks and respond by removing overlays and starting mouse look controls
  // Listen
  instructions.addEventListener("click", function() {
    controls.lock();
  });
  // Remove overlays and begin controls on click
  controls.addEventListener("lock", function() {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });
  // Restore overlays and stop controls on esc
  controls.addEventListener("unlock", function() {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
  // Add controls to scene
  scene.add(controls.getObject());

  // Define key controls for WASD controls
  const onKeyDown = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Add raycasting for mouse controls
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  // ground
  const texture4 = new THREE.TextureLoader().load("assets/grass1.jpg");
  texture4.wrapS = THREE.RepeatWrapping;
  texture4.wrapT = THREE.RepeatWrapping;
  texture4.repeat.set(4, 4);

  const material4 = new THREE.MeshLambertMaterial({
    map: texture4
  });
  const geometry4 = new THREE.CircleGeometry(100, 100);

  const floor = new THREE.Mesh(geometry4, material4);
  floor.material.side = THREE.DoubleSide;
  floor.rotateX(-Math.PI / 2);
  scene.add(floor);

  //images

  var planes = [];
  var planeImages = ["./assets/neighbors/isaac1.png", "./assets/neighbors/olivia1.png"];
  var planeGeometry = new THREE.PlaneGeometry(10, 23);
  for (var i = 0; i < planeImages.length; i++) {
    var planeMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(planeImages[i]),
      transparent: true,
      side: THREE.DoubleSide
    }); // NOTE: specify "transparent: true"
    planes[i] = new THREE.Mesh(planeGeometry, planeMaterial);
    planes[i].position.x = 1 * i * (i % 2 == 0 ? -1 : 1);
    planes[i].position.y = 2 * i * (i % 2 == 0 ? 1 : -1) * 0.25;
    planes[i].position.z = -2;
    if (i == 0) {
      planes[i].position.set(10, 10, -1);
    } else {
      planes[i].position.set(20, 10, -1);
    }
    scene.add(planes[i]);
  }


  // Add Text under models
  const loader3 = new FontLoader();
  loader3.load('./assets/fonts/JosefinSans-Medium.ttf.json', function(font) {
    // Define font color
    const color = 0x2E5999;
    // Define font material
    const matDark = new THREE.LineBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    // Generate and place left side text
    const message = "Static Model";
    const shapes = font.generateShapes(message, .5);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);
    const text = new THREE.Mesh(geometry, matDark);
    text.position.set(-4, -4, 0);
    scene.add(text);

    // Generate and place right side text
    const message2 = "bawk bawk";
    const shapes2 = font.generateShapes(message2, .5);
    const geometry2 = new THREE.ShapeGeometry(shapes2);
    geometry2.computeBoundingBox();
    const xMid2 = -0.5 * (geometry2.boundingBox.max.x - geometry2.boundingBox.min.x);
    geometry2.translate(xMid2, 0, 0);
    const text2 = new THREE.Mesh(geometry2, matDark);
    text2.position.set(4, 17, -14);
    scene.add(text2);
  });

  //   3D obj
  var mesh1;
  // Load preanimated model, add material, and add it to the scene
  const loader1 = new GLTFLoader().load(
    "./assets/car.glb",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material = newMaterial;
        }
      });
      // set position and scale
      mesh1 = gltf.scene;
      mesh1.position.set(0, 10, -70);
      mesh1.rotation.set(0, 110, 0);
      mesh1.scale.set(8, 8, 8);
      // Add model to scene
      scene.add(mesh1);

    },
    undefined,
    function(error) {
      console.error(error);
    }
  );

  var mesh2;
  // Load preanimated model, add material, and add it to the scene
  const loader2 = new GLTFLoader().load(
    "./assets/house.glb",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material = newMaterial;
        }
      });
      // set position and scale
      mesh2 = gltf.scene;
      mesh2.position.set(80, 20, -10);
      mesh2.rotation.set(0, 110, 0);
      mesh2.scale.set(40, 40, 40);
      // Add model to scene
      scene.add(mesh2);

    },
    undefined,
    function(error) {
      console.error(error);
    }
  );

  var mesh3;
  // Load preanimated model, add material, and add it to the scene
  const loader3_1 = new GLTFLoader().load(
    "./assets/house.glb",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material = newMaterial;
        }
      });
      // set position and scale
      mesh3 = gltf.scene;
      mesh3.position.set(0, 20, 80);
      mesh3.rotation.set(0, 90, 0);
      mesh3.scale.set(40, 40, 40);
      // Add model to scene
      scene.add(mesh3);

    },
    undefined,
    function(error) {
      console.error(error);
    }
  );

  var mesh4;
  // Load preanimated model, add material, and add it to the scene
  const loader4 = new GLTFLoader().load(
    "./assets/house.glb",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material = newMaterial;
        }
      });
      // set position and scale
      mesh4 = gltf.scene;
      mesh4.position.set(0, 20, -80);
      mesh4.rotation.set(0, -190, 0);
      mesh4.scale.set(40, 40, 40);
      // Add model to scene
      scene.add(mesh4);

    },
    undefined,
    function(error) {
      console.error(error);
    }
  );

  var mesh5;
  // Load preanimated model, add material, and add it to the scene
  const loader5 = new GLTFLoader().load(
    "./assets/house.glb",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material = newMaterial;
        }
      });
      // set position and scale
      mesh5 = gltf.scene;
      mesh5.position.set(-80, 20, 10);
      mesh5.rotation.set(0, 25, 0);
      mesh5.scale.set(40, 40, 40);
      // Add model to scene
      scene.add(mesh5);

    },
    undefined,
    function(error) {
      console.error(error);
    }
  );



  // Define Rendered and html document placement
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Listen for window resizing
  window.addEventListener("resize", onWindowResize);
}

// Window resizing function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation function
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  // Check for controls being activated (locked) and animate scene according to controls
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}
