var words = [];
var currentRow = 0;
var currentWord = "";
var gameProgress = [];
var gameWord = "storm";
var keysStatus = {};
var maxGuessWords = 6;
var maxLengthWord = 5;
var fetching = false;
var gameWon = false;
var intervalID = null;
var dictionary = {};
var dictionary_famous = {}
var hours = 0, minutes = 0, sec = 0;
const HOURS_2 = 60*60*2;
var wordsPanel = document.querySelector(".words");
let keyboardPanelHTML = document.querySelector('.keyboard');

// INITIAL LOAD -- START ---
function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

(function onLoadSuccess(){
    console.log("calling onload")
    const user_uuid = localStorage.getItem('user_uuid');
    if(!user_uuid) {
        const id = create_UUID();
        localStorage.setItem('user_uuid', id);
    }
    loadGameStatus();
    loadFamousWords();
    loadUpdateTheDictionary()
    .then(dictionary => {
        console.log("Dictionary loaded!")
        generateNewWord();
        // batchWordGenerator();
    })
})();

window.addEventListener('beforeunload', function (e) {
    // e.preventDefault();
    // e.returnValue = '';
    localStorage.setItem('currentGameStatus', JSON.stringify(words))
})

function timeElapsedInSeconds(timestamp) {
    endTime = new Date();
    var timeDiff = endTime - new Date(timestamp); //in ms
    // strip the ms
    timeDiff /= 1000;
    // get seconds 
    var seconds = Math.round(timeDiff);
    return seconds;
}

function loadFamousWords() {
    const wordsList = localStorage.getItem('mostused');
        if(!wordsList) {
            console.log("Fetchin")
            let url = window.origin == 'http://127.0.0.1:5500' ? '/mostused.json' : '/wordleclone/mostused.json'
            fetch(url)
            .then(data => data.json())
            .then(res => {
                let arrayOfWords = res.data.split(',');
                const wordsObj = arrayOfWords.reduce((acc, word) => {
                    // const keep = word.split('').filter(function(item, pos, self) { return self.indexOf(item) == pos}).length == word.length;
                    // if(keep) {
                        acc[word] = {attempted: false, value: word}
                    // }
                    return acc;
                }, {});
                localStorage.setItem('mostused', JSON.stringify(wordsObj));
                dictionary_famous = wordsObj;
            })
            .catch(err =>
                reject("Error Loading Dictionary_famous",err)
            );
        } else {
            const dictLocal = localStorage.getItem('mostused');
            dictionary_famous = JSON.parse(dictLocal);
        }
}

function loadGameStatus() {
    const gameWordsGuessed = localStorage.getItem('currentGameStatus');
    if(gameWordsGuessed) {
        const wordsGuessed = JSON.parse(gameWordsGuessed);
        words = wordsGuessed;
        if(wordsGuessed.length > 0) {
            let i;
            for(i=0;i<wordsGuessed.length;i++) {
                const currentRowHTML = wordsPanel.children[i];
                currentRowHTML.classList.remove('active')
                const wordToUpdate = wordsGuessed[i].word;
                const wordStatus = wordsGuessed[i].status;
                for(let j=0, currects = 0;j<5;j++) {
                    const currentLetterHTML = currentRowHTML.children[j];
                    currentLetterHTML.innerText = wordToUpdate[j];
                    currentLetterHTML.classList.add(wordStatus[j]);
                    currects += wordStatus[j] == 'correct' ? 1 : 0;
                    if(currects == maxLengthWord) {
                        gameWon = true;
                        currentRow = maxGuessWords
                    }
                }
            }
            currentRow = i;
            if(currentRow>maxGuessWords) {
                const currentRowHTML = wordsPanel.children[i];
                currentRowHTML.classList.add('active')
            }
        }
    }
}

function didTimeElapse(timestamp) {
    const seconds = timeElapsedInSeconds(timestamp)
    console.log(seconds + " seconds");
    if(seconds >= HOURS_2) {
        return true;
    } else {
        return false;
    }
}

function loadUpdateTheDictionary() {
    return new Promise((resolve,reject) => {
        const wordsList = localStorage.getItem('words');
        if(!wordsList) {
            console.log("Fetchin")
            let url = window.origin == 'http://127.0.0.1:5500' ? '/words.json' : '/wordleclone/words.json'
            fetch(url)
            .then(data => data.json())
            .then(res => {
                let arrayOfWords = res.data.split(',');
                const wordsObj = arrayOfWords.reduce((acc, word) => {
                    // const keep = word.split('').filter(function(item, pos, self) { return self.indexOf(item) == pos}).length == word.length;
                    // if(keep) {
                        acc[word] = {attempted: false, value: word}
                    // }
                    return acc;
                }, {});
                localStorage.setItem('words', JSON.stringify(wordsObj));
                dictionary = wordsObj;
                resolve(wordsObj);
            })
            .catch(err =>
                reject("Error Loading Dictionary",err)
            );
        } else {
            const dictLocal = localStorage.getItem('words');
            dictionary = JSON.parse(dictLocal);
            resolve(dictionary);
        }
    })
}
// INITIAL LOAD -- END ---


// TOAST --- START ----
function handleLoader(fetchVal){
    fetching = fetchVal;
    const loaderHTML = document.querySelector('.loader');
    loaderHTML.style.visibility = fetchVal ? 'visible' : 'hidden';
}

function displayPermanentMessage(msg) {
    let tryAgainHTML = document.getElementById('displayMessage');
    tryAgainHTML.innerText = msg;
    tryAgainHTML.style.display = 'block';
}

function displayToast(msg, timer) {
    let errorToast = document.getElementById("error");
    errorToast.innerText = msg;
    errorToast.style.display = 'block';
    setTimeout(() => {
        errorToast.style.display = 'none';
    }, timer || 2000)
}
// TOAST --- END ----

function randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

function startTimer(timestamp) {
    if(!intervalID) {
        console.log("timer is not set lets set", intervalID)
        intervalID = setInterval(() => {
            if(timestamp) {
                console.log("time stamp")
                let seconds = HOURS_2 - timeElapsedInSeconds(timestamp);
                hours = Math.floor(seconds / (60*60));
                if(hours >= 1) { seconds -= hours*60*60; }
                minutes = Math.floor(seconds / 60);
                if(minutes >= 1) { seconds -= minutes*60; }
                sec = seconds;
                // console.log("final timer", `0${hours}`.slice(-2), `0${minutes}`.slice(-2), `0${sec}`.slice(-2))
            }
            if(hours<0 || minutes < 0 || sec <0) {
                console.log("something is les than zero")
                hours = 0
                minutes = 0
                sec = 0
                intervalID = clearInterval(intervalID);
                localStorage.removeItem('gameword')
                generateNewWord();
                alert("Time out! Game over!!")
                refreshPage();
            }
            let timerHTML = document.getElementById('timer');
            timerHTML.innerText = `0${hours}`.slice(-2) +':'+ `0${minutes}`.slice(-2) +':'+ `0${sec}`.slice(-2);
        }, 1000);
    }
}

function generateNewWord(forceGenerate= false) {
    console.log("generate New word", intervalID)
    const local_gameWord = localStorage.getItem('gameword');
    if(local_gameWord && !forceGenerate) {
        const gameWordobj = JSON.parse(local_gameWord);
        gameWord = gameWordobj.word;
        startTimer(gameWordobj.timestamp);
        return;
    }
    let randomWord = randomProperty(dictionary_famous);
    gameWord = randomWord && randomWord.value || gameWord;
    const timeStampNewWord = new Date();
    localStorage.setItem('gameword', JSON.stringify({word: gameWord, timestamp: timeStampNewWord}));
    localStorage.removeItem('currentGameStatus'); //Delete old word game status
    words = [];
    startTimer(timeStampNewWord);
}

