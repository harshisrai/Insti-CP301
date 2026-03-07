"""
Tile Generator for Leaflet CRS.Simple Maps
Slices a large image into 256x256 tiles at multiple zoom levels.
Output structure: tiles/{z}/{x}/{y}.png

Usage:
    python generate_tiles.py
"""

import os
import math
from PIL import Image

# ── CONFIG ──
INPUT_IMAGE = "IIT_Ropar.jpg"
OUTPUT_DIR = "tiles"
TILE_SIZE = 256
MIN_ZOOM = 0
MAX_ZOOM = 5  # Adjust if needed; higher = more zoom detail

def generate_tiles():
    print(f"Opening {INPUT_IMAGE}...")
    img = Image.open(INPUT_IMAGE)
    orig_w, orig_h = img.size
    print(f"Image size: {orig_w} x {orig_h}")

    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        # At each zoom level, the image is divided into 2^zoom tiles per axis
        num_tiles = 2 ** zoom
        # The canvas size at this zoom level is num_tiles * TILE_SIZE
        canvas_size = num_tiles * TILE_SIZE

        # Scale the image to fit within the canvas (maintain aspect ratio)
        scale = min(canvas_size / orig_w, canvas_size / orig_h)
        scaled_w = int(orig_w * scale)
        scaled_h = int(orig_h * scale)

        print(f"Zoom {zoom}: {num_tiles}x{num_tiles} tiles, "
              f"scaled to {scaled_w}x{scaled_h}, canvas {canvas_size}x{canvas_size}")

        # Resize the image for this zoom level
        scaled_img = img.resize((scaled_w, scaled_h), Image.LANCZOS)

        # Place scaled image onto a transparent canvas
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        canvas.paste(scaled_img, (0, 0))

        # Slice into tiles
        tiles_generated = 0
        for x in range(num_tiles):
            for y in range(num_tiles):
                # Crop the tile
                left = x * TILE_SIZE
                upper = y * TILE_SIZE
                right = left + TILE_SIZE
                lower = upper + TILE_SIZE

                tile = canvas.crop((left, upper, right, lower))

                # Skip fully transparent tiles (outside the image area)
                if tile.getextrema()[3][1] == 0:  # Alpha channel max is 0
                    continue

                # Save tile
                tile_dir = os.path.join(OUTPUT_DIR, str(zoom), str(x))
                os.makedirs(tile_dir, exist_ok=True)
                tile_path = os.path.join(tile_dir, f"{y}.png")
                tile.save(tile_path, "PNG")
                tiles_generated += 1

        print(f"  → Generated {tiles_generated} tiles")

    print(f"\nDone! Tiles saved to '{OUTPUT_DIR}/'")
    print(f"Use MAX_ZOOM = {MAX_ZOOM} in your Leaflet config.")

    # Print image info for the HTML
    print(f"\n── Copy these values into index.html ──")
    print(f"const IMAGE_WIDTH  = {orig_w};")
    print(f"const IMAGE_HEIGHT = {orig_h};")
    print(f"const MAX_ZOOM     = {MAX_ZOOM};")

if __name__ == "__main__":
    generate_tiles()
