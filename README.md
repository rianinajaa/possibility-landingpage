# Progress & Possibility

An interactive reconstruction of the visible sequence in `referensi/contoh2.mp4`.

## Preview

From this directory:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. Scroll down through the full experience. The menu jumps to each scene; project screens open a gallery; the final control restarts the story.

No build or package installation is required. All runtime assets are local. Three.js r170 renders the metallic triangle, five project screens, and a scanned portrait split into solid animated fragments. Scroll position controls all primary animation. Reduced-motion preferences disable interpolation and pointer parallax.

## Files

- `dist/index.html`: page structure and dialogs
- `dist/style.css`: responsive layout and typography
- `dist/app.js`: 3D scene, fragment generation, scroll choreography and interactions
- `dist/assets`: fonts, imagery, portrait geometry and locally bundled Three.js

## Reference and asset notes

This is a visual study, not the official Digital Surgeons website. The supplied video is the design reference. Its unseen pages are not reconstructed. The portrait and some gallery compositions are substitutes; the end scene is an extension.

The logo, Gilroy webfonts, and Naboso/Blenders project imagery were obtained from the public Digital Surgeons website and remain the property of their respective owners. Source: https://www.digitalsurgeons.com/. For a separately branded production site, replace these brand assets and fonts with licensed equivalents.

Three.js: https://github.com/mrdoob/three.js/tree/r170 (MIT).

Zeus at The British Museum, London, by Scan the World, via https://zenodo.org/records/21172621. License: CC BY-NC-SA 4.0, https://creativecommons.org/licenses/by-nc-sa/4.0/. This private reference study is noncommercial. The derived sculpture asset (`dist/assets/zeus.bin`) and its cropped/fractured presentation retain the same license. Changes: geometry decoded from the reduced GLB, pedestal cropped at runtime, orientation changed, material replaced, geometry split and animated. Replace or separately license this asset for commercial use.

The studio environment, triangle, screen layouts, fracture geometry, and choreography were created for this implementation.

## Enhanced edition

The portrait now contains 177,103 vertices and 354,202 triangles (five times the previous scan detail). The adapted source is `7203dae70154b2ea7c669cec6fd2d0dc_normalized-0.500.glb` from the same credited record. Canvas artwork is rendered at 2000×1320; Blenders uses the original-resolution source. Naboso's available source is only 360×637 and is kept as a portrait inset, not upscaled to simulate HD. Rendering supports up to 2× device pixel ratio.

Added responsive studio lighting, pointer-responsive gallery panels, 150 instanced fracture shards, scroll-velocity camera depth, and a metallic orbital sculpture finale. Reduced-motion preferences disable continuous orbit, pointer movement and entrance animations. The more detailed scan increases initial processing and download size.

## Latest visual revision
Restored the original 35,426-vertex / 70,838-triangle portrait and original interior material at the user's request. Other enhanced effects remain. The opening now includes delicate orbital lines, light points, and a restrained halo. A white circular pointer appears only on fine-pointer devices, expands over links/buttons, and remains usable inside dialogs. It hides when the pointer leaves the page.
