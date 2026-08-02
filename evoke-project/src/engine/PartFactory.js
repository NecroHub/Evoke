/**
 * PartFactory.js
 * Creates Babylon.js meshes for every supported primitive type, and applies
 * the common "part" properties (position, rotation, scale, material, color,
 * transparency, name) that every buildable object shares. This is the only
 * place mesh creation happens, so adding a new primitive type means editing
 * one function here plus one entry in the Explorer/Asset panel UI.
 */

let partCounter = 0;

/** Supported primitive type identifiers. Keep in sync with the Studio UI and serializer. */
export const PART_TYPES = ["cube", "sphere", "cylinder", "plane", "wedge"];

/**
 * Builds the raw mesh geometry for a given primitive type.
 * @param {string} type one of PART_TYPES
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.Mesh}
 */
function buildGeometry(type, scene) {
  switch (type) {
    case "cube":
      return BABYLON.MeshBuilder.CreateBox("part", { size: 1 }, scene);
    case "sphere":
      return BABYLON.MeshBuilder.CreateSphere("part", { diameter: 1, segments: 16 }, scene);
    case "cylinder":
      return BABYLON.MeshBuilder.CreateCylinder("part", { height: 1, diameter: 1, tessellation: 24 }, scene);
    case "plane":
      return BABYLON.MeshBuilder.CreateGround("part", { width: 1, height: 1 }, scene);
    case "wedge": {
      // Babylon has no built-in wedge; build a triangular prism manually.
      return buildWedge(scene);
    }
    default:
      throw new Error(`Unknown part type: ${type}`);
  }
}

/**
 * Constructs a triangular-prism "wedge" mesh (a cube with one edge collapsed),
 * useful for ramps and roofs.
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.Mesh}
 */
function buildWedge(scene) {
  const positions = [
    // bottom face (4 verts)
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   -0.5, -0.5, 0.5,
    // top ridge (2 verts, collapsed along z-front edge)
    -0.5, 0.5, -0.5,    0.5, 0.5, -0.5,
  ];
  const indices = [
    0, 1, 2, 0, 2, 3,   // bottom
    0, 4, 1, 1, 4, 5,   // back slope
    1, 5, 2,            // right end
    2, 5, 4, 2, 4, 3,   // slanted top (ramp surface)
    3, 4, 0,            // left end
  ];
  const mesh = new BABYLON.Mesh("part", scene);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
  vertexData.applyToMesh(mesh);
  return mesh;
}

/**
 * Creates a fully-configured part mesh: geometry + material + transform +
 * standard metadata used by the Explorer, Properties panel, and serializer.
 *
 * @param {string} type one of PART_TYPES
 * @param {BABYLON.Scene} scene
 * @param {object} [overrides] optional initial values (position, rotation, scale, color, transparency, name)
 * @returns {BABYLON.Mesh}
 */
export function createPart(type, scene, overrides = {}) {
  if (!PART_TYPES.includes(type)) throw new Error(`Unsupported part type: ${type}`);

  const mesh = buildGeometry(type, scene);
  partCounter += 1;

  mesh.name = overrides.name || `${capitalize(type)}${partCounter}`;
  mesh.position = toVector3(overrides.position) || new BABYLON.Vector3(0, 0.5, 0);
  mesh.rotation = toVector3(overrides.rotation) || BABYLON.Vector3.Zero();
  mesh.scaling = toVector3(overrides.scale) || new BABYLON.Vector3(1, 1, 1);

  const material = new BABYLON.StandardMaterial(`${mesh.name}_mat`, scene);
  const color = overrides.color ? BABYLON.Color3.FromHexString(overrides.color) : BABYLON.Color3.FromHexString("#8B90A0");
  material.diffuseColor = color;
  material.alpha = overrides.transparency !== undefined ? 1 - overrides.transparency : 1;
  mesh.material = material;

  // Metadata drives the Properties panel and the JSON serializer — the
  // single source of truth for a part's semantic type and human name.
  mesh.metadata = {
    partType: type,
    materialName: overrides.material || "default",
  };

  return mesh;
}

/** Capitalizes a primitive type name for the default object name (e.g. "cube" → "Cube"). */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a plain [x,y,z] array (as stored in Firebase) to a BABYLON.Vector3.
 * @param {number[]} arr
 * @returns {BABYLON.Vector3|null}
 */
function toVector3(arr) {
  if (!arr) return null;
  return new BABYLON.Vector3(arr[0], arr[1], arr[2]);
}
