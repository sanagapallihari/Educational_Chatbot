from flask import Flask, send_file, request, jsonify
import random
import requests

app = Flask(__name__)

# Serve the HTML file
@app.route('/')
def index():
    return send_file('index.html')  # Directly serve the HTML file

# Serve the CSS file
@app.route('/styles.css')
def styles():
    return send_file('styles.css')  # Directly serve the CSS file

# Serve the JavaScript file
@app.route('/script.js')
def script():
    return send_file('script.js')  # Directly serve the JavaScript file

# Dynamic Math Solver API
@app.route('/math-solver', methods=['POST'])
def math_solver():
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operation = random.choice(["+", "-", "*", "/"])

    if operation == "+":
        correct_answer = num1 + num2
        question = f"What is {num1} + {num2}?"
    elif operation == "-":
        correct_answer = num1 - num2
        question = f"What is {num1} - {num2}?"
    elif operation == "*":
        correct_answer = num1 * num2
        question = f"What is {num1} * {num2}?"
    else:  # Division
        num1, num2 = num1 * num2, num1  # Ensure num1 is divisible by num2
        correct_answer = num1 / num2
        question = f"What is {num1} / {num2}?"

    options = [correct_answer, random.randint(1, 20), random.randint(1, 20), random.randint(1, 20)]
    random.shuffle(options)

    return jsonify({
        "question": question,
        "options": options,
        "correctAnswer": correct_answer
    })

# Dynamic Vocabulary Quiz API
@app.route('/vocabulary-quiz', methods=['POST'])
def vocabulary_quiz():
    dictionary_api_url = "https://api.dictionaryapi.dev/api/v2/entries/en/"
    random_word_api_url = "https://random-word-api.herokuapp.com/word"

    try:
        response = requests.get(random_word_api_url)
        if response.status_code == 200:
            word = response.json()[0]
        else:
            return jsonify({"error": "Couldn't fetch a random word."}), 500

        response = requests.get(f"{dictionary_api_url}{word}")
        if response.status_code == 200:
            data = response.json()
            meanings = data[0]['meanings']
            correct_definition = meanings[0]['definitions'][0]['definition']

            incorrect_definitions = ["An incorrect meaning.", "Unrelated definition.", "Looking sad."]
            options = [correct_definition] + random.sample(incorrect_definitions, 3)
            random.shuffle(options)

            return jsonify({
                "word": word,
                "options": options,
                "correctDefinition": correct_definition
            })
        else:
            return jsonify({"error": f"Couldn't find the meaning of '{word}'."}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
