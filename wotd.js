// Usage: node wotd.js YYYY-MM-DD word.json
// Renders the carousel into wotd/<date>/, writes caption.txt, and advances state.json and used-words.json.
// word.json: {level, word, english, pos, example, exampleEnglish}
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [date, wordFile] = process.argv.slice(2);
const w = JSON.parse(fs.readFileSync(wordFile, 'utf8'));
const dir = path.join(__dirname, 'wotd', date);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'word.json'), JSON.stringify(w, null, 2) + '\n');
execFileSync('node', [path.join(__dirname, 'build.js'), path.join(dir, 'word.json'), dir], { stdio: 'inherit' });

const lang = w.level.split(' ')[0], lvl = w.level.replace(' ', '').toLowerCase();
const tags = {
  Spanish: '#learnspanish #spanishvocab #spanishclass',
  German: '#learngerman #germanvocab #germanclass',
  French: '#learnfrench #frenchvocab #frenchclass',
}[lang];
const caption = `📚 Word of the Day · ${w.level}

${w.word} 🤔 Do you know what it means? Guess before you swipe, then drop your answer in the comments 👇

✅ ${w.word} = ${w.english}
🗣️ "${w.example}"
(${w.exampleEnglish})

Got a vocab quiz coming up? LearnVai turns your class's own vocab list into flash cards, games, and a study plan. Link in bio.

#wordoftheday ${tags} #${lvl} #languagelearning #flashcards #studytips #learnvai
`;
fs.writeFileSync(path.join(dir, 'caption.txt'), caption);

const state = JSON.parse(fs.readFileSync('state.json', 'utf8'));
state.nextIndex = (state.levels.indexOf(w.level) + 1) % state.levels.length;
state.lastDate = date;
fs.writeFileSync('state.json', JSON.stringify(state, null, 2) + '\n');
const used = JSON.parse(fs.readFileSync('used-words.json', 'utf8'));
used[w.level].push(w.word);
fs.writeFileSync('used-words.json', JSON.stringify(used, null, 2) + '\n');
console.log(caption);
