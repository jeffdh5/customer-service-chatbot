# Customer Service Chatbot with Genkit

This project demonstrates how to build a customer service chatbot using Genkit, a powerful AI framework for building conversational applications. The chatbot is designed to handle various customer inquiries related to products, orders, and general catalog questions.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL database

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

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   ```
   Replace the values with your actual PostgreSQL credentials.

4. Set up the database:
   ```
   npx prisma generate
   npx prisma migrate dev
   ```

5. Seed the database with sample data:
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
- `prisma/`: Contains the Prisma schema and migrations
- `prompts/`: Contains the prompt templates for Genkit
- `scripts/`: Contains utility scripts