function fetchWordInfo(word) {
    return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+word)
    .then(res => res.json())
    .then(res => {
        validity = res && res[0].word ? true : false
        return validity;
    })
    .catch(err => {
        return false;
    })
}

function isWordValid(word){
    return new Promise((resolve, reject) => {
        let capitalizedWordForDict = word.toLowerCase();
        let validity =  capitalizedWordForDict in dictionary;
        console.log("valididty", validity)
        if(!validity) {
            if(fetching == false) {
                handleLoader(true);
                fetchWordInfo(capitalizedWordForDict)
                .then(res => { resolve(res);  handleLoader(false);})
                .catch(err => { reject(false);  handleLoader(false);})
            }
        } else {
            resolve(true);
        }
    })
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
    const guessStatus = {};
    let checkIfAllMatched = 0;
    for(let i=0; i<currentWord.length; i++) {
        let currentLetterHTML = currentRowHTML.children[i];
        let keysHTML = keyboardPanelHTML.querySelectorAll('span');
        let letter = currentWord[i].toLowerCase();
        // console.log("letter", letter, gameWord[i], letter == gameWord[i]);
        Array.from(keysHTML).forEach(function(ele) {
            const keyToCheck = ele.innerText;
            if(keyToCheck.toLowerCase() == letter) {
                // console.log(ele.innerText)
                if(letter == gameWord[i]){
                    ele.classList.remove('misplace');
                    ele.classList.add('correct');
                } else if(gameWord.includes(letter)) {
                    ele.classList.add('misplace');
                } else {
                    ele.classList.add('wrong');
                }
            }
        });
        if(letter == gameWord[i]){
            checkIfAllMatched += 1;
            currentLetterHTML.classList.add('correct');
            guessStatus[i] ='correct';
        } else if(gameWord.includes(letter)) {
            currentLetterHTML.classList.add('misplace');
            guessStatus[i] ='misplace';
        } else {
            currentLetterHTML.classList.add('wrong');
            guessStatus[i] ='wrong';
        }
    }
    // On successfully parsed the word
    words.push({word: currentWord, status: guessStatus});
    currentWord = "";
    currentRowHTML.classList.remove('active');//remove active class old row
    // Move to next row after checking.
    currentRow += 1;
    if(checkIfAllMatched == maxLengthWord) {
        //gameWon 
        gameWon = true;
        displayPermanentMessage('You guessed it right! 🥳' + '  click to play again!');
        return;
    }
    if(currentRow == maxGuessWords) {
        displayPermanentMessage('Try again! 😕');
    } else {
        currentRowHTML = wordsPanel.children[currentRow];
        currentRowHTML.classList.add('active');//Add active class new row
    }
}

function refreshPage(e) {
    document.location.reload();
}

async function handleKeyboard(e){
    if(gameWon) {
        return;
    }
    let item = e.target
    let itemType = e.target && e.target.nodeName;
    if(itemType == 'SPAN') {
        const key = item.innerText;
        if(key.length == 1) {   // For each letter press
            if(currentWord.length == maxLengthWord) {
                return;
            }
            currentWord += key;
            let currentRowHTML = wordsPanel.children[currentRow];
            let currentLetterHTML = currentRowHTML.children[currentWord.length-1];
            currentLetterHTML.innerText = key;
        }

        // For delete function
        if(key == 'Del') {
            if(currentWord.length == 0) {
                return;
            }
            let currentRowHTML = wordsPanel.children[currentRow];
            let currentLetterHTML = currentRowHTML.children[currentWord.length-1];
            currentLetterHTML.innerText = "";
            currentWord = currentWord.slice(0, currentWord.length-1);
        }

        // For enter function
        if(key == 'Ent') {
            if(currentWord.length < maxLengthWord) {
                return;
            }
            let currentRowHTML = wordsPanel.children[currentRow];
            // validity
            if(currentWord.length == 0) {return;}
            let validWord;
            try {
                validWord = await isWordValid(currentWord);
            } catch(err){
                validWord = false;
            }
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