# SplitEase – Smart Shared Expense Management System for Students

## Project Overview

SplitEase is a web-based shared expense management system designed to help students and roommates efficiently manage group expenses. It provides a centralized platform where users can create groups, record shared expenses, automatically split bills, track balances, and settle dues transparently.

Instead of relying on spreadsheets, chat messages, or manual calculations, SplitEase automates expense tracking and balance computation, reducing confusion and ensuring fairness among all group members.

---

# Problem it Solves

Managing shared expenses in student accommodations such as flats, hostels, or PGs is often challenging. Daily expenses including rent, groceries, electricity bills, internet charges, food orders, and household purchases are typically recorded in WhatsApp chats, notebooks, or remembered mentally.

These traditional methods often result in:

- Forgotten expenses
- Incorrect manual calculations
- Lack of transparency
- Missed or delayed payments
- Frequent disputes among roommates

SplitEase eliminates these problems by maintaining a single source of truth for all shared expenses and automatically calculating individual balances.

---

# Target Users (Personas)

## Rahul – Flat Resident (Age: 20)

Rahul frequently pays for groceries and food orders on behalf of his roommates. He wants a quick and easy way to record expenses and immediately know how much each roommate owes him.

### Goals
- Add expenses within seconds
- Avoid manual calculations
- Track pending payments

---

## Priya – Group Organizer (Age: 21)

Priya manages a four-member apartment and wants complete visibility of the group's monthly spending. She needs organized reports and accurate balance summaries.

### Goals
- Manage group expenses efficiently
- View monthly spending reports
- Ensure everyone pays fairly

---

## Admin / Group Creator

The administrator creates the expense group, invites members, manages group information, and monitors overall spending.

### Goals
- Create and manage groups
- Add or remove members
- Maintain transparency across the group

---

# Vision Statement

To become the simplest and most reliable expense-sharing platform for students and small groups by providing transparent expense tracking, automatic balance calculations, and hassle-free settlement management.

---

# Key Features / Goals

- Secure user registration and authentication
- Create and manage multiple expense groups
- Add shared expenses with descriptions and categories
- Automatically split expenses equally or by custom percentage
- Real-time balance calculation for every member
- Track who owes whom
- View expense history with filters and categories
- Monthly spending analytics and visual charts
- Settle outstanding balances by marking payments as completed
- Responsive interface accessible from desktop and mobile browsers

---

# Success Metrics

The project will be considered successful if it achieves the following objectives:

- Users can record a new expense in under 10 seconds.
- Balance calculations remain 100% accurate across all test scenarios.
- Users can clearly identify pending dues without manual calculations.
- At least three sample groups successfully manage one month of expenses.
- Dashboard loads within two seconds under normal usage.
- Users can complete the expense settlement process with minimal interaction.

---

# Assumptions & Constraints

## Assumptions

- All members honestly record expenses.
- Internet connectivity is available while using the application.
- Each user belongs to at least one expense group.
- Users are familiar with basic web applications.

## Constraints

- No real payment gateway integration (settlements are recorded manually).
- Supports only Indian Rupees (INR) in the current version.
- Designed for small groups containing 2–8 members.
- Web application only (no Android or iOS application).
- Internet connection is required.
- Receipt scanning and OCR are outside the scope of the MVP.

# MoSCoW Prioritization

## Must Have (M)

These are essential features without which the application cannot function.

| Feature | Reason |
|----------|--------|
| User Registration & Login | Required for secure access |
| Create Expense Groups | Core functionality |
| Add Members to Group | Enables shared expenses |
| Add Shared Expense | Primary feature |
| Equal Expense Split | Core calculation |
| Custom Expense Split | Supports flexible sharing |
| Automatic Balance Calculation | Eliminates manual calculations |
| Dashboard Overview | Displays user balances |
| Expense History | Tracks previous expenses |
| Settle Outstanding Payments | Completes expense lifecycle |

---

## Should Have (S)

Important features that improve usability but are not essential for the MVP.

| Feature | Reason |
|----------|--------|
| Edit Expense | Correct mistakes |
| Delete Expense | Remove incorrect entries |
| Expense Categories | Better organization |
| Monthly Expense Summary | Spending analysis |
| Spending Charts | Better visualization |
| Group Management | Modify group information |
| Settlement History | View completed payments |

---

## Could Have (C)

Useful enhancements that improve user experience.

| Feature | Reason |
|----------|--------|
| Receipt Upload | Store bill images |
| Dark Mode | Better UI experience |
| Budget Tracking | Monitor monthly spending |
| Pending Payment Reminders | Improve settlements |
| Profile Picture | Personalization |
| Search & Filter Expenses | Easier navigation |

---

## Won't Have (W)

Features intentionally excluded from the first release.

| Feature | Reason |
|----------|--------|
| Online Payment Gateway | Outside project scope |
| UPI Integration | Future enhancement |
| Mobile Application | Web-only project |
| Multi-Currency Support | INR only |
| OCR Receipt Scanning | Future work |
| AI Spending Prediction | Advanced feature |
