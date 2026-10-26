const MS_PER_DAY = 24 * 60 * 60 * 1000;

// dueDate dianggap tanggal kalender, jadi dibandingkan per hari (bukan per jam)
export const getDaysUntil = (dueDate) => {
  const due = new Date(dueDate);
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dueDay - today) / MS_PER_DAY);
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export const getDueInfo = (dueDate) => {
  const days = getDaysUntil(dueDate);

  if (days < 0) return { tone: "overdue", label: `Overdue ${plural(Math.abs(days), "day")}` };
  if (days === 0) return { tone: "soon", label: "Due today" };
  if (days === 1) return { tone: "soon", label: "Due tomorrow" };
  if (days <= 7) return { tone: "soon", label: `Due in ${days} days` };

  const date = new Date(dueDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return { tone: "later", label: `Due ${date}` };
};

// Kelompok untuk modal "View all"
export const groupPayments = (payments) => {
  const groups = { overdue: [], week: [], later: [] };

  payments.forEach((p) => {
    const days = getDaysUntil(p.dueDate);
    if (days < 0) groups.overdue.push(p);
    else if (days <= 7) groups.week.push(p);
    else groups.later.push(p);
  });

  return [
    { key: "overdue", title: "Overdue", items: groups.overdue },
    { key: "week", title: "Next 7 days", items: groups.week },
    { key: "later", title: "Later", items: groups.later },
  ].filter((g) => g.items.length > 0);
};