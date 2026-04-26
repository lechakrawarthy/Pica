import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { formatCurrency, formatDate } from "../utils/formatters";

export const ExpenseCard = ({ expense, onEdit, onDelete }) => {
    return (
        <View style={styles.card}>
            <View>
                <Text style={styles.category}>{expense.category}</Text>
                <Text style={styles.note}>{expense.note || "No note"}</Text>
                <Text style={styles.date}>{formatDate(expense.date)}</Text>
            </View>

            <View style={styles.rightSection}>
                <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
                <View style={styles.actions}>
                    <Pressable onPress={onEdit} style={styles.iconButton}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={onDelete} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    category: {
        color: colors.text,
        fontWeight: "700",
        fontSize: 16,
    },
    note: {
        color: colors.muted,
        marginTop: 4,
    },
    date: {
        color: colors.muted,
        fontSize: 12,
        marginTop: 8,
    },
    rightSection: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    amount: {
        color: colors.secondary,
        fontWeight: "800",
        fontSize: 17,
    },
    actions: {
        flexDirection: "row",
        marginTop: 8,
    },
    iconButton: {
        marginLeft: 8,
    },
});
