# Facility photos

The page loads these files. Any that are missing show a labelled placeholder.

| File | Where it appears |
|---|---|
| `exterior.webp` | Large photo under the headline |
| `exterior.jpg` | Link preview image (social/text shares) |
| `apartment.webp` | Care section card (bedroom) |
| `exterior-mountains.webp` | About section |
| `living-room.webp` | Gallery: Great room (large tile) |
| `kitchen.webp` | Gallery: Kitchen |
| `family-room.webp` | Gallery: Family room (tall tile) |
| `lounge.webp` | Gallery: TV lounge |
| `dining.webp` | Gallery: Dining room (wide tile) |
| `kitchenette.webp` | Gallery: Apartment kitchenette |
| `bathroom.webp` | Gallery: Private bathroom |

Keep each file under ~500 KB (about 2000px on the long side) so the page loads quickly.

`logo.jpg` and `favicon.png` are exported from the Hearthstone badge PDF.

Each photo also has a smaller `-720.webp` copy (and `exterior-800.webp`) that phones load instead of the full-size file. If you replace a photo, regenerate its small copy too, e.g. `convert images/kitchen.webp -resize 720x -quality 80 images/kitchen-720.webp`.
