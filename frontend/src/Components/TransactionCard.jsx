// src/components/TransactionCard.jsx
import React from "react";

const TransactionCard = ({ transaction, onDelete }) => {
  const { title, type, category, date, amount, _id } = transaction;

  const borderColor = type === "income" ? "border-green-500" : "border-red-500";
  const badgeColor = type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  const amountColor = type === "income" ? "text-green-600" : "text-red-600";

  return (
    <div className={`p-5 bg-white shadow-md rounded-lg border-l-4 hover:shadow-lg transition-all duration-200 ${borderColor}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[70%]">{title}</h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {type === "income" ? "Income" : "Expense"}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 text-gray-600 text-sm">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{category}</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <span className={`text-xl font-bold ${amountColor}`} aria-label={`Amount: ${amount.toLocaleString("de-DE")} Rupiah`}>
          Rp {amount.toLocaleString("de-DE")}
        </span>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(_id)}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
      >
        Delete
      </button>
    </div>
  );
};

export default TransactionCard;
