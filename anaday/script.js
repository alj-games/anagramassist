document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const submitButton = document.getElementById('submit-button');
    const backToAssistButton = document.getElementById('back-to-assist');
    const letterCircle = document.getElementById('letter-circle');
    const solutionSpaces = document.getElementById('solution-spaces');
    const gameSection = document.querySelector('.game-section');
    const helpButton = document.getElementById('help-button');
    const helpOverlay = document.getElementById('help-overlay');
    const closeHelpButton = document.getElementById('close-help-button');
    const resultOverlay = document.getElementById('result-overlay');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const correctWord = document.getElementById('correct-word');
    const timeRemaining = document.getElementById('time-remaining');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const timerElement = document.getElementById('timer');
    const statsOverlay = document.getElementById('stats-overlay');
    const statsStreak = document.getElementById('stats-streak');
    const statsSolved = document.getElementById('stats-solved');
    const statsFailed = document.getElementById('stats-failed');
    const statsFast = document.getElementById('stats-fast');
    
    // App state
    let letters = [];
    let selectedPositionIndex = null;
    let timer = null;
    let timeLeft = 60;
    let todaysWord = "";
    let gameStats = {
        streak: 0,
        totalSolved: 0,
        totalFailed: 0,
        solvedUnder30s: 0,
        lastPlayedDate: null
    };
    let isCompletionRecorded = false;
    
    // Initialize event listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    shuffleButton.addEventListener('click', shuffleLetters);
    submitButton.addEventListener('click', submitAnswer);
    helpButton.addEventListener('click', showHelp);
    closeHelpButton.addEventListener('click', hideHelp);
    backToMenuButton.addEventListener('click', backToMenu);
    backToAssistButton.addEventListener('click', navigateToAssist);

    initializeStats();
    
    // Start the game
    function startGame() {
      const today = new Date().toDateString();

      if (gameStats.lastPlayedDate === today) {
         const wasSuccess = localStorage.getItem("gameSuccess") === "true";
         isCompletionRecorded = true;
         const storedTimeLeft = parseInt(localStorage.getItem("gameTimeRemaining") || "0");
         todaysWord = localStorage.getItem("gameTodaysWord") || getWordOfTheDay();
	 timeLeft = storedTimeLeft;
         showResult(wasSuccess);
	 return;
      }

         // Get today's word
         todaysWord = getWordOfTheDay();
        
         // Scramble the letters
         const scrambledLetters = scrambleWord(todaysWord);
        
         // Initialize game state with scrambled letters
         letters = scrambledLetters.split('').map(letter => {
             return {
                 value: letter,
                 used: false
             };
         }); 

        // Create solution spaces for the word
        createSolutionSpaces(todaysWord.length);

        gameStats.lastPlayedDate = today;
        saveStats();
        
        const inputOverlay = document.getElementById('input-overlay');
        inputOverlay.style.opacity = '0';
        inputOverlay.style.visibility = 'hidden';

        // Show game section
        gameSection.style.display = 'block';
        
        setTimeout(() => {
            gameSection.style.opacity = '1';
            buildLetterCircle();
            
            // Start the timer
            startTimer();
        }, 50);
    }
    
    // Scramble a word to create an anagram
    function scrambleWord(word) {
        const letters = word.split('');
        
        // Check that it's different from the original
        let scrambled;
        do {
            // Fisher-Yates shuffle algorithm
            for (let i = letters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [letters[i], letters[j]] = [letters[j], letters[i]];
            }
            scrambled = letters.join('');
        } while (scrambled === word);
        
        return scrambled;
    }
    
    // Start the countdown timer
    function startTimer() {
        updateTimerDisplay();
        
        timer = setInterval(() => {
            timeLeft--;
            
            // Update timer display
            updateTimerDisplay();
            
            // Check if time is up
            if (timeLeft <= 0) {
                clearInterval(timer);
                showResult(false);
            }
        }, 1000);
    }
    
    // Update the timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;        
       
            if (timeLeft <= 10) {
                timerElement.classList.add('danger');
            } else if (timeLeft <= 30) {
                timerElement.classList.add('warning');
	    } else {
		timerElement.classList.remove('warning', 'danger');
            }
        }
    }
    
    // Create solution spaces
    function createSolutionSpaces(count) {
        solutionSpaces.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const space = document.createElement('div');
            space.className = 'solution-space';
            space.dataset.index = i;
            
            // Add event listener to make spaces selectable
            space.addEventListener('click', function() {
                // Deselect previously active space
                const activeSpace = document.querySelector('.solution-space.active');
                if (activeSpace) {
                    activeSpace.classList.remove('active');
                }
                
                // If clicking on the same space, deselect it
                if (selectedPositionIndex === i) {
                    selectedPositionIndex = null;
                } else {
                    // Otherwise select the new space
                    space.classList.add('active');
                    selectedPositionIndex = i;
                }
            });
            
            solutionSpaces.appendChild(space);
        }
    }
    
    // Build the letter circle
    function buildLetterCircle() {
        letterCircle.innerHTML = '';
        
        // Calculate circle dimensions
        const circleWidth = letterCircle.offsetWidth;
        const circleHeight = letterCircle.offsetHeight;

        const radius = Math.min(circleWidth, circleHeight) * 0.45;
        const center = { 
            x: circleWidth / 2, 
            y: circleHeight / 2 
        };
        
        letters.forEach((letter, index) => {
            // Calculate position evenly around the circle
            const angle = (index / letters.length) * 2 * Math.PI;
            const x = center.x + radius * Math.cos(angle) - 25;
            const y = center.y + radius * Math.sin(angle) - 25;
            
            // Create letter element
            const letterElement = document.createElement('div');
            letterElement.className = letter.used ? 'letter used' : 'letter';
            letterElement.textContent = letter.value;
            letterElement.style.left = `${x}px`;
            letterElement.style.top = `${y}px`;
            letterElement.dataset.index = index;
            
            // Add event listener for selecting/deselecting letters
            letterElement.addEventListener('click', function() {
                selectLetter(index);
            });
            
            letterCircle.appendChild(letterElement);
        });
    }
    
    // Update letter states without moving them
    function updateLetterStates() {
        letters.forEach((letter, index) => {
            const letterElement = document.querySelector(`.letter[data-index="${index}"]`);
            if (letterElement) {
                if (letter.used) {
                    letterElement.classList.add('used');
                } else {
                    letterElement.classList.remove('used');
                }
            }
        });
    }
    
	function selectLetter(index) {
	    const letter = letters[index];
    
	    if (letter.used) {
	        // If the letter is already used, remove it from solution
	        removeLetterFromSolution(letter.value, index);
	        letter.used = false;
	    } else {
	        // If not used, add it to solution
	        addLetterToSolution(letter.value, index);
	        letter.used = true;
	    }
    
	    // Update letter states without moving them
	    updateLetterStates();
	}
    
    // Add letter to solution
	function addLetterToSolution(letterValue, letterIndex) {
	    const solutionSpaceElements = Array.from(document.querySelectorAll('.solution-space'));
    
	    if (selectedPositionIndex !== null) {
	        // If a specific position is selected
	        const targetSpace = solutionSpaceElements[selectedPositionIndex];
        
	        if (targetSpace) {
	            if (targetSpace.textContent) {
	                const oldValue = targetSpace.textContent;
	                const oldLetterIndex = targetSpace.dataset.sourceIndex;
                
	                if (oldLetterIndex !== undefined) {
	                    // If we know which letter object this came from, mark it unused
	                    letters[parseInt(oldLetterIndex)].used = false;
	                } else {
	                    // Otherwise fall back to searching by value (less reliable)
	                    letters.forEach(l => {
	                        if (l.value === oldValue && l.used) {
	                            l.used = false;
	                        }
	                    });
	                }
	            }
            
	            // Set the new letter
	            targetSpace.textContent = letterValue;
	            targetSpace.dataset.sourceIndex = letterIndex;
            
	            // Clear the selection
	            targetSpace.classList.remove('active');
	            selectedPositionIndex = null;
	        }
	    } else {
	        // Find the first empty space
	        const emptySpace = solutionSpaceElements.find(space => !space.textContent);
	        if (emptySpace) {
	            emptySpace.textContent = letterValue;
	            emptySpace.dataset.sourceIndex = letterIndex;  // Add this line
	        }
	    }
	}
    
	function removeLetterFromSolution(letterValue, letterIndex = null) {
	    const solutionSpaceElements = Array.from(document.querySelectorAll('.solution-space'));
    
	    if (letterIndex !== null) {
	        // If we know which specific letter object to remove
	        for (const space of solutionSpaceElements) {
	            if (space.dataset.sourceIndex === letterIndex.toString()) {
	                space.textContent = '';
	                delete space.dataset.sourceIndex;
	                return;
	            }
	        }
	    }
    
	    // Fallback: find the first space with this letter value
	    for (const space of solutionSpaceElements) {
	        if (space.textContent === letterValue) {
	            space.textContent = '';
	            delete space.dataset.sourceIndex;
	            break;
	        }
	    }
	}
    
	function resetGame() {
	    letters.forEach(letter => {
	        letter.used = false;
	    });
    
	    // Clear solution spaces
	    const solutionSpaceElements = document.querySelectorAll('.solution-space');
	    solutionSpaceElements.forEach(space => {
	        space.textContent = '';
	        delete space.dataset.sourceIndex;  // Add this line
	    });
    
	    // Reset selected position
	    selectedPositionIndex = null;
	    const activeSpace = document.querySelector('.solution-space.active');
	    if (activeSpace) {
	        activeSpace.classList.remove('active');
	    }

	    updateLetterStates();
	}
    
    // Shuffle the letters in the circle
    function shuffleLetters() {
        // Add spinning class to trigger animation
        letterCircle.classList.add('spinning');
        
        // Schedule the shuffle to happen during the fastest part of the spin
        setTimeout(() => {
            // Fisher-Yates shuffle algorithm
            for (let i = letters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                // Swap values in the letters array
                [letters[i], letters[j]] = [letters[j], letters[i]];
            }

            // Rebuild the circle with the new arrangement
            buildLetterCircle();
            updateLetterStates();
            
        }, 600); // Around 40% into the animation when spin is fast
        
        // Remove the spinning class after the animation completes
        setTimeout(() => {
            letterCircle.classList.remove('spinning');
        }, 1500);
    }
    
    // Submit the user's answer
    function submitAnswer() {
        // Get the current solution from the solution spaces
        const solutionSpaces = document.querySelectorAll('.solution-space');
        let userSolution = '';
        
        solutionSpaces.forEach(space => {
            userSolution += space.textContent || '';
        });
        
        // Check if the solution is correct
        if (userSolution === todaysWord) {
            clearInterval(timer);
            showResult(true);
        } else {
            // Indicate incorrect answer (shake the solution spaces)
            const solutionArea = document.querySelector('.solution-area');
            solutionArea.classList.add('shake');
            
            setTimeout(() => {
                solutionArea.classList.remove('shake');
            }, 500);
        }
    }
    
    // Show help overlay
    function showHelp() {
        helpOverlay.style.visibility = 'visible';
        helpOverlay.style.opacity = '1';
    }

    // Hide help overlay
    function hideHelp() {
        helpOverlay.style.opacity = '0';
        helpOverlay.style.visibility = 'hidden';
    }
    
    // Show result overlay with success or failure
    function showResult(isSuccess) {
        // Set result content based on success or failure
        if (isSuccess) {
            resultTitle.textContent = 'SOLVED';
            resultMessage.textContent = "Well done.";

            let displayTimeLeft = timeLeft;
            if (isCompletionRecorded) {
            displayTimeLeft = parseInt(localStorage.getItem("gameTimeRemaining") || "0");
        } else {
            localStorage.setItem("gameTimeRemaining", timeLeft.toString());
        }
            
            // Format remaining time
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            resultTitle.textContent = 'OUT OF TIME';
            resultMessage.textContent = "Better luck tomorrow.";
            timeRemaining.textContent = '0:00';

	    if (!isCompletionRecorded) {
                localStorage.setItem("gameTimeRemaining", "0");
	    }
        }

	correctWord.textContent = todaysWord;
        if (!isCompletionRecorded) {
	    localStorage.setItem("gameTodaysWord", todaysWord);
	}

	if (isCompletionRecorded) {
            const timeUsed = isSuccess ? 60 - timeLeft : 0;
            recordGameCompletion(isSuccess, timeUsed);
        
            // Store whether game was successful for today
            localStorage.setItem("gameSuccess", isSuccess.toString());
        }
        
        // Set the correct word
        correctWord.textContent = todaysWord;
	localStorage.setItem("gameTodaysWord", todaysWord);

        if (!isCompletionRecorded) {
            const timeUsed = isSuccess ? 60 - timeLeft : 0;
            recordGameCompletion(isSuccess, timeUsed);
        
            // Store whether game was successful for today
            localStorage.setItem("gameSuccess", isSuccess.toString());
        }
        
        // Show the overlay
        resultOverlay.style.visibility = 'visible';
        resultOverlay.style.opacity = '1';

        const statsButton = document.getElementById('stats-button');
        if (statsButton) {
            statsButton.replaceWith(statsButton.cloneNode(true));
            const freshStatsButton = document.getElementById('stats-button');
            freshStatsButton.addEventListener('click', showStats);
        }

	const closeStatsButton = document.getElementById('close-stats-button');
	if (closeStatsButton) {
	    closeStatsButton.addEventListener('click', hideStats);
	}
    }
    
    // Go back to menu
    function backToMenu() {
        // Stop the timer if it's running
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // Reset game state
        resetGame();
        
        // Reset timer
        timeLeft = 60;
        timerElement.textContent = '1:00';
        timerElement.classList.remove('warning', 'danger');
        
        // Hide result overlay
        resultOverlay.style.opacity = '0';
        resultOverlay.style.visibility = 'hidden';
        
        // Hide game section
        gameSection.style.opacity = '0';
        setTimeout(() => {
            gameSection.style.display = 'none';
            
            // Show input overlay
            const inputOverlay = document.getElementById('input-overlay');
            inputOverlay.style.visibility = 'visible';
            inputOverlay.style.opacity = '1';
        }, 300);
    }

	function initializeStats() {
	    const savedStats = localStorage.getItem('anagramGameStats');
	    if (savedStats) {
	        gameStats = JSON.parse(savedStats);
        
	        // Check if the streak should be reset (not played yesterday)
	        const today = new Date().toDateString();
	        const lastPlayed = gameStats.lastPlayedDate;
        
	        if (lastPlayed) {
	            const yesterday = new Date();
	            yesterday.setDate(yesterday.getDate() - 1);
	            const yesterdayString = yesterday.toDateString();
            
	            if (lastPlayed !== yesterdayString && lastPlayed !== today) {
	                gameStats.streak = 0;
	            }
	        }
	    }
	    updateStatsDisplay();
	}
    
	// Save stats to local storage
	function saveStats() {
	    localStorage.setItem('anagramGameStats', JSON.stringify(gameStats));
	    updateStatsDisplay();
	}

	// Update the stats display
	function updateStatsDisplay() {
	    statsStreak.textContent = gameStats.streak;
	    statsSolved.textContent = gameStats.totalSolved;
	    statsFailed.textContent = gameStats.totalFailed;
	    statsFast.textContent = gameStats.solvedUnder30s;
	}

	function showStats() {
	    console.log("showStats function called");
	    const statsOverlay = document.getElementById('stats-overlay');
	    if (statsOverlay) {
	        console.log("Setting overlay visible");
	        statsOverlay.style.visibility = 'visible';
	        statsOverlay.style.opacity = '1';
	    } else {
	        console.log("Stats overlay not found");
	    }
	}
	
	// Hide stats overlay
	function hideStats() {
	    statsOverlay.style.opacity = '0';
	    statsOverlay.style.visibility = 'hidden';
	}

	// Record a game completion
	function recordGameCompletion(success, timeInSeconds) {
	    const today = new Date().toDateString();

	    if (isCompletionRecorded) {
	        return; // Skip if stats have already been recorded for today
	    }

	    isCompletionRecorded = true;
	    
	    if (success) {
	        gameStats.totalSolved++;
	        
	        // Check if this is a consecutive day
	        if (gameStats.lastPlayedDate !== today) {
	            gameStats.streak++;
	        }
	        
	        // Check if solved under 30 seconds
	        if (timeInSeconds < 30) {
	            gameStats.solvedUnder30s++;
	        }
	    } else {
	        gameStats.totalFailed++;
	        gameStats.streak = 0;
	    }
	    
	    gameStats.lastPlayedDate = today;
	    saveStats();
	}
	    
    // Navigate to Anagram Assist
    function navigateToAssist() {
        // In a real implementation, this would navigate to the Anagram Assist app
        window.location.href = 'https://alj-games.github.io/anagramassist/';
    }
    
    // Add shake animation for incorrect answers
    document.querySelector('.solution-area').addEventListener('animationend', function() {
        this.classList.remove('shake');
    });

    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .solution-area.shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
    `;
    document.head.appendChild(style);

});
