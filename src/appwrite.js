import { Client, Account, Databases } from 'appwrite';

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Replace with your Appwrite endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID) // Replace with your Appwrite project ID
  .setDevKey(import.meta.env.VITE_APPWRITE_API_KEY); // Replace with your Appwrite API key if needed
const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases}
