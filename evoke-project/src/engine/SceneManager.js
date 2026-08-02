/**
 * SceneManager.js
 * Owns the Babylon.js Engine and Scene lifecycle for the Studio: creates
 * the render loop, camera, lighting, and ground grid, and handles resize
 * and disposal. Other engine modules (PartFactory, GizmoController, etc.)
 * receive the `scene` instance from here rather than creating their own.
 */

export class SceneManager {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true });
    this.scene = new BABYLON.Scene(this.engine);
    this._setupScene();
    this._bindResize();
  }

  /** Configures background, camera, lights, and the reference grid. */
  _setupScene() {
    this.scene.clearColor = BABYLON.Color4.FromHexString("#0B0C10FF");

    // Orbit camera — the default navigation mode in Studio.
    this.camera = new BABYLON.ArcRotateCamera(
      "studioCamera",
      -Math.PI / 3,
      Math.PI / 3.2,
      30,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.lowerRadiusLimit = 2;
    this.camera.upperRadiusLimit = 400;
    this.camera.wheelPrecision = 20;
    this.camera.panningSensibility = 1000;
    this.camera.pinchPrecision = 80;

    // Key light + soft fill so primitives read clearly without full PBR setup.
    const hemi = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.85;
    hemi.groundColor = new BABYLON.Color3(0.08, 0.08, 0.12);

    const dir = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-0.5, -1, -0.3), this.scene);
    dir.intensity = 0.6;

    this._createGrid();

    // Performance: enable frustum culling (on by default in Babylon, kept
    // explicit here) and octree-based scene culling for large maps.
    this.scene.skipPointerMovePicking = false;
    this.scene.autoClear = true;
    this.scene.createOrUpdateSelectionOctree();
  }

  /** Draws a ground grid plane for spatial reference and snapping feedback. */
  _createGrid() {
    const groundMat = new BABYLON.GridMaterial("gridMat", this.scene);
    groundMat.majorUnitFrequency = 5;
    groundMat.minorUnitVisibility = 0.3;
    groundMat.gridRatio = 1;
    groundMat.mainColor = BABYLON.Color3.FromHexString("#2A2E38");
    groundMat.lineColor = BABYLON.Color3.FromHexString("#6E5BFF");
    groundMat.opacity = 0.6;

    const ground = BABYLON.MeshBuilder.CreateGround("studioGrid", { width: 200, height: 200 }, this.scene);
    ground.material = groundMat;
    ground.isPickable = false; // grid should never intercept object picking
  }

  /** Starts the render loop. */
  start() {
    this.engine.runRenderLoop(() => this.scene.render());
  }

  /** Keeps the canvas sized to its container. */
  _bindResize() {
    this._resizeHandler = () => this.engine.resize();
    window.addEventListener("resize", this._resizeHandler);
  }

  /** Cleans up Babylon resources and listeners when leaving the Studio. */
  dispose() {
    window.removeEventListener("resize", this._resizeHandler);
    this.scene.dispose();
    this.engine.dispose();
  }
}
