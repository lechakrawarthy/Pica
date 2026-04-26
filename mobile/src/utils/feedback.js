// Pica — Feedback Utils
// Haptic feedback for every interaction. Crisp, tactile, purposeful.
// Uses expo-haptics — no audio files needed, works on all devices.

import * as Haptics from "expo-haptics";

// Numpad key tap — very light
export const hapticTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

// Button press — medium weight
export const hapticMedium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

// Transaction saved successfully — double pulse of success
export const hapticSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

// Budget exceeded warning
export const hapticWarning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
};

// Validation error
export const hapticError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
