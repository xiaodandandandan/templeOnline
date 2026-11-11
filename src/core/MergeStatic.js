import * as THREE from 'three';

/**
 * 把同一材质、同一阴影配置的静态 Mesh 合并成一个 BufferGeometry。
 *
 * 场景里的建筑/家具/山体都是大量独立 box，逐个 draw 的 CPU 开销比几何体本身
 * 还高。合并后通常能把数千次 draw call 压到几十次；透明材质、InstancedMesh、
 * Sprite/Points 和标记了 noMerge 的对象保持原样。
 */
export function mergeStatic(root) {
  if (!root) return { merged: 0, before: 0, after: 0 };

  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const meshes = [];

  root.traverse((object) => {
    if (!object.isMesh) return;
    if (object.isInstancedMesh || object.isSkinnedMesh) return;
    if (!object.visible || object.userData.noMerge) return;
    if (Array.isArray(object.material) || !object.material) return;
    if (object.material.transparent || object.material.alphaTest > 0) return;
    if (object.material.blending !== THREE.NormalBlending) return;
    if (!object.geometry || !object.geometry.attributes.position) return;

    const key = `${object.material.uuid}|${Number(object.castShadow)}|${Number(object.receiveShadow)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(object);
    meshes.push(object);
  });

  const before = meshes.length;
  let merged = 0;

  for (const list of buckets.values()) {
    if (list.length < 2) continue;

    const chunks = [];
    let vertexCount = 0;
    let material = null;
    let castShadow = false;
    let receiveShadow = false;

    for (const mesh of list) {
      if (!material) material = mesh.material;
      castShadow = castShadow || mesh.castShadow;
      receiveShadow = receiveShadow || mesh.receiveShadow;

      const source = mesh.geometry.index
        ? mesh.geometry.toNonIndexed()
        : mesh.geometry.clone();
      source.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInverse, mesh.matrixWorld));

      const position = source.getAttribute('position');
      if (!position) {
        source.dispose();
        continue;
      }
      let normal = source.getAttribute('normal');
      if (!normal) {
        source.computeVertexNormals();
        normal = source.getAttribute('normal');
      }
      let uv = source.getAttribute('uv');
      if (!uv) {
        uv = new THREE.Float32BufferAttribute(new Float32Array(position.count * 2), 2);
      }

      chunks.push({
        position: new Float32Array(position.array),
        normal: new Float32Array(normal.array),
        uv: new Float32Array(uv.array),
        count: position.count,
      });
      vertexCount += position.count;
      source.dispose();
    }

    if (!material || vertexCount === 0) continue;

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    let offset = 0;

    for (const chunk of chunks) {
      positions.set(chunk.position, offset * 3);
      normals.set(chunk.normal, offset * 3);
      uvs.set(chunk.uv, offset * 2);
      offset += chunk.count;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    root.add(mesh);

    for (const original of list) original.removeFromParent();
    merged += list.length;
  }

  return { merged, before, after: before - merged };
}
