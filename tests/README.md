# 场景回归验证

运行 `npm test`，或直接运行 `node --no-warnings --experimental-vm-modules tests/open-halls.cjs`。

测试使用仓库真实 Three.js、建筑及角色代码；仅用简化材质替代依赖浏览器 Canvas 的贴图，以便在 Node 中验证几何与交互。预渲染背景图在 Node 环境下只保留占位材质，不加载图片。

覆盖：

- 25 个蒲团与跪拜交互一一对应；
- 跪拜点不与碰撞体重叠；
- 室外不再包含入殿/出殿交互；
- 七座殿堂、祖堂、五观堂、文创店的实际 `Player.update` 步行通过门洞；
- 玩家进入殿堂后 `zoneAt()` 返回对应区域；
- 小殿堂的 `cameraMaxAt()` 小于室外相机距离。

视觉表现、WebGL 降级路径和 GPU 帧率仍需在浏览器检查。
