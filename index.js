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
const FLIP_TIME = 400;
const HOURS_2 = 60*60*2;
let gameScore = {
    totalGames: 0,
    totalGamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    gamesWonScore:{ 1:0, 2:0, 3:0, 4:0, 5:0, 6:0}
}
let gameSettings = {
    gameTimer: HOURS_2,
    notification: false,
    notificationBetween: {
        from: 9,
        to: 19
    }
}
let gameSettingsTemp = { ...gameSettings }
const WinnerMessage = ['Magnificent 🤩', 'Excellent 🥳', 'Wonderful 😁', 'Splendid 😁', 'Perfect 😊', 'Nice! It was close 😅']
var wordsPanel = document.querySelector(".words");
let keyboardPanelHTML = document.querySelector('.keyboard');

// Add to Home screen 
function registerA2HS() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        addBtn.style.display = 'block';
      
        addBtn.addEventListener('click', (e) => {
          // hide our user interface that shows our A2HS button
          addBtn.style.display = 'none';
          // Show the prompt
          deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
              } else {
                console.log('User dismissed the A2HS prompt');
              }
              deferredPrompt = null;
            });
        });
      });
}

// INITIAL LOAD -- START ---
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function updateOnlineStatus(event, isOnload) {
    var condition = navigator.onLine ? "online" : "offline";
    const onlineStatusHTML = document.getElementById('onlineStatus');
    if(condition == 'offline') {
        onlineStatusHTML.classList.remove('onlinestatus');
        onlineStatusHTML.classList.add('offlinestatus');
        onlineStatusHTML.innerHTML = 'YOU ARE OFFLINE'
        onlineStatusHTML.style.display = 'block';
    } else {
        if(isOnload) {
            return;
        }
        onlineStatusHTML.innerHTML = 'YOU ARE ONLINE'
        onlineStatusHTML.style.display = 'block';
        onlineStatusHTML.classList.remove('offlinestatus');
        onlineStatusHTML.classList.add('onlinestatus');
        setTimeout(()=> {
            onlineStatusHTML.style.display = 'none';
        },3000)
    }
}

function encryptor(text, publicKey="publicKey") {
    function getMessageEncoding() {
        let message = text;
        let enc = new TextEncoder();
        return enc.encode(message);
    }
    
    let encoded = getMessageEncoding();
    return window.crypto.subtle.encrypt(
        {
        name: "RSA-OAEP"
        },
        publicKey,
        encoded
    );
}

