import { useState } from "react";
import { IoMdTrash } from "react-icons/io";

const dummyGoals = [
  {
    _id: "1",
    title: "Buy a new laptop",
    targetAmount: 1500,
    currentAmount: 500,
    deadline: "2025-12-31",
  },
  {
    _id: "2",
    title: "Vacation Fund",
    targetAmount: 2000,
    currentAmount: 1200,
    deadline: "2025-08-31",
  },
];

const Goals = () => {
  const [goals, setGoals] = useState(dummyGoals);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;

    setGoals((prev) => [
      ...prev,
      { ...newGoal, _id: Date.now().toString(), currentAmount: 0 },
    ]);
    setNewGoal({ title: "", targetAmount: "", deadline: "" });
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g._id !== id));
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Your Goals</h2>

      {/* Add Goal Form */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Goal title"
          value={newGoal.title}
          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          className="border p-2 rounded-md flex-1"
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={newGoal.targetAmount}
          onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
          className="border p-2 rounded-md flex-1"
        />
        <input
          type="date"
          value={newGoal.deadline}
          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
          className="border p-2 rounded-md"
        />
        <button
          onClick={handleAddGoal}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100
          );

          return (
            <div key={goal._id} className="bg-white p-5 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                <button onClick={() => handleDeleteGoal(goal._id)}>
                  <IoMdTrash className="text-red-500 text-xl" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Target: ${goal.targetAmount} | Current: ${goal.currentAmount}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{progress.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
