import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

class PhysicsScene {
  constructor() {
    // Three.js setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // Camera setup
    this.camera.position.set(0, 5, 10);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.scene.add(ambientLight, directionalLight);

    // Physics world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });

    // Ground
    this.addGround();

    // Objects arrays
    this.meshes = [];
    this.bodies = [];

    // Animation
    this.animate = this.animate.bind(this);
    this.animate();

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.getElementById('addBox').addEventListener('click', () => this.addBox());
    document.getElementById('addSphere').addEventListener('click', () => this.addSphere());
    document.getElementById('reset').addEventListener('click', () => this.reset());
  }

  addGround() {
    // Physics ground
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane()
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);

    // Visual ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      side: THREE.DoubleSide
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
  }

  addBox(position = { x: 0, y: 5, z: 0 }) {
    const size = 1;
    
    // Physics box
    const boxBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)),
      position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    this.world.addBody(boxBody);
    this.bodies.push(boxBody);

    // Visual box
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.castShadow = true;
    this.scene.add(boxMesh);
    this.meshes.push(boxMesh);
  }

  addSphere(position = { x: 0, y: 5, z: 0 }) {
    const radius = 0.5;

    // Physics sphere
    const sphereBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(radius),
      position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    this.world.addBody(sphereBody);
    this.bodies.push(sphereBody);

    // Visual sphere
    const sphereGeometry = new THREE.SphereGeometry(radius);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.castShadow = true;
    this.scene.add(sphereMesh);
    this.meshes.push(sphereMesh);
  }

  reset() {
    // Remove all objects
    this.meshes.forEach(mesh => this.scene.remove(mesh));
    this.bodies.forEach(body => this.world.removeBody(body));
    this.meshes = [];
    this.bodies = [];
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Step physics world
    this.world.step(1/60);

    // Update mesh positions
    for(let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].position.copy(this.bodies[i].position);
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

new PhysicsScene();