(function onLoadSuccess(){
    console.log("calling onload")
    updateOnlineStatus('', true);
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
    loadGameScore();
    loadGameSettings();
    registerA2HS();
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

// game score
function loadGameScore(){
    let gameScoreLocal = localStorage.getItem('gamescore');
    if(gameScoreLocal){
        gameScore = JSON.parse(gameScoreLocal);
    } else {
        localStorage.setItem('gamescore', JSON.stringify(gameScore));
    }
}

function loadGameSettings() {
    let gameSettingLocal = localStorage.getItem('gamesettings');
    if(gameSettingLocal){
        gameSettings = JSON.parse(gameSettingLocal);
        let time_rangeHTML = document.getElementById('time-range');
        time_rangeHTML.value = gameSettings.gameTimer;
        let notificationHTML = document.getElementById('notification');
        notificationHTML.checked = gameSettings.notification;
        let notificationFromHTML = document.getElementById('noti-from');
        notificationFromHTML.value = gameSettings.notificationBetween.from;
        let notificationTo = document.getElementById('noti-to');
        notificationTo.value = gameSettings.notificationBetween.to;
    } else {
        localStorage.setItem('gamesettings', JSON.stringify(gameSettings));
    }
}

function handleShare() {
    if(window.navigator && navigator.share){
        navigator.share({
            url: 'https://aravin008.github.io/wordleclone/',
            text: 'Wordle Clone Game for Fun. Share and play unlimited games.',
            title: 'Wordle Clone'
        });
        return;
    }
    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent('https://aravin008.github.io/wordleclone/ Wordle Clone'))
}

function updateGameScore(isItWin=false, winningAttempt){
    if(isItWin){
        gameScore.totalGames += 1;
        gameScore.totalGamesWon += 1;
        gameScore.currentStreak += 1;
        if(gameScore.currentStreak > gameScore.maxStreak) {
            gameScore.maxStreak = gameScore.currentStreak;
        }
        gameScore.gamesWonScore[winningAttempt] += 1;
    } else {
        gameScore.totalGames += 1;
        gameScore.currentStreak = 0;
    }
    localStorage.setItem('gamescore', JSON.stringify(gameScore));
    handleScoreCardDisplay(undefined, 'flex')
}

function handleDisplayOverlay(event, displayString, type) {
    if(type == 'help') {
        let helpHTML = document.getElementById('help');
        helpHTML.style.display = displayString
    }
    if(type == 'setting') {
        // setting display
        loadGameSettings();
        let helpHTML = document.getElementById('setting');
        helpHTML.style.display = displayString
    }
}

function handleSettingChange(e, type) {
    if(type == 'timer_range' && e.target.value) {
        const val = parseInt(e.target.value, 10);
        gameSettingsTemp.gameTimer = val;
    }
    if(type == 'notification') {
        const val = e.target.checked;
        gameSettingsTemp.notification = val;
    }
    if(type == 'notification_range_from' || type == 'notification_range_to') {
        const val = parseInt(e.target.value, 10);
        if(!gameSettingsTemp.notificationBetween) {
            gameSettingsTemp.notificationBetween = {}
        } 
        gameSettingsTemp.notificationBetween[type == 'notification_range_from' ? 'from' : 'to'] = val;
    }
    if(type == 'save') {
        gameSettings = gameSettingsTemp;
        localStorage.setItem('gamesettings', JSON.stringify(gameSettings));
        handleDisplayOverlay(e, 'none', 'setting')
    }
}

function loadFamousWords() {
    const wordsList = localStorage.getItem('mostused');
        if(!wordsList) {
            console.log("Fetchin")
            let url = window.origin == 'https://aravin008.github.io/' ? '/wordleclone/mostused.json' : '/mostused.json';
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
    const gameWordToGuess = localStorage.getItem('gameword')
    if(gameWordsGuessed && gameWord) {
        const wordsGuessed = JSON.parse(gameWordsGuessed);
        const wordToGuessObj = JSON.parse(gameWordToGuess);
        const wordToGuess = wordToGuessObj && wordToGuessObj.word;
        words = wordsGuessed;
        if(wordsGuessed.length > 0) {
            let i;
            for(i=0;i<wordsGuessed.length;i++) {
                const currentRowHTML = wordsPanel.children[i];
                currentRowHTML.classList.remove('active')
                const wordToUpdate = wordsGuessed[i].word;
                const wordStatus = wordsGuessed[i].status;
                if(wordToUpdate && wordStatus) {
                    for(let j=0, currects = 0;j<5;j++) {
                        colorKeyboardLayout(wordToUpdate[j].toLowerCase(), wordToGuess[j], wordToGuess)
                        const currentLetterHTML = currentRowHTML.children[j];
                        currentLetterHTML.innerText = wordToUpdate[j];
                        currentLetterHTML.classList.add(wordStatus[j]);
                        currects += wordStatus[j] == 'correct' ? 1 : 0;
                        if(currects == maxLengthWord) {
                            gameWon = true;
                            currentRow = maxGuessWords;
                            let timerHTML = document.getElementById('time');
                            timerHTML.style.display = 'block';
                            setTimeout(() => {
                                let animateItemsHTML = currentRowHTML.children;
                                Array.from(animateItemsHTML).forEach((ele,index) => {
                                    setTimeout(() => {
                                        ele.style.animation = "upNdown .4s ease-in-out";
                                    }, 200*index)
                                })
                            }, 1000)
                        }
                    }
                }
            }
            currentRow = i;
            if(currentRow<maxGuessWords && !gameWon) {
                const currentRowHTML = wordsPanel.children[i];
                currentRowHTML.classList.add('active')
            } else {
                let timerHTML = document.getElementById('time');
                timerHTML.style.display = 'block';
            }
        }
    }
}

function didTimeElapse(timestamp) {
    const seconds = timeElapsedInSeconds(timestamp)
    // console.log(seconds + " seconds");
    if(seconds >= gameSettings.gameTimer) {
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
            let url = window.origin == 'https://aravin008.github.io' ? '/wordleclone/words.json' : '/words.json';
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
    loaderHTML.style.display = fetchVal ? 'block' : 'none';
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

function checkNSendNotification(title, message) {
    var hr = (new Date()).getHours();
    const startTimeHR = gameSettings && gameSettings.notificationBetween && gameSettings.notificationBetween.from || 9;
    const EndTimerHR = gameSettings && gameSettings.notificationBetween && gameSettings.notificationBetween.from || 19;
    if((hr > startTimeHR) && (hr < EndTimerHR) && gameSettings.notification) {
        createScheduledNotification(title, message);
    }
}

function startTimer(timestamp) {
    if(!intervalID) {
        intervalID = setInterval(() => {
            if(timestamp) {
                let seconds = gameSettings.gameTimer - timeElapsedInSeconds(timestamp);
                hours = Math.floor(seconds / (60*60));
                if(hours >= 1) { seconds -= hours*60*60; }
                minutes = Math.floor(seconds / 60);
                if(minutes >= 1) { seconds -= minutes*60; }
                sec = seconds;
                // console.log("final timer", `0${hours}`.slice(-2), `0${minutes}`.slice(-2), `0${sec}`.slice(-2))
            }
            if(hours<0 || minutes < 0 || sec <0) {
                hours = 0
                minutes = 0
                sec = 0
                intervalID = clearInterval(intervalID);
                localStorage.removeItem('gameword')
                checkNSendNotification("Wordle clone", 'New Word is now avalibale! 🥳');
                // alert("Time out! Game over!!")
                generateNewWord();
                refreshPage();
            }
            let timerHTML = document.getElementById('timer');
            timerHTML.innerText = `0${hours}`.slice(-2) +':'+ `0${minutes}`.slice(-2) +':'+ `0${sec}`.slice(-2);
        }, 1000);
    }
}

function generateNewWord(forceGenerate= false) {
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
        // console.log("valididty", validity)
        if(!validity) {
            reject(false); 
            // if(fetching == false) {
            //     handleLoader(true);
            //     fetchWordInfo(capitalizedWordForDict)
            //     .then(res => { resolve(res);  handleLoader(false);})
            //     .catch(err => { reject(false);  handleLoader(false);})
            // }
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

function shouldPaint(currWord, letter, i, guessStat) {
    const currWord1 = currWord.toLowerCase();
    const totalOccurence = currWord1.split(letter).length - 1;
    if(totalOccurence>1) {
        const lastOccurence = (currWord.length - 1) - currWord1.split("").reverse().indexOf(letter);
        if( lastOccurence == i){
            let checkPreviosCorrect = true;
            for(let ii=0;ii<maxLengthWord; ii++) {
                if(currWord1[ii] == letter && guessStat[ii] == 'correct') {
                    checkPreviosCorrect = false;
                }
            }
            return checkPreviosCorrect;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

function checkMatching(currentRowHTML) {
    const guessStatus = {};
    let checkIfAllMatched = 0;
    for(let i=0; i<currentWord.length; i++) {
        let currentLetterHTML = currentRowHTML.children[i];
        let letter = currentWord[i].toLowerCase();
        let gameLetter = gameWord[i]
        // console.log("letter", letter, gameWord[i], letter == gameWord[i]);
        setTimeout(() => {
            colorKeyboardLayout(letter, gameLetter, gameWord);
        }, FLIP_TIME*i)

        if(letter == gameLetter){
            checkIfAllMatched += 1;
            setTimeout(() => {
                currentLetterHTML.classList.add('correct');
            }, FLIP_TIME*i)
            guessStatus[i] ='correct';
        } else if(gameWord.includes(letter) && shouldPaint(currentWord, letter, i, guessStatus)) {
            setTimeout(() => {
                currentLetterHTML.classList.add('misplace');
            }, FLIP_TIME*i)
            guessStatus[i] ='misplace';
        } else {
            setTimeout(() => {
                currentLetterHTML.classList.add('wrong');
            }, FLIP_TIME*i)
            guessStatus[i] ='wrong';
        }
    }
    // console.log("check matched", checkIfAllMatched)
    // On successfully parsed the word
    words.push({word: currentWord, status: guessStatus});
    localStorage.setItem('currentGameStatus', JSON.stringify(words))
    currentWord = "";
    currentRowHTML.classList.remove('active');//remove active class old row
    // Move to next row after checking.
    currentRow += 1;
    if(checkIfAllMatched == maxLengthWord) {
        //gameWon update the status
        setTimeout(()=> {
            let animateItemsHTML = currentRowHTML.children;
            Array.from(animateItemsHTML).forEach((ele,index) => {
                setTimeout(() => {
                    ele.style.animation = "upNdown .4s ease-in-out";
                    if(index == 4) {
                        // Udpate and display the Messages and scoreboard
                        setTimeout(()=>{
                            gameWon = true;
                            displayPermanentMessage(WinnerMessage[currentRow-1] + ', You guessed it right! 🥳');
                            setTimeout(()=> {
                                updateGameScore(true, currentRow);
                            }, FLIP_TIME*4)
                        }, FLIP_TIME*2)
                    }
                }, 200*index)
            })
        },FLIP_TIME*6)
        return;
    }
    if(currentRow == maxGuessWords) {
        setTimeout(()=>{
            displayPermanentMessage('Try again! 😕, Correct word is : '+ gameWord.toUpperCase());
            setTimeout(()=>{
                updateGameScore(false, -1);
            }, FLIP_TIME*6)
        }, FLIP_TIME*7)
    } else {
        currentRowHTML = wordsPanel.children[currentRow];
        currentRowHTML.classList.add('active');//Add active class new row
    }
}

function colorKeyboardLayout(letter, gameLetter, gameWord) {
    let keysHTML = keyboardPanelHTML.querySelectorAll('span');
    Array.from(keysHTML).forEach(function(ele) {
        const keyToCheck = ele.innerText;
        if(keyToCheck.toLowerCase() == letter) {
            // console.log(ele.innerText)
            if(letter == gameLetter){
                ele.classList.remove('misplace');
                ele.classList.add('correct');
            } else if(gameWord.includes(letter)) {
                if(ele.classList.contains('correct')) {
                    return; // Don't update if its correct
                }
                ele.classList.add('misplace');
            } else {
                if(ele.classList.contains('correct')) {
                    return; // Don't update if its correct
                }
                ele.classList.add('wrong');
            }
        }
    });
}

function handleScoreCardDisplay(e, displayStyle) {
    let scoreCardOverlayHTML = document.getElementById('scorecard');
    if(displayStyle == 'flex') {
        let scoreCardHTML = scoreCardOverlayHTML.firstElementChild;
        let statsHTML = scoreCardHTML.querySelector('ul');
        let statsLiHTML = statsHTML.children;
        let guessDistHTML = scoreCardHTML.querySelector('.guess-dist');
        let progressStatusHTML = guessDistHTML.children;
        // Update Stats
        Array.from(statsLiHTML).forEach( (item, index) => {
            let value = 0;
            let liItemHTML = item.querySelector('span');
            if(index == 0) {value = gameScore.totalGames;}
            if(index == 1) {value = gameScore.totalGamesWon ? Math.floor((gameScore.totalGamesWon / gameScore.totalGames)*100) : 0;}
            if(index == 2) {value = gameScore.currentStreak;}
            if(index == 3) {value = gameScore.maxStreak;}
            liItemHTML.innerHTML = value;
        })
        //Update the guess wise percentage and stats
        Array.from(progressStatusHTML).forEach( (item, index) => {
            let gameScoreList = Object.values(gameScore.gamesWonScore);
            let baseScore = gameScoreList && gameScoreList.reduce((max, item) => max < item ? item : max, 0);
            let scoreDivHTML = item.lastElementChild;
            let val = gameScore.gamesWonScore[index+1];
            let totalWon = gameScore.totalGamesWon;
            let percentage = 0;
            if(val != 0){
                percentage = Math.floor((val / baseScore)*100);
            }
            scoreDivHTML.style.width = percentage ? `max(calc(${percentage}% - 30px), 5%)` : '5%';
            scoreDivHTML.innerHTML = val;
        })
    }
    scoreCardOverlayHTML.style.display = displayStyle;
}

function refreshPage(e) {
    document.location.reload();
}

async function handleKeyboard(e){
    if(gameWon || currentRow >= maxGuessWords) {
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
                // console.log("Not a valid word", currentWord);
                displayToast("Not a valid Word! 😬", 2000)
                return;
            }
            // console.log("Its valid word")
            checkMatching(currentRowHTML);
        }
    }
    
}


// Service Worker

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function determineAppServerKey() {
    // Public Key:
    // BPWBGw-lmK5W1-s3Q_Fs3Czds24zerLyYKOBazSK2COfgQZQi5SlUPzmqy50zpVmmyItG94k-d-zOITfFLV4r-Q
    // Private Key:
    // ulCEYjDKpii6SUr3kytCj008qQlLbqgx4MqyFU3cBtI
    var vapidPublicKey = 'BPWBGw-lmK5W1-s3Q_Fs3Czds24zerLyYKOBazSK2COfgQZQi5SlUPzmqy50zpVmmyItG94k-d-zOITfFLV4r-Q' 
    return urlBase64ToUint8Array(vapidPublicKey);
}


const createScheduledNotification = async (title, message) => {
    navigator.serviceWorker.ready
      .then(function (registration) {
            registration.showNotification(title,{
                body: message
            })
        })
}


// A2HS
let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';