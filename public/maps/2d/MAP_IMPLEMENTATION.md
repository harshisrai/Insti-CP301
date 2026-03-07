# Insti Campus Map — Implementation Guide

**Approach:** Two-phase Leaflet.js map with clickable building polygons  
**Asset:** `IIT_Ropar.jpg` (14.8 MB high-res satellite image)  
**No navigation/pathfinding** — focus on exploration, building info, and GPS.

---

## Architecture Overview

```
Phase 1 (Demo)                          Phase 2 (Production)
─────────────                           ──────────────────
CRS.Simple (pixel coords)        →     Mercator (real lat/lng)
Single image or tiles             →     Geo-referenced tiles (GDAL)
Markers only                      →     Markers + GPS "You Are Here"
Click polygons on pixel grid      →     Click polygons on real coords
localhost / quick deploy          →     Integrated into Insti PWA
```

Both phases share the **same building polygon data** and **popup system** — Phase 2 only changes the coordinate system and adds GPS.

---

## Phase 1 — Quick Demo (CRS.Simple)

### Step 1: Prepare Tiles

Use **GDAL** to slice `IIT_Ropar.jpg` into tiles:

```bash
# Install GDAL (pick one)
conda install -c conda-forge gdal          # via Anaconda
pip install GDAL                            # via pip (may need system libs)
# Or download OSGeo4W on Windows: https://trac.osgeo.org/osgeo4w/

# Generate tiles (adjust -z range based on image dimensions)
# For a ~14MB image, 0-5 zoom levels is usually enough
gdal2tiles.py --xyz -p raster -z 0-5 IIT_Ropar.jpg tiles/
```

This creates:
```
tiles/
├── 0/0/0.png        ← Full campus thumbnail
├── 1/0/0.png ...    ← 4 tiles
├── 2/...            ← 16 tiles
└── 5/...            ← Most detailed tiles
```

