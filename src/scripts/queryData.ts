import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getOrderDetails(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      console.log(`Order ${orderId} not found.`);
      return;
    }

    console.log('Order Details:');
    console.log(JSON.stringify(order, null, 2));

    console.log('\nCustomer Details:');
    console.log(JSON.stringify(order.customer, null, 2));

    console.log('\nOrder Items:');
    order.orderItems.forEach((item: any, index: any) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(JSON.stringify(item, null, 2));
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function with the specified order ID
getOrderDetails(1068273);
