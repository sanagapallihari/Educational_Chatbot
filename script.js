// Global variables to store state
let currentTask = null;
let score = 0; // Store score
let currentQuestionIndex = 0; // This will track the current question for each task
let currentMathQuestion = null; // Store the current Math question
let currentVocabQuestion = null; // Store the current Vocabulary question


// Function to generate a random Math question
function generateMathQuestion() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operation = Math.floor(Math.random() * 3); // Randomly choose an operation
  let question = '';
  let correctAnswer = 0;

  if (operation === 0) { // Addition
    question = `${num1} + ${num2}`;
    correctAnswer = num1 + num2;
  } else if (operation === 1) { // Subtraction
    question = `${num1} - ${num2}`;
    correctAnswer = num1 - num2;
  } else if (operation === 2) { // Multiplication
    question = `${num1} * ${num2}`;
    correctAnswer = num1 * num2;
  }

  return { question, correctAnswer };
}

// Function to fetch a random word and generate a vocabulary question
async function generateVocabularyQuestion() {
  const randomWordApiUrl = "https://random-word-api.herokuapp.com/word?number=1"; // Random word API
  const dictionaryApiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";

  try {
    // Fetch a random word
    const response = await fetch(randomWordApiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch random word");
    }
    const wordData = await response.json();
    const word = wordData[0];

    // Fetch the word's meaning from the dictionary API
    const definitionResponse = await fetch(`${dictionaryApiUrl}${word}`);
    if (!definitionResponse.ok) {
      throw new Error("Failed to fetch word definition");
    }
    const definitionData = await definitionResponse.json();

    // Validate if the definition is available
    if (!definitionData || !definitionData[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
      throw new Error("No definition found for the word");
    }
    const correctAnswer = definitionData[0].meanings[0].definitions[0].definition;

    // Generate incorrect options
    const incorrectDefinitions = [
      "An incorrect meaning.",
      "to bring to a stop.",
      "move or jump suddenly or rapidly."
    ];

    // Add random incorrect definitions to the options
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomDef = incorrectDefinitions[Math.floor(Math.random() * incorrectDefinitions.length)];
      if (!options.includes(randomDef)) {
        options.push(randomDef);
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    return {
      question: `What does "${word}" mean?`,
      correctAnswer,
      options
    };
  } catch (error) {
    console.error('Error generating vocabulary question:', error.message);
    return {
      question: 'Could not fetch a vocabulary question at the moment. Please try again.',
      correctAnswer: '',
      options: []
    };
  }
}

// Function to generate random options for vocabulary
function generateVocabularyOptions(correctAnswer, vocabularyWords) {
  const options = [correctAnswer];
  while (options.length < 4) {
    const randomWord = vocabularyWords[Math.floor(Math.random() * vocabularyWords.length)].meaning;
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }
  return options.sort(() => Math.random() - 0.5); // Shuffle options
}

// Display the current points
function displayPoints() {
  document.getElementById('chatbot-output').innerHTML = `<p>🌟 Your current score is: ${score}</p>`;
  document.getElementById('task-options').innerHTML = `
    <button onclick="showMenu()">Go to Main Menu</button>
    <button onclick="exitChatbot()">Exit</button>
  `;
}

// Function to choose an option from the main menu
function chooseOption(option) {
  document.getElementById('chatbot-input').style.display = 'none';
  document.getElementById('task-options').style.display = 'block';

  if (option === 1) {
    // Math problem task
    currentTask = 'math';
    currentQuestionIndex = 0;
    currentMathQuestion = generateMathQuestion(); // Store current question
    displayMathQuestion();
  } else if (option === 2) {
    // Vocabulary task
    currentTask = 'vocabulary';
    currentQuestionIndex = 0;
    generateVocabularyQuestion().then(question => {
      currentVocabQuestion = question; // Store current question
      displayVocabularyQuestion();
    });
  } else if (option === 3) {
    // Show points
    displayPoints();
  } else if (option === 4) {
    // Exit chatbot
    exitChatbot();
  }
}

// Display the current Math question
function displayMathQuestion() {
  document.getElementById('chatbot-output').innerHTML = ` 
    <p>🔢 ${currentMathQuestion.question}</p> 
    ${generateAnswerButtons([currentMathQuestion.correctAnswer, currentMathQuestion.correctAnswer + 1, currentMathQuestion.correctAnswer - 1, currentMathQuestion.correctAnswer + 2], checkMathAnswer)} 
  `;
}

// Check the Math question answer
function checkMathAnswer(answer) {
  if (parseInt(answer) === currentMathQuestion.correctAnswer) {
    score += 10;
    document.getElementById('chatbot-output').innerHTML = '<p>✅ Correct! Great job!</p>';
  } else {
    document.getElementById('chatbot-output').innerHTML = `<p>❌ Incorrect. The correct answer is ${currentMathQuestion.correctAnswer}.</p>`;
  }
  showNextButton();
}

// Display the current Vocabulary question
function displayVocabularyQuestion() {
  document.getElementById('chatbot-output').innerHTML = ` 
    <p>📚 ${currentVocabQuestion.question}</p>
    ${generateAnswerButtons(currentVocabQuestion.options, checkVocabularyAnswer)} 
  `;
}

// Check the Vocabulary question answer
function checkVocabularyAnswer(answer) {
  if (answer === currentVocabQuestion.correctAnswer) {
    score += 10;
    document.getElementById('chatbot-output').innerHTML = '<p>✅ Correct! You got it!</p>';
  } else {
    document.getElementById('chatbot-output').innerHTML = `<p>❌ Incorrect. The correct meaning is: ${currentVocabQuestion.correctAnswer}.</p>`;
  }
  showNextButton();
}

// Generate the answer buttons dynamically
function generateAnswerButtons(options, checkAnswerFunction) {
  return options
    .map(option => `<button onclick="(${checkAnswerFunction})(\'${option}\')">${option}</button>`)
    .join('');
}

// Show the next button after answering the question
function showNextButton() {
  document.getElementById('task-options').innerHTML = ` 
    <button onclick="nextTask()">Next Question</button> 
    <button onclick="showMenu()">Go to Main Menu</button> 
    <button onclick="exitChatbot()">Exit</button> 
  `;
}

// Next task button (calls the next question for the task)
function nextTask() {
  if (currentTask === 'math') {
    currentMathQuestion = generateMathQuestion(); // Generate new math question
    displayMathQuestion();
  } else if (currentTask === 'vocabulary') {
    generateVocabularyQuestion().then(question => {
      currentVocabQuestion = question; // Generate new vocab question
      displayVocabularyQuestion();
    });
  }
}

// Show the main menu
function showMenu() {
  document.getElementById('chatbot-input').style.display = 'block';
  document.getElementById('task-options').style.display = 'none';
  document.getElementById('chatbot-output').innerHTML = ` 
    <p>👋 Hello! I'm your dynamic learning assistant chatbot!</p> 
    <p>I can help you solve math problems or improve your vocabulary dynamically. Let's get started!</p>
  `;
}

// Exit chatbot
function exitChatbot() {
  document.getElementById('chatbot-output').innerHTML = `<p>👋 Goodbye! Your final score is: ${score}</p>`;
  document.getElementById('task-options').style.display = 'none';
  document.getElementById('chatbot-input').style.display = 'block';
}
