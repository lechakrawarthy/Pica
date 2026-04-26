import { useEffect, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useExpenses } from "../context/ExpenseContext";
import { layout } from "../theme/styles";
import { colors } from "../theme/colors";
import { validateExpense } from "../utils/validators";

export const AddEditExpenseScreen = ({ route, navigation }) => {
    const expense = route.params?.expense;
    const { addExpense, updateExpense } = useExpenses();
    const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : "");
    const [category, setCategory] = useState(expense?.category || "");
    const [date, setDate] = useState(expense?.date ? new Date(expense.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState(expense?.note || "");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        navigation.setOptions({ title: expense ? "Edit Expense" : "Add Expense" });
    }, [expense, navigation]);

    const onSubmit = async () => {
        const payload = {
            amount: Number(amount),
            category,
            date: new Date(date).toISOString(),
            note,
        };

        const validationError = validateExpense(payload);
        if (validationError) {
            Alert.alert("Validation", validationError);
            return;
        }

        try {
            setSubmitting(true);
            if (expense) {
                await updateExpense(expense._id, payload);
            } else {
                await addExpense(payload);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert("Save Failed", error?.response?.data?.message || "Unable to save expense");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={layout.screen}>
            <View style={layout.content}>
                <View style={styles.formCard}>
                    <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="e.g. 150.50" />
                    <FormField label="Category" value={category} onChangeText={setCategory} placeholder="Food, Transport, Bills..." />
                    <FormField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-04-26" autoCapitalize="none" />
                    <FormField label="Note" value={note} onChangeText={setNote} placeholder="Optional note" />
                    <PrimaryButton title={expense ? "Update Expense" : "Add Expense"} onPress={onSubmit} loading={submitting} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    formCard: {
        backgroundColor: colors.bgSoft,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
    },
});
