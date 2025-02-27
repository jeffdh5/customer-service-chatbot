# Customer Service Chatbot with Genkit
This project demonstrates how to build a customer service chatbot using Genkit, a powerful AI framework for building conversational applications. The chatbot is designed to handle various customer inquiries related to products, orders, and general catalog questions.

This sample demonstrates:
- Answering questions using a database + LLM
- Conditional branching based on intent (different data is added to the prompt based on whether the inquiry was an Order vs. Refund vs. Product question)
- Using an LLM call to escalate the request to a human based on certain conditions


## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v18 or later)
- npm (v6 or later)
- Genkit CLI

## Getting Started

1. Clone this repository:
   ```
   git clone https://github.com/jeffdh5/customer-service-chatbot.git
   cd customer-service-chatbot
   ```

2. Install dependencies:
   ```
   pnpm i
   ```

3. Set up your database:
   a. Set up your environment variables:
      Create a `.env` file in the root directory and add the following:
      ```
      PROJECT_ID=[YOUR PROJECT ID]
      LOCATION=[YOUR LOCATION]
      ```

   b. Set up the database and seed with sample data:
      ```
      cd src/
      npx prisma generate
      npx prisma migrate dev --name init
      npm run prisma:seed
      cd ../
      ```

4. Test the chatbot with sample data
   
   After seeding the database, you can test the chatbot with these example queries that match our seed data:

   ```bash
   # In a different terminal
   npm run genkit:dev

   # Test the classify inquiry flow to detect intent
   genkit flow:run classifyInquiryFlow '{
     "inquiry": "Is the Classic Blue T-Shirt for $19.99 still in stock?"
   }'

   # Test e2e CS flow (generates a email response to the input inquiry)
   genkit flow:run customerServiceFlow '{
     "from": "john.doe@example.com",
     "to": "support@company.com",
     "subject": "Product Catalog",
     "body": "Do you guys carry shirts?",
     "sentAt": "2024-03-14T12:00:00Z",
     "threadHistory": []
   }'
   ```

   ### Seeded Data Reference
   The SQLite database comes pre-seeded with some data so that you can
   easily test out your queries.

   #### Products:
   - Classic Blue T-Shirt ($19.99, SKU: BLU-TSHIRT-M)
   - Running Shoes ($89.99, SKU: RUN-SHOE-42)
   - Denim Jeans ($49.99, SKU: DEN-JEAN-32)
   - Leather Wallet ($29.99, SKU: LEA-WALL-01)
   - Wireless Headphones ($149.99, SKU: WIR-HEAD-BK)

   #### Customers and Their Orders:
   - John Doe (john.doe@example.com)
     - Order TRACK123456: 2 Blue T-Shirts, 1 Running Shoes (DELIVERED)
   - Jane Smith (jane.smith@example.com)
     - Order TRACK789012: 1 Denim Jeans (PROCESSING)
   - Bob Wilson (bob.wilson@example.com)
     - Order TRACK345678: 1 Leather Wallet, 1 Wireless Headphones (PENDING)


## Project Structure

The project is structured as follows:

- `src/`: Contains the main application code
- `prisma/`: Contains the Prisma schema and migrations (for PostgreSQL)
- `flows/`: Contains the various flows for Genkit
- `scripts/`: Contains utility scripts
