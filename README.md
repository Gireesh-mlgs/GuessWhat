# GuessWhat

GuessWhat is a web-based guessing game platform featuring multiple interactive games.

## Features

* Interactive game selection
* GuessTheSong
* GuessTheState
* Responsive interface
* Music playback and guessing
* Score tracking

## Tech Stack

* React
* JavaScript
* CSS
* Node.js
* iTunes Search API

## Project Structure

```text
GuessWhat/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── games/
│   ├── assets/
│   └── App.jsx
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone <https://github.com/Gireesh-mlgs/GuessWhat.git>
```

Navigate to the project directory:

```bash
cd GuessWhat
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API

GuessTheSong uses the **iTunes Search API** to retrieve song information and preview audio.

## Environment Variables

If environment variables are required, create a `.env` file in the project root:

```env
VITE_API_URL=your_api_url
```

Do not commit sensitive API keys or credentials to the repository.

## License

This project is for educational and personal use.
