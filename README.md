# Customer Service Chatbot with Genkit

This project demonstrates how to build a customer service chatbot using Genkit, a powerful AI framework for building conversational applications. The chatbot is designed to handle various customer inquiries related to products, orders, and general catalog questions.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- Firebase CLI

## Getting Started

1. Clone this repository:
   ```
   git clone https://github.com/jeffdh5/customer-service-chatbot.git
   cd customer-service-chatbot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your database:

   Option A: PostgreSQL
   a. Set up your environment variables:
      Create a `.env` file in the root directory and add the following:
      ```
      DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
      ```
      Replace the values with your actual PostgreSQL credentials.

   b. Set up the database:
      ```
      npx prisma generate
      npx prisma migrate dev
      ```

   c. Seed the database with sample data:
      ```
      npm run prisma:seed
      ```

   Option B: Firestore
   a. Set up your Firebase project:
      - Go to the [Firebase Console](https://console.firebase.google.com/)
      - Create a new project or select an existing one
      - Enable Firestore in your project

   b. Set up your environment variables:
      Create a `.env` file in the root directory and add the following:
      ```
      FIREBASE_PROJECT_ID="your-project-id"
      FIREBASE_PRIVATE_KEY="your-private-key"
      FIREBASE_CLIENT_EMAIL="your-client-email"
      ```
      Replace the values with your actual Firebase project credentials.

   c. Initialize Firestore:
      ```
      firebase init firestore
      ```
      Follow the prompts to set up Firestore in your project.

   d. Seed the database with sample data:
      ```
      npm run firestore:seed
      ```

6. Run evals
   ```
   genkit eval:flow classifyInquiryFlow --input src/classifyInquiryTestInputs.json 
   genkit eval:flow generateDraftFlow --input src/generateDraftTestInputs.json
   ```

## Project Structure

The project is structured as follows:

- `src/`: Contains the main application code
- `prisma/`: Contains the Prisma schema and migrations (for PostgreSQL)
- `firestore/`: Contains Firestore security rules and indexes (for Firestore)
- `prompts/`: Contains the prompt templates for Genkit
- `scripts/`: Contains utility scripts
- `firebase.json`: Firebase configuration file (for Firestore)

## Handler Concept

The chatbot uses a handler-based architecture to process inquiries:

1. Inquiry Classification: Categorizes user inquiries
2. Response Generation: Creates draft responses based on classification
3. Human Review (optional): Routes complex inquiries for human review

This allows you to configure the responder to only handle specific intents.
If there is no handler, then the flow will escalate the conversation.

It also gives you the flexibility to control the logic for each handler.

Handlers are modular and extensible, located in `src/handlers/`.

## Database Setup

This project supports both PostgreSQL (using Prisma) and Firestore as database options. Choose the one that best fits your needs.

### PostgreSQL Setup

If you're using PostgreSQL:

1. The database schema is defined in `prisma/schema.prisma`.
2. Migrations are managed using Prisma Migrate.
3. Database operations are performed using the Prisma Client in `src/models/index.ts`.

### Firestore Setup

If you're using Firestore:

1. The Firebase Admin SDK is initialized in `src/config/firebase.ts`.
2. Firestore collections are defined in `src/models/index.ts`.
3. Firestore security rules are defined in `firestore/firestore.rules`.
4. The seeding script is located in `scripts/seedFirestore.ts`.

Remember to update your handlers and other parts of the application to use the database option you've chosen.