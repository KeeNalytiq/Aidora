export const ticketTemplates = {
    bug: {
        name: "🐛 Bug Report",
        title: "Bug: ",
        description: `**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Environment:**
- Browser: 
- OS: 
- Version: `
    },
    feature: {
        name: "✨ Feature Request",
        title: "Feature: ",
        description: `**Feature Description:**


**Use Case:**


**Proposed Solution:**


**Additional Context:**
`
    },
    payment: {
        name: "💳 Payment Issue",
        title: "Payment: ",
        description: `**Issue Type:**
[ ] Payment failed
[ ] Incorrect charge
[ ] Refund request
[ ] Other

**Transaction ID:**


**Error Message:**


**Additional Details:**
`
    },
    api: {
        name: "🔌 API Issue",
        title: "API: ",
        description: `**Endpoint:**


**Error Response:**


**Request Details:**


**Expected Response:**
`
    },
    general: {
        name: "📝 General Issue",
        title: "",
        description: ""
    }
};
