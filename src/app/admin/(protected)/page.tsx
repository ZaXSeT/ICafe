"use client";

import { useEffect, useState } from "react";
import { getAdminOrders, completeOrder } from "@/app/actions/admin.actions";
import { InvoiceData, InvoicePrint } from "@/components/features/InvoicePrint";
import { getStaffSession } from "@/app/actions/staff.actions";
import { Printer, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [staffName, setStaffName] = useState("Staff");

  useEffect(() => {
    loadOrders();
    getStaffSession().then(session => {
      if (session) setStaffName(session.name);
    });
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(data as InvoiceData[]);
    } catch (e) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string, type: "ONLINE" | "POS") => {
    try {
      const res = await completeOrder(id, type);
      if (res.success) {
        toast.success("Order marked as completed");
        loadOrders();
      } else {
        toast.error("Failed to complete order");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handlePrint = (order: InvoiceData) => {
    setActiveInvoice(order);
    // Slight delay to allow React to render the InvoicePrint component before triggering print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-500">Loading orders...</div>;
  }

  return (
    <>
      <div className="print:hidden">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold text-stone-800 pb-1 md:pb-2">Sales & Orders</h1>
            <p className="text-stone-500 text-sm md:text-base">Manage incoming reservations and POS orders.</p>
          </div>
          <button 
            onClick={loadOrders}
            className="px-5 py-2.5 bg-white border-2 border-stone-200 rounded-full text-stone-600 hover:border-primary hover:text-primary transition-all active:scale-95 text-sm font-bold shadow-sm"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold whitespace-nowrap">Time</th>
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Table</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Order Total</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-4 text-sm text-stone-500 whitespace-nowrap font-medium">
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-500 uppercase">
                      {order.id.slice(-6)}
                    </td>
                    <td className="p-4 font-bold text-stone-800">
                      {String(order.tableNumber).replace("Table ", "")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded border text-[11px] font-bold tracking-wider uppercase ${
                        order.type === "ONLINE" 
                          ? "bg-blue-50 border-blue-100 text-blue-700" 
                          : "bg-stone-100 border-stone-200 text-stone-700"
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        order.status === "COMPLETED" 
                          ? "bg-stone-50 border-stone-200 text-stone-500" 
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        {order.status === "COMPLETED" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-stone-800">
                      {order.order ? `$${order.order.total.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-3">
                      {order.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleComplete(order.id, order.type)}
                          className="px-4 py-1.5 bg-stone-800 hover:bg-primary text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                        >
                          Complete
                        </button>
                      )}
                      {order.order && (
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-800 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-stone-500">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="w-8 h-8 text-stone-300 mb-2" />
                        <p className="font-medium text-stone-600">No orders found</p>
                        <p className="text-sm">Wait for new orders to appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hidden print container */}
      {activeInvoice && (
        <InvoicePrint invoice={activeInvoice} staffName={staffName} />
      )}
    </>
  );
}
