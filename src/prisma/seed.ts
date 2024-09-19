/*
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Seed Products
  const products = [];
  for (let i = 0; i < 10; i++) {
    products.push(
      await prisma.product.create({
        data: {
          id: faker.number.int({ min: 1000000, max: 9999999 }),
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          stockLevel: faker.number.int({ min: 0, max: 1000 }),
          price: parseFloat(faker.commerce.price()),
          sku: faker.string.uuid(),
        }
      })
    );
  }

  // Seed Customers
  const customers = [];
  for (let i = 0; i < 10; i++) {
    customers.push(
      await prisma.customer.create({
        data: {
          id: faker.number.int({ min: 1000000, max: 9999999 }),
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      })
    );
  }

  // Seed Orders and OrderItems
  for (const customer of customers) {
    const order = await prisma.order.create({
      data: {
        id: faker.number.int({ min: 1000000, max: 9999999 }),
        customerId: customer.id,
        status: faker.helpers.arrayElement(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
        trackingNumber: faker.string.alphanumeric(10),
        orderItems: {
          create: faker.helpers.arrayElements(products, 3).map((product) => ({
            id: faker.number.int({ min: 1000000, max: 9999999 }),
            productId: product.id,
            quantity: faker.number.int({ min: 1, max: 5 }),
          })),
        },
      },
    });
  }

  console.log('Database has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  */