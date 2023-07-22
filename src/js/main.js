import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertex from "../shaders/vertexParticles.glsl";
import fragment from "../shaders/fragment.glsl";
import GUI from "lil-gui";
import { gsap } from "gsap";

import map from "../images/map-1-cut.jpg";

class WebGL {
  constructor() {
    //scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x11111);

    //Renderer
    this.container = document.getElementById("webgl");
    this.renderer = new THREE.WebGLRenderer();
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(2);

    this.time = 0;
    this.getData();
    this.addCamera();
    this.addMesh();
    this.addControl();
    this.addLight();
    this.render();
    this.onWindowResize();
    // this.gui = new GUI();
    // this.addSetting();
    this.onMouseMove();
  }

  get viewport() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let aspectRatio = width / height;

    return {
      width,
      height,
      aspectRatio,
    };
  }

  getData() {
    this.svg = [...document.querySelectorAll(".cls-1")];
    this.lines = [];
    this.svg.forEach((path, j) => {
      let len = path.getTotalLength();
      let numberOfPoints = Math.floor(len / 5);

      //console.log(numberOfPoints);
      let points = [];

      for (let i = 0; i < numberOfPoints; i++) {
        let pointAt = (len * i) / numberOfPoints;
        let p = path.getPointAtLength(pointAt);
        let randX = (Math.random() - 0.5) * 5;
        let randY = (Math.random() - 0.5) * 5;
        points.push(new THREE.Vector3(p.x - 1024 + randX, p.y - 512 + randY, 0));
        //console.log(p);
      }

      this.lines.push({
        id: j,
        path: path,
        length: len,
        number: numberOfPoints,
        points: points,
        currentPos: 0,
        speed: 1,
      });
    });
    //console.log(this.lines);
  }

  addCamera() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.camera = new THREE.PerspectiveCamera(70, this.viewport.aspectRatio, 100, 10000);
    this.camera.position.z = 600;
    this.renderer.setSize(this.viewport.width, this.viewport.height);
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, resolution: { value: new THREE.Vector4() } },
      vertexShader: vertex,
      fragmentShader: fragment,
      //wireframe: true,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
    this.geometry = new THREE.BufferGeometry();
    this.max = this.lines.length * 100;
    this.positions = new Float32Array(this.max * 3);
    this.opacity = new Float32Array(this.max);

    // this.lines.forEach((line) => {
    //   line.points.forEach((p) => {
    //     this.positions.push(p.x, p.y, p.z);
    //     this.opacity.push(Math.random() / 5);
    //   });
    // });

    for (let i = 0; i < this.max; i++) {
      this.opacity.set([Math.random() / 5], i);
      this.positions.set([Math.random() * 100, Math.random() * 1000, 0], i * 3);
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("opacity", new THREE.BufferAttribute(this.opacity, 1));
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    let texture = new THREE.TextureLoader().load(map);
    texture.flipY = false;

    let imgMap = new THREE.Mesh(
      new THREE.PlaneGeometry(2048, 1024, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        map: texture,
      })
    );
    this.scene.add(imgMap);
    imgMap.position.z = -0.5;
    console.log(this.positions.length);
  }

  addLight() {
    this.light = new THREE.DirectionalLight(0xffff, 0.08);
    this.light.position.set(-100, 0, -100);
    this.scene.add(this.light);
  }

  addControl() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enableDamping = true;
    // this.controls.enablePan = true;
    // this.controls.enableZoom = true;
  }

  onWindowResize() {
    this.camera.aspect = this.viewport.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.uWidth = this.container.offsetWidth;
    this.uHeight = this.container.offsetHeight;
    this.imageAspect = 1;
    let a1;
    let a2;

    if (this.uWidth / this.uHeight > this.imageAspect) {
      a1 = (this.uWidth / this.uHeight) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.uWidth / this.uHeight / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.uWidth;
    this.material.uniforms.resolution.value.y = this.uHeight;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    this.camera.updateProjectionMatrix();
  }

  onMouseMove() {
    this.mouse = [];
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / this.viewport.width) * 2 - 1;
      this.mouse.y = (event.clientY / this.viewport.height) * 2 - 1;
      this.mesh.position.x = gsap.utils.interpolate(this.mesh.position.x, this.mouse.x, 0.1);
      this.mesh.position.y = gsap.utils.interpolate(this.mesh.position.y, -this.mouse.y, 0.1);
    });
  }

  updateThings() {
    let j = 0;
    this.lines.forEach((line) => {
      line.currentPos += line.speed;
      line.currentPos = line.currentPos % line.number;
      for (let i = 0; i < 100; i++) {
        let index = (line.currentPos + i) % line.number;
        let p = line.points[index];
        this.positions.set([p.x, p.y, p.z], j * 3);
        this.opacity.set([i / 1000], j);
        j++;
      }
    });

    this.geometry.attributes.position.array = this.positions;
    this.geometry.attributes.position.needsUpdate = true;
  }

  render() {
    this.time += 0.05;
    this.updateThings();
    this.material.uniforms.uTime.value = this.time;
    //console.log(this.material.uniforms.uTime);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }

  addSetting() {
    this.cameraFolder = this.gui.addFolder("camera");
    this.cameraFolder.add(this.camera.position, "x", -5, 5);
    this.cameraFolder.add(this.camera.position, "y", -5, 5);
    this.cameraFolder.add(this.camera.position, "z", -5, 5);
    this.cameraFolder.open();
  }
}

new WebGL();
