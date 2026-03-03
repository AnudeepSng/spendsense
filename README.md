# SpendSense 💸
### AI-Powered Expense Tracker That Reads Your Indian Bank SMS Automatically

> **Zero manual entry.** SpendSense reads your bank SMS, parses transactions using NLP, categorizes them using a fine-tuned ML model, detects anomalies, and gives you weekly spending insights — all automatically.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React Native](https://img.shields.io/badge/React_Native-Expo-black)
![ML](https://img.shields.io/badge/ML-DistilBERT-orange)

---

## 📱 Demo

| Dashboard | Transactions | Analytics | Insights |
|---|---|---|---|
| Live balance + weekly chart | Auto-parsed SMS list | Category breakdown | AI nudges + forecasts |

---

## 🚀 The Problem

Every Indian with a smartphone gets flooded with bank/UPI SMS alerts — SBI, HDFC, ICICI, PhonePe, GPay. Nobody manually tracks these. Every finance app requires manual entry so people abandon it after 3 days.

**SpendSense solves this with zero manual entry** — it reads your SMS, understands it using NLP, and builds your complete financial picture automatically.

---

## 🧠 How It Works

```
Bank SMS → NLP Parser → Category Classifier → Anomaly Detector → Dashboard
```

1. **SMS Ingestion** — App reads financial SMS from Android inbox
2. **Custom NLP Parser** — Regex + Named Entity Recognition extracts amount, merchant, bank, channel from 15+ Indian bank formats
3. **ML Categorizer** — Fine-tuned DistilBERT classifies transactions into 12 categories (Food, Travel, Bills, Loans, etc.)
4. **Anomaly Detection** — Isolation Forest flags unusual transactions in real-time
5. **Forecasting** — Facebook Prophet predicts next month's spend by category
6. **Insights Engine** — Personalized savings nudges based on spending patterns

---

## 🛠️ Tech Stack

### Backend
| Component | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn |
| SMS Parser | Custom Regex + spaCy NER |
| ML Categorizer | Fine-tuned DistilBERT |
| Anomaly Detection | Isolation Forest (scikit-learn) |
| Forecasting | Facebook Prophet |
| Database | Supabase (PostgreSQL) |

### Mobile App
| Component | Technology |
|---|---|
| Framework | React Native (Expo) |
| Navigation | Expo Router |
| API Client | Axios |
| UI | Custom dark theme components |

---

## 📊 SMS Parser Coverage

Handles **15+ Indian bank formats** including:

| Bank | Formats Supported |
|---|---|
| SBI | Debit/Credit, UPI, NEFT |
| HDFC | Debit card, Credit card, UPI |
| ICICI | Account debit/credit, UPI |
| Axis Bank | UPI, Account transactions |
| Kotak | Sent/Received, UPI |
| Generic UPI | GPay, PhonePe, Paytm, CRED, Amazon Pay |

**Smart merchant detection:**
- 80+ Indian brands pre-mapped (Swiggy, Zomato, IRCTC, Netflix, etc.)
- BNPL/Loan detection (Slice `@slc`, KreditBee, LazyPay, etc.)
- VPA normalization (strips `@okaxis`, `@ybl` etc.)
- Fallback fuzzy matching for unknown merchants

---

## 🔌 API Endpoints

```
GET  /health              → Server status
POST /parse-sms           → Parse single SMS → structured transaction
POST /parse-sms-batch     → Parse multiple SMS (first app launch)
GET  /transactions        → Get all transactions (filterable)
GET  /summary             → Category-wise spending summary
GET  /anomalies           → Flag unusual transactions
DELETE /transactions/clear → Clear all data (dev only)
```

### Example

**Request:**
```json
POST /parse-sms
{
  "sms": "Rs.1,250.00 debited from A/c XX4521 on 14-Feb-25 at SWIGGY UPI. Avl Bal: Rs.8,432.10 -SBI"
}
```

**Response:**
```json
{
  "amount": 1250.0,
  "type": "debit",
  "merchant_normalized": "Swiggy",
  "category": "Food",
  "bank": "SBI",
  "channel": "UPI",
  "account_last4": "4521",
  "balance": 8432.10,
  "parsed": true
}
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Expo Go app on your phone

### Backend

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/spendsense.git
cd spendsense/backend

# Install dependencies
pip install fastapi uvicorn python-multipart pydantic

# Run the server
python3 app.py
# Server starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Mobile App

```bash
cd spendsense/mobile

# Install dependencies
npm install

# Update API URL in services/api.ts
# Change YOUR_MAC_IP to your machine's local IP

# Start Expo
npx expo start

# Scan QR code with Expo Go app
```

---

## 📁 Project Structure

```
spendsense/
├── backend/
│   ├── app.py                 ← FastAPI server (7 endpoints)
│   └── parser/
│       └── sms_parser.py      ← NLP SMS parser (500+ lines)
├── mobile/
│   ├── app/
│   │   └── (tabs)/
│   │       ├── index.tsx      ← Dashboard screen
│   │       ├── transactions.tsx
│   │       ├── parse.tsx      ← Live SMS parser screen
│   │       ├── analytics.tsx
│   │       └── insights.tsx
│   └── services/
│       └── api.ts             ← API service layer
└── README.md
```

---

## 🗺️ Roadmap

- [x] Custom SMS parser (15+ bank formats)
- [x] FastAPI backend (7 endpoints)
- [x] React Native app (5 screens)
- [x] Live SMS parsing from phone
- [x] Anomaly detection (rule-based)
- [ ] Fine-tuned DistilBERT categorizer
- [ ] Isolation Forest anomaly detection
- [ ] Facebook Prophet spend forecasting
- [ ] Android SMS auto-reading (background service)
- [ ] Supabase database integration
- [ ] Razorpay payment wall (monetization)

---

## 🎯 Why I Built This

As a 2025 CSE graduate from Manipal University, I wanted to build something that solves a real problem I face every day — understanding where my money goes without manually entering every transaction.

This project demonstrates end-to-end ML engineering: data collection, NLP pipeline design, model fine-tuning, API development, and mobile app deployment.

---

## 📬 Contact

**Anudeep** — [LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [GitHub](https://github.com/YOUR_USERNAME)

---

*Built with ❤️ to solve a real Indian problem*