> [!TIP]
> **Alternative if GDAL is tricky to install:** Use [MapTiler Engine](https://www.maptiler.com/engine/) (free tier, GUI) — drag in the image, select "Raster", set zoom levels, export.

### Step 2: Get Image Dimensions

You need the pixel width/height of `IIT_Ropar.jpg`:

```bash
# Python one-liner
python -c "from PIL import Image; img=Image.open('IIT_Ropar.jpg'); print(img.size)"
# Output: (WIDTH, HEIGHT) e.g., (8192, 6144)
```

### Step 3: Create the Map

Create `index.html` in the `Map/` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IIT Ropar Campus Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- RasterCoords plugin for pixel ↔ map coordinate conversion -->
    <script src="https://unpkg.com/leaflet-rastercoords@1.0.2/rastercoords.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        #map { height: 100vh; width: 100vw; }

        /* Building info panel */
        .building-popup {
            font-family: 'Inter', system-ui, sans-serif;
            min-width: 200px;
        }
        .building-popup h3 {
            margin: 0 0 6px;
            font-size: 16px;
            color: #1a1a2e;
        }
        .building-popup .tag {
            display: inline-block;
            background: #e8f4f8;
            color: #0a6c74;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-bottom: 6px;
        }
        .building-popup p {
            font-size: 13px;
            color: #444;
            margin: 4px 0;
        }

        /* Highlight polygon on hover */
        .leaflet-interactive:hover {
            cursor: pointer;
        }

        /* Search bar */
        #search-container {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            width: 320px;
        }
        #search-input {
            width: 100%;
            padding: 10px 16px;
            border: none;
            border-radius: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            font-family: 'Inter', system-ui, sans-serif;
            outline: none;
        }
        #search-results {
            background: white;
            border-radius: 12px;
            margin-top: 4px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
        .search-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            border-bottom: 1px solid #f0f0f0;
        }
        .search-item:hover { background: #f5f5ff; }
        .search-item:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <!-- Search bar -->
    <div id="search-container">
        <input type="text" id="search-input" placeholder="Search buildings..." autocomplete="off" />
        <div id="search-results"></div>
    </div>

    <div id="map"></div>

    <script>
    // ═══════════════════════════════════════════════════════
    // CONFIG — Update these values for your image
    // ═══════════════════════════════════════════════════════
    const IMAGE_WIDTH  = 8192;   // ← Replace with your image's pixel width
    const IMAGE_HEIGHT = 6144;   // ← Replace with your image's pixel height
    const TILE_PATH    = 'tiles/{z}/{x}/{y}.png';
    const MAX_ZOOM     = 5;      // ← Must match your gdal2tiles -z value

    // ═══════════════════════════════════════════════════════
    // BUILDING DATA
    // Each building has: name, category, description, and a
    // polygon defined as pixel coordinates [x, y] from the
    // TOP-LEFT of the original image.
    //
    // How to get coordinates:
    //   Open IIT_Ropar.jpg in any image editor (Paint, GIMP,
    //   Photoshop). Hover over building corners — the status
    //   bar shows pixel (x, y). Record 4+ corners per building.
    // ═══════════════════════════════════════════════════════
    const buildings = [
        {
            name: "SAB (Student Activity Building)",
            shortCode: "SAB",
            category: "Student Life",
            description: "Clubs, societies, and student activities hub.",
            departments: [],
            // Polygon corners as [x, y] pixel coords from image top-left
            // ↓ Replace these with real coordinates from your image
            polygon: [
                [2400, 1800],
                [2600, 1800],
                [2600, 2000],
                [2400, 2000]
            ]
        },
        {
            name: "Lecture Hall Complex (LHC)",
            shortCode: "LHC",
            category: "Academic",
            description: "Main lecture halls for UG and PG courses.",
            departments: ["All"],
            polygon: [
                [3000, 2200],
                [3300, 2200],
                [3300, 2500],
                [3000, 2500]
            ]
        },
        {
            name: "Main Library",
            shortCode: "LIB",
            category: "Academic",
            description: "Central library with reading halls, digital resources, and group study rooms.",
            departments: ["All"],
            polygon: [
                [3500, 1600],
                [3800, 1600],
                [3800, 1850],
                [3500, 1850]
            ]
        }
        // ──────────────────────────────────────
        // ADD MORE BUILDINGS HERE
        // Copy the template above, update name,
        // category, description, and polygon
        // coordinates from the satellite image.
        // ──────────────────────────────────────
    ];

    // ═══════════════════════════════════════════════════════
    // MAP SETUP
    // ═══════════════════════════════════════════════════════
    const map = L.map('map', {
        crs: L.CRS.Simple,
        maxZoom: MAX_ZOOM,
        minZoom: 0
    });

    // RasterCoords converts pixel [x,y] → Leaflet LatLng
    const rc = new L.RasterCoords(map, [IMAGE_WIDTH, IMAGE_HEIGHT]);
    map.setMaxBounds(rc.getMaxBounds());
    map.setView(rc.unproject([IMAGE_WIDTH / 2, IMAGE_HEIGHT / 2]), 2);

    // Base tile layer (your satellite image)
    L.tileLayer(TILE_PATH, {
        noWrap: true,
        maxZoom: MAX_ZOOM,
        bounds: rc.getMaxBounds()
    }).addTo(map);

    // ═══════════════════════════════════════════════════════
    // BUILDING POLYGONS (clickable)
    // ═══════════════════════════════════════════════════════
    const polygonLayer = L.layerGroup().addTo(map);
    let activePolygon = null;  // Track the currently selected building

    // Category → color mapping
    const categoryColors = {
        "Academic":       { fill: "#3b82f6", border: "#1d4ed8" },
        "Student Life":   { fill: "#8b5cf6", border: "#6d28d9" },
        "Hostel":         { fill: "#f59e0b", border: "#d97706" },
        "Administrative": { fill: "#6b7280", border: "#4b5563" },
        "Sports":         { fill: "#10b981", border: "#059669" },
        "Dining":         { fill: "#ef4444", border: "#dc2626" },
        "Utility":        { fill: "#64748b", border: "#475569" },
        "default":        { fill: "#6366f1", border: "#4f46e5" }
    };

    buildings.forEach(b => {
        const colors = categoryColors[b.category] || categoryColors["default"];

        // Convert pixel coords to Leaflet coords
        const latLngs = b.polygon.map(([x, y]) => rc.unproject([x, y]));

        const poly = L.polygon(latLngs, {
            color: colors.border,
            fillColor: colors.fill,
            fillOpacity: 0.25,
            weight: 2
        }).addTo(polygonLayer);

        // Hover effect
        poly.on('mouseover', () => {
            if (poly !== activePolygon) {
                poly.setStyle({ fillOpacity: 0.45, weight: 3 });
            }
        });
        poly.on('mouseout', () => {
            if (poly !== activePolygon) {
                poly.setStyle({ fillOpacity: 0.25, weight: 2 });
            }
        });

        // Click → highlight + show info popup
        poly.on('click', () => {
            // Reset previously selected building
            if (activePolygon && activePolygon !== poly) {
                const prevColors = categoryColors[activePolygon._buildingData.category] || categoryColors["default"];
                activePolygon.setStyle({
                    fillOpacity: 0.25,
                    weight: 2,
                    color: prevColors.border,
                    fillColor: prevColors.fill
                });
                activePolygon.closePopup();
            }

            // Highlight clicked building
            activePolygon = poly;
            poly.setStyle({
                fillOpacity: 0.5,
                weight: 3,
                color: '#ffffff',
                fillColor: colors.fill
            });

            // Show popup at polygon center
            const center = poly.getBounds().getCenter();
            L.popup({ className: 'building-popup' })
                .setLatLng(center)
                .setContent(`
                    <div class="building-popup">
                        <h3>${b.name}</h3>
                        <span class="tag">${b.category}</span>
                        <p>${b.description}</p>
                        ${b.departments.length ? `<p><strong>Departments:</strong> ${b.departments.join(', ')}</p>` : ''}
                    </div>
                `)
                .openOn(map);
        });

        // Store building data reference on the polygon
        poly._buildingData = b;
    });

    // Click on empty area → deselect
    map.on('click', (e) => {
        // Only deselect if click was NOT on a polygon
        if (activePolygon && !e.originalEvent._polygonClick) {
            const colors = categoryColors[activePolygon._buildingData.category] || categoryColors["default"];
            activePolygon.setStyle({
                fillOpacity: 0.25,
                weight: 2,
                color: colors.border,
                fillColor: colors.fill
            });
            activePolygon = null;
            map.closePopup();
        }
    });

    // ═══════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════
    const searchInput  = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = buildings.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.shortCode.toLowerCase().includes(query) ||
            b.category.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        matches.forEach(b => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.textContent = `${b.shortCode} — ${b.name}`;
            div.addEventListener('click', () => {
                // Fly to building and simulate click
                const latLngs = b.polygon.map(([x, y]) => rc.unproject([x, y]));
                const bounds = L.latLngBounds(latLngs);
                map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 4 });

                // Find and click the matching polygon
                polygonLayer.eachLayer(layer => {
                    if (layer._buildingData && layer._buildingData.shortCode === b.shortCode) {
                        layer.fire('click');
                    }
                });

                searchInput.value = '';
                searchResults.style.display = 'none';
            });
            searchResults.appendChild(div);
        });

        searchResults.style.display = 'block';
    });

    // Close search on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
            searchResults.style.display = 'none';
        }
    });
    </script>
