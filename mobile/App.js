import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { ExpenseProvider } from "./src/context/ExpenseContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </ExpenseProvider>
    </AuthProvider>
  );
}
