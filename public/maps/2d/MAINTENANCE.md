# Maintaining and Updating the Insti Campus Map

## The Problem: "Pixel Fragility"
In Phase 1 (Demo), we use **Pixel Coordinates** (e.g., `x: 4000, y: 3000`). If you ever update the satellite image (e.g., zoom slightly differently, crop edges, or use a higher-res source), **ALL your pixel coordinates break**. You would have to re-draw every building. 😱

## The Solution: Geo-referencing (Phase 2)
To automate future updates, we switch to **Real-World Coordinates (Latitude/Longitude)**.
- **The Ground Truth:** The physical location of the Library never changes (`30.968°N, 76.524°E`), regardless of what image you put on top of it.
- **The Workflow:** Instead of fitting buildings to the image, we **fit the image to the world**.

## Future Update Workflow (Automated)
When you get a new satellite image next year:

1.  **Open QGIS (Free Software):**
    -   Load your new image.
    -   Click 4 known points (e.g., road intersections) and enter their real GPS usage from Google Maps.
    -   Save as **GeoTIFF**. (This takes ~5 minutes).

2.  **Generate Tiles:**
    -   Run `gdal2tiles.py -p mercator input.tif tiles/`.

3.  **Upload:**
    -   Replace the old `tiles/` folder.
    -   **DONE.** ✨

**Why this works:**
Because your database stores **Latitude/Longitude** for buildings, the map engine (Leaflet) automatically places them in the correct spot on the new, geo-referenced tiles. **Zero re-drawing required.**

## Migration Path (Do this later)
1.  **Keep building Phase 1 now.** Don't worry about pixels.
2.  **Conversion Script:** We will run a script to convert all your existing `[x, y]` pixels into `[lat, lng]` by using just 2 anchor points (Top-Left and Bottom-Right).
3.  **Switch to Phase 2.**

**Verdict:** Proceed with Phase 1. The data is not lost; it is easily convertible. Future maintenance is solved by Geo-referencing.
