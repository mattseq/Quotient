# Quotient

> **Submitted for the Appwrite Sites Hackathon**

“Everyone has that one friend who drops the funniest roast, the most random out-of-context line, or the perfect piece of wisdom. But those quotes usually get lost. **Quotient** is a quote bank that makes saving and sharing those moments effortless — and turns them into games.

Build your own quote bank, join groups to pool sayings together, and play quiz modes like survivor rounds, team battles, and quote-of-the-day challenges. It’s part memory vault, part trivia night, and all about the joy of collecting and playing with words.”

---

## Features

- Personal and group quote banks
- Quizzes
- Easy sharing and saving of quotes
- Leaderboards

## Tech Stack

- React
- Framer Motion
- Appwrite (Backend as a Service)
- Appwrite Sites (hosting)

## Appwrite Setup

This project uses [Appwrite](https://appwrite.io/) as its Backend as a Service.

1. **Install Appwrite**  
   Follow the [Appwrite installation guide](https://appwrite.io/docs/installation) to set up Appwrite on your server or use Appwrite Cloud.

2. **Create a Project**  
   - Log in to your Appwrite console.
   - Create a new project (e.g., "Quotient").

3. **Add Web Platform**  
   - In your project, add a new Web platform.

4. **Create Database & Collections**  
   - Create a database for quotes and users.
   - Add collections for quotes, users, and any other entities your app requires.

5. **Set Up API Keys & Environment Variables**  
   - Add your Appwrite endpoint, project ID, and API key to your environment variables:
     ```
     VITE_APPWRITE_ENDPOINT=your-appwrite-endpoint
     VITE_APPWRITE_PROJECT_ID=your-project-id
     VITE_APPWRITE_API_KEY=your-api-key
     ```
   - Update your frontend code to use these variables.

6. **Configure Permissions**  
   - Set appropriate read/write permissions for collections and documents.

Refer to the [Appwrite documentation](https://appwrite.io/docs) for more details.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mattseq/Quotient.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## License

[MIT](LICENSE)
