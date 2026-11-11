export const OUTDOOR = {
  id: 'outdoor',
  name: '径山寺',
  subtitle: '五进中轴 · 庭院',
  bounds: { minX: -24, maxX: 24, minZ: -56, maxZ: 60 },
  // 中轴路面半宽、台地半宽、山门南墙位置；Minimap/地形共用同一组数据。
  axisHalf: 4.5,
  terraceHalf: 47,
  wall: { half: 6, z: 60 },
  spawn: { x: 0, z: 55, yaw: 0 },
  // [zFar(south), zNear(north), yFar, yNear] —— 高度随 z 线性变化，形成台阶坡度
  bands: [
    { z0: 47.0, z1: 60, y0: 0, y1: 0 },
    { z0: 38.5, z1: 47, y0: 0, y1: 0 },
    { z0: 35.0, z1: 38.5, y0: 0.55, y1: 0 },
    { z0: 23.8, z1: 35.0, y0: 0.55, y1: 0.55 },
    { z0: 19.6, z1: 23.8, y0: 1.25, y1: 0.55 },
    { z0: 7.1, z1: 19.6, y0: 1.25, y1: 1.25 },
    { z0: 2.9, z1: 7.1, y0: 1.95, y1: 1.25 },
    { z0: -9.6, z1: 2.9, y0: 1.95, y1: 1.95 },
    { z0: -13.8, z1: -9.6, y0: 2.65, y1: 1.95 },
    { z0: -27.3, z1: -13.8, y0: 2.65, y1: 2.65 },
    { z0: -31.5, z1: -27.3, y0: 3.35, y1: 2.65 },
    { z0: -53.5, z1: -31.5, y0: 3.35, y1: 3.35 },
  ],
  // ry: 0 = 门朝南；+π/2 = 左侧建筑门朝东（面向中轴）；
  // -π/2 = 右侧建筑门朝西（面向中轴）。
  entrances: [
    {
      id: 'tianwang', name: '天王殿', sub: '五凤山门 · 一层天王殿',
      x: 0, z: 29.3, w: 14, d: 9, h: 9.4, platform: 0.55, tiers: 2,
      doorZ: 33.8, input: { x: 0, z: 35.7 },
      preview: { scheme: 'gold', variant: 'buddha', pose: 'seated', scale: 0.92 },
    },
    {
      id: 'shijia', name: '释迦宝殿', sub: '大雄宝殿',
      x: 0, z: 12.0, w: 16, d: 11, h: 11.0, platform: 1.25, tiers: 1,
      doorZ: 17.5, input: { x: 0, z: 18.9 },
      preview: { scheme: 'gold', variant: 'buddha', pose: 'seated', scale: 0.95 },
    },
    {
      id: 'chaoyin', name: '潮音堂', sub: '文殊法席',
      x: 0, z: -4.1, w: 14, d: 9, h: 9.9, platform: 1.95, tiers: 1,
      doorZ: 0.4, input: { x: 0, z: 2.3 },
      preview: { scheme: 'painted', variant: 'bodhisattva', pose: 'seated', scale: 0.92 },
    },
    {
      id: 'guanyin', name: '观音堂', sub: '水月慈容 · 龙女善财',
      x: 0, z: -20.5, w: 12, d: 9, h: 9.6, platform: 2.65, tiers: 1,
      doorZ: -16.0, input: { x: 0, z: -14.2 },
      preview: { scheme: 'jade', variant: 'guanyin', pose: 'seated', arms: 6, scale: 0.8 },
    },
    {
      id: 'lingxiao', name: '凌霄阁', sub: '三世佛 · 四大菩萨',
      x: 0, z: -40.0, w: 20, d: 13, h: 13.7, platform: 3.35, tiers: 3,
      doorZ: -33.5, input: { x: 0, z: -31.6 },
      preview: { scheme: 'bronze', variant: 'buddha', pose: 'seated', scale: 0.95 },
    },
    {
      id: 'yaoshi', name: '药师殿', sub: '东方净琉璃世界',
      x: -10.667, z: -15.0, w: 7, d: 6, h: 8.1, platform: 2.65, tiers: 1, plinth: 0.35,
      ry: Math.PI / 2,
      doorZ: 14.6, input: { x: -17, z: 16.5 },
      preview: { scheme: 'jade', variant: 'buddha', pose: 'seated', scale: 0.8 },
    },
    {
      id: 'longwang', name: '龙王殿', sub: '灵泽龙王 · 护法',
      x: 11.333, z: -15.0, w: 5.0, d: 4.4, h: 7.8, platform: 2.65, tiers: 1, plinth: 0.30,
      ry: -Math.PI / 2,
      doorZ: 17.6, input: { x: 14.0, z: 18.8 },
      preview: { scheme: 'painted', variant: 'dragon', pose: 'seated', scale: 0.78 },
    },
    {
      id: 'caishen', name: '财神殿', sub: '福德财神 · 顺风顺水',
      x: 11.333, z: 1.786, w: 5.0, d: 4.4, h: 7.6, platform: 1.95, tiers: 1, plinth: 0.30,
      ry: -Math.PI / 2,
      doorZ: 17.6, input: { x: 21.0, z: 18.8 },
      preview: { scheme: 'gold', variant: 'caishen', pose: 'seated', scale: 0.78 },
    },
  ],
  // 纯景观建筑（不设拜位）：祖堂（抄经）、五观堂（两层素面）、文创店。
  scenery: [
    {
      id: 'zutang', name: '祖堂', sub: '抄经 · 静心',
      x: -10.667, z: 19.286, w: 7, d: 6, h: 7.8, platform: 1.25, tiers: 1, plinth: 0.35,
      ry: Math.PI / 2,
    },
    {
      id: 'wuguan', name: '五观堂', sub: '两层 · 素面',
      x: -11.333, z: 1.786, w: 13, d: 10, h: 9.5, platform: 1.95, tiers: 2, plinth: 0.35,
      ry: Math.PI / 2,
    },
    {
      id: 'wenchuang', name: '文创用品', sub: '售卖 · 手作',
      x: 10.667, z: 19.286, w: 8, d: 6, h: 7.2, platform: 1.25, tiers: 1, plinth: 0.35,
      ry: -Math.PI / 2,
    },
  ],
  garden: {
    id: 'lutan',
    x: 0, z: -25.0,
    w: 10, d: 4,
  },
  pavilion: {
    id: 'tingzi',
    x: 16, z: -15.0,
    w: 5, d: 5, h: 9.0, platform: 2.65,
  },
};

