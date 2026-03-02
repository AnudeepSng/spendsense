"""
SpendSense - FastAPI Backend
==============================
Endpoints:
  POST /parse-sms        → parse a single SMS
  POST /parse-sms-batch  → parse multiple SMS at once
  GET  /transactions     → get all stored transactions
  GET  /summary          → category-wise spending summary
  GET  /health           → check if server is running

Run with:
  uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

# Import our parser (make sure sms_parser.py is in parser/ folder)
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "parser"))
from sms_parser import parse_sms, parse_batch, is_financial_sms


# ─────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────

app = FastAPI(
    title="SpendSense API",
    description="AI-powered Indian bank SMS parser and expense tracker",
    version="1.0.0"
)

# Allow requests from React Native app (any origin for now)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (we'll replace with Supabase later)
transaction_store = []


# ─────────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────────

class SMSRequest(BaseModel):
    sms: str
    received_at: Optional[str] = None   # ISO timestamp from phone

class SMSBatchRequest(BaseModel):
    messages: List[SMSRequest]

class TransactionResponse(BaseModel):
    id: str
    raw_sms: str
    amount: Optional[float]
    type: Optional[str]
    merchant: Optional[str]
    merchant_normalized: Optional[str]
    category: Optional[str]
    bank: Optional[str]
    account_last4: Optional[str]
    balance: Optional[float]
    channel: Optional[str]
    upi_ref: Optional[str]
    date_str: Optional[str]
    parsed: bool
    parse_error: Optional[str]
    received_at: Optional[str]
    created_at: str


# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────

def transaction_to_dict(tx, sms_req: SMSRequest) -> dict:
    """Convert Transaction dataclass + request into a storable dict."""
    return {
        "id": str(uuid.uuid4()),
        "raw_sms": tx.raw_sms,
        "amount": tx.amount,
        "type": tx.type,
        "merchant": tx.merchant,
        "merchant_normalized": tx.merchant_normalized,
        "category": tx.category,
        "bank": tx.bank,
        "account_last4": tx.account_last4,
        "balance": tx.balance,
        "channel": tx.channel,
        "upi_ref": tx.upi_ref,
        "date_str": tx.date_str,
        "parsed": tx.parsed,
        "parse_error": tx.parse_error,
        "received_at": sms_req.received_at,
        "created_at": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Quick check to confirm server is running."""
    return {
        "status": "ok",
        "message": "SpendSense API is running!",
        "transactions_stored": len(transaction_store)
    }


@app.post("/parse-sms", response_model=TransactionResponse)
def parse_single_sms(request: SMSRequest):
    """
    Parse a single SMS and store the transaction.

    Example request body:
    {
        "sms": "Rs.1,250.00 debited from A/c XX4521 on 14-Feb-25 at SWIGGY UPI. Avl Bal: Rs.8,432 -SBI",
        "received_at": "2025-02-14T14:30:00"
    }
    """
    if not request.sms or not request.sms.strip():
        raise HTTPException(status_code=400, detail="SMS text cannot be empty")

    # Parse using our engine
    tx = parse_sms(request.sms)

    # Convert to dict and store
    tx_dict = transaction_to_dict(tx, request)
    transaction_store.append(tx_dict)

    return tx_dict


@app.post("/parse-sms-batch")
def parse_sms_batch(request: SMSBatchRequest):
    """
    Parse multiple SMS messages at once.
    Use this when the app first launches and sends all old SMS together.

    Example request body:
    {
        "messages": [
            {"sms": "Rs.1250 debited...", "received_at": "2025-02-14T10:00:00"},
            {"sms": "Rs.499 debited...", "received_at": "2025-02-13T18:00:00"}
        ]
    }
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    results = []
    parsed_count = 0
    skipped_count = 0

    for sms_req in request.messages:
        tx = parse_sms(sms_req.sms)
        tx_dict = transaction_to_dict(tx, sms_req)
        transaction_store.append(tx_dict)
        results.append(tx_dict)

        if tx.parsed:
            parsed_count += 1
        else:
            skipped_count += 1

    return {
        "total_received": len(request.messages),
        "parsed_successfully": parsed_count,
        "skipped_non_financial": skipped_count,
        "transactions": results
    }


@app.get("/transactions")
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    bank: Optional[str] = None,
    limit: int = 50
):
    """
    Get stored transactions with optional filters.

    Query params:
      ?category=Food
      ?type=debit
      ?bank=SBI
      ?limit=20
    """
    results = [t for t in transaction_store if t["parsed"]]

    # Apply filters
    if category:
        results = [t for t in results if t.get("category", "").lower() == category.lower()]
    if type:
        results = [t for t in results if t.get("type", "").lower() == type.lower()]
    if bank:
        results = [t for t in results if t.get("bank", "").lower() == bank.lower()]

    # Sort newest first
    results = sorted(results, key=lambda x: x["created_at"], reverse=True)

    return {
        "count": len(results),
        "transactions": results[:limit]
    }


@app.get("/summary")
def get_summary():
    """
    Get category-wise spending summary for current month.
    This powers the Analytics screen in the app.
    """
    debits = [t for t in transaction_store if t["parsed"] and t["type"] == "debit"]
    credits = [t for t in transaction_store if t["parsed"] and t["type"] == "credit"]

    # Category breakdown
    category_summary = {}
    for tx in debits:
        cat = tx.get("category") or "Other"
        if cat not in category_summary:
            category_summary[cat] = {"category": cat, "total": 0, "count": 0, "transactions": []}
        category_summary[cat]["total"] += tx["amount"] or 0
        category_summary[cat]["count"] += 1
        category_summary[cat]["transactions"].append({
            "merchant": tx["merchant_normalized"],
            "amount": tx["amount"]
        })

    # Sort by total spend
    sorted_categories = sorted(category_summary.values(), key=lambda x: x["total"], reverse=True)

    total_spent = sum(t["amount"] or 0 for t in debits)
    total_income = sum(t["amount"] or 0 for t in credits)

    return {
        "total_spent": round(total_spent, 2),
        "total_income": round(total_income, 2),
        "net_savings": round(total_income - total_spent, 2),
        "total_transactions": len(debits) + len(credits),
        "category_breakdown": sorted_categories,
        "top_merchant": sorted_categories[0]["transactions"][0]["merchant"] if sorted_categories else None,
    }


@app.get("/anomalies")
def get_anomalies():
    """
    Simple anomaly detection — flags transactions that are
    more than 3x the average transaction amount.
    This is the rule-based version. Week 4 we'll replace with Isolation Forest.
    """
    debits = [t for t in transaction_store if t["parsed"] and t["type"] == "debit" and t["amount"]]

    if len(debits) < 3:
        return {"message": "Not enough transactions yet to detect anomalies", "anomalies": []}

    amounts = [t["amount"] for t in debits]
    avg = sum(amounts) / len(amounts)
    threshold = avg * 3   # flag anything 3x the average

    anomalies = [t for t in debits if t["amount"] > threshold]

    return {
        "average_transaction": round(avg, 2),
        "threshold": round(threshold, 2),
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }


@app.delete("/transactions/clear")
def clear_transactions():
    """
    Clear all stored transactions.
    Useful during development and testing.
    """
    transaction_store.clear()
    return {"message": "All transactions cleared", "count": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)