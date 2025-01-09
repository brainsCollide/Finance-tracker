import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AddTransaction = () => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("income");
    const [notification, setNotification] = useState({ message: "", type: "" });

    const sendTransaction = async () => {
        try {
            const response = await axiosInstance.post("/transactions", {
                title,
                type,
                amount: parseFloat(amount),
                date,
            });
            setNotification({ message: "Transaction added successfully", type: "success" });
        } catch (error) {
            setNotification({ message: "Error adding transaction", type: "error" });
        }
    };

    return (
        <div>
            <div className="flex flex-col space-y-4 mb-6">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <select
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
            </div>

            <div>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 w-full sm:w-auto"
                    onClick={sendTransaction}
                >
                    Add Transaction
                </button>
            </div>

            {notification.message && (
                <div
                    className={`p-4 mt-4 rounded ${
                        notification.type === "success" ? "text-green-800 bg-green-200" : "text-red-800 bg-red-200"
                    }`}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default AddTransaction;
