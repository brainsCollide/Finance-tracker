import { FiCalendar, FiAlertCircle } from "react-icons/fi";
import { IoMdCheckmark } from "react-icons/io";
import { getDueInfo } from "../utils/payments";

const TONES = {
  overdue: {
    border: "border-rose-100",
    icon: "bg-rose-50 text-rose-500",
    text: "font-medium text-rose-600",
  },
  soon: {
    border: "border-slate-100",
    icon: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
  },
  later: {
    border: "border-slate-100",
    icon: "bg-slate-50 text-slate-500",
    text: "text-slate-400",
  },
};

const formatRupiah = (amount) =>
  `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function PaymentRow({ payment, onPay }) {
  const { label, tone } = getDueInfo(payment.dueDate);
  const style = TONES[tone];
  const Icon = tone === "overdue" ? FiAlertCircle : FiCalendar;

  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition hover:border-slate-200 sm:p-4 ${style.border}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {payment.title}
          </p>
          <p className={`mt-1 text-xs ${style.text}`}>{label}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="text-xs font-semibold text-slate-800 sm:text-sm">
          {formatRupiah(payment.amount)}
        </span>

        <button
          type="button"
          onClick={() => onPay(payment)}
          aria-label={`Mark ${payment.title} as paid`}
          className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
        >
          <IoMdCheckmark size={17} />
        </button>
      </div>
    </div>
  );
}