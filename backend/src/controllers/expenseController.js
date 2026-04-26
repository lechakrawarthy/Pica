const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const validateExpenseInput = ({ amount, category, date, note }) => {
    if (amount === undefined || category === undefined || date === undefined) {
        return "Amount, category, and date are required";
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
        return "Amount must be a positive number or zero";
    }

    if (typeof category !== "string" || category.trim().length === 0) {
        return "Category must be a non-empty string";
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Date must be a valid ISO date string";
    }

    if (note !== undefined && typeof note !== "string") {
        return "Note must be a string";
    }

    return null;
};

const getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        next(error);
    }
};

const addExpense = async (req, res, next) => {
    try {
        const validationError = validateExpenseInput(req.body);
        if (validationError) {
            res.status(400);
            throw new Error(validationError);
        }

        const { amount, category, date, note = "" } = req.body;

        const expense = await Expense.create({
            user: req.user._id,
            amount,
            category: category.trim(),
            date,
            note: note.trim(),
        });

        res.status(201).json(expense);
    } catch (error) {
        next(error);
    }
};

const updateExpense = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error("Invalid expense ID");
        }

        const validationError = validateExpenseInput(req.body);
        if (validationError) {
            res.status(400);
            throw new Error(validationError);
        }

        const { amount, category, date, note = "" } = req.body;

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                amount,
                category: category.trim(),
                date,
                note: note.trim(),
            },
            { new: true }
        );

        if (!updatedExpense) {
            res.status(404);
            throw new Error("Expense not found");
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error("Invalid expense ID");
        }

        const deletedExpense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deletedExpense) {
            res.status(404);
            throw new Error("Expense not found");
        }

        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getExpenseSummary = async (req, res, next) => {
    try {
        const summary = await Expense.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalAmount: -1 } },
        ]);

        const transformed = summary.map((item) => ({
            category: item._id,
            totalAmount: item.totalAmount,
            count: item.count,
        }));

        res.status(200).json(transformed);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
};
