var words = [];
var currentRow = 0;
var currentWord = "";
var gameProgress = [];
var gameWord = "trust";

var dictionary = [ 
"abuse", "adult", "agent", "anger", "apple", "award", "basis", "beach", "birth", "block", "blood", "board", "brain", "bread", "break", "brown", "buyer", "cause", "chain", "chair", "chest", "chief", "child", "china", "claim", "class", "clock", "coach", "coast", "court", "cover", "cream", "crime", "cross", "crowd", "crown", "cycle", "dance", "death", "depth", "doubt", "draft", "drama", "dream", "dress", "drink", "drive", "earth", "enemy", "entry", "error", "event", "faith", "fault", "field", "fight", "final", "floor", "focus", "force", "frame", "frank", "front", "fruit", "glass", "grant", "grass", "green", "group", "guide", "heart", "henry", "horse", "hotel", "house", "image", "index", "input", "issue", "japan", "jones", "judge", "knife", "laura", "layer", "level", "lewis", "light", "limit", "lunch", "major", "march", "match", "metal", "model", "money", "month", "motor", "mouth", "music", "night", "noise", "north", "novel", "nurse", "offer", "order", "other", "owner", "panel", "paper", "party", "peace", "peter", "phase", "phone", "piece", "pilot", "pitch", "place", "plane", "plant", "plate", "point", "pound", "power", "press", "price", "pride", "prize", "proof", "queen", "radio", "range", "ratio", "reply", "right", "river", "round", "route", "rugby", "scale", "scene", "scope", "score", "sense", "shape", "share", "sheep", "sheet", "shift", "shirt", "shock", "sight", "simon", "skill", "sleep", "smile", "smith", "smoke", "sound", "south", "space", "speed", "spite", "sport", "squad", "staff", "stage", "start", "state", "steam", "steel", "stock", "stone", "store", "study", "stuff", "style", "sugar", "table", "taste", "terry", "theme", "thing", "title", "total", "touch", "tower", "track", "trade", "train", "trend", "trial", "trust", "truth", "uncle", "union", "unity", "value",
"video", "visit", "voice", "waste", "watch", "water", "while", "white", "whole", "woman", "world", "youth", "alcon", "aught", "hella", "one’s", "ought", "thame", "there", "thine", "thine", "where", "which", "whose", "whoso", "yours", "yours", "admit", "adopt", "agree", "allow", "alter", "apply", "argue", "arise", "avoid", "begin", "blame", "break", "bring", "build", "burst", "carry", "catch", "cause", "check", "claim", "clean", "clear", "climb", "close", "count", "cover", "cross", "dance", "doubt", "drink", "drive", "enjoy", "enter", "exist", "fight", "focus", "force", "guess", "imply", "issue", "judge", "laugh", "learn", "leave", "let’s", "limit", "marry", "match", "occur", "offer", "order", "phone", "place", "point", "press", "prove", "raise", "reach", "refer", "relax", "serve", "shall", "share", "shift", "shoot", "sleep", "solve", "sound", "speak", "spend", "split", "stand", "start", "state", "stick", "study", "teach", "thank", "think", "throw", "touch", "train", "treat", "trust", "visit", 
"voice", "waste", "watch", "worry", "would", "write", "above", "acute", "alive", "alone", "angry", "aware", "awful", "basic", "black", "blind", "brave", "brief", "broad", "brown", "cheap", "chief", "civil", "clean", "clear", "close", "crazy", "daily", "dirty", "early", "empty", "equal", "exact", "extra", "faint", "false", "fifth", "final", "first", "fresh", "front", "funny", "giant", "grand", "great", "green", "gross", "happy", "harsh", "heavy", "human", "ideal", "inner", "joint", "large", "legal", "level", "light", "local", "loose", "lucky", "magic", "major", "minor", "moral", "naked", "nasty", "naval", "other", "outer", "plain", "prime", "prior", "proud", "quick", "quiet", "rapid", "ready", "right", "roman", "rough", "round", "royal", "rural", "sharp", "sheer", "short", "silly", "sixth", "small", "smart", "solid", "sorry", "spare", "steep", "still", "super", "sweet", "thick", "third", "tight", "total", "tough", "upper", "upset", "urban", "usual", "vague", "valid", "vital", "white", "whole", "wrong", "young", "afore", "after", "bothe", "other", "since", "slash", "until", "where", "while", "aback", "abaft", "aboon", "about", "above", "accel", "adown", "afoot", "afore", "afoul", "after", "again", "agape", "agogo", "agone", "ahead", "ahull", "alife", "alike", "aline", "aloft", "alone", "along", "aloof", "aloud", "amiss", "amply", "amuck", "apace", "apart", "aptly", "arear", "aside", "askew", "awful", "badly", "bally", "below", "canny", "cheap", "clean", "clear", "coyly", "daily", "dimly", "dirty", "ditto", "drily", "dryly", "dully", "early", "extra", "false", "fatly", "feyly", "first", "fitly", "forte", "forth", "fresh", "fully", "funny", "gaily", "gayly", "godly", "great", "haply", "heavy", "hella", "hence", "hotly", "icily", "infra", "intl.", "jildi", "jolly", "laxly", "lento", "light", "lowly", "madly", "maybe", "never", "newly", "nobly", "oddly", "often", "other", "ought", "party", "piano", "plain", "plonk", "plumb", "prior", "queer", "quick", "quite", "ramen", "rapid", "redly", "right", "rough", "round", "sadly", "secus", "selly", "sharp", "sheer", "shily", "short", "shyly", "silly", "since", "sleek", "slyly", "small",
"so-so", "sound", "spang", "srsly", "stark", "still", "stone", "stour", "super", "tally", "tanto", "there", "thick", "tight", "today", "tomoz", "truly", "twice", "under", "utter", "verry", "wanly", "wetly", "where", "wrong", "wryly", "abaft", "aboon", "about", "above", "adown", "afore", "after", "along", "aloof", "among", "below", "circa", "cross", "furth", "minus", "neath", "round", "since", "spite", "under", "until", "aargh", "adieu", "adios", "alack", "aloha", "avast", "bakaw", "basta", "begad", "bless", "blige", "brava", "bravo", "bring", "chook", "damme", "dildo", "ditto", "frick", "fudge", "golly", "gratz", "hallo", "hasta", "havoc", "hella", "hello", "howay", "howdy", "hullo", "huzza", "jesus", "kapow", "loose", "lordy", "marry", "mercy", "night", "plonk", "psych", "quite", "salve", "skoal", "sniff", "sooey", "there", "thiam", "thwap", "tough", "twirp", "viola", "vivat", "wacko", "wahey", "whist", "wilma", "wirra", "woops", "wowie", "yecch", "yeeha", "yeesh", "yowch", "zowie"]
var wordsPanel = document.querySelector(".words")