export const HALLS = {
  tianwang: { name: '天王殿', subtitle: '弥勒慈颜 · 四天护法', total: 3 },
  shijia: { name: '释迦宝殿', subtitle: '大雄宝殿', total: 3 },
  chaoyin: { name: '潮音堂', subtitle: '文殊法席', total: 4 },
  guanyin: { name: '观音堂', subtitle: '水月慈容 · 龙女善财', total: 1 },
  lingxiao: { name: '凌霄阁', subtitle: '三世佛 · 四大菩萨', total: 7 },
  yaoshi: { name: '药师殿', subtitle: '东方净琉璃世界', total: 3 },
  longwang: { name: '龙王殿', subtitle: '灵泽龙王 · 护法', total: 3 },
  caishen: { name: '财神殿', subtitle: '福德财神', total: 1 },
  zutang: { name: '祖堂', subtitle: '抄经 · 静心', total: 0 },
  wenchuang: { name: '文创用品', subtitle: '售卖 · 手作', total: 0 },
  outdoor: { name: '径山寺', subtitle: '五进中轴 · 庭院', total: 1 },
};

// Expand courtyards without stretching architecture or changing terrace heights.
const spreadZ = z => 60 + (z - 60) * 1.4;
for (const b of OUTDOOR.bands) { b.z0=spreadZ(b.z0); b.z1=spreadZ(b.z1); }
for (const b of [...OUTDOOR.entrances,...OUTDOOR.scenery]) {
  const oldZ=b.z; b.x*=1.5; b.z=spreadZ(oldZ);
  if(b.doorZ!=null) b.doorZ=b.z+(b.doorZ-oldZ);
  if(b.input) { b.input.x=b.x; b.input.z=b.z+(b.input.z-oldZ); }
}
OUTDOOR.bounds={minX:-46,maxX:46,minZ:spreadZ(-56),maxZ:60};
OUTDOOR.garden.x*=1.5;
OUTDOOR.garden.z=spreadZ(OUTDOOR.garden.z);
OUTDOOR.pavilion.x*=1.5;
OUTDOOR.pavilion.z=spreadZ(OUTDOOR.pavilion.z);
HALLS.wuguan={name:'五观堂',subtitle:'两层 · 素面',total:0};
