import { useState } from "react";
import {
  FiDownload,
  FiFileText,
  FiDatabase,
  FiFile,
  FiCheckCircle,
  FiInbox,
  FiLoader,
} from "react-icons/fi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import useTransactions from "../hooks/useTransactions";

const Loading = () => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="relative">
      <div className="w-14 h-14 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>

      <FiLoader className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
    </div>

    <p className="text-slate-400 font-medium tracking-wide">
      Preparing export center...
    </p>
  </div>
);

const Empty = () => (
  <div className="flex flex-col justify-center items-center h-[400px] bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300 ring-8 ring-slate-50/50">
      <FiInbox size={40} />
    </div>

    <h3 className="text-slate-900 font-bold text-xl tracking-tight">
      No transactions found
    </h3>

    <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
      Add some transactions first before exporting your financial data.
    </p>
  </div>
);

const Export = () => {
  const [format, setFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { transactions, loading, error } = useTransactions();

  const exportOptions = [
    {
      id: "csv",
      title: "CSV",
      subtitle: "Spreadsheet friendly",
      icon: <FiDatabase size={20} />,
    },
    {
      id: "xlsx",
      title: "Excel",
      subtitle: ".xlsx format",
      icon: <FiFileText size={20} />,
    },
    {
      id: "pdf",
      title: "PDF",
      subtitle: "Printable report",
      icon: <FiFile size={20} />,
    },
  ];

  const formattedTransactions = transactions.map((item) => ({
    Date: item.date ? new Date(item.date).toLocaleDateString("id-ID") : "-",
    Title: item.title || item.description || "-",
    Category: item.category || "-",
    Type: item.type || "-",
    Amount: item.amount || 0,
  }));

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentTransactions = transactions.slice(startIndex, endIndex);

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedTransactions);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(
      workbook,
      `transactions-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedTransactions);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(
      workbook,
      `transactions-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Transactions Report", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [["Date", "Title", "Category", "Type", "Amount"]],
      body: formattedTransactions.map((item) => [
        item.Date,
        item.Title,
        item.Category,
        item.Type,
        `Rp ${Number(item.Amount).toLocaleString("id-ID")}`,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [37, 99, 235],
      },
    });

    doc.save(`transactions-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      if (format === "csv") exportCSV();
      if (format === "xlsx") exportExcel();
      if (format === "pdf") exportPDF();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-3xl">
          <p className="font-bold">Failed to load transactions</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <Empty />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Data Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Export Transactions
            </h1>

            <p className="text-slate-500 font-medium">
              Download and backup your financial activities
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <FiDownload className="text-blue-500" size={20} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Formats
                </p>
                <p className="text-sm font-bold text-blue-600">
                  CSV • XLSX • PDF
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <FiCheckCircle className="text-emerald-500" size={20} />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Entries
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {transactions.length} Records
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CARD */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">

          <h2 className="text-xl font-black text-slate-900 mb-2">
            Choose Export Format
          </h2>

          <p className="text-sm text-slate-500 mb-8">
            Select the file type you want to generate
          </p>

          {/* OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {exportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFormat(option.id)}
                className={`border rounded-[1.5rem] p-5 text-left transition ${
                  format === option.id
                    ? "border-blue-500 bg-blue-50/60"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between">
                  <div className="text-slate-700">{option.icon}</div>
                  {format === option.id && (
                    <FiCheckCircle className="text-blue-500" />
                  )}
                </div>

                <h3 className="font-bold text-slate-900 mt-4">
                  {option.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {option.subtitle}
                </p>
              </button>
            ))}
          </div>

          {/* PREVIEW (PAGINATION) */}
          <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 mb-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-800">
                Export Preview
              </h3>

              <span className="text-xs font-bold text-blue-500 bg-blue-100 px-3 py-1 rounded-full">
                {format}
              </span>
            </div>

            <div className="space-y-3">
              {currentTransactions.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between bg-white p-3 rounded-xl border"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.title || item.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.category || "Uncategorized"}
                    </p>
                  </div>

                  <p
                    className={`font-bold ${
                      item.type === "income"
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    Rp {Number(item.amount).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1} -{" "}
              {Math.min(endIndex, transactions.length)} of{" "}
              {transactions.length}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(p - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-xl disabled:opacity-40"
              >
                Prev
              </button>

              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold">
                {currentPage} / {Math.ceil(transactions.length / ITEMS_PER_PAGE)}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-xl disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {/* EXPORT BUTTON */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full sm:w-auto inline-flex items-center space-x-3 bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl"
          >
            <FiDownload size={20} />
            <span>
              {exporting
                ? "Preparing Export..."
                : `Export as ${format.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Export;