# 场景回归验证

运行 `node --experimental-vm-modules tests/open-halls.cjs`。

测试使用仓库真实 Three.js、建筑及角色代码；仅用简化材质替代依赖浏览器 Canvas 的贴图，以便在 Node 中验证几何与交互。

覆盖：26 个蒲团与跪拜交互一一对应、跪拜点不与碰撞体重叠、室外不再包含入殿/出殿交互、七座殿堂及五观堂的实际 Player.update 步行通过门洞。

视觉表现和 GPU 帧率仍需在浏览器检查。
