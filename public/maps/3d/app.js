// =====================================================================
// IIT ROPAR 3D CAMPUS MODEL — Complete Hardcoded Build
// Every building shape, road, field, and feature modeled from
// satellite imagery analysis. No satellite tiles, no external APIs.
//
// World coordinate system:
//   X axis: left(-150) to right(+150)  ~300 units
//   Z axis: top(-100)  to bottom(+100) ~200 units
//   Y axis: up (height)
//
// Pixel→World mapping (from 2559x1599 image, sidebar at x<130):
//   wx = (px - 130) / 2429 * 300 - 150
//   wz = (py - 130) / 1469 * 200 - 100
// =====================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// =====================================================================
// 1. RENDERER, SCENE, CAMERA
// =====================================================================
const canvas = document.getElementById('campus3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue

// Gradient sky via hemisphere
const skyGeo = new THREE.SphereGeometry(500, 32, 15);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor:    { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xc8e6c9) },
        offset:      { value: 50 },
        exponent:    { value: 0.4 },
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `,
    side: THREE.BackSide,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 1200);
camera.position.set(0, 160, 180);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// CSS2D label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '50';
document.body.appendChild(labelRenderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 15;
controls.maxDistance = 400;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 0, 0);

// =====================================================================
// 2. LIGHTING
// =====================================================================
scene.add(new THREE.AmbientLight(0xd0dce8, 0.55));

const hemi = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff8e7, 1.5);
sun.position.set(100, 180, 80);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
const sc = sun.shadow.camera;
sc.left = -200; sc.right = 200; sc.top = 200; sc.bottom = -200;
sc.near = 1; sc.far = 600;
sun.shadow.bias = -0.0004;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x8ec8f0, 0.35);
fill.position.set(-80, 60, -60);
scene.add(fill);

// =====================================================================
// 3. MATERIALS LIBRARY
// =====================================================================
const MAT = {
    // Ground
    grass:      new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.95, metalness: 0 }),
    grassDark:  new THREE.MeshStandardMaterial({ color: 0x3d6b4a, roughness: 0.95, metalness: 0 }),
    grassLight: new THREE.MeshStandardMaterial({ color: 0x6aaf5e, roughness: 0.9, metalness: 0 }),
    field:      new THREE.MeshStandardMaterial({ color: 0x5da84e, roughness: 0.85, metalness: 0 }),
    dirt:       new THREE.MeshStandardMaterial({ color: 0xa08060, roughness: 0.95, metalness: 0 }),
    sand:       new THREE.MeshStandardMaterial({ color: 0xc4a87c, roughness: 0.9, metalness: 0 }),
    road:       new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.85, metalness: 0.05 }),
    roadLight:  new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.8, metalness: 0.05 }),
    sidewalk:   new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8, metalness: 0 }),
    parking:    new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.9, metalness: 0.05 }),
    water:      new THREE.MeshStandardMaterial({ color: 0x3a9ad9, roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.8 }),
    // Buildings
    concrete:   new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.7, metalness: 0.05 }),
    concreteW:  new THREE.MeshStandardMaterial({ color: 0xf0ece6, roughness: 0.65, metalness: 0.05 }),
    brick:      new THREE.MeshStandardMaterial({ color: 0xc4956a, roughness: 0.75, metalness: 0 }),
    brickDark:  new THREE.MeshStandardMaterial({ color: 0xa07050, roughness: 0.8, metalness: 0 }),
    glass:      new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.15, metalness: 0.55, transparent: true, opacity: 0.7 }),
    roof:       new THREE.MeshStandardMaterial({ color: 0xd0c8bc, roughness: 0.6, metalness: 0.1 }),
    roofRed:    new THREE.MeshStandardMaterial({ color: 0xb05040, roughness: 0.7, metalness: 0.05 }),
    roofDark:   new THREE.MeshStandardMaterial({ color: 0x706860, roughness: 0.7, metalness: 0.1 }),
    metal:      new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.35, metalness: 0.6 }),
    gate:       new THREE.MeshStandardMaterial({ color: 0xb89a6a, roughness: 0.6, metalness: 0.15 }),
    hostel:     new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.7, metalness: 0.05 }),
    hostelAlt:  new THREE.MeshStandardMaterial({ color: 0xc8b898, roughness: 0.7, metalness: 0.05 }),
    academic:   new THREE.MeshStandardMaterial({ color: 0xe0d8cc, roughness: 0.65, metalness: 0.05 }),
    academicB:  new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.65, metalness: 0.05 }),
    admin:      new THREE.MeshStandardMaterial({ color: 0xd4ccc0, roughness: 0.6, metalness: 0.08 }),
    sports:     new THREE.MeshStandardMaterial({ color: 0xc0a888, roughness: 0.7, metalness: 0 }),
    poolWater:  new THREE.MeshStandardMaterial({ color: 0x40a0d0, roughness: 0.1, metalness: 0.3 }),
    track:      new THREE.MeshStandardMaterial({ color: 0xc06030, roughness: 0.85, metalness: 0 }),
    white:      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }),
};

// =====================================================================
// 4. COLORS FOR CATEGORIES (sidebar)
// =====================================================================
const CAT_COLORS = {
    academic: '#3b82f6', hostel: '#f59e0b', sports: '#10b981',
    admin: '#a855f7', landmark: '#ef4444', facility: '#06b6d4',
    dining: '#f97316', residential: '#78716c', infrastructure: '#64748b',
};

// =====================================================================
// 5. HELPER: CREATE SHAPE FUNCTIONS
// =====================================================================
const allMeshes = [];    // for raycasting
const meshById = {};     // id -> mesh
const labelById = {};    // id -> CSS2DObject
const origColor = {};    // id -> color hex
let selectedId = null;
let labelsVisible = true;

// Make a box building
function box(id, x, z, w, d, h, mat, castShadow = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.userData.id = id;
    scene.add(mesh);
    if (id) {
        allMeshes.push(mesh);
        if (!meshById[id]) meshById[id] = [];
        meshById[id].push(mesh);
    }
    return mesh;
}

// L-shaped building (2 boxes joined)
function lShape(id, x, z, w1, d1, w2, d2, h, mat, orient = 'BL') {
    // orient: which corner the L notch is at:
    // BL = bottom-left missing, BR, TL, TR
    const m1 = box(id, x, z, w1, d1, h, mat);
    let m2;
    if (orient === 'BL') {
        m2 = box(id, x + (w1 - w2) / 2, z - (d1 + d2) / 2 + d2 / 2, w2, d2, h, mat);
        m2.position.x = x + w1 / 2 - w2 / 2;
        m2.position.z = z + d1 / 2 + d2 / 2;
    } else if (orient === 'BR') {
        m2 = box(id, x - w1 / 2 + w2 / 2, z + d1 / 2 + d2 / 2, w2, d2, h, mat);
    } else if (orient === 'TL') {
        m2 = box(id, x + w1 / 2 - w2 / 2, z - d1 / 2 - d2 / 2, w2, d2, h, mat);
    } else {
        m2 = box(id, x - w1 / 2 + w2 / 2, z - d1 / 2 - d2 / 2, w2, d2, h, mat);
    }
    return [m1, m2];
}

// U-shaped building (3 boxes)
function uShape(id, x, z, w, d, wingW, wingD, h, mat) {
    // Main bar + 2 wings
    box(id, x, z, w, d, h, mat); // center bar
    box(id, x - w / 2 + wingW / 2, z - d / 2 - wingD / 2, wingW, wingD, h, mat); // left wing
    box(id, x + w / 2 - wingW / 2, z - d / 2 - wingD / 2, wingW, wingD, h, mat); // right wing
}

// Flat ground patch
function ground(x, z, w, d, mat) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.02, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Road strip
function road(x, z, w, d) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mesh = new THREE.Mesh(geo, MAT.road);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.06, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Road with dashes (center line)
function roadWithLine(x, z, w, d, isVertical = true) {
    road(x, z, w, d);
    // Center dashes
    const dashCount = isVertical ? Math.floor(d / 4) : Math.floor(w / 4);
    for (let i = 0; i < dashCount; i++) {
        const dGeo = new THREE.PlaneGeometry(isVertical ? 0.3 : 1.5, isVertical ? 1.5 : 0.3);
        const dash = new THREE.Mesh(dGeo, MAT.white);
        dash.rotation.x = -Math.PI / 2;
        if (isVertical) {
            dash.position.set(x, 0.07, z - d / 2 + i * 4 + 2);
        } else {
            dash.position.set(x - w / 2 + i * 4 + 2, 0.07, z);
        }
        scene.add(dash);
    }
}

// Tree
function tree(x, z, scale = 1) {
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 2 * scale, 6);
    const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
    trunk.position.set(x, scale, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const canopyGeo = new THREE.SphereGeometry(1.5 * scale, 8, 6);
    const green = 0x2e7d32 + Math.floor(Math.random() * 0x1a3a1a);
    const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({ color: green, roughness: 0.8 }));
    canopy.position.set(x, 2.5 * scale + scale * 0.5, z);
    canopy.castShadow = true;
    scene.add(canopy);
}

// Row of trees
function treeRow(x1, z1, x2, z2, count, scaleMin = 0.7, scaleMax = 1.2) {
    for (let i = 0; i < count; i++) {
        const t = i / Math.max(count - 1, 1);
        const tx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 1.5;
        const tz = z1 + (z2 - z1) * t + (Math.random() - 0.5) * 1.5;
        tree(tx, tz, scaleMin + Math.random() * (scaleMax - scaleMin));
    }
}

// Fence/Wall
function wall(x1, z1, x2, z2, height = 2, thickness = 0.3) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const geo = new THREE.BoxGeometry(thickness, height, len);
    const mesh = new THREE.Mesh(geo, MAT.concrete);
    mesh.position.set((x1 + x2) / 2, height / 2, (z1 + z2) / 2);
    mesh.rotation.y = angle;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

// Label
function addLabel(id, text, x, y, z) {
    const div = document.createElement('div');
    div.className = 'label3d';
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.set(x, y, z);
    scene.add(label);
    if (id) labelById[id] = label;
    return label;
}

// Pillar (for gate)
function pillar(x, z, w, d, h, mat) {
    // Tapered pillar (pyramid-like)
    const geo = new THREE.CylinderGeometry(w * 0.3, w * 0.5, h, 4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = Math.PI / 4;
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
}

// =====================================================================
// VISITING FACULTY BUILDING — Detailed model (square courtyard + tensile roof)
// Adapted from standalone visitingfaculty.html
// =====================================================================
function createVisitingFacultyBuilding(cx, cz) {
    const id = 'visiting_faculty';
    const buildingGroup = new THREE.Group();

    // Scale: the HTML model is 100 units wide; campus scale ~15 units
    const S = 0.15;
    const size = 100 * S;       // 15
    const height = 40 * S;      // 6
    const wallDepth = 15 * S;   // 2.25

    // Materials (reuse campus palette where possible)
    const wallMaterial = MAT.concreteW;
    const windowMaterial = MAT.glass;
    const redAccentMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    const roofMaterial = MAT.roofDark;

    function createWing() {
        const wingGroup = new THREE.Group();

        // Main wall block
        const wallGeo = new THREE.BoxGeometry(size, height, wallDepth);
        const wall = new THREE.Mesh(wallGeo, wallMaterial);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.id = id;
        wingGroup.add(wall);

        // Windows & red accent grid
        const cols = 12;
        const rows = 6;
        const stepX = (size - 10 * S) / cols;
        const stepY = (height - 10 * S) / rows;
        const startX = -size / 2 + 5 * S;
        const startY = -height / 2 + 5 * S;

        for (let i = 0; i < cols; i++) {
            const isRedPanel = (i % 4 === 2) || (i % 4 === 3 && i % 7 < 3);
            for (let j = 0; j < rows; j++) {
                const x = startX + i * stepX + stepX / 2;
                const y = startY + j * stepY + stepY / 2;
                const z = wallDepth / 2 + 0.05;

                if (isRedPanel) {
                    const panelH = stepY + 1 * S;
                    const panelGeo = new THREE.BoxGeometry(stepX * 0.8, panelH, 0.15);
                    const panel = new THREE.Mesh(panelGeo, redAccentMaterial);
                    panel.position.set(x, y, z);
                    wingGroup.add(panel);
                } else {
                    const winGeo = new THREE.BoxGeometry(stepX * 0.6, stepY * 0.6, 0.08);
                    const win = new THREE.Mesh(winGeo, windowMaterial);
                    win.position.set(x, y, z);
                    wingGroup.add(win);
                }
            }
        }

        // Roof cap for wing
        const roofGeo = new THREE.BoxGeometry(size + 2 * S, 2 * S, wallDepth + 2 * S);
        const roof = new THREE.Mesh(roofGeo, roofMaterial);
        roof.position.y = height / 2 + 1 * S;
        roof.castShadow = true;
        wingGroup.add(roof);

        return wingGroup;
    }

    // Assemble 4 sides to form a hollow square
    const offset = (size - wallDepth) / 2;

    const front = createWing();
    front.position.z = offset;
    buildingGroup.add(front);

    const back = createWing();
    back.rotation.y = Math.PI;
    back.position.z = -offset;
    buildingGroup.add(back);

    const left = createWing();
    left.rotation.y = -Math.PI / 2;
    left.position.x = -offset;
    buildingGroup.add(left);

    const right = createWing();
    right.rotation.y = Math.PI / 2;
    right.position.x = offset;
    buildingGroup.add(right);

    // Central tensile / cone roof structure
    const innerSize = size * 0.6;

    // Fabric cone
    const fabricGeo = new THREE.ConeGeometry(innerSize / 1.5, 15 * S, 16, 4, true);
    const fabricMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9
    });
    const fabric = new THREE.Mesh(fabricGeo, fabricMat);
    fabric.position.y = height / 2 - 5 * S;
    fabric.rotation.y = Math.PI / 4;
    fabric.castShadow = true;
    buildingGroup.add(fabric);

    // Wire frame overlay (cables)
    const wireframeGeo = new THREE.WireframeGeometry(fabricGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x8B4513 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframe.position.copy(fabric.position);
    wireframe.rotation.copy(fabric.rotation);
    buildingGroup.add(wireframe);

    // Central cap ring
    const capGeo = new THREE.CylinderGeometry(2 * S, 2 * S, 1 * S, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, height / 2 + 2.5 * S, 0);
    buildingGroup.add(cap);

    // Corner anchor cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0x555555 });
    const corners = [
        new THREE.Vector3(-innerSize / 2, height / 2, -innerSize / 2),
        new THREE.Vector3( innerSize / 2, height / 2, -innerSize / 2),
        new THREE.Vector3( innerSize / 2, height / 2,  innerSize / 2),
        new THREE.Vector3(-innerSize / 2, height / 2,  innerSize / 2),
    ];
    const topPoint = new THREE.Vector3(0, height / 2 + 2.5 * S, 0);
    corners.forEach(corner => {
        const points = [topPoint, corner];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, cableMat);
        buildingGroup.add(line);
    });

    // Position the whole group in campus coordinates
    buildingGroup.position.set(cx, height / 2, cz);
    scene.add(buildingGroup);

    // Register meshes for raycasting (collect all Mesh children)
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    // Add label
    addLabel(id, '🏢 Visiting Faculty', cx, height + 3, cz);
}

// =====================================================================
// HOSTEL BUILDING — Detailed model (multi-wing with balconies, dome, tanks)
// Adapted from standalone hostel.html
// =====================================================================
function createHostelBuilding(id, cx, cz, fitW, fitD, labelText) {
    const buildingGroup = new THREE.Group();

    // The original hostel model spans roughly 170 (x: -82..88) by 280 (z: -105..175).
    // We scale to fit the requested footprint (fitW x fitD).
    const origW = 170;
    const origD = 280;
    const sx = fitW / origW;
    const sz = fitD / origD;
    const S = Math.min(sx, sz); // uniform scale to preserve proportions

    const buildingHeight = 25 * S;
    const floorCount = 5;
    const floorHeight = buildingHeight / floorCount;

    // Materials
    const wallMat = MAT.hostel;
    const wallMatAlt = MAT.hostelAlt;
    const roofMat = MAT.roof;
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x3e5f3e, roughness: 0.8 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x2f4f2f, metalness: 0.1 });
    const windowMat = MAT.glass;
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.4 });

    function createDetailedBlock(x, z, width, depth, hasCourtyard) {
        const group = new THREE.Group();
        group.position.set(x * S, 0, z * S);

        const w = width * S;
        const d = depth * S;
        const coreW = w - 2 * S;
        const coreD = d - 2 * S;

        // Core structure
        const coreGeo = new THREE.BoxGeometry(coreW, buildingHeight, coreD);
        const core = new THREE.Mesh(coreGeo, wallMat);
        core.position.y = buildingHeight / 2;
        core.castShadow = true;
        core.receiveShadow = true;
        group.add(core);

        // Roof slab
        const roofGeo = new THREE.BoxGeometry(w, 1 * S, d);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = buildingHeight + 0.5 * S;
        roof.receiveShadow = true;
        group.add(roof);

        // Floor slabs (green balcony strips) and window details
        for (let i = 1; i <= floorCount; i++) {
            const yPos = i * floorHeight - floorHeight / 2;

            // Balcony slab
            const slabGeo = new THREE.BoxGeometry(w, 0.5 * S, d);
            const slab = new THREE.Mesh(slabGeo, balconyMat);
            slab.position.y = i * floorHeight;
            slab.castShadow = true;
            group.add(slab);

            // Room dividers and windows on the longer sides
            const roomWidth = 10 * S;
            const stepsZ = Math.max(1, Math.floor(d / roomWidth));

            for (let k = 0; k <= stepsZ; k++) {
                const divZ = -d / 2 + k * (d / stepsZ);

                // Left column
                const pL = new THREE.Mesh(new THREE.BoxGeometry(1 * S, floorHeight, 1 * S), wallMatAlt);
                pL.position.set(-w / 2, yPos - floorHeight / 2, divZ);
                group.add(pL);

                // Right column
                const pR = new THREE.Mesh(new THREE.BoxGeometry(1 * S, floorHeight, 1 * S), wallMatAlt);
                pR.position.set(w / 2, yPos - floorHeight / 2, divZ);
                group.add(pR);

                // Windows between columns
                if (k < stepsZ) {
                    const winH = floorHeight * 0.6;
                    const winD = (d / stepsZ) - 2 * S;
                    if (winD > 0) {
                        const winGeo = new THREE.BoxGeometry(0.5 * S, winH, winD);

                        const wL = new THREE.Mesh(winGeo, windowMat);
                        wL.position.set(-w / 2 + 0.5 * S, yPos - floorHeight / 2, divZ + (d / stepsZ) / 2);
                        group.add(wL);

                        const wR = new THREE.Mesh(winGeo, windowMat);
                        wR.position.set(w / 2 - 0.5 * S, yPos - floorHeight / 2, divZ + (d / stepsZ) / 2);
                        group.add(wR);
                    }
                }
            }
        }

        // Courtyard square on roof
        if (hasCourtyard) {
            const cyGeo = new THREE.PlaneGeometry(w * 0.4, d * 0.4);
            const cyMat = new THREE.MeshStandardMaterial({ color: 0x3b4d3b });
            const cy = new THREE.Mesh(cyGeo, cyMat);
            cy.rotation.x = -Math.PI / 2;
            cy.position.y = buildingHeight + 0.6 * S;
            group.add(cy);
        }

        buildingGroup.add(group);
    }

    // Recreate the hostel wings from hostel.html (original coordinates)
    const wingW = 32;

    // Top wings
    createDetailedBlock(-40, -70, wingW, 70, true);
    createDetailedBlock(40, -70, wingW, 70, true);

    // Central connector
    createDetailedBlock(0, -15, 60, 35, false);

    // Middle wings
    createDetailedBlock(-40, 25, wingW, 45, false);
    createDetailedBlock(40, 25, wingW, 45, false);

    // Stepped connectors
    createDetailedBlock(-54, 55, 28, wingW, false);
    createDetailedBlock(54, 55, 28, wingW, false);

    // Bottom wings (long)
    createDetailedBlock(-68, 115, wingW, 110, true);
    createDetailedBlock(68, 115, wingW, 110, true);

    // Central dome
    const domeGeo = new THREE.SphereGeometry(22 * S, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.scale.set(1.3, 0.6, 2.0);
    dome.position.set(0, buildingHeight + 0.2 * S, -15 * S);
    dome.castShadow = true;
    buildingGroup.add(dome);

    // Water tanks on roof
    for (let i = 0; i < 6; i++) {
        const tankGeo = new THREE.CylinderGeometry(2 * S, 2 * S, 4 * S, 16);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.set((-15 + i * 6) * S, buildingHeight + 2 * S, 10 * S);
        tank.castShadow = true;
        buildingGroup.add(tank);
    }

    // Position group in campus world
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register all meshes for raycasting
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    // Add label
    addLabel(id, labelText, cx, buildingHeight + 4, cz);
}

// =====================================================================
// 6. BUILD THE GROUND / TERRAIN
// =====================================================================
function buildTerrain() {
    // Main campus ground (grass)
    ground(0, 0, 320, 220, MAT.grass);

    // Outer terrain
    ground(0, 0, 600, 500, MAT.grassDark);
    const outerGeo = new THREE.PlaneGeometry(600, 500);
    const outerMesh = new THREE.Mesh(outerGeo, MAT.grassDark);
    outerMesh.rotation.x = -Math.PI / 2;
    outerMesh.position.set(0, -0.05, 0);
    outerMesh.receiveShadow = true;
    scene.add(outerMesh);

    // Sandy/bare areas around construction zones
    ground(-120, -60, 30, 40, MAT.sand);
    ground(110, -50, 40, 30, MAT.dirt);
    ground(100, 60, 50, 30, MAT.sand);
    ground(-100, 50, 30, 25, MAT.dirt);
}

// =====================================================================
// 7. BUILD ROAD NETWORK
// =====================================================================
function buildRoads() {
    // ============ MAIN ENTRY ROAD (from bottom, going north) ============
    // Comes from south (z≈95) up through campus
    roadWithLine(-0.6, 55, 4, 80, true);     // Main gate road going north
    roadWithLine(-0.6, 5, 4, 30, true);      // Continues north through center
    roadWithLine(-0.6, -25, 4, 30, true);    // Into academic zone
    roadWithLine(-0.6, -55, 4, 30, true);    // Further north

    // ============ MAJOR EAST-WEST ROADS ============
    // Road along academic blocks row (z ≈ -84, the top academic row)
    roadWithLine(20, -84, 180, 3.5, false);

    // Road south of academic blocks (z ≈ -75)
    roadWithLine(10, -72, 120, 3, false);

    // Central campus ring road (z ≈ 2)
    roadWithLine(0, 2, 200, 3.5, false);

    // Road near hostels/residential (z ≈ 35)
    roadWithLine(40, 36, 120, 3, false);

    // Road at z ≈ 50
    roadWithLine(50, 51, 100, 3, false);

    // South perimeter road (z ≈ 85)
    roadWithLine(0, 87, 200, 3, false);

    // ============ MAJOR NORTH-SOUTH ROADS ============
    // Left campus road (x ≈ -65)
    roadWithLine(-65, -20, 3, 120, true);

    // Center-left (x ≈ -35)
    roadWithLine(-35, 0, 3, 80, true);

    // Center road (x ≈ -1)  — already done above

    // Center-right (x ≈ 30)
    roadWithLine(30, 10, 3, 100, true);

    // Right campus road (x ≈ 55)
    roadWithLine(55, 0, 3, 140, true);

    // Far right (x ≈ 88)
    roadWithLine(88, 10, 3, 80, true);

    // Hostel zone road (x ≈ 75)
    roadWithLine(75, 40, 3, 50, true);

    // ============ SECONDARY / CONNECTING ROADS ============
    road(-100, -84, 50, 2.5);      // West academic road
    road(100, -84, 40, 2.5);       // East academic road
    road(-100, 2, 50, 2.5);        // West ring road extension
    road(110, 2, 40, 2.5);         // East ring road extension

    // Curving approach road to main gate
    road(-0.6, 92, 20, 5);         // Gate plaza

    // Internal paths (smaller roads / walkways)
    road(-45, -84, 20, 2);
    road(60, -84, 20, 2);
    road(-80, 40, 30, 2);
    road(110, 40, 30, 2);

    // Parking areas
    ground(-20, 15, 15, 8, MAT.parking);
    ground(20, 15, 15, 8, MAT.parking);
    ground(-50, -70, 12, 8, MAT.parking);
    ground(50, -70, 12, 8, MAT.parking);
    ground(-1, 75, 20, 6, MAT.parking);
}

// =====================================================================
// 8. BUILDING DATABASE — every building from image analysis
// =====================================================================
// Each entry: { id, name, cat, desc, tags, build() }
// build() creates the 3D geometry at exact positions from image analysis.

const CAMPUS_DATA = [];

function reg(id, name, cat, desc, tags) {
    const entry = { id, name, cat, desc, tags };
    CAMPUS_DATA.push(entry);
    return entry;
}

function buildAllBuildings() {

    // =====================================================================
    // 8A. MAIN GATE COMPLEX (bottom of map, z ≈ 87)
    // Image: large structure at center-bottom
    // World center: (-0.6, 87.2), width: 75, depth: 16.5
    // =====================================================================
    reg('main_gate', 'Main Gate Complex', 'landmark',
        'Iconic entrance inspired by Indus Valley Civilisation with four 41-ft stone-carved pyramid pillars, built with ASI.',
        ['Entrance', 'Indus Valley', 'Iconic']);

    // Gate structure - wide low wall with 4 tall pillars
    box('main_gate', -0.6, 87, 60, 4, 3, MAT.gate);        // base wall
    pillar(-20, 87, 2, 2, 14, MAT.gate);                     // Pillar 1
    pillar(-8, 87, 2, 2, 14, MAT.gate);                      // Pillar 2
    pillar(6, 87, 2, 2, 14, MAT.gate);                       // Pillar 3
    pillar(18, 87, 2, 2, 14, MAT.gate);                      // Pillar 4
    // Gate canopy/beam connecting pillars
    box('main_gate', -0.6, 87, 44, 2.5, 2, MAT.concrete);
    const gateMesh = meshById['main_gate'][0];
    gateMesh.position.y = 13;
    addLabel('main_gate', '🏛️ Main Gate', -0.6, 18, 87);
    origColor['main_gate'] = 0xb89a6a;

    // The Spiral DNA sculpture near gate
    reg('spiral', 'The Spiral (DNA Sculpture)', 'landmark',
        'Artistic DNA double-helix sculpture at the entrance complex.',
        ['Sculpture', 'Art', 'DNA']);
    const spiralGeo = new THREE.TorusKnotGeometry(2, 0.4, 80, 8, 2, 3);
    const spiralMesh = new THREE.Mesh(spiralGeo, MAT.metal);
    spiralMesh.position.set(-0.6, 8, 80);
    spiralMesh.castShadow = true;
    spiralMesh.userData.id = 'spiral';
    scene.add(spiralMesh);
    allMeshes.push(spiralMesh);
    meshById['spiral'] = [spiralMesh];
    origColor['spiral'] = 0x8899aa;
    addLabel('spiral', '🧬 DNA Spiral', -0.6, 14, 80);

    // =====================================================================
    // 8B. ACADEMIC BLOCKS — TOP ROW (z ≈ -84)
    // Image analysis: 6 large white blocks in a row at y≈223-275
    // These are the named blocks: Ramanujan, JC Bose, Visvesvaraya etc.
    // =====================================================================

    // Block 1: S. Ramanujan Block — world: (-50.4, -83.8) w=25, d=7
    reg('ramanujan', 'S. Ramanujan Block', 'academic',
        'Named after Srinivasa Ramanujan. Houses Mathematics dept, classrooms, and research labs.',
        ['Mathematics', 'Classrooms', 'Research']);
    uShape('ramanujan', -50, -84, 25, 5, 5, 7, 12, MAT.academic);
    box('ramanujan', -50, -84, 25, 5, 2, MAT.roof); // roof accent
    meshById['ramanujan'][meshById['ramanujan'].length - 1].position.y = 13;
    addLabel('ramanujan', '📐 Ramanujan Block', -50, 16, -84);
    origColor['ramanujan'] = 0xe0d8cc;

    // Block 2: Bhatnagar Block — world: (-27.9, -83.8) w=17, d=7
    reg('bhatnagar', 'S. Bhatnagar Block', 'academic',
        'Named after Shanti Swaroop Bhatnagar, CSIR founder. Chemistry & Chemical Engineering labs.',
        ['Chemistry', 'Chemical Eng', 'Labs']);
    uShape('bhatnagar', -28, -84, 17, 5, 4, 6, 12, MAT.academicB);
    addLabel('bhatnagar', '🧪 Bhatnagar Block', -28, 16, -84);
    origColor['bhatnagar'] = 0xd8cfc0;

    // Block 3: J.C. Bose Block — world: (-5.1, -83.8) w=25.5, d=7
    reg('jcbose', 'J.C. Bose Block', 'academic',
        'Named after Jagadish Chandra Bose, radio science pioneer. Physics & EE research.',
        ['Physics', 'Research', 'Radio Science']);
    uShape('jcbose', -5, -84, 25, 5, 5, 7, 12, MAT.academic);
    addLabel('jcbose', '📡 J.C. Bose Block', -5, 16, -84);
    origColor['jcbose'] = 0xe0d8cc;

    // Block 4: Visvesvaraya Block — world: (19.9, -83.8) w=21.6, d=7
    reg('visvesvaraya', 'M. Visvesvaraya Block', 'academic',
        'Named after Sir M. Visvesvaraya. Mechanical & Civil Engineering departments.',
        ['Mechanical', 'Civil', 'Engineering']);
    uShape('visvesvaraya', 20, -84, 22, 5, 5, 6, 12, MAT.academicB);
    addLabel('visvesvaraya', '⚙️ Visvesvaraya Block', 20, 16, -84);
    origColor['visvesvaraya'] = 0xd8cfc0;

    // Block 5: Satish Dhawan Block — world: (41.0, -83.8) w=17.9, d=7
    reg('satish_dhawan', 'Satish Dhawan Block', 'academic',
        'Named after Satish Dhawan, father of experimental fluid dynamics. Aerospace research.',
        ['Aerospace', 'Fluid Dynamics', 'Research']);
    uShape('satish_dhawan', 41, -84, 18, 5, 4, 6, 12, MAT.academic);
    addLabel('satish_dhawan', '🚀 Satish Dhawan', 41, 16, -84);
    origColor['satish_dhawan'] = 0xe0d8cc;

    // Block 6: Har Gobind Khorana Block — world: (72.3, -83.9) w=42, d=7.3
    // This is the largest academic block
    reg('khorana', 'Har Gobind Khorana Block', 'academic',
        'Named after Nobel laureate HG Khorana. Biomedical Engineering, advanced bio-labs, CSE & EE.',
        ['Biomedical', 'Nobel', 'CSE', 'EE']);
    // Main long bar
    box('khorana', 72, -84, 42, 6, 12, MAT.academic);
    // Wings at ends
    box('khorana', 52, -90, 6, 8, 12, MAT.academicB);
    box('khorana', 92, -90, 6, 8, 12, MAT.academicB);
    addLabel('khorana', '🧬 Khorana Block', 72, 16, -84);
    origColor['khorana'] = 0xe0d8cc;

    // =====================================================================
    // 8C. LECTURE HALL COMPLEX & RADHAKRISHNAN BLOCK (z ≈ -74)
    // =====================================================================
    reg('radhakrishnan', 'Radhakrishnan Block', 'academic',
        'Named after Dr. S. Radhakrishnan. Humanities & Social Sciences.',
        ['Humanities', 'HSS', 'Philosophy']);
    box('radhakrishnan', -14, -74, 5, 6, 11, MAT.academic);
    addLabel('radhakrishnan', '📖 Radhakrishnan', -14, 14, -74);
    origColor['radhakrishnan'] = 0xe0d8cc;

    // =====================================================================
    // 8D. MID-CAMPUS BUILDINGS (z ≈ -40 to +5)
    // From image analysis — scattered smaller structures
    // =====================================================================

    // CSE Department cluster — world: approx (-85, -8) to (-83, 15)
    // Two tall narrow buildings from image (items 37, 40)
    reg('cse', 'CSE Department', 'academic',
        'Computer Science & Engineering — first dept on permanent campus (July 2018). Computing labs & server rooms.',
        ['CSE', 'Computing', 'Server Rooms']);
    lShape('cse', -85, -5, 4, 14, 8, 4, 11, MAT.academic, 'TL');
    addLabel('cse', '💻 CSE Dept', -85, 14, -5);
    origColor['cse'] = 0xe0d8cc;

    // Admin Block cluster — world: (-106, 10..20)
    // Items 16, 18 from image
    reg('admin_block', 'Administrative Block', 'admin',
        "Director's office, Registrar, Dean offices, central administration.",
        ['Director', 'Registrar', 'Admin']);
    lShape('admin_block', -106, 15, 8, 10, 10, 4, 10, MAT.admin, 'BL');
    addLabel('admin_block', '🏛️ Admin Block', -106, 13, 15);
    origColor['admin_block'] = 0xd4ccc0;

    // Lecture Hall Complex — world: (-102, 34)
    reg('lhc', 'Lecture Hall Complex', 'academic',
        'Multiple tiered auditoriums for classes, seminars, and workshops.',
        ['Lectures', 'Seminars', 'Auditorium']);
    box('lhc', -102, 34, 17, 4.5, 8, MAT.concrete);
    box('lhc', -106, 38, 15, 3, 8, MAT.concrete);
    addLabel('lhc', '🎓 Lecture Halls', -102, 11, 34);
    origColor['lhc'] = 0xe8e0d4;

    // Central Workshop — world: (-94, 24)
    reg('workshop', 'Central Workshop', 'facility',
        'Fabrication and machining workshop for research and academic projects.',
        ['Workshop', 'Fabrication', 'Machining']);
    box('workshop', -94, 24, 7, 6, 6, MAT.brick);
    addLabel('workshop', '🔧 Workshop', -94, 9, 24);
    origColor['workshop'] = 0xc4956a;

    // =====================================================================
    // 8E. CENTRAL RESEARCH & DATA CENTER (z ≈ 20-35)
    // =====================================================================

    // Large research complex — world: (31.4, 20.9) w=13, d=13
    reg('crf', 'Central Research Facility', 'facility',
        'Sophisticated high-end equipment from all departments for centralized research.',
        ['Research', 'Equipment', 'Central']);
    // L-shaped from image
    box('crf', 31, 21, 13, 8, 10, MAT.concrete);
    box('crf', 37, 27, 5, 6, 10, MAT.concrete);
    addLabel('crf', '🔬 Central Research', 31, 13, 21);
    origColor['crf'] = 0xe8e0d4;

    // Building at (48, 10) — w=10, d=7 — possible EE labs / additional academic
    reg('ee_labs', 'EE Research Labs', 'academic',
        'Electrical Engineering research labs — power systems, signal processing, VLSI.',
        ['Electrical', 'VLSI', 'Power Systems']);
    box('ee_labs', 48, 10, 10, 7, 10, MAT.academicB);
    addLabel('ee_labs', '⚡ EE Labs', 48, 13, 10);
    origColor['ee_labs'] = 0xd8cfc0;

    // Building at (48.5, 20) — more labs
    reg('mech_labs', 'ME Research Labs', 'academic',
        'Mechanical Engineering advanced research labs and testing facilities.',
        ['Mechanical', 'Testing', 'Labs']);
    box('mech_labs', 49, 20, 9, 8, 10, MAT.academic);
    addLabel('mech_labs', '🔩 ME Labs', 49, 13, 20);
    origColor['mech_labs'] = 0xe0d8cc;

    // AWaDH Innovation Hub — world: approx (9.5, 14)
    reg('awadh', 'AWaDH Innovation Hub', 'facility',
        'DST Technology Innovation Hub (₹110 Cr) — Agriculture, Water, IoT, stubble management.',
        ['Innovation', 'AgriTech', 'DST', 'IoT']);
    box('awadh', 10, 14, 8, 10, 9, MAT.concrete);
    addLabel('awadh', '🌾 AWaDH Hub', 10, 12, 14);
    origColor['awadh'] = 0xe8e0d4;

    // Cluster at (8, 22) — small academic
    reg('biotech', 'Biotech Lab', 'academic',
        'Biotechnology and biomedical research laboratory.',
        ['Biotech', 'Biomedical', 'Lab']);
    box('biotech', 8, 22, 5, 6, 9, MAT.academicB);
    addLabel('biotech', '🧫 Biotech', 8, 12, 22);
    origColor['biotech'] = 0xd8cfc0;

    // Buildings at (23.6, 19) — narrow tall
    reg('server_room', 'Data Center & IT', 'facility',
        'Campus network operations center, server room, and IT support.',
        ['IT', 'Network', 'Servers']);
    box('server_room', 24, 19, 3, 13, 10, MAT.metal);
    addLabel('server_room', '🖥️ Data Center', 24, 13, 19);
    origColor['server_room'] = 0x8899aa;

    // =====================================================================
    // 8F. LIBRARY & SAC AREA (z ≈ 30-50)
    // =====================================================================

    // Library — world: (-22, 32.7) and surroundings
    reg('library', 'Central Library', 'facility',
        'State-of-the-art library with digital & physical collections, reading rooms, e-resources.',
        ['Library', 'Books', 'E-Resources']);
    box('library', -22, 33, 8, 5, 9, MAT.concreteW);
    box('library', -28, 33, 4, 3.5, 9, MAT.concrete);
    addLabel('library', '📚 Library', -22, 12, 33);
    origColor['library'] = 0xf0ece6;

    // Seminar Hall cluster (29, 34)
    reg('seminar_hall', 'Seminar Hall Complex', 'academic',
        'Seminar halls and conference rooms for academic events.',
        ['Seminars', 'Conference', 'Events']);
    box('seminar_hall', 29, 34, 8, 6, 8, MAT.concrete);
    addLabel('seminar_hall', '🎤 Seminar Halls', 29, 11, 34);
    origColor['seminar_hall'] = 0xe8e0d4;

    // Student Activity Centre
    reg('sac', 'Student Activity Centre', 'facility',
        'Hub for clubs, societies, cultural activities, gymnasium, music rooms.',
        ['Students', 'Clubs', 'Gym', 'Activities']);
    box('sac', -2, 30, 5, 9, 8, MAT.concrete);
    addLabel('sac', '🎭 SAC', -2, 11, 30);
    origColor['sac'] = 0xe8e0d4;

    // =====================================================================
    // 8G. HEALTH, SHOPPING, GUEST HOUSE (z ≈ 40-50)
    // =====================================================================

    // Health Centre — world: (-63, 44)
    reg('health', 'Health Centre', 'facility',
        'Campus health centre — primary healthcare, first aid, medical assistance.',
        ['Medical', 'Health', 'Clinic']);
    box('health', -63, 44, 9, 8, 7, MAT.concreteW);
    addLabel('health', '🏥 Health Centre', -63, 10, 44);
    origColor['health'] = 0xf0ece6;

    // Shopping complex / Canteen — multiple at (85, -38)
    reg('shopping', 'Shopping Complex & Canteen', 'facility',
        'Shops, ATMs, stationery, food outlets.',
        ['Shopping', 'ATM', 'Canteen', 'Food']);
    box('shopping', 85, -38, 5, 6, 5, MAT.brick);
    addLabel('shopping', '🛒 Shopping', 85, 8, -38);
    origColor['shopping'] = 0xc4956a;

    // Guest House — world: (88, 67)
    reg('guest_house', 'Guest House', 'admin',
        'Accommodation for guests, visiting faculty, and parents.',
        ['Guest', 'Visitors', 'Accommodation']);
    box('guest_house', 88, 67, 9, 8, 7, MAT.hostel);
    addLabel('guest_house', '🏠 Guest House', 88, 10, 67);
    origColor['guest_house'] = 0xd4c4a8;

    // SBI & Post Office — world: approx (-25, 45)
    reg('sbi', 'SBI Bank & Post Office', 'facility',
        'On-campus State Bank of India branch and post office.',
        ['Bank', 'SBI', 'Post Office']);
    box('sbi', -25, 45, 8, 6, 5, MAT.concrete);
    addLabel('sbi', '🏦 SBI Bank', -25, 8, 45);
    origColor['sbi'] = 0xe8e0d4;

    // =====================================================================
    // 8H. LARGE SOUTHERN COMPLEX (z ≈ 37-53) — world: (82.5, 44.7)
    // Image item 11: big structure, w=36, d=17 — Faculty Housing / Apartments
    // =====================================================================
    reg('faculty_housing', 'Faculty Housing Complex', 'residential',
        'Residential quarters for faculty members and senior staff. Multiple apartment blocks.',
        ['Faculty', 'Housing', 'Apartments']);
    // Multiple apartment blocks
    box('faculty_housing', 75, 42, 10, 15, 8, MAT.hostel);
    box('faculty_housing', 88, 42, 10, 15, 8, MAT.hostelAlt);
    box('faculty_housing', 75, 52, 12, 4, 8, MAT.hostel);
    box('faculty_housing', 88, 52, 12, 4, 8, MAT.hostelAlt);
    addLabel('faculty_housing', '🏘️ Faculty Housing', 82, 11, 45);
    origColor['faculty_housing'] = 0xd4c4a8;

    // =====================================================================
    // 8I. HOSTEL ZONE (mid-left area, z ≈ -10 to +5)
    // From image: buildings at (-35, 3), (-41, 10), (-61, 11), (-69, -12)
    // =====================================================================

    reg('hostel_1', 'Bhaskara Boys Hostel', 'hostel',
        'Boys hostel named after Bhaskara II. Multi-storey residential block.',
        ['Boys', 'Residential']);
    createHostelBuilding('hostel_1', -35, 3, 12, 16, '🏠 Bhaskara Hostel');
    origColor['hostel_1'] = 0xd4c4a8;

    reg('hostel_2', 'Aryabhatta Boys Hostel', 'hostel',
        'Boys hostel named after Aryabhatta, legendary ancient mathematician.',
        ['Boys', 'Residential']);
    createHostelBuilding('hostel_2', -42, 10, 12, 14, '🏠 Aryabhatta Hostel');
    origColor['hostel_2'] = 0xc8b898;

    reg('hostel_3', 'Brahmagupta Boys Hostel', 'hostel',
        'Boys hostel named after Brahmagupta, ancient mathematician and astronomer.',
        ['Boys', 'Residential']);
    createHostelBuilding('hostel_3', -61, 11, 10, 12, '🏠 Brahmagupta Hostel');
    origColor['hostel_3'] = 0xd4c4a8;

    reg('hostel_4', 'Gargi Girls Hostel', 'hostel',
        'Girls hostel named after Gargi Vachaknavi, prominent philosopher.',
        ['Girls', 'Residential']);
    createHostelBuilding('hostel_4', -69, -12, 12, 14, '🏠 Gargi Hostel');
    origColor['hostel_4'] = 0xc8b898;

    reg('hostel_5', 'Maitreyi Girls Hostel', 'hostel',
        'Girls hostel named after Maitreyi, Vedic-era philosopher.',
        ['Girls', 'Residential']);
    createHostelBuilding('hostel_5', -45, -1, 12, 16, '🏠 Maitreyi Hostel');
    origColor['hostel_5'] = 0xd4c4a8;

    reg('hostel_6', 'Married Scholars Hostel', 'hostel',
        'Accommodation for married research scholars and PhD students.',
        ['Scholars', 'PhD', 'Married']);
    createHostelBuilding('hostel_6', -15, -74, 10, 14, '🏠 Scholars Hostel');
    origColor['hostel_6'] = 0xc8b898;

    // =====================================================================
    // 8J. DINING / MESS (near hostels)
    // =====================================================================
    reg('mess1', 'Central Mess Hall', 'dining',
        'Main dining facility for hostel residents — breakfast, lunch, dinner.',
        ['Food', 'Mess', 'Dining']);
    box('mess1', -50, -10, 8, 5, 5, MAT.brick);
    addLabel('mess1', '🍽️ Mess Hall', -50, 8, -10);
    origColor['mess1'] = 0xc4956a;

    reg('mess2', 'Dining Hall 2', 'dining',
        'Secondary dining facility.',
        ['Food', 'Dining']);
    box('mess2', -70, 0, 7, 4, 5, MAT.brickDark);
    addLabel('mess2', '🍽️ Dining Hall 2', -70, 8, 0);
    origColor['mess2'] = 0xa07050;

    // =====================================================================
    // 8K. SPORTS FACILITIES
    // From image: green areas around z≈ -40 to -60 on left side
    // =====================================================================

    // Cricket Ground — large green ellipse (left side)
    reg('cricket', 'Cricket Ground', 'sports',
        'Full-size cricket ground with pitch, boundary markings.',
        ['Cricket', 'Sports']);
    const cricketGeo = new THREE.CircleGeometry(18, 32);
    const cricketMesh = new THREE.Mesh(cricketGeo, MAT.field);
    cricketMesh.rotation.x = -Math.PI / 2;
    cricketMesh.position.set(-85, 0.05, -40);
    cricketMesh.receiveShadow = true;
    cricketMesh.userData.id = 'cricket';
    scene.add(cricketMesh);
    allMeshes.push(cricketMesh);
    meshById['cricket'] = [cricketMesh];
    origColor['cricket'] = 0x5da84e;
    // Cricket pitch
    box(null, -85, -40, 1.5, 10, 0.05, MAT.sand, false);
    addLabel('cricket', '🏏 Cricket Ground', -85, 4, -40);

    // Football ground
    reg('football', 'Football Ground', 'sports',
        'Standard football field for inter-IIT and intra-college matches.',
        ['Football', 'Soccer']);
    ground(-50, -50, 28, 18, MAT.field);
    // Goal posts
    box(null, -64, -50, 0.3, 5, 3, MAT.white, false);
    box(null, -36, -50, 0.3, 5, 3, MAT.white, false);
    const fbMesh = ground(-50, -50, 28, 18, MAT.grassLight);
    fbMesh.userData.id = 'football';
    allMeshes.push(fbMesh);
    meshById['football'] = [fbMesh];
    origColor['football'] = 0x6aaf5e;
    addLabel('football', '⚽ Football Ground', -50, 4, -50);

    // Tennis Courts
    reg('tennis', 'Tennis Courts', 'sports',
        'Synthetic surface tennis courts for practice and tournaments.',
        ['Tennis', 'Courts']);
    ground(-30, -55, 14, 8, MAT.track);
    // Net lines
    box(null, -30, -55, 0.1, 7, 1.5, MAT.white, false);
    box(null, -36, -55, 0.1, 7, 1.5, MAT.white, false);
    meshById['tennis'] = [box('tennis', -33, -55, 2, 8, 0.2, MAT.track, false)];
    origColor['tennis'] = 0xc06030;
    addLabel('tennis', '🎾 Tennis Courts', -30, 3, -55);

    // Indoor Sports Complex
    reg('sports_complex', 'Indoor Sports Complex', 'sports',
        'Multi-sport indoor complex — basketball, badminton, TT, gym, fitness center.',
        ['Indoor', 'Gym', 'Basketball', 'Badminton']);
    box('sports_complex', -15, -60, 16, 10, 8, MAT.sports);
    addLabel('sports_complex', '🏀 Sports Complex', -15, 11, -60);
    origColor['sports_complex'] = 0xc0a888;

    // Swimming Pool
    reg('pool', 'Swimming Pool', 'sports',
        'Swimming pool facility.',
        ['Swimming', 'Pool']);
    // Pool deck
    box(null, 5, -55, 10, 8, 0.5, MAT.sidewalk, false);
    // Water
    const poolGeo = new THREE.BoxGeometry(8, 1.5, 6);
    const poolMesh = new THREE.Mesh(poolGeo, MAT.poolWater);
    poolMesh.position.set(5, -0.3, -55);
    poolMesh.userData.id = 'pool';
    scene.add(poolMesh);
    allMeshes.push(poolMesh);
    meshById['pool'] = [poolMesh];
    origColor['pool'] = 0x40a0d0;
    addLabel('pool', '🏊 Pool', 5, 3, -55);

    // =====================================================================
    // 8L. BUILDINGS in z ≈ 25-50 (from image analysis items 22-34)
    // Various smaller academic/lab buildings scattered through campus center
    // =====================================================================

    reg('chemical_lab', 'Chemical Engineering Lab', 'academic',
        'Chemical Engineering experimental and process labs.',
        ['Chemical', 'Process', 'Labs']);
    box('chemical_lab', 16, 34, 5, 6, 8, MAT.academicB);
    addLabel('chemical_lab', '⚗️ ChemE Lab', 16, 11, 34);
    origColor['chemical_lab'] = 0xd8cfc0;

    reg('physics_lab', 'Physics Lab', 'academic',
        'Physics department experimental and optics labs.',
        ['Physics', 'Optics', 'Experimental']);
    box('physics_lab', 50, 32, 5, 3.5, 8, MAT.academic);
    addLabel('physics_lab', '⚛️ Physics Lab', 50, 11, 32);
    origColor['physics_lab'] = 0xe0d8cc;

    reg('civil_lab', 'Civil Engineering Lab', 'academic',
        'Civil Engineering structures and materials testing lab.',
        ['Civil', 'Structures', 'Materials']);
    box('civil_lab', 36, 33, 6, 5, 8, MAT.concrete);
    addLabel('civil_lab', '🏗️ Civil Lab', 36, 11, 33);
    origColor['civil_lab'] = 0xe8e0d4;

    // Auditorium — world: (-24, 40)
    reg('auditorium', 'Main Auditorium', 'admin',
        'Large auditorium for convocations, Zeitgeist, Advitiya, and major events.',
        ['Auditorium', 'Events', 'Convocation']);
    box('auditorium', -22, 40, 5, 6, 9, MAT.admin);
    addLabel('auditorium', '🎭 Auditorium', -22, 12, 40);
    origColor['auditorium'] = 0xd4ccc0;

    // =====================================================================
    // 8M. LARGE BOTTOM-CENTER COMPLEX (z ≈ 87, the gate area complex)
    // From image item 1: world (-0.6, 87.2) w=75, d=16.5
    // This includes the gate plaza, security, boundary wall structures
    // =====================================================================
    reg('gate_plaza', 'Gate Plaza & Security', 'infrastructure',
        'Entry plaza with security booth, visitor registration, and vehicle checking.',
        ['Security', 'Entry', 'Parking']);
    ground(-0.6, 92, 70, 10, MAT.sidewalk);
    box('gate_plaza', -25, 92, 4, 4, 3, MAT.concrete);   // Security booth left
    box('gate_plaza', 22, 92, 4, 4, 3, MAT.concrete);    // Security booth right
    origColor['gate_plaza'] = 0xe8e0d4;

    // =====================================================================
    // 8N. LARGER BUILDING at (1547-1651, 972-1064) => world (31, 21) — already CRF
    // Building at (1693, 917)=>(43, 7) — already EE labs
    // Building at (1702, 982)=>(44, 16) — already ME labs
    // Item at (1864, 1130)=>(64.4, 36.1)-(100.5, 53.3) => Faculty housing (done)
    // =====================================================================

    // Additional building near (42, 45)
    reg('visiting_faculty', 'Visiting Faculty Block', 'residential',
        'Short-term accommodation for visiting professors and researchers.',
        ['Visiting', 'Faculty', 'Accommodation']);
    createVisitingFacultyBuilding(41, 45);
    origColor['visiting_faculty'] = 0xd4c4a8;

    // Building at (58, 39)
    reg('staff_quarters', 'Staff Quarters', 'residential',
        'Residential quarters for institute staff.',
        ['Staff', 'Quarters']);
    box('staff_quarters', 58, 39, 9, 4, 6, MAT.hostelAlt);
    addLabel('staff_quarters', '🏘️ Staff Quarters', 58, 9, 39);
    origColor['staff_quarters'] = 0xc8b898;

    // Transformer / Utility at (64, 16)
    reg('utility', 'Power Substation', 'infrastructure',
        'Campus electrical power substation and transformer complex.',
        ['Power', 'Electrical', 'Utility']);
    box('utility', 64, 16, 5, 6, 5, MAT.metal);
    addLabel('utility', '⚡ Substation', 64, 8, 16);
    origColor['utility'] = 0x8899aa;

    // =====================================================================
    // 8O. BOUNDARY WALL (perimeter)
    // =====================================================================
    reg('boundary', 'Campus Boundary Wall', 'infrastructure',
        'Perimeter boundary wall of the 525-acre permanent campus.',
        ['Boundary', 'Wall', 'Perimeter']);
    // Draw boundary walls
    wall(-140, -95, 140, -95, 2.5, 0.4);  // North wall
    wall(-140, 98, 140, 98, 2.5, 0.4);    // South wall
    wall(-140, -95, -140, 98, 2.5, 0.4);  // West wall
    wall(140, -95, 140, 98, 2.5, 0.4);    // East wall
    origColor['boundary'] = 0xe8e0d4;

    // =====================================================================
    // 8P. ADDITIONAL SCATTERED BUILDINGS FROM IMAGE
    // =====================================================================

    // Building at bottom left (image item 7): world (-139, 82) small
    reg('pump_house', 'Pump House / Water Tank', 'infrastructure',
        'Campus water supply pump house and elevated storage tank.',
        ['Water', 'Pump', 'Tank']);
    box('pump_house', -139, 82, 15, 8, 6, MAT.concrete);
    // Water tank cylinder
    const tankGeo = new THREE.CylinderGeometry(3, 3, 12, 16);
    const tankMesh = new THREE.Mesh(tankGeo, MAT.metal);
    tankMesh.position.set(-132, 6, 82);
    tankMesh.castShadow = true;
    scene.add(tankMesh);
    addLabel('pump_house', '💧 Water Tank', -135, 15, 82);
    origColor['pump_house'] = 0xe8e0d4;

    // Building at image (2014, 560) => world (82.7, -41.5)
    reg('nss_ncc', 'NSS / NCC Office', 'facility',
        'National Service Scheme and National Cadet Corps offices.',
        ['NSS', 'NCC', 'Service']);
    box('nss_ncc', 83, -38, 5, 6, 6, MAT.brick);
    origColor['nss_ncc'] = 0xc4956a;

    // Small buildings: (986, 912) => world (-42, 6.5)
    reg('laundry', 'Laundry Block', 'facility',
        'Laundry services for hostel residents.',
        ['Laundry', 'Services']);
    box('laundry', -42, 7, 5, 6, 4, MAT.brickDark);
    origColor['laundry'] = 0xa07050;

    // Building at (1386, 382) => (5.1, -65.7) - (9.9, -59.7)
    reg('sports_office', 'Sports Office', 'sports',
        'Sports department office and equipment storage.',
        ['Sports', 'Office', 'Equipment']);
    box('sports_office', 8, -63, 5, 6, 5, MAT.sports);
    origColor['sports_office'] = 0xc0a888;

    // (1212, 296) => (-14, -77) — additional near hostel area
    reg('canteen_2', 'Night Canteen', 'dining',
        'Late-night food outlet near hostel zone.',
        ['Food', 'Night', 'Canteen']);
    box('canteen_2', -14, -77, 5, 6, 4, MAT.brick);
    origColor['canteen_2'] = 0xc4956a;
}

// =====================================================================
// 9. LANDSCAPING — Trees, Gardens, Green Spaces
// =====================================================================
function buildLandscaping() {
    // Tree lines along roads
    treeRow(-0.6, 30, -0.6, 80, 20);          // Along main gate road
    treeRow(-0.6, -20, -0.6, -70, 18);         // North main road
    treeRow(-65, -70, -65, 20, 25);             // Left campus road
    treeRow(55, -40, 55, 50, 25);               // Right campus road
    treeRow(-120, -84, 120, -84, 30);           // Along academic row
    treeRow(-120, 2, 120, 2, 30);               // Ring road trees

    // Clusters in open areas
    treeRow(-120, -60, -95, -20, 15);           // West forest
    treeRow(-120, 50, -100, 80, 12);            // Southwest trees
    treeRow(110, -60, 135, -20, 15);            // East forest
    treeRow(110, 30, 135, 70, 12);              // Southeast trees
    treeRow(30, 60, 60, 80, 15);                // South-center trees
    treeRow(-60, 60, -30, 80, 12);              // South-left trees

    // Garden near admin
    treeRow(-115, 5, -100, 25, 8, 0.5, 0.8);
    treeRow(-75, -30, -70, -5, 6, 0.6, 0.9);

    // Trees around hostels
    treeRow(-55, -15, -30, 15, 12, 0.6, 1.0);
    treeRow(-80, -20, -65, 10, 10, 0.7, 1.1);

    // Random scattered trees
    for (let i = 0; i < 60; i++) {
        const rx = -130 + Math.random() * 260;
        const rz = -90 + Math.random() * 180;
        // Skip building areas (rough check)
        if (Math.abs(rz + 84) < 12 && rx > -70 && rx < 100) continue;
        if (Math.abs(rz) < 8 && Math.abs(rx) < 20) continue;
        tree(rx, rz, 0.5 + Math.random() * 0.8);
    }

    // Flower beds / garden patches
    ground(-0.6, 70, 8, 8, MAT.grassLight);     // Near gate garden
    ground(-100, 10, 6, 6, MAT.grassLight);     // Admin garden
    ground(30, -70, 6, 4, MAT.grassLight);      // Near academic
    ground(-50, 30, 5, 5, MAT.grassLight);      // Mid campus garden
}

// =====================================================================
// 10. SATLUJ RIVER (northern edge of campus)
// =====================================================================
function buildRiver() {
    const riverPts = [
        new THREE.Vector3(-160, 0.08, -98),
        new THREE.Vector3(-110, 0.08, -96),
        new THREE.Vector3(-60, 0.08, -99),
        new THREE.Vector3(-10, 0.08, -97),
        new THREE.Vector3(40, 0.08, -99),
        new THREE.Vector3(90, 0.08, -96),
        new THREE.Vector3(140, 0.08, -98),
        new THREE.Vector3(170, 0.08, -95),
    ];
    const curve = new THREE.CatmullRomCurve3(riverPts);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 5, 8, false);
    scene.add(new THREE.Mesh(tubeGeo, MAT.water));

    // River banks (sand strips)
    const bankPts1 = riverPts.map(p => new THREE.Vector3(p.x, 0.04, p.z + 6));
    const bankPts2 = riverPts.map(p => new THREE.Vector3(p.x, 0.04, p.z - 6));
    const bankCurve1 = new THREE.CatmullRomCurve3(bankPts1);
    const bankCurve2 = new THREE.CatmullRomCurve3(bankPts2);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(bankCurve1, 80, 2, 6, false), MAT.sand));
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(bankCurve2, 80, 2, 6, false), MAT.sand));

    addLabel(null, '🌊 Satluj River', 0, 5, -97);
}

// =====================================================================
// 11. SIWALIK HILLS (background mountains south of campus)
// =====================================================================
function buildHills() {
    // Simple triangular mountains in the background
    const hillPositions = [
        [-100, 130, 25], [-60, 125, 30], [-20, 135, 22],
        [20, 128, 28], [60, 132, 25], [100, 127, 20],
        [-130, 135, 18], [130, 130, 22], [-40, 140, 15],
        [40, 138, 18], [0, 142, 12],
    ];

    hillPositions.forEach(([hx, hz, hh]) => {
        const geo = new THREE.ConeGeometry(20 + Math.random() * 15, hh, 6);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x4a6741 + Math.floor(Math.random() * 0x101010),
            roughness: 0.9,
        });
        const hill = new THREE.Mesh(geo, mat);
        hill.position.set(hx, hh / 2 - 2, hz);
        hill.castShadow = true;
        scene.add(hill);
    });

    addLabel(null, '⛰️ Siwalik Hills', 0, 20, 140);
}

// =====================================================================
// 12. COMPASS
// =====================================================================
function buildCompass() {
    const arrowGeo = new THREE.ConeGeometry(1.5, 5, 3);
    const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    arrow.position.set(130, 5, -85);
    scene.add(arrow);
    addLabel(null, '⬆ N', 130, 10, -85);
}

// =====================================================================
// 13. INTERACTION — Click, Hover, Selection
// =====================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('pointerdown', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    if (hits.length > 0 && hits[0].object.userData.id) {
        selectBuilding(hits[0].object.userData.id);
    }
});

canvas.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    renderer.domElement.style.cursor = hits.length > 0 && hits[0].object.userData.id ? 'pointer' : 'grab';
});

function selectBuilding(id) {
    // Deselect previous
    if (selectedId && meshById[selectedId]) {
        meshById[selectedId].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(origColor[selectedId]);
            m.material.emissive.setHex(0x000000);
        });
    }

    selectedId = id;

    // Highlight new
    if (meshById[id]) {
        meshById[id].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(0xfbbf24);
            m.material.emissive.setHex(0x443300);
        });
    }

    // Fly camera
    const meshes = meshById[id];
    if (meshes && meshes.length > 0) {
        const pos = meshes[0].position;
        animateCamera(
            new THREE.Vector3(pos.x + 25, pos.y + 30, pos.z + 30),
            new THREE.Vector3(pos.x, pos.y, pos.z)
        );
    }

    // Show info
    showInfo(id);
    document.querySelectorAll('.bl-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
}

function animateCamera(toPos, toLook) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const dur = 800, t0 = performance.now();
    function step(now) {
        const t = Math.min((now - t0) / dur, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        camera.position.lerpVectors(startPos, toPos, ease);
        controls.target.lerpVectors(startTarget, toLook, ease);
        controls.update();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// =====================================================================
// 14. INFO PANEL
// =====================================================================
function showInfo(id) {
    const b = CAMPUS_DATA.find(b => b.id === id);
    if (!b) return;
    document.getElementById('infoTitle').textContent = b.name;
    document.getElementById('infoDesc').textContent = b.desc;
    const tagsEl = document.getElementById('infoTags');
    tagsEl.innerHTML = '';
    b.tags.forEach(t => {
        const s = document.createElement('span');
        s.className = 'itag';
        s.textContent = t;
        tagsEl.appendChild(s);
    });
    document.getElementById('infoPanel').classList.remove('hidden');
}

document.getElementById('closeInfo').addEventListener('click', () => {
    document.getElementById('infoPanel').classList.add('hidden');
});

// =====================================================================
// 15. SIDEBAR
// =====================================================================
function populateList(filter = '') {
    const el = document.getElementById('buildingList');
    el.innerHTML = '';
    const cats = ['academic', 'hostel', 'admin', 'facility', 'dining', 'sports', 'landmark', 'residential', 'infrastructure'];
    const catNames = {
        academic: '📚 Academic', hostel: '🏠 Hostels', admin: '🏛️ Admin',
        facility: '🔧 Facilities', dining: '🍽️ Dining', sports: '⚽ Sports',
        landmark: '🗿 Landmarks', residential: '🏘️ Residential', infrastructure: '⚙️ Infrastructure',
    };
    const q = filter.toLowerCase();
    const filtered = CAMPUS_DATA.filter(b =>
        b.name.toLowerCase().includes(q) || b.cat.includes(q) || b.tags.some(t => t.toLowerCase().includes(q))
    );
    cats.forEach(cat => {
        const items = filtered.filter(b => b.cat === cat);
        if (!items.length) return;
        const hdr = document.createElement('div');
        hdr.className = 'bl-cat';
        hdr.textContent = catNames[cat] || cat;
        el.appendChild(hdr);
        items.forEach(b => {
            const row = document.createElement('div');
            row.className = 'bl-item';
            row.dataset.id = b.id;
            row.innerHTML = `<div class="bl-dot" style="background:${CAT_COLORS[b.cat] || '#888'}"></div>
                <div><div class="bl-name">${b.name}</div><div class="bl-sub">${b.tags.slice(0, 2).join(' · ')}</div></div>`;
            row.addEventListener('click', () => selectBuilding(b.id));
            el.appendChild(row);
        });
    });
}

document.getElementById('searchBox').addEventListener('input', e => populateList(e.target.value));

// =====================================================================
// 16. HEADER BUTTONS
// =====================================================================
document.getElementById('btnReset').addEventListener('click', () => {
    if (selectedId && meshById[selectedId]) {
        meshById[selectedId].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(origColor[selectedId]);
            m.material.emissive.setHex(0x000000);
        });
        selectedId = null;
    }
    document.getElementById('infoPanel').classList.add('hidden');
    document.querySelectorAll('.bl-item').forEach(el => el.classList.remove('active'));
    animateCamera(new THREE.Vector3(0, 160, 180), new THREE.Vector3(0, 0, 0));
});

document.getElementById('btnTop').addEventListener('click', () => {
    animateCamera(new THREE.Vector3(0, 250, 1), new THREE.Vector3(0, 0, 0));
});

document.getElementById('btnLabels').addEventListener('click', function () {
    labelsVisible = !labelsVisible;
    this.classList.toggle('active', labelsVisible);
    Object.values(labelById).forEach(l => { l.visible = labelsVisible; });
});

document.getElementById('btnWire').addEventListener('click', function () {
    const active = this.classList.toggle('active');
    Object.values(meshById).forEach(arr => arr.forEach(m => {
        m.material = m.material.clone();
        m.material.wireframe = active;
    }));
});

// =====================================================================
// 17. RESIZE
// =====================================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================================
// 18. ANIMATION LOOP
// =====================================================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// =====================================================================
// 19. INIT
// =====================================================================
buildTerrain();
buildRoads();
buildAllBuildings();
buildLandscaping();
buildRiver();
buildHills();
buildCompass();
populateList();
animate();

// Hide loader
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) { loader.classList.add('gone'); setTimeout(() => loader.remove(), 500); }
}, 800);

console.log(`✅ IIT Ropar 3D Campus: ${CAMPUS_DATA.length} buildings, fully hardcoded.`);
