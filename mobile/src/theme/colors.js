// Spendly Editorial Design System — Color Palette
// Philosophy: paper, ink, one decisive coral. Earth-toned. Literary.

export const colors = {
    // Core surface palette
    paper:     "#F4F0E8",   // warm off-white — the page
    paper2:    "#EBE5D8",   // slightly darker — cards, inputs
    paper3:    "#E2DAC8",   // subtle contrast surface
    ink:       "#1A1814",   // near-black — primary text
    ink2:      "#3A3530",   // dark brown — secondary text
    ink3:      "#7A726A",   // warm gray — muted / labels
    shell:     "#1A1814",   // outer background (dark ink)

    // Accent — used sparingly
    coral:     "#E8553A",   // the one decisive accent
    coral2:    "#C84628",   // pressed/dark variant

    // Category palette
    sage:      "#5A6B4A",   // Transport / success
    plum:      "#5E3A5C",   // Shopping
    rust:      "#A85C2E",   // Utilities
    gold:      "#B8893E",   // Health & wellness

    // Semantic
    danger:    "#C84628",
    dangerBg:  "rgba(200,70,40,0.08)",

    // Lines / borders
    line:      "rgba(26,24,20,0.08)",
    line2:     "rgba(26,24,20,0.14)",
    line3:     "rgba(26,24,20,0.22)",

    // Dark shell accents (nav bar, splash bg)
    shellLine: "rgba(244,240,232,0.08)",
    shellText: "#F4F0E8",
    shellMuted:"rgba(244,240,232,0.45)",
};

// Category color map — by name
export const categoryColors = {
    "Food & Dining":    colors.coral,
    "Food":             colors.coral,
    "Shopping":         colors.plum,
    "Transport":        colors.sage,
    "Health":           colors.gold,
    "Health & Wellness":colors.gold,
    "Bills":            colors.rust,
    "Utilities":        colors.rust,
    "Entertainment":    colors.plum,
    "Other":            colors.ink3,
    "Uncategorized":    colors.ink3,
};

export const getCategoryColor = (category) => {
    const key = Object.keys(categoryColors).find(
        (k) => k.toLowerCase() === (category || "").toLowerCase()
    );
    return key ? categoryColors[key] : colors.ink3;
};
