# Database Documentation

## Prisma Schema Explanations

### `User` Model
- Represents Customers, Cashiers, and Admins.
- Uses NextAuth.js structure for authentication.
- **Relationships**: Can have many Reservations, Orders, Reviews.

### `Table` Model
- Represents physical tables in the cafe.
- Includes capacity and current status.
- **Relationships**: Can have many Reservations.

### `Reservation` Model
- Links a User and a Table for a specific Date and Time.
- **Relationships**: Belongs to User and Table.

### `MenuItem` & `Category` Models
- Categories group MenuItems (e.g., "Hot Coffee", "Pastries").
- MenuItems represent specific products with prices and descriptions.

### `Order` & `OrderItem` Models
- An Order belongs to a User and contains multiple OrderItems.
- OrderItems link to MenuItems and store the quantity and price at the time of purchase.

### `Payment` / `Transaction`
- Records successful or failed payment attempts tied to an Order.

*Detailed schema will be generated in Phase 2 in `prisma/schema.prisma`.*
