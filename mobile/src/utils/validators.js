export const validateAuth = ({ name, email, password }, isRegister) => {
    if (isRegister && (!name || name.trim().length < 2)) {
        return "Name must be at least 2 characters";
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return "Please enter a valid email address";
    }
    if (!password || password.length < 6) {
        return "Password must be at least 6 characters";
    }
    return null;
};

export const validateExpense = ({ amount, category, date }) => {
    if (amount === "" || amount === undefined || Number(amount) < 0) {
        return "Amount must be zero or greater";
    }
    if (!category || category.trim().length < 2) {
        return "Category must be at least 2 characters";
    }
    if (!date || Number.isNaN(new Date(date).getTime())) {
        return "Please provide a valid date";
    }
    return null;
};
