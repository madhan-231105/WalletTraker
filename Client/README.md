# Project Raseed

Transform Google Wallet into a **smart financial assistant** with AI-powered receipt management.  
Raseed captures receipts from Gmail, Google Pay, POS systems, and manual uploads, turning them into Wallet passes with **real-time insights**.

---

## About

Over **60% of physical receipts are lost** and digital vouchers are scattered across apps, SMS, and emails.  
While Google Wallet handles **150M+ daily transactions**, it lacks tools for organizing receipts.

**Raseed** solves this problem by:
- Centralizing physical & digital receipts in one place.  
- Using **AI (Gemini + Document AI)** for OCR, NLP, and categorization.  
- Providing **budget insights, alerts, and reminders** directly inside Google Wallet.  
- Enabling **POS system integration** to generate e-bills linked with Google Pay.  

---

## Features

- **Gmail + Google Pay Sync** – auto-extract receipts & create Wallet passes.  
- **Manual Receipt Upload** – scan/ upload receipts; supports multilingual OCR.  
- **POS System Integration** – auto-generate e-bills linked to Google Pay.  
- **Intelligent Spend Insights** – category grouping, vouchers, and budget alerts.  
- **Voice-enabled assistant** – ask spending queries via voice.  
- **Family-level tracking** – manage household expenses together.  
- **Purchase timeline memory** – recall past purchases instantly.  

---

## Unique Value

- Centralizes receipts, vouchers & discounts in one place.  
- Eliminates manual effort of sorting emails, SMS, and paper slips.  
- Provides **actionable, real-time insights**.  
- Runs seamlessly inside **Google Wallet** — no extra apps needed.  

---

## Tech Stack

### 🔹 AI & Language
- Gemini 1.5 Pro  
- Vertex AI Agent  
- Translation API  

### 🔹 Cloud & Infrastructure
- Google Cloud Functions  
- Firestore Database  
- Firebase Auth  

### 🔹 Integration
- Google Wallet API  
- Google Pay / UPI Integration  
- Notification Service  

---

## Architecture Overview

- **Google Cloud Functions** – backend logic & automation.  
- **Firestore Database** – secure storage of structured receipt data.  
- **Gemini / Document AI** – OCR + NLP for receipt parsing.  
- **Vertex AI Agent** – smart categorization & insights.  
- **Google Wallet API** – creates passes directly in Wallet.  
- **GPay/UPI integration** – links payments to digital receipts.  
- **Notification Service** – sends alerts & budget reminders.  

*(Insert diagrams if available: Architecture & Process Flow)*

---

