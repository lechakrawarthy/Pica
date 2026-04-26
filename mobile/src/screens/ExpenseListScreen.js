import { useCallback, useEffect } from "react";
import { View, FlatList, Pressable, Text, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { ExpenseCard } from "../components/ExpenseCard";
import { StateView } from "../components/StateView";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { layout } from "../theme/styles";
import { colors } from "../theme/colors";

export const ExpenseListScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { expenses, loading, error, fetchExpenses, deleteExpense } = useExpenses();

    useEffect(() => {
        fetchExpenses();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchExpenses();
        }, [])
    );

    const onDelete = (id) => {
        Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteExpense(id);
                    } catch (requestError) {
                        Alert.alert("Delete Failed", requestError?.response?.data?.message || "Could not delete expense");
                    }
                },
            },
        ]);
    };

    return (
        <View style={layout.screen}>
            <View style={layout.content}>
                <AppHeader title={`Hi ${user?.name || "there"}`} subtitle="Your latest spending timeline" />

                <View style={styles.actionsRow}>
                    <Pressable style={styles.actionButton} onPress={() => navigation.navigate("AddEditExpense")}>
                        <Ionicons name="add-circle-outline" size={18} color={colors.bg} />
                        <Text style={styles.actionText}>Add Expense</Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, styles.logoutButton]} onPress={logout}>
                        <Ionicons name="log-out-outline" size={18} color={colors.text} />
                        <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                    </Pressable>
                </View>

                <StateView
                    loading={loading}
                    error={error}
                    empty={!loading && !error && expenses.length === 0}
                    onRetry={fetchExpenses}
                    emptyText="No expenses yet. Tap Add Expense to get started."
                />

                {!loading && !error ? (
                    <FlatList
                        data={expenses}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <ExpenseCard
                                expense={item}
                                onEdit={() => navigation.navigate("AddEditExpense", { expense: item })}
                                onDelete={() => onDelete(item._id)}
                            />
                        )}
                    />
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 8,
    },
    actionButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: colors.primary,
    },
    actionText: {
        marginLeft: 6,
        color: colors.bg,
        fontWeight: "800",
    },
    logoutButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    logoutText: {
        color: colors.text,
    },
});
