import * as THREE from 'three';

const cube = new THREE.BoxGeometry(1, 1, 1);
cube.userData.shared = true;
// Statue parts are static; keep animated props and the player outside this path.
export function batchStatue(root) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map();
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.geometry.type !== 'BoxGeometry' || Array.isArray(mesh.material)) return;
    const key = `${mesh.material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  });
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const first = meshes[0];
    const batch = new THREE.InstancedMesh(cube, first.material, meshes.length);
    batch.castShadow = first.castShadow;
    batch.receiveShadow = first.receiveShadow;
    meshes.forEach((mesh, i) => {
      const {width, height, depth} = mesh.geometry.parameters;
      const matrix = inverse.clone().multiply(mesh.matrixWorld);
      matrix.multiply(new THREE.Matrix4().makeScale(width, height, depth));
      batch.setMatrixAt(i, matrix);
      mesh.removeFromParent();
    });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    root.add(batch);
  }
  return root;
}
