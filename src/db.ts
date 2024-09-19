import { PrismaClient, EscalationStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
  })
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  })
}

export async function getCustomerById(id: number) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: true,
    },
  })
}

export async function listProducts() {
  return prisma.product.findMany()
}

export async function listOrders() {
  return prisma.order.findMany({
    include: {
      customer: true,
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  })
}

export async function listCustomers() {
  return prisma.customer.findMany({
    include: {
      orders: true,
    },
  })
}

export async function getRecentOrders(customerId: number, limit: number = 5) {
  return prisma.order.findMany({
    where: {
      customerId: customerId
    },
    orderBy: {
      orderDate: 'desc'
    },
    take: limit,
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
}

export async function getCustomerByEmail(email: string) {
  return prisma.customer.findUnique({
    where: {
      email: email
    },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });
}

export async function getOrdersByCustomerEmail(email: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: email
    },
    include: {
      orders: {
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  return customer ? customer.orders : null;
}

export async function getRecentOrdersByEmail(email: string, limit: number = 5) {
  return prisma.order.findMany({
    where: {
      customer: {
        email: email
      }
    },
    orderBy: {
      orderDate: 'desc'
    },
    take: limit,
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
}

// Add more utility functions as needed

// Remember to close the Prisma connection when your app shuts down
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Add these functions at the end of the file

export async function createEscalation(customerId: number, subject: string, description: string, threadId: string) {
  return prisma.escalation.create({
    data: {
      customerId,
      subject,
      description,
      threadId,
    },
  });
}

export async function getEscalationById(id: number) {
  return prisma.escalation.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });
}

export async function updateEscalationStatus(id: number, status: EscalationStatus) {
  return prisma.escalation.update({
    where: { id },
    data: { status },
  });
}

export async function listEscalations() {
  return prisma.escalation.findMany({
    include: {
      customer: true,
    },
  });
}
