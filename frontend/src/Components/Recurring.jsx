import { useState } from "react";
import { Trash2 } from "lucide-react";

const Recurring = () => {
  const [recurringPayments, setRecurringPayments] = useState([
    { id: 1, name: "Netflix", amount: 15.99, frequency: "Monthly", nextDue: "2025-09-01" },
    { id: 2, name: "Gym Membership", amount: 40, frequency: "Monthly", nextDue: "2025-08-20" },
    { id: 3, name: "Spotify", amount: 9.99, frequency: "Monthly", nextDue: "2025-09-05" },
  ]);

  const handleDelete = (id) => {
    setRecurringPayments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-xl sm:text-3xl font-bold text-[#0F172A] mb-8">
        Recurring Payments
      </h2>

      {recurringPayments.length === 0 ? (
        <p className="text-gray-500 text-lg">No recurring payments found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {payment.name}
                </h3>
                <p className="text-gray-500">
                  ${payment.amount.toFixed(2)} – {payment.frequency}
                </p>
                <p className="text-sm text-gray-400">
                  Next Due: {new Date(payment.nextDue).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(payment.id)}
                className="mt-4 flex items-center text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} className="mr-1" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recurring;
