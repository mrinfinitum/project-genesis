# NOVERIS Inspiration Wall

The canonical Inspiration Wall route is `/experience-design/inspiration-wall`.

The wall is a local image repository browser for creative reference images. It reads recursively from `public/images` at build/server time and exposes images through public runtime URLs such as `/images/08-solar-forge.png`.

## Discovery

- Source directory: `public/images`
- Public URL prefix: `/images/`
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`
- Ignored files: hidden files, temporary files, unsupported formats, unreadable images, corrupt images
- Stable IDs are derived from the image path relative to `public/images`
- No absolute filesystem paths are returned in the manifest

Each image manifest record includes filename, relative path, public URL, extension, width, height, aspect ratio, orientation, size, modified time, title, folder, palette, warmth, luminance, and loading status.

## User Experience

The wall opens directly into a visual masonry gallery. It does not render demo cards, placeholder tiles, review dashboards, ownership summaries, typography cards, or color-token cards as gallery content.

The top bar stays minimal:

- Title
- Image count
- Search
- Folder and orientation filters
- Upload
- Presentation mode
- Metadata on demand

Keyboard support includes Enter or double-click for viewer mode, Space for quick preview, Escape to close overlays, and arrow keys for previous/next navigation.

## Uploads

Local development uploads write into `public/images/YYYY-MM-DD`.

Uploads validate MIME type, extension, size, and filename safety. Filenames are sanitized, traversal is rejected, and generated names are duplicate-safe.

Production deployments are treated as immutable. The upload API returns a clear local-development-only error instead of pretending that writes to `public/images` can persist on hosts such as Vercel.

## Runtime Boundary

The Inspiration Wall is Experience Design reference material. It is not gameplay runtime data and it is not published into the game runtime or engine exports.

Public manifest records may contain `/images/...` URLs, but they must not contain absolute `/Users/...` paths, `studio-private://` references, source masters, private storage URLs, environment variables, or secret data.

## Legacy Routes

These legacy Experience Design routes redirect to `/experience-design/inspiration-wall`:

- `/experience-design/inspiration-boards`
- `/experience-design/mood-boards`
- `/experience-design/canvas`

The underlying DV-04 Inspiration Board content model remains available for relationships and search, but its visual workspace is now the local-image Inspiration Wall.
