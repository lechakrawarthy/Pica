// Spendly Editorial Typography System
// Fraunces-inspired editorial feel using system fonts
// (swap fontFamily strings once expo-font loads custom fonts)

export const typography = {
    // Display — for big numbers and hero headlines
    displayXL: {
        fontSize: 56,
        fontWeight: "300",
        letterSpacing: -1.5,
        lineHeight: 60,
    },
    displayL: {
        fontSize: 42,
        fontWeight: "300",
        letterSpacing: -1.2,
        lineHeight: 46,
    },
    displayM: {
        fontSize: 32,
        fontWeight: "400",
        letterSpacing: -0.8,
        lineHeight: 36,
    },

    // Headings
    h1: {
        fontSize: 28,
        fontWeight: "400",
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    h2: {
        fontSize: 22,
        fontWeight: "500",
        letterSpacing: -0.3,
        lineHeight: 26,
    },
    h3: {
        fontSize: 18,
        fontWeight: "500",
        letterSpacing: -0.2,
        lineHeight: 22,
    },

    // Body
    bodyL: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
    },
    body: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 22,
    },
    bodyS: {
        fontSize: 13,
        fontWeight: "400",
        lineHeight: 20,
    },

    // Mono / labels
    label: {
        fontSize: 10,
        fontWeight: "600",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    labelM: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    mono: {
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 0.3,
        fontVariant: ["tabular-nums"],
    },
    monoL: {
        fontSize: 14,
        fontWeight: "500",
        letterSpacing: 0.2,
        fontVariant: ["tabular-nums"],
    },

    // UI
    button: {
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    caption: {
        fontSize: 11,
        fontWeight: "400",
        lineHeight: 16,
    },
};
