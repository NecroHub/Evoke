/**
 * serializer.js
 * Converts between Babylon.js meshes (runtime, in-memory) and the plain
 * JSON "map" schema stored in Firebase Realtime Database. Critically, the
 * database NEVER stores rendered mesh/geometry data — only enough
 * descriptive JSON for PartFactory.createPart() to reconstruct the scene.
 *
 * Schema (matches the spec exactly):
 * {
 *   "parts": [
 *     {
 *       "type": "cube",
 *       "position": [0,0,0],
 *       "rotation": [0,0,0],
 *       "scale": [4,1,4],
 *       "material": "grass",
 *       "color": "#8B90A0",
 *       "transparency": 0,
 *       "name": "Cube1"
 *     }
 *   ]
 * }
 */

import { createPart } from "./PartFactory.js";

/**
 * Serializes every buildable part mesh in the scene into the map JSON schema.
 * @param {BABYLON.Mesh[]} partMeshes meshes with `metadata.partType` set (i.e. created via PartFactory)
 * @returns {{parts: object[]}}
 */
export function serializeMap(partMeshes) {
  const parts = partMeshes.map((mesh) => ({
    type: mesh.metadata.partType,
    position: vector3ToArray(mesh.position),
    rotation: vector3ToArray(mesh.rotation),
    scale: vector3ToArray(mesh.scaling),
    material: mesh.metadata.materialName || "default",
    color: mesh.material ? mesh.material.diffuseColor.toHexString() : "#8B90A0",
    transparency: mesh.material ? Number((1 - mesh.material.alpha).toFixed(3)) : 0,
    name: mesh.name,
  }));
  return { parts };
}

/**
 * Reconstructs Babylon.js meshes from a stored map JSON document.
 * @param {{parts: object[]}} mapData
 * @param {BABYLON.Scene} scene
 * @returns {BABYLON.Mesh[]} the newly created part meshes
 */
export function deserializeMap(mapData, scene) {
  if (!mapData || !Array.isArray(mapData.parts)) return [];
  return mapData.parts.map((partData) =>
    createPart(partData.type, scene, {
      position: partData.position,
      rotation: partData.rotation,
      scale: partData.scale,
      material: partData.material,
      color: partData.color,
      transparency: partData.transparency,
      name: partData.name,
    })
  );
}

/**
 * Rounds a BABYLON.Vector3 to a plain [x,y,z] array for JSON storage.
 * @param {BABYLON.Vector3} vec
 * @returns {number[]}
 */
function vector3ToArray(vec) {
  return [round(vec.x), round(vec.y), round(vec.z)];
}

/** Rounds to 3 decimal places to keep stored JSON compact. */
function round(n) {
  return Math.round(n * 1000) / 1000;
}
