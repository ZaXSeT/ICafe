import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.table.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const cashierPassword = await bcrypt.hash('cashier123', 10)
  const customerPassword = await bcrypt.hash('customer123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@icafe.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier User',
      email: 'cashier@icafe.com',
      password: cashierPassword,
      role: 'CASHIER',
    },
  })

  const customer = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'john@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  })

  // Create Categories
  const drinksCategory = await prisma.category.create({
    data: {
      name: 'Hot Drinks',
      description: 'Warm up with our signature hot beverages.',
    },
  })

  const coldDrinksCategory = await prisma.category.create({
    data: {
      name: 'Cold Drinks',
      description: 'Refreshing iced coffees and teas.',
    },
  })

  const pastryCategory = await prisma.category.create({
    data: {
      name: 'Pastries',
      description: 'Freshly baked daily.',
    },
  })

  // Create Menu Items
  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: drinksCategory.id,
        name: 'Caramel Macchiato',
        description: 'Espresso combined with vanilla-flavored syrup, milk and caramel drizzle.',
        price: 5.50,
        isPopular: true,
      },
      {
        categoryId: drinksCategory.id,
        name: 'Cappuccino',
        description: 'Dark, rich espresso lying in wait under a smoothed and stretched layer of thick milk foam.',
        price: 4.50,
      },
      {
        categoryId: coldDrinksCategory.id,
        name: 'Iced Matcha Latte',
        description: 'Smooth and creamy matcha sweetened just right and served with milk over ice.',
        price: 6.00,
        isPopular: true,
      },
      {
        categoryId: pastryCategory.id,
        name: 'Butter Croissant',
        description: 'Classic, flaky, buttery crescent-shaped pastry.',
        price: 3.50,
      },
      {
        categoryId: pastryCategory.id,
        name: 'Chocolate Chip Cookie',
        description: 'Chewy cookie loaded with chocolate chunks.',
        price: 2.75,
      }
    ]
  })

  // Create Tables
  await prisma.table.createMany({
    data: [
      { number: 1, capacity: 2, location: 'Window' },
      { number: 2, capacity: 2, location: 'Window' },
      { number: 3, capacity: 4, location: 'Main Floor' },
      { number: 4, capacity: 4, location: 'Main Floor' },
      { number: 5, capacity: 6, location: 'Patio' },
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
