export const formatCurrency = (value) => {
    const amount = Number(value) || 0;
    return `$${amount.toFixed(2)}`;
};

export const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Invalid date";
    }
    return parsedDate.toLocaleDateString();
};
