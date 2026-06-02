"use client";

import { useEffect, useState, useRef } from "react";
import { getMenuData, addMenuItem, deleteMenuItem } from "@/app/actions/menu.actions";
import { Plus, Trash2, Loader2, Coffee, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  // Add form state
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  
  // Custom dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: string, itemId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMenu();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getMenuData();
      setCategories(data);
      if (data.length > 0 && !activeCategory) {
        setActiveCategory(data[0].id);
      }
    } catch (e) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !activeCategory) return;

    setAdding(true);
    try {
      const item = {
        name: newName,
        description: newDesc || null,
        price: parseFloat(newPrice),
        image: newImage || null
      };
      
      const res = await addMenuItem(activeCategory, item);
      if (res.success) {
        toast.success("Item added successfully");
        setNewName("");
        setNewDesc("");
        setNewPrice("");
        setNewImage("");
        loadMenu();
      } else {
        toast.error(res.error || "Failed to add item");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    setItemToDelete({ categoryId, itemId });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteMenuItem(itemToDelete.categoryId, itemToDelete.itemId);
      if (res.success) {
        toast.success("Item deleted");
        loadMenu();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
  }

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-stone-800 mb-2">Menu Management</h1>
        <p className="text-stone-500">Add or remove items from your cafe menu.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar / Add Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-700" />
              Add New Item
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Category</label>
                <div 
                  className={`w-full px-4 py-2.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                    dropdownOpen ? "border-amber-500 ring-2 ring-amber-500/20 bg-white" : "border-stone-200 bg-stone-50 hover:border-stone-300"
                  }`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className={activeCategory ? "text-stone-800" : "text-stone-400"}>
                    {categories.find(c => c.id === activeCategory)?.name || "Select Category"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </div>
                
                {/* Dropdown Menu */}
                <div 
                  className={`absolute z-10 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg transition-all duration-200 origin-top ${
                    dropdownOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
                  }`}
                >
                  <div className="max-h-60 overflow-y-auto p-1 scrollbar-hide">
                    {categories.map(c => (
                      <div
                        key={c.id}
                        className={`px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                          activeCategory === c.id 
                            ? "bg-amber-50 text-amber-800 font-semibold" 
                            : "text-stone-600 hover:bg-stone-50"
                        }`}
                        onClick={() => {
                          setActiveCategory(c.id);
                          setDropdownOpen(false);
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Item Name</label>
                <input
                  type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
                  placeholder="e.g. Mocha Frappe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Price ($)</label>
                <input
                  type="number" step="0.01" required value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
                  placeholder="4.50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50 resize-none"
                  placeholder="Short description..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Image URL (Optional)</label>
                <input
                  type="url" value={newImage} onChange={e => setNewImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit" disabled={adding || !newName || !newPrice}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Item"}
              </button>
            </form>
          </div>
        </div>

        {/* Item List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-stone-100 p-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat.id 
                      ? "bg-stone-100 text-stone-800" 
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="p-6">
              {activeCategoryData?.menuItems.length === 0 ? (
                <div className="text-center py-12 text-stone-500">No items in this category.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeCategoryData?.menuItems.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 transition-colors group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400"><Coffee className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-stone-800 text-sm truncate">{item.name}</h3>
                          <span className="font-bold text-amber-700 text-sm">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{item.description}</p>
                        
                        <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteItem(activeCategory, item.id)}
                            className="text-xs flex items-center gap-1 text-rose-500 hover:text-rose-600 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-stone-800 mb-2">Delete Menu Item</h3>
            <p className="text-stone-600 mb-6 text-sm">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md font-medium text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 text-sm min-w-[80px]"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
