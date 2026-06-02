"use client";

import { useEffect, useState } from "react";
import { getStaffList, addStaff, deleteStaff, getStaffSession } from "@/app/actions/staff.actions";
import { Users, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Staff {
  id: string;
  name: string;
  pin: string;
  role: "OWNER" | "CASHIER";
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    // Verify OWNER role
    getStaffSession().then(session => {
      if (!session || session.role !== "OWNER") {
        window.location.href = "/";
      } else {
        loadStaff();
      }
    });
  }, [router]);

  const loadStaff = async () => {
    try {
      const data = await getStaffList();
      setStaffList(data as Staff[]);
    } catch (e) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 6) {
      toast.error("PIN must be at least 6 digits");
      return;
    }

    setAdding(true);
    try {
      const res = await addStaff(newName, newPin, "CASHIER");
      if (res.success) {
        toast.success("Cashier added successfully");
        setNewName("");
        setNewPin("");
        loadStaff();
      } else {
        toast.error(res.error || "Failed to add cashier");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStaff = async (id: string, role: string) => {
    if (role === "OWNER") {
      toast.error("Cannot delete Owner account");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this cashier account?")) return;

    try {
      const res = await deleteStaff(id);
      if (res.success) {
        toast.success("Cashier deleted");
        loadStaff();
      }
    } catch (e) {
      toast.error("Failed to delete cashier");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-stone-800 mb-2">Staff Accounts</h1>
        <p className="text-stone-500">Manage cashier access to the POS and admin panel.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Add Staff Form */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-stone-800">New Cashier</h2>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-stone-50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">6-Digit PIN</label>
                <input
                  type="text"
                  required
                  pattern="\d{6,}"
                  maxLength={10}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-stone-50"
                  placeholder="123456"
                />
              </div>
              <button
                type="submit"
                disabled={adding || !newName || newPin.length < 6}
                className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Account"}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-stone-400" />
              <h2 className="font-bold text-stone-800">Active Staff</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {staffList.map(staff => (
                <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                      {staff.name}
                      {staff.role === "OWNER" && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                          Owner
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-stone-500 font-mono mt-1">PIN: •••{staff.pin.slice(-3)}</p>
                  </div>
                  {staff.role !== "OWNER" && (
                    <button
                      onClick={() => handleDeleteStaff(staff.id, staff.role)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Cashier"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