</body>
</html>
```

### Step 4: How to Add Building Coordinates

1. Open `IIT_Ropar.jpg` in any image viewer/editor (Paint, GIMP, Photoshop, or even the browser)
2. Hover over each **corner of a building** — note the pixel `(x, y)` from the top-left
3. Add the building to the `buildings` array with its polygon corners
4. Reload the page

> [!TIP]
> For rectangular buildings, you only need 4 corners. For L-shaped or complex buildings, use more points to trace the outline.

### Step 5: Run Locally

```bash
# Option A: Python HTTP server
cd Map
python -m http.server 8080
# Open http://localhost:8080

# Option B: VS Code Live Server extension (right-click index.html → Open with Live Server)
```

---

## Phase 2 — Production (Geo-referenced + GPS)

When you're ready to integrate into the Insti PWA with real GPS:

### Step 1: Geo-reference the Image

**Option A — QGIS (most precise)**
1. Install [QGIS](https://qgis.org/) (free)
2. Open `IIT_Ropar.jpg` via `Raster → Georeferencer`
3. Click 4+ recognizable points (building corners, road intersections)
4. For each point, enter the real lat/lng (get these from Google Maps — right-click → "What's here?")
5. Export as GeoTIFF

**Option B — Manual bounds (quick & good enough)**
Find the lat/lng of the image's four corners from Google Maps:
```bash
# IIT Ropar approximate bounds (verify on Google Maps)
SOUTH=30.9650
NORTH=30.9750
WEST=76.4680
EAST=76.4800

