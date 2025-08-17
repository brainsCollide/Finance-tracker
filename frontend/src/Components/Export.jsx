import { useState } from "react";
import { DownloadCloud } from "lucide-react";

const Export = () => {
  const [format, setFormat] = useState("csv");

  const dummyTransactions = [
    { date: "2025-08-14", description: "Groceries", amount: -50.25 },
    { date: "2025-08-13", description: "Salary", amount: 2000 },
    { date: "2025-08-12", description: "Electricity Bill", amount: -75.5 },
  ];

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const handleExport = () => {
    let fileContent = "";
    let mimeType = "";
    let fileName = `transactions.${format}`;

    if (format === "csv") {
      fileContent = convertToCSV(dummyTransactions);
      mimeType = "text/csv";
    } else if (format === "xlsx") {
      // Fake Excel content — still CSV format for demo
      fileContent = convertToCSV(dummyTransactions);
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (format === "pdf") {
      // For demo: export text as PDF-like file
      fileContent = "Transactions Report\n\n" + JSON.stringify(dummyTransactions, null, 2);
      mimeType = "application/pdf";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <DownloadCloud size={24} /> Export Transactions
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Choose format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="mt-2 w-full border rounded-md p-2"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default Export;
