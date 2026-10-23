# LearnVai social images

Public images for LearnVai's Instagram posts. Metricool loads post images from the raw links to this repository.

- `wotd/YYYY-MM-DD/` Word of the Day carousel (01-front.png, 02-back.png, word.json, caption.txt)
- `build.js` renders a word: `node build.js word.json outDir`
- `state.json` which level is next in the rotation
- `used-words.json` words already posted, per level, so none repeat