function isWordValid(word){
    return new Promise((resolve, reject) => {
        let capitalizedWordForDict = word.toLowerCase();
        let validity =  dictionary.indexOf(capitalizedWordForDict);
        console.log("valididty", validity)
        if(validity == -1) {
            fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+capitalizedWordForDict)
            .then(res => res.json())
            .then(res => {
                console.log("response", res)
                validity = res && res[0].word ? true : false
                resolve(validity)
            })
            .catch(err => {
                resolve(validity != -1)
            })
        } else {
            reject(false)
        }
    })
    
    // console.log("valid",capitalizedWordForDict, validity)
}

function displayToast(msg, timer) {
    let errorToast = document.getElementById("error");
    errorToast.innerText = msg;
    errorToast.style.display = 'block';
    setTimeout(() => {
        errorToast.style.display = 'none';
    }, timer || 2000)
}

function checkAndApplyColor(currentRowHTML) {
    currentWord.map((letter, index) => {
        if(letter == gameWord[index]){
            let currentLetterHTML = currentRowHTML.children[index];
            currentLetterHTML.classList.add('correct');
        }
    })
}

function checkMatching(currentRowHTML) {
    for(let i=0; i<currentWord.length; i++) {
        let currentLetterHTML = currentRowHTML.children[i];
        let letter = currentWord[i].toLowerCase();
        console.log("letter", letter, gameWord[i], letter == gameWord[i])
        if(letter == gameWord[i]){
            currentLetterHTML.classList.add('correct');
        } else if(gameWord.includes(letter)) {
            currentLetterHTML.classList.add('misplace');
        } else {
            currentLetterHTML.classList.add('wrong');
        }
    }

    words.push(currentWord);
    currentWord = "";
    currentRowHTML.classList.remove('active');//remove active class old row
    // Move to next row after checking.
    currentRow += 1;
    currentRowHTML = wordsPanel.children[currentRow];
    currentRowHTML.classList.add('active');//Add active class new row
}

async function handleKeyboard(e){
    let item = e.target
    let itemType = e.target && e.target.nodeName;
    if(itemType == 'SPAN') {
        const key = item.innerText;
        if(key.length == 1) {   // For each letter press
            if(currentWord.length == 5) {
                return;
            }
            currentWord += key;
            let currentRowHTML = wordsPanel.children[currentRow];
            let currentLetterHTML = currentRowHTML.children[currentWord.length-1];
            currentLetterHTML.innerText = key;
        }

        // For delete function
        if(key == 'Delete') {
            if(currentWord.length == 0) {
                return;
            }
            let currentRowHTML = wordsPanel.children[currentRow];
            let currentLetterHTML = currentRowHTML.children[currentWord.length-1];
            currentLetterHTML.innerText = "";
            currentWord = currentWord.slice(0, currentWord.length-1);
        }

        // For enter function
        if(key == 'Enter') {
            let currentRowHTML = wordsPanel.children[currentRow];
            // validity
            if(currentWord.length == 0) {return;}
            let validWord = await isWordValid(currentWord);
            if(!validWord){
                console.log("Not a valid word", currentWord);
                displayToast("Not a valid Word! 😬", 2000)
                return;
            }
            console.log("Its valid word")
            checkMatching(currentRowHTML);
        }
    }
    
}