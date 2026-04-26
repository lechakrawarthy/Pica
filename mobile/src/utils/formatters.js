// Pica — Formatters
// Indian Rupee, Indian date format, clean locale strings.

export const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    // Indian numbering: ₹1,23,450
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

export const formatDate = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

export const formatTime = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

export const formatRelativeDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return formatDate(date);
};
