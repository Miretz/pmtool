const projectStatuses = [

    { id: "backlog", name: "Backlog", color: "#f4f4f5" },
    { id: "inactive", name: "Inactive", color: "#f4f4f5" },
    { id: "notStarted", name: "Not Started", color: "#f4f4f5" },
    { id: "onHold", name: "On Hold", color: "#f4f4f5" },

    { id: "pendingaApproval", name: "Pending Approval", color: "#fffae6" },
    { id: "scheduled", name: "Scheduled", color: "#fffae6" },
    { id: "ready", name: "Ready", color: "#fffae6" },
    { id: "approved", name: "Approved", color: "#fffae6" },

    { id: "active", name: "Active", color: "#B0E57C" },
    { id: "inDevelopment", name: "In Development", color: "#B0E57C" },
    { id: "inProgress", name: "In Progress", color: "#B0E57C" },
    { id: "inTesting", name: "In Testing", color: "#B0E57C" },

    { id: "late", name: "Late", color: "#ffcccc" },
    { id: "blocked", name: "Blocked", color: "#ffcccc" },
    { id: "cancelled", name: "Cancelled", color: "#ffcccc" },
    { id: "rejected", name: "Rejected", color: "#ffcccc" },

    { id: "live", name: "Live", color: "#d8ebf3" },
    { id: "completed", name: "Completed", color: "#d8ebf3" },
    { id: "delivered", name: "Delivered", color: "#d8ebf3" },
    { id: "shipped", name: "Shipped", color: "#d8ebf3" },
];

const avatarColors = [
    "D81B60",
    "F06292",
    "F48FB1",
    "FFB74D",
    "FF9800",
    "F57C00",
    "00897B",
    "4DB6AC",
    "80CBC4",
    "80DEEA",
    "4DD0E1",
    "00ACC1",
    "9FA8DA",
    "7986CB",
    "3949AB",
    "8E24AA",
    "BA68C8",
    "CE93D8"
];

module.exports = {
    projectStatuses,
    avatarColors
}