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

6. Run evals
   ```
   genkit eval:flow classifyInquiryFlow --input src/classifyInquiryTestInputs.json 
   genkit eval:flow generateDraftFlow --input src/generateDraftTestInputs.json
   ```

## Project Structure

The project is structured as follows:

- `src/`: Contains the main application code
- `prisma/`: Contains the Prisma schema and migrations (for PostgreSQL)
- `prompts/`: Contains the prompt templates for Genkit
- `scripts/`: Contains utility scripts

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

This project uses PostgreSQL with Prisma as the ORM.

### PostgreSQL Setup

1. Make sure you have PostgreSQL installed and running
2. Set up your DATABASE_URL in .env: