"use client";

import { forwardRef } from "react";

export interface InvoiceData {
  id: string;
  type: "ONLINE" | "POS";
  tableNumber: string;
  createdAt: string;
  status: string;
  order: {
    total: number;
    items: {
      id?: string;
      name: string;
      price: number;
      quantity: number;
    }[];
  } | null;
  notes?: string;
  paymentMethod?: string;
}

interface InvoicePrintProps {
  invoice: InvoiceData;
  staffName?: string;
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, staffName = "Staff" }, ref) => {
    if (!invoice || !invoice.order) return null;

    const date = new Date(invoice.createdAt);
    
    return (
      <div 
        ref={ref} 
        className="hidden print:block w-full max-w-[80mm] mx-auto text-black bg-white font-mono text-sm leading-tight p-4"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}} />
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold mb-1">ICAFE</h1>
          <p className="text-xs">123 Coffee Street</p>
          <p className="text-xs">Jakarta, Indonesia</p>
          <p className="text-xs">Tel: (021) 1234-5678</p>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 text-xs">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{date.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{date.toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span>{invoice.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span>{invoice.type === "ONLINE" ? "Reservation" : "Walk-in"}</span>
          </div>
          <div className="flex justify-between">
            <span>Table:</span>
            <span>{invoice.tableNumber}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Staff:</span>
            <span>{staffName}</span>
          </div>
          {invoice.paymentMethod && (
            <div className="flex justify-between mt-1">
              <span>Pay Method:</span>
              <span>{invoice.paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 text-xs">
          <div className="font-bold flex justify-between mb-1">
            <span className="w-2/3">Item</span>
            <span className="w-1/6 text-right">Qty</span>
            <span className="w-1/6 text-right">Amt</span>
          </div>
          {invoice.order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between mb-1">
              <span className="w-2/3 truncate">{item.name}</span>
              <span className="w-1/6 text-right">{item.quantity}</span>
              <span className="w-1/6 text-right">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-bold text-sm mb-6">
          <span>TOTAL</span>
          <span>${invoice.order.total.toFixed(2)}</span>
        </div>

        <div className="text-center text-xs space-y-1">
          <p>Thank you for visiting ICafe!</p>
          <p>Please come again.</p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
