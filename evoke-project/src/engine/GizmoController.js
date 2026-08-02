/**
 * GizmoController.js
 * Wraps Babylon's GizmoManager to provide Move / Rotate / Scale tools with
 * optional grid snapping, and to notify listeners whenever the selected
 * mesh's transform changes (so the Properties panel and undo/redo stack
 * can stay in sync).
 */

export class GizmoController {
  /**
   * @param {BABYLON.Scene} scene
   * @param {(mesh: BABYLON.Mesh) => void} onTransformChange called after any drag ends
   */
  constructor(scene, onTransformChange) {
    this.scene = scene;
    this.onTransformChange = onTransformChange;
    this.gizmoManager = new BABYLON.GizmoManager(scene);
    this.gizmoManager.usePointerToAttachGizmos = false; // selection is driven by our own picking logic

    this.snapEnabled = true;
    this.snapSize = 1; // world units per grid cell

    this.activeTool = "move"; // "move" | "rotate" | "scale"
    this._configureGizmos();
  }

  /** Sets up each gizmo type's snap distances and drag-end callbacks. */
  _configureGizmos() {
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;

    // Position gizmo: snap to grid on each axis.
    this.gizmoManager.gizmos.positionGizmo?.onDragEndObservable.add(() => this._notifyChange());

    // Rotation gizmo: snap to 15° increments for predictable alignment.
    this.gizmoManager.gizmos.rotationGizmo?.onDragEndObservable.add(() => this._notifyChange());

    // Scale gizmo.
    this.gizmoManager.gizmos.scaleGizmo?.onDragEndObservable.add(() => this._notifyChange());
  }

  /** Applies current snap settings to whichever gizmo is active. */
  _applySnap() {
    const snapDistance = this.snapEnabled ? this.snapSize : 0;
    const rotationSnap = this.snapEnabled ? BABYLON.Tools.ToRadians(15) : 0;

    if (this.gizmoManager.gizmos.positionGizmo) {
      this.gizmoManager.gizmos.positionGizmo.snapDistance = snapDistance;
    }
    if (this.gizmoManager.gizmos.rotationGizmo) {
      this.gizmoManager.gizmos.rotationGizmo.snapDistance = rotationSnap;
    }
    if (this.gizmoManager.gizmos.scaleGizmo) {
      this.gizmoManager.gizmos.scaleGizmo.snapDistance = snapDistance;
    }
  }

  /**
   * Switches the active transform tool.
   * @param {"move"|"rotate"|"scale"} tool
   */
  setTool(tool) {
    this.activeTool = tool;
    this.gizmoManager.positionGizmoEnabled = tool === "move";
    this.gizmoManager.rotationGizmoEnabled = tool === "rotate";
    this.gizmoManager.scaleGizmoEnabled = tool === "scale";
    this._applySnap();
  }

  /**
   * Attaches gizmos to the given mesh (or detaches if null).
   * @param {BABYLON.Mesh|null} mesh
   */
  attachTo(mesh) {
    this.gizmoManager.attachToMesh(mesh);
  }

  /**
   * Toggles grid snapping on/off.
   * @param {boolean} enabled
   */
  setSnapEnabled(enabled) {
    this.snapEnabled = enabled;
    this._applySnap();
  }

  /**
   * Sets the grid cell size used for position snapping.
   * @param {number} size world units
   */
  setSnapSize(size) {
    this.snapSize = size;
    this._applySnap();
  }

  _notifyChange() {
    const mesh = this.gizmoManager.attachedMesh;
    if (mesh && this.onTransformChange) this.onTransformChange(mesh);
  }

  dispose() {
    this.gizmoManager.dispose();
  }
}
