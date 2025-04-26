document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const anagramInput = document.getElementById('anagram-input');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const letterCircle = document.getElementById('letter-circle');
    const solutionSpaces = document.getElementById('solution-spaces');
    const gameSection = document.querySelector('.game-section');
    const helpButton = document.getElementById('help-button');
    const helpOverlay = document.getElementById('help-overlay');
    const closeHelpButton = document.getElementById('close-help-button');
    
    // App state
    let letters = [];
    let selectedPositionIndex = null;
    
    // Initialize event listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    shuffleButton.addEventListener('click', shuffleLetters);
    helpButton.addEventListener('click', showHelp);
    closeHelpButton.addEventListener('click', hideHelp);

    // Enter key event listener
    document.getElementById('anagram-input').addEventListener('keydown', function(event) {
        // Check if Enter key was pressed
        if (event.key === 'Enter') {
            // Prevent the default action (like form submission)
            event.preventDefault();
            
            // Trigger the start button click
            startButton.click();
        }
    });
    
    // Start the game
	function startGame() {
	    // Get the input text
	    const input = anagramInput.value.toUpperCase();
	    
	    // Extract just the letters for the circle (no separators)
	    const lettersOnly = input.replace(/[^A-Z]/g, '');
    
	    if (lettersOnly.length === 0) {
	        alert('Please enter some letters.');
	        return;
	    }
    
	    // Initialize game state with only actual letters
	    letters = lettersOnly.split('').map(letter => {
	        return {
	            value: letter,
	            used: false
	        };
	    });

	    // Create solution spaces that include the separators
	    createSolutionSpacesWithSeparators(input);
    
	    const inputOverlay = document.getElementById('input-overlay');
	    inputOverlay.style.opacity = '0';
	    inputOverlay.style.visibility = 'hidden';

	    // Show game section
	    gameSection.style.display = 'block';
	    
	    setTimeout(() => {
	        gameSection.style.opacity = '1';
	        buildLetterCircle();
	    }, 50);

	    setTimeout(() => {
	        buildLetterCircle();
	    }, 600);
	}

	function createSolutionSpacesWithSeparators(originalInput) {
	    solutionSpaces.innerHTML = '';
    
	    // Create a mapping between the original input positions and letter indices
	    let letterIndex = 0;
	    const positionToLetterIndex = {};
    
	    for (let i = 0; i < originalInput.length; i++) {
	        if (/[A-Z]/.test(originalInput[i])) {
	            positionToLetterIndex[i] = letterIndex++;
	        }
	    }
    
	    // Now create the solution spaces
	    for (let i = 0; i < originalInput.length; i++) {
	        if (originalInput[i] === '/') {
	            // Create a separator element
	            const separator = document.createElement('div');
	            separator.className = 'solution-space separator';
	            separator.textContent = '|';
	            solutionSpaces.appendChild(separator);
	        } else if (/[A-Z]/.test(originalInput[i])) {
	            // Create a regular solution space
	            const space = document.createElement('div');
	            space.className = 'solution-space';
	            space.dataset.letterIndex = positionToLetterIndex[i];
            
	            // Add event listener to make spaces selectable
	            space.addEventListener('click', function() {
	                // Deselect previously active space
	                const activeSpace = document.querySelector('.solution-space.active');
	                if (activeSpace) {
	                    activeSpace.classList.remove('active');
	                }
                
	                // If clicking on the same space, deselect it
	                if (selectedPositionIndex === parseInt(space.dataset.letterIndex)) 		{
	                    selectedPositionIndex = null;
	                } else {
	                    // Otherwise select the new space
	                    space.classList.add('active');
	                    selectedPositionIndex = parseInt(space.dataset.letterIndex);
	                }
	            });
	            
	            solutionSpaces.appendChild(space);
	        }
	    }
	}


	// Build the letter circle once
	function buildLetterCircle() {
	    letterCircle.innerHTML = '';

	    void letterCircle.offsetWidth;
	    
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
	        letterElement.className = 'letter';
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
	    console.log('Circle dimensions:', circleWidth, 'x', circleHeight);
	}
    
    // Create solution spaces (underscores)
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
    
	// Arrange letters in a circle
	function arrangeLettersInCircle() {
	    letterCircle.innerHTML = '';
    
	    const radius = 80; // Radius of the circle
	    const center = { x: 100, y: 100 }; // Center point of the circle
    
	    // Count only unused letters for positioning
	    const unusedLetters = letters.filter(l => !l.used);
	    let unusedIndex = 0;
    
	    letters.forEach((letter, index) => {
	        // Calculate position on circle
	        let angle, x, y;
        
	        if (!letter.used) {
	            // Position unused letters evenly around the circle
	            angle = (unusedIndex / unusedLetters.length) * 2 * Math.PI;
	            unusedIndex++;
	        } else {
	            // Position used letters at their last position (don't move them)
	            const letterElement = document.querySelector(`.letter[data-index="${index}"]`);
	            if (letterElement) {
	                angle = Math.atan2(
	                    parseFloat(letterElement.style.top) + 20 - center.y,
	                    parseFloat(letterElement.style.left) + 20 - center.x
	                );
	            } else {
	                // Fallback if element not found (shouldn't happen normally)
	                angle = (index / letters.length) * 2 * Math.PI;
	            }
	        }
        
	        x = center.x + radius * Math.cos(angle) - 20;
	        y = center.y + radius * Math.sin(angle) - 20;
        
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

	document.getElementById('new-button').addEventListener('click', function() {
	    // Show the overlay again
	    const inputOverlay = document.getElementById('input-overlay');
	    inputOverlay.style.opacity = '1';
	    inputOverlay.style.visibility = 'visible';
    
	    // Hide game section
	    const gameSection = document.querySelector('.game-section');
	    gameSection.style.opacity = '0';
    
	    // Clear input field for new entry
	    document.getElementById('anagram-input').value = '';
	});
    
    // Handle letter selection
    function selectLetter(index) {
        const letter = letters[index];
        
        if (letter.used) {
            // If the letter is already used, remove it from solution
            removeLetterFromSolution(letter.value);
            letter.used = false;
        } else {
            // If not used, add it to solution
            addLetterToSolution(letter.value, index);
            letter.used = true;
        }
        
	// Update letter states without moving them
	updateLetterStates();
    }

	// Update the visual state of letters without moving them
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
    
    // Add letter to solution
    function addLetterToSolution(letterValue, letterIndex) {
        const solutionSpaceElements = Array.from(document.querySelectorAll('.solution-space:not(.separator)'));
        
        if (selectedPositionIndex !== null) {
            // If a specific position is selected
            const targetSpace = solutionSpaceElements.find(space => 
                parseInt(space.dataset.letterIndex) === selectedPositionIndex
            );            
           
            if (targetSpace) {
		if (targetSpace.textContent) {
                    letters.forEach(l => {
                        if (l.value === targetSpace.textContent && l.used) {
                            l.used = false;
                        }
                    });
                }
            
                // Set the new letter
                targetSpace.textContent = letterValue;
            
                // Clear the selection
                targetSpace.classList.remove('active');
                selectedPositionIndex = null;
	    }
        } else {
            // Find the first empty space
            const emptySpace = solutionSpaceElements.find(space => !space.textContent);
            if (emptySpace) {
                emptySpace.textContent = letterValue;
            }
        }
    }
    
    // Remove letter from solution
    function removeLetterFromSolution(letterValue) {
        const solutionSpaceElements = Array.from(document.querySelectorAll('.solution-space:not(.separator)'));
        
        // Find the space containing this letter and clear it
        for (const space of solutionSpaceElements) {
            if (space.textContent === letterValue) {
                space.textContent = '';
                break;
            }
        }
    }
    
    // Reset the game
    function resetGame() {
        letters.forEach(letter => {
            letter.used = false;
        });
        
        // Clear solution spaces
        const solutionSpaceElements = document.querySelectorAll('.solution-space:not(.separator)');
        solutionSpaceElements.forEach(space => {
            space.textContent = '';
        });
        
        // Reset selected position
        selectedPositionIndex = null;
        const activeSpace = document.querySelector('.solution-space.active');
        if (activeSpace) {
            activeSpace.classList.remove('active');
        }

        updateLetterStates();
    }
    
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
	    }, 1500); // Match this to the full animation duration
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
});
