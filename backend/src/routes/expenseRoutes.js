const express = require("express");
const {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getExpenses);
router.get("/summary", getExpenseSummary);
router.post("/", addExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
