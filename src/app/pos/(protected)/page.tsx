"use client";

import { useEffect, useState, useRef } from "react";
import { getMenuData } from "@/app/actions/menu.actions";
import { createPosOrder } from "@/app/actions/admin.actions";
import { getStaffSession } from "@/app/actions/staff.actions";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/components/providers/CartContext";
import { InvoiceData, InvoicePrint } from "@/components/features/InvoicePrint";
import { Plus, Minus, Trash2, Coffee, Printer, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const MOCK_TABLES = [
  { id: "table-1", number: 1, capacity: 2, status: "AVAILABLE", location: "Window" },
  { id: "table-2", number: 2, capacity: 2, status: "AVAILABLE", location: "Window" },
  { id: "table-3", number: 3, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
  { id: "table-4", number: 4, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
  { id: "table-5", number: 5, capacity: 6, status: "AVAILABLE", location: "Patio" },
  { id: "table-6", number: 6, capacity: 2, status: "AVAILABLE", location: "Bar" },
  { id: "table-7", number: 7, capacity: 8, status: "AVAILABLE", location: "Private Room" },
  { id: "table-8", number: 8, capacity: 4, status: "AVAILABLE", location: "Patio" },
];

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [tableNumber, setTableNumber] = useState("Takeaway");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [staffName, setStaffName] = useState("Staff");
  
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [tables, setTables] = useState<any[]>([]);

  // Custom table dropdown state
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false);
  const tableDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMenu();
    getStaffSession().then(session => {
      if (session) setStaffName(session.name);
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target as Node)) {
        setTableDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Listen to live tables
    const unsubscribe = onSnapshot(collection(db, "tables"), (snapshot) => {
      if (snapshot.empty) {
        setTables(MOCK_TABLES);
      } else {
        const tableData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Merge with mock tables to ensure all tables are always displayed
        const mergedTables = MOCK_TABLES.map(mockTable => {
          const firestoreTable = tableData.find(t => t.id === mockTable.id);
          return firestoreTable ? { ...mockTable, ...firestoreTable } : mockTable;
        });

        mergedTables.sort((a: any, b: any) => a.number - b.number);
        setTables(mergedTables);
      }
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribe();
    };
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getMenuData();
      setCategories(data);
      if (data.length > 0) {
        setActiveCategory(data[0].id);
      }
    } catch (e) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        total: cartTotal,
        items: items.map(i => ({
          id: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity
        }))
      };

      const res = await createPosOrder(orderData, tableNumber, notes, paymentMethod);
      
      if (res.success) {
        toast.success("Order completed!");
        
        // Setup invoice for printing
        const invoice: InvoiceData = {
          id: res.orderId!,
          type: "POS",
          tableNumber,
          createdAt: res.createdAt!,
          status: "COMPLETED",
          order: orderData,
          notes,
          paymentMethod
        };
        
        setActiveInvoice(invoice);
        
        // Reset form
        clearCart();
        setTableNumber("Takeaway");
        setNotes("");
        setPaymentMethod("Cash");
        
        // Trigger print
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        toast.error("Failed to process order");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
  }

  return (
    <>
      <div className="flex h-full print:hidden">
        {/* Left Panel: Menu */}
        <div className="flex-1 flex flex-col bg-white border-r border-stone-200">
          {/* Categories Tab */}
          <div className="flex overflow-x-auto border-b border-stone-200 p-3 gap-2 scrollbar-hide flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat.id 
                    ? "bg-stone-800 text-white" 
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeCategoryData?.menuItems.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all text-left flex flex-col h-full active:scale-95"
                >
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300"><Coffee className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-stone-800 text-sm leading-tight truncate">{item.name}</h3>
                    {item.isNew && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex-shrink-0">New</span>
                    )}
                  </div>
                  <div className="mt-auto pt-2 flex justify-between items-center w-full">
                    <span className="font-bold text-amber-700">${item.price.toFixed(2)}</span>
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Current Order */}
        <div className="w-96 flex flex-col bg-white flex-shrink-0">
          <div className="p-4 border-b border-stone-200 flex-shrink-0 bg-stone-50/50">
            <h2 className="font-heading font-bold text-base text-stone-800 mb-3">Current Order</h2>
            <div className="flex gap-2">
              <div className="relative w-1/2" ref={tableDropdownRef}>
                <div 
                  className={`w-full px-3 py-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer text-sm ${
                    tableDropdownOpen ? "border-amber-500 ring-2 ring-amber-500/20 bg-white" : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                  }`}
                  onClick={() => setTableDropdownOpen(!tableDropdownOpen)}
                >
                  <span className="font-medium text-stone-700 truncate mr-2">
                    {tableNumber}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${tableDropdownOpen ? "rotate-180" : ""}`} />
                </div>
                
                {/* Dropdown Menu */}
                <div 
                  className={`absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg transition-all duration-200 origin-top ${
                    tableDropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                  }`}
                >
                  <div className="max-h-48 overflow-y-auto p-1 scrollbar-hide">
                    <div
                      key="Takeaway"
                      className={`px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                        tableNumber === "Takeaway" 
                          ? "bg-amber-50 text-amber-800 font-semibold" 
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                      onClick={() => {
                        setTableNumber("Takeaway");
                        setTableDropdownOpen(false);
                      }}
                    >
                      Takeaway
                    </div>
                    {tables.map(t => {
                      const optionStr = `Table ${t.number}`;
                      const isAvailable = t.status === "AVAILABLE";
                      return (
                        <div
                          key={t.id}
                          className={`px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${
                            !isAvailable ? "opacity-50 cursor-not-allowed bg-stone-50" : 
                            tableNumber === optionStr 
                              ? "bg-amber-50 text-amber-800 font-semibold cursor-pointer" 
                              : "text-stone-600 hover:bg-stone-50 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (isAvailable) {
                              setTableNumber(optionStr);
                              setTableDropdownOpen(false);
                            }
                          }}
                        >
                          <span>{optionStr}</span>
                          {!isAvailable && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">
                              {t.status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes..."
                className="w-1/2 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                <Coffee className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Cart is empty</p>
              </div>
            ) : (
              items.map(cartItem => (
                <div key={cartItem.menuItem.id} className="flex gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-sm text-stone-800 truncate leading-tight">
                      {cartItem.menuItem.name}
                    </h4>
                    <span className="text-stone-500 text-xs font-semibold mt-0.5">
                      ${(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
                    <button
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                      className="p-1 hover:bg-stone-100 text-stone-500 rounded-md transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-stone-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                      className="p-1 hover:bg-stone-100 text-stone-500 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItem.menuItem.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-stone-600">Total Amount</span>
            <span className="text-2xl font-bold text-amber-700">${cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "Card", "QRIS"].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-sm font-bold rounded-lg transition-all border ${
                    paymentMethod === method 
                      ? "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-400/50" 
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
              <button
                onClick={clearCart}
                disabled={items.length === 0}
                className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-md"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Printer className="w-5 h-5" />
                    Print & Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden print component */}
      {activeInvoice && (
        <InvoicePrint invoice={activeInvoice} staffName={staffName} />
      )}
    </>
  );
}
