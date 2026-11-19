#!/usr/bin/env bash
# Frames for the hero scroll (index.html + script.js) from a source video. Needs ffmpeg with libwebp.
# Usage: tools/extract-frames.sh <video> [start_s=41] [length_s=22]
#
# desktop: every 3rd frame, 1920x1080, webp q45  -> frames-v2/f_0001.webp ...
# mobile : every 6th frame, 960x1080 crop around the waterfall (x offset 420), webp q55 -> frames-m-v2/
# Then set data-frames / data-frames-m in index.html to the number of files made.
#
# The source clip is out of focus for its first second (sharpness measured per frame), so the default start
# is 41 s, not 40 s. The crossfade in script.js hides the gaps between frames, so every 3rd frame is enough.
set -euo pipefail
SRC="${1:?usage: $0 <video> [start_s] [length_s]}"
START="${2:-41}"
LEN="${3:-22}"
cd "$(dirname "$0")/.."
mkdir -p frames-v2 frames-m-v2
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$SRC" -an \
  -vf "select=not(mod(n\,3))" -vsync 0 -c:v libwebp -quality 45 -compression_level 5 frames-v2/f_%04d.webp
ffmpeg -v error -y -ss "$START" -t "$LEN" -i "$SRC" -an \
  -vf "select=not(mod(n\,6)),crop=960:1080:420:0" -vsync 0 -c:v libwebp -quality 55 -compression_level 5 frames-m-v2/f_%04d.webp
echo "desktop: $(ls frames-v2 | wc -l) frames, mobile: $(ls frames-m-v2 | wc -l) frames"
