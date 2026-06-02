// Firebase user types for the application

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "CASHIER" | "ADMIN";
}

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
export type OrderType = "DINE_IN" | "TAKEAWAY";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
