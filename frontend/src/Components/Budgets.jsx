import { useState } from "react";

const Budgets = () => {
  const [budgets] = useState([
    { id: 1, category: "Food", spent: 180, limit: 250 },
    { id: 2, category: "Transportation", spent: 90, limit: 100 },
    { id: 3, category: "Entertainment", spent: 120, limit: 150 },
    { id: 4, category: "Utilities", spent: 200, limit: 200 },
  ]);

  const getProgressColor = (spent, limit) => {
    const ratio = spent / limit;
    if (ratio < 0.7) return "bg-green-500";
    if (ratio < 1) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Budgets Overview</h2>
      <div className="space-y-6">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          return (
            <div key={budget.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-700">{budget.category}</h3>
                <span className="text-gray-600">
                  ${budget.spent} / ${budget.limit}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(budget.spent, budget.limit)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