# Create a geo-referenced TIFF using GDAL
gdal_translate -of GTiff \
  -a_srs EPSG:4326 \
  -a_ullr $WEST $NORTH $EAST $SOUTH \
  IIT_Ropar.jpg IIT_Ropar_geo.tif
```

### Step 2: Generate Mercator Tiles

```bash
gdal2tiles.py --xyz -p mercator -z 14-20 IIT_Ropar_geo.tif tiles_geo/
```

### Step 3: Swap CRS.Simple → Standard Leaflet

Key changes from Phase 1:

```javascript
// ── Phase 2 changes ──

// 1. Standard map (no CRS.Simple)
const map = L.map('map').setView([30.9697, 76.4734], 17);

// 2. Your geo-referenced tiles as base layer
L.tileLayer('tiles_geo/{z}/{x}/{y}.png', { maxZoom: 20 }).addTo(map);

// 3. Building polygons now use [lat, lng] instead of [px_x, px_y]
const buildings = [
    {
        name: "SAB",
        polygon: [
            [30.9705, 76.4725],   // ← real lat/lng corners
            [30.9705, 76.4735],
            [30.9698, 76.4735],
            [30.9698, 76.4725]
        ]
        // ... rest same as Phase 1
    }
];

// 4. No more RasterCoords — polygons work directly
buildings.forEach(b => {
    L.polygon(b.polygon, { /* same styles */ }).addTo(map);
});

// 5. GPS "You Are Here"
map.locate({ watch: true, maxZoom: 18 });
map.on('locationfound', (e) => {
    if (!userMarker) {
        userMarker = L.circleMarker(e.latlng, {
            radius: 8, fillColor: '#4285F4',
            color: '#fff', weight: 2, fillOpacity: 1
        }).addTo(map);
    } else {
        userMarker.setLatLng(e.latlng);
    }
});
```

### Migrating Building Data

To convert Phase 1 pixel coordinates to Phase 2 lat/lng:

```python
# Quick conversion script
# You only need: image bounds and image dimensions

SOUTH, NORTH = 30.9650, 30.9750
WEST, EAST   = 76.4680, 76.4800
IMG_W, IMG_H = 8192, 6144  # your image dimensions

def pixel_to_latlng(x, y):
    lng = WEST + (x / IMG_W) * (EAST - WEST)
    lat = NORTH - (y / IMG_H) * (NORTH - SOUTH)  # y is inverted
    return [round(lat, 6), round(lng, 6)]

# Example: SAB corner at pixel (2400, 1800)
print(pixel_to_latlng(2400, 1800))
# → [30.970700, 76.471514]
```

---

## Building Data Template

Use this template for each building. The same data works in both Phase 1 (pixel) and Phase 2 (lat/lng):

```javascript
{
    name: "Full Building Name",
    shortCode: "CODE",           // e.g., "SAB", "LHC", "LIB"
    category: "Academic",        // Academic | Student Life | Hostel |
                                 // Administrative | Sports | Dining | Utility
    description: "What this building is for.",
    departments: ["CSE", "EE"],  // or [] if N/A
    photos: [],                  // Future: image URLs
    polygon: [
        [x1, y1],               // Phase 1: pixels from image
        [x2, y2],               // Phase 2: [lat, lng] pairs
        [x3, y3],
        [x4, y4]
    ]
}
```

---

## Summary

| Feature | Phase 1 (Demo) | Phase 2 (Production) |
|---------|----------------|---------------------|
| Map tiles | `gdal2tiles -p raster` | `gdal2tiles -p mercator` |
| Coordinates | Pixel `[x, y]` | Real `[lat, lng]` |
| Clickable buildings | ✅ Polygons + popups | ✅ Same |
| Search | ✅ Client-side filter | ✅ Same |
| GPS "You Are Here" | ❌ | ✅ `map.locate()` |
| Navigation | ❌ | ❌ (by design) |
| Integration | Standalone HTML | Next.js React component |
| Effort | ~1 day | ~1 more day |