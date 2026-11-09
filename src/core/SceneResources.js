// Shared cached geometries and materials belong to the application, not a map.
export function disposeMap(map) {
  map.scene.traverse(object => {
    if(object.geometry && !object.geometry.userData.shared) object.geometry.dispose();
    if(object.isInstancedMesh) object.dispose();
    if(object.isLight && object.shadow) object.shadow.dispose();
  });
  map.scene.clear();
}
