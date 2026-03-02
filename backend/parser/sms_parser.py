"""
SpendSense - Indian Bank SMS Parser
=====================================
Handles SMS formats from: SBI, HDFC, ICICI, Axis, Kotak, PNB, BOI,
Canara, Yes Bank, IndusInd + all UPI apps (GPay, PhonePe, Paytm, CRED)

Author: SpendSense
"""

import re
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional


# ─────────────────────────────────────────────
# DATA CLASS — clean structured output
# ─────────────────────────────────────────────

@dataclass
class Transaction:
    raw_sms: str
    amount: Optional[float] = None
    type: Optional[str] = None          # "debit" or "credit"
    merchant: Optional[str] = None
    merchant_normalized: Optional[str] = None
    category: Optional[str] = None
    bank: Optional[str] = None
    account_last4: Optional[str] = None
    balance: Optional[float] = None
    channel: Optional[str] = None       # UPI, Card, NetBanking, ATM, NEFT, IMPS
    upi_ref: Optional[str] = None
    date_str: Optional[str] = None
    parsed: bool = False
    parse_error: Optional[str] = None


# ─────────────────────────────────────────────
# MERCHANT NORMALIZATION DICTIONARY
# Maps raw merchant strings → clean name + category
# ─────────────────────────────────────────────

MERCHANT_MAP = {
    # Food Delivery
    "swiggy": ("Swiggy", "Food"),
    "zomato": ("Zomato", "Food"),
    "eatsure": ("EatSure", "Food"),
    "dunzo": ("Dunzo", "Food"),
    "domino": ("Domino's", "Food"),
    "pizza hut": ("Pizza Hut", "Food"),
    "kfc": ("KFC", "Food"),
    "mcdonalds": ("McDonald's", "Food"),
    "subway": ("Subway", "Food"),
    "burger king": ("Burger King", "Food"),
    "starbucks": ("Starbucks", "Food"),
    "cafe coffee day": ("Café Coffee Day", "Food"),
    "chaayos": ("Chaayos", "Food"),

    # Groceries & Quick Commerce
    "zepto": ("Zepto", "Groceries"),
    "blinkit": ("Blinkit", "Groceries"),
    "instamart": ("Swiggy Instamart", "Groceries"),
    "bigbasket": ("BigBasket", "Groceries"),
    "jiomart": ("JioMart", "Groceries"),
    "dmart": ("D-Mart", "Groceries"),
    "more retail": ("More Retail", "Groceries"),
    "reliance fresh": ("Reliance Fresh", "Groceries"),
    "spencer": ("Spencer's", "Groceries"),
    "nature basket": ("Nature Basket", "Groceries"),

    # Travel
    "irctc": ("IRCTC", "Travel"),
    "makemytrip": ("MakeMyTrip", "Travel"),
    "goibibo": ("Goibibo", "Travel"),
    "cleartrip": ("Cleartrip", "Travel"),
    "ixigo": ("Ixigo", "Travel"),
    "indigo": ("IndiGo Airlines", "Travel"),
    "air india": ("Air India", "Travel"),
    "spicejet": ("SpiceJet", "Travel"),
    "vistara": ("Vistara", "Travel"),
    "ola": ("Ola Cabs", "Travel"),
    "uber": ("Uber", "Travel"),
    "rapido": ("Rapido", "Travel"),
    "redbus": ("RedBus", "Travel"),
    "abhi bus": ("AbhiBus", "Travel"),

    # Entertainment
    "netflix": ("Netflix", "Entertainment"),
    "prime video": ("Amazon Prime", "Entertainment"),
    "hotstar": ("Disney+ Hotstar", "Entertainment"),
    "sony liv": ("SonyLIV", "Entertainment"),
    "zee5": ("ZEE5", "Entertainment"),
    "jiocinema": ("JioCinema", "Entertainment"),
    "spotify": ("Spotify", "Entertainment"),
    "youtube": ("YouTube Premium", "Entertainment"),
    "bookmyshow": ("BookMyShow", "Entertainment"),
    "pvr": ("PVR Cinemas", "Entertainment"),
    "inox": ("INOX", "Entertainment"),

    # Shopping
    "amazon": ("Amazon", "Shopping"),
    "flipkart": ("Flipkart", "Shopping"),
    "myntra": ("Myntra", "Shopping"),
    "ajio": ("AJIO", "Shopping"),
    "nykaa": ("Nykaa", "Shopping"),
    "meesho": ("Meesho", "Shopping"),
    "snapdeal": ("Snapdeal", "Shopping"),
    "shopsy": ("Shopsy", "Shopping"),
    "croma": ("Croma", "Shopping"),
    "reliance digital": ("Reliance Digital", "Shopping"),

    # Health
    "apollo": ("Apollo Pharmacy", "Health"),
    "netmeds": ("Netmeds", "Health"),
    "1mg": ("1mg", "Health"),
    "pharmeasy": ("PharmEasy", "Health"),
    "medplus": ("MedPlus", "Health"),
    "practo": ("Practo", "Health"),
    "healthians": ("Healthians", "Health"),
    "thyrocare": ("Thyrocare", "Health"),

    # Bills & Utilities
    "jio": ("Jio", "Bills"),
    "airtel": ("Airtel", "Bills"),
    "vi ": ("Vi (Vodafone Idea)", "Bills"),
    "bsnl": ("BSNL", "Bills"),
    "tata power": ("Tata Power", "Bills"),
    "bescom": ("BESCOM", "Bills"),
    "msedcl": ("MSEDCL", "Bills"),
    "adani electricity": ("Adani Electricity", "Bills"),
    "indane": ("Indane Gas", "Bills"),
    "hp gas": ("HP Gas", "Bills"),
    "bharat gas": ("Bharat Gas", "Bills"),
    "mahanagar gas": ("MGL", "Bills"),

    # Education
    "byju": ("BYJU'S", "Education"),
    "unacademy": ("Unacademy", "Education"),
    "physicswallah": ("PhysicsWallah", "Education"),
    "coursera": ("Coursera", "Education"),
    "udemy": ("Udemy", "Education"),
    "upgrad": ("upGrad", "Education"),
    "college": ("College Fee", "Education"),

    # Investment
    "zerodha": ("Zerodha", "Investment"),
    "groww": ("Groww", "Investment"),
    "upstox": ("Upstox", "Investment"),
    "angel broking": ("Angel One", "Investment"),
    "coin": ("Coin by Zerodha", "Investment"),
    "mutual fund": ("Mutual Fund", "Investment"),
    "nps": ("NPS", "Investment"),

    # ATM / Cash
    "atm": ("ATM Withdrawal", "Cash"),
    "cash withdrawal": ("ATM Withdrawal", "Cash"),
}


def normalize_merchant(raw: str) -> tuple:
    """
    Match raw merchant string to clean name + category.
    Returns (merchant_name, category)
    """
    if not raw:
        return (raw, "Other")

    raw_lower = raw.lower().strip()

    # ── Slice repayment detection ──
    # ONLY repayment@slc or repayments@slc = Slice EMI/loan
    # Any other VPA with @slc is a normal payment
    if raw_lower.startswith('repayment') and raw_lower.endswith('@slc'):
        return ("Slice Repayment", "Loans")

    # ── Generic loan/EMI repayment detection ──
    repayment_keywords = [
        'repayment', 'emi', 'loanrepay', 'loan repay',
        'kreditbee', 'moneyview', 'cashe', 'nira',
        'stashfin', 'mpokket', 'earlysalary', 'bajajfinserv',
        'muthoot', 'payrupik', 'smfg', 'prefr', 'fibe',
        'freopay', 'lazypay', 'simpl', 'uni.cards',
    ]
    if any(k in raw_lower for k in repayment_keywords):
        return ("Loan Repayment", "Loans")

    for keyword, (name, category) in MERCHANT_MAP.items():
        if keyword in raw_lower:
            return (name, category)

    # Fallback: clean up the raw string
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', raw).strip().title()
    return (cleaned or "Unknown Merchant", "Other")


# ─────────────────────────────────────────────
# HELPER: Extract amount from various formats
# ─────────────────────────────────────────────

def extract_amount(text: str) -> Optional[float]:
    """
    Handles: Rs.1,250.00 | INR 1250 | Rs 1,250 | INR1250.50
    """
    patterns = [
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)',
        r'([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:Rs\.?|INR)',
        r'(?:debited|credited)\s+(?:by|with|for|of)?\s*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                continue
    return None


def extract_account(text: str) -> Optional[str]:
    """Extract last 4 digits of account/card number."""
    patterns = [
        r'[Aa]/[Cc]\s*[XxNn*]{2,4}(\d{4})',
        r'[Cc]ard\s+[XxNn*]{2,8}(\d{4})',
        r'[Aa]ccount\s+[XxNn*]{2,4}(\d{4})',
        r'[Aa]/[Cc]\.?\s*(\d{4})',
        r'ending\s+(?:with\s+)?(\d{4})',
        r'[XxNn*]{4}(\d{4})',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None


def extract_balance(text: str) -> Optional[float]:
    """Extract available balance."""
    patterns = [
        r'(?:Avl\.?\s*[Bb]al\.?|Available\s+[Bb]alance|[Bb]al\.?)\s*(?:Rs\.?|INR|:)?\s*([0-9,]+(?:\.[0-9]{1,2})?)',
        r'(?:Avl|Bal)\s*-?\s*(?:Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except ValueError:
                continue
    return None


def extract_upi_ref(text: str) -> Optional[str]:
    """Extract UPI transaction reference number."""
    patterns = [
        r'[Uu][Pp][Ii]\s*[Rr]ef\.?\s*[Nn]o\.?\s*:?\s*(\d{10,})',
        r'[Rr]ef\.?\s*[Nn]o\.?\s*:?\s*(\d{10,})',
        r'[Tt]xn\s*[Ii][Dd]\s*:?\s*(\d{10,})',
        r'[Uu][Tt][Rr]\s*:?\s*(\w{16,})',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return None


def detect_channel(text: str) -> str:
    """Detect payment channel from SMS."""
    text_lower = text.lower()
    if 'upi' in text_lower:
        return 'UPI'
    elif any(x in text_lower for x in ['debit card', 'credit card', 'card ending', 'pos ']):
        return 'Card'
    elif any(x in text_lower for x in ['neft', 'rtgs', 'imps']):
        return 'NetBanking'
    elif 'atm' in text_lower:
        return 'ATM'
    elif 'netbanking' in text_lower or 'net banking' in text_lower:
        return 'NetBanking'
    return 'Unknown'


def detect_bank(text: str) -> str:
    """Detect bank name from SMS sender or content."""
    text_lower = text.lower()
    bank_keywords = {
        'SBI': ['sbi', 'state bank'],
        'HDFC': ['hdfc'],
        'ICICI': ['icici'],
        'Axis': ['axis bank', 'axisbank'],
        'Kotak': ['kotak'],
        'PNB': ['pnb', 'punjab national'],
        'BOI': ['bank of india', 'boi'],
        'Canara': ['canara'],
        'Yes Bank': ['yes bank', 'yesbank'],
        'IndusInd': ['indusind'],
        'IDFC': ['idfc'],
        'Federal': ['federal bank'],
        'Union Bank': ['union bank'],
        'Bank of Baroda': ['bob', 'bank of baroda'],
        'Indian Bank': ['indian bank'],
    }
    for bank, keywords in bank_keywords.items():
        if any(k in text_lower for k in keywords):
            return bank
    return 'Unknown Bank'


# ─────────────────────────────────────────────
# BANK-SPECIFIC PARSERS
# ─────────────────────────────────────────────

def parse_sbi(sms: str, tx: Transaction) -> bool:
    """
    SBI Patterns:
    - "Rs.1,250.00 debited from A/c XX4521 on 14-Feb-25 at SWIGGY UPI..."
    - "Rs.500.00 credited to A/c XX4521 on 14-Feb-25 by transfer..."
    - "Your A/c XX4521 is debited with Rs.1000 on 14/02/25..."
    """
    patterns = [
        # Pattern 1: Amount debited/credited from/to A/c
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited from|credited to)\s*[Aa]/[Cc]\s*[Xx]+(\d{4})\s*on\s*([\d\-/]+)\s*(?:at|by|to|from)?\s*(.*?)(?:Avl|Available|Bal|\.|$)',
        # Pattern 2: Your A/c is debited/credited
        r'[Yy]our\s*[Aa]/[Cc]\s*[Xx]+(\d{4})\s*is\s*(debited|credited)\s*(?:with|by)?\s*(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)',
    ]

    m = re.search(patterns[0], sms, re.IGNORECASE | re.DOTALL)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        tx.date_str = m.group(4)
        merchant_raw = m.group(5).strip().split('\n')[0].split('.')[0][:40]
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'SBI'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.upi_ref = extract_upi_ref(sms)
        tx.parsed = True
        return True

    m = re.search(patterns[1], sms, re.IGNORECASE)
    if m:
        tx.account_last4 = m.group(1)
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.amount = float(m.group(3).replace(',', ''))
        tx.bank = 'SBI'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    return False


def parse_hdfc(sms: str, tx: Transaction) -> bool:
    """
    HDFC Patterns:
    - "HDFC Bank: Rs 1,250 debited from a/c **4521 on 14-02-25 at SWIGGY..."
    - "INR 499.00 debited from HDFC Bank a/c xx4521 thru NetBanking..."
    - "Rs.1250 spent on HDFC Credit Card ending 4521 at SWIGGY on 14/02/25"
    """
    patterns = [
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:debited from|spent on|deducted)\s*.*?[Aa]/[Cc]\s*[*Xx]+(\d{4})\s*(?:on|thru|at)\s*.*?(?:at|on)\s*([\w\s*\.]+?)(?:\.|Avl|Bal|$)',
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited|credited).*?ending\s*(\d{4})\s*at\s*(.+?)(?:\.|on|$)',
    ]

    m = re.search(patterns[0], sms, re.IGNORECASE | re.DOTALL)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit'
        tx.account_last4 = m.group(2)
        merchant_raw = m.group(3).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'HDFC'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.upi_ref = extract_upi_ref(sms)
        tx.parsed = True
        return True

    m = re.search(patterns[1], sms, re.IGNORECASE)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        merchant_raw = m.group(4).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'HDFC'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    return False


def parse_icici(sms: str, tx: Transaction) -> bool:
    """
    ICICI Patterns:
    - "ICICI Bank Acct XX4521 debited for Rs 1,250.00 on 14-Feb-25; SWIGGY credited..."
    - "Dear Customer, Rs 1250.00 debited from A/c no. XX4521 on 14/02/2025..."
    """
    patterns = [
        r'[Aa]cct?\s*[Xx]+(\d{4})\s*(debited|credited)\s*for\s*(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*on\s*([\d\-/\w]+);\s*(.+?)\s*(credited|debited)',
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited from|credited to)\s*[Aa]/[Cc]\s*(?:no\.?)?\s*[Xx]+(\d{4})',
    ]

    m = re.search(patterns[0], sms, re.IGNORECASE)
    if m:
        tx.account_last4 = m.group(1)
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.amount = float(m.group(3).replace(',', ''))
        tx.date_str = m.group(4)
        merchant_raw = m.group(5).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'ICICI'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    # ICICI Pattern 2 extended — also captures merchant after "at"
    pattern2_ext = r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited from|credited to)\s*[Aa]/[Cc]\s*(?:no\.?)?\s*[Xx]+(\d{4})\s*on\s*[\d/]+\s*at\s*(.+?)(?:\.|$)'
    m = re.search(pattern2_ext, sms, re.IGNORECASE)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        merchant_raw = m.group(4).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'ICICI'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    m = re.search(patterns[1], sms, re.IGNORECASE)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        tx.bank = 'ICICI'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    return False


def parse_axis(sms: str, tx: Transaction) -> bool:
    """
    Axis Bank Patterns:
    - "Rs.1250.00 debited from Axis Bank Acct XX4521 on 14-02-2025 for SWIGGY..."
    """
    pattern = r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited from|credited to).*?[Aa]cct?\s*[Xx]+(\d{4})\s*on\s*([\d\-/]+)\s*for\s*(.+?)(?:\.|Avl|$)'

    m = re.search(pattern, sms, re.IGNORECASE | re.DOTALL)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        tx.date_str = m.group(4)
        merchant_raw = m.group(5).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'Axis'
        tx.balance = extract_balance(sms)
        tx.channel = detect_channel(sms)
        tx.upi_ref = extract_upi_ref(sms)
        tx.parsed = True
        return True

    return False


def parse_kotak(sms: str, tx: Transaction) -> bool:
    """
    Kotak Patterns:
    - "Sent Rs.X from Kotak Bank AC XXXX to MERCHANT on DATE. UPI Ref XXXXX"
    - "Rs.X debited from Kotak Bank account XXXX via UPI. Merchant: MERCHANT"
    """
    # Pattern 1: "Sent Rs.X from Kotak Bank AC XXXX to VPA on DATE"
    pattern1 = r'Sent\s+Rs\.?([0-9,]+(?:\.[0-9]{1,2})?)\s+from\s+Kotak\s+Bank\s+AC\s+[Xx*]+(\d{4})\s+to\s+([\w@\.\-]+)\s+on\s+([\d\-/\.]+)'

    # Pattern 2: "Rs.X debited from Kotak Bank account XXXX. Merchant: NAME"
    pattern2 = r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited|credited).*?[Aa]ccount\s*[Xx]+(\d{4}).*?[Mm]erchant[:\s]+(.+?)(?:\.|$)'

    m = re.search(pattern1, sms, re.IGNORECASE)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit'
        tx.account_last4 = m.group(2)
        tx.date_str = m.group(4)
        # Keep full VPA for merchant detection (don't strip @slc)
        merchant_raw = m.group(3).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'Kotak'
        tx.channel = 'UPI'
        tx.upi_ref = extract_upi_ref(sms)
        tx.balance = extract_balance(sms)
        tx.parsed = True
        return True

    m = re.search(pattern2, sms, re.IGNORECASE | re.DOTALL)
    if m:
        tx.amount = float(m.group(1).replace(',', ''))
        tx.type = 'debit' if 'debit' in m.group(2).lower() else 'credit'
        tx.account_last4 = m.group(3)
        merchant_raw = m.group(4).strip()
        tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
        tx.merchant = merchant_raw
        tx.bank = 'Kotak'
        tx.channel = detect_channel(sms)
        tx.parsed = True
        return True

    return False


def parse_upi_generic(sms: str, tx: Transaction) -> bool:
    """
    Generic UPI patterns used by GPay, PhonePe, Paytm, CRED, Amazon Pay.
    - "Sent Rs.1250 to Swiggy via UPI. Ref: 123456789012"
    - "Rs.1250 paid to swiggy@okaxis on 14 Feb. UPI Ref: 12345"
    - "Your UPI txn of Rs.1250 to VPA swiggy@ybl on 14-02-25 is successful"
    - "Money received! Rs.500 from Rahul via UPI Ref: 12345"
    """
    patterns = [
        # Sent to / paid to
        r'(?:Sent|Paid)\s*(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*to\s*([\w\s@\.]+?)\s*(?:via UPI|on|\.)',
        # UPI txn of Rs to VPA
        r'[Uu][Pp][Ii]\s*(?:txn|transaction)\s*of\s*(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*to\s*(?:[Vv][Pp][Aa]\s*)?([\w@\.\-]+)',
        # received from
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:received|credited).*?from\s*([\w\s]+?)(?:\s*via|\s*UPI|\.|$)',
        # Generic debit via UPI
        r'(?:Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*(debited|deducted).*?(?:UPI|upi).*?(?:to|at)\s*([\w\s@\.]+?)(?:\.|Ref|$)',
    ]

    for i, pattern in enumerate(patterns):
        m = re.search(pattern, sms, re.IGNORECASE)
        if m:
            tx.amount = float(m.group(1).replace(',', ''))
            if i == 2:  # received/credited
                tx.type = 'credit'
                merchant_raw = m.group(2).strip()
            else:
                tx.type = 'debit'
                merchant_raw = m.group(2).strip() if i < 3 else m.group(3).strip()

            # Clean VPA (remove @okaxis @ybl etc)
            merchant_raw = re.sub(r'@\w+', '', merchant_raw).strip()
            tx.merchant_normalized, tx.category = normalize_merchant(merchant_raw)
            tx.merchant = merchant_raw
            tx.bank = detect_bank(sms)
            tx.channel = 'UPI'
            tx.upi_ref = extract_upi_ref(sms)
            tx.balance = extract_balance(sms)
            tx.parsed = True
            return True

    return False


def parse_generic_fallback(sms: str, tx: Transaction) -> bool:
    """
    Last resort parser — handles any SMS that mentions
    debit/credit + an amount. Less precise but catches edge cases.
    """
    has_debit = bool(re.search(r'\b(?:debited|deducted|spent|withdrawn)\b', sms, re.IGNORECASE))
    has_credit = bool(re.search(r'\b(?:credited|received|deposited)\b', sms, re.IGNORECASE))

    if not (has_debit or has_credit):
        return False

    amount = extract_amount(sms)
    if not amount:
        return False

    tx.amount = amount
    tx.type = 'debit' if has_debit else 'credit'
    tx.account_last4 = extract_account(sms)
    tx.balance = extract_balance(sms)
    tx.channel = detect_channel(sms)
    tx.bank = detect_bank(sms)
    tx.upi_ref = extract_upi_ref(sms)
    tx.merchant = "Unknown Merchant"
    tx.merchant_normalized = "Unknown Merchant"
    tx.category = "Other"
    tx.parsed = True
    return True


# ─────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────

def is_financial_sms(sms: str) -> bool:
    """
    Quick check: is this SMS financial?
    Filters out OTPs, promotional, and non-bank SMS.
    """
    financial_keywords = [
        'debited', 'credited', 'deducted', 'withdrawn',
        'sent rs', 'paid rs', 'received rs',
        'spent on', 'inr ', 'rs.',
        'upi', 'neft', 'imps', 'rtgs',
        'a/c', 'acct', 'account',
        'balance', 'avl bal', 'ending',
    ]
    sms_lower = sms.lower()
    return any(kw in sms_lower for kw in financial_keywords)


def parse_sms(sms: str) -> Transaction:
    """
    Master parser — tries bank-specific parsers in order,
    falls back to generic UPI and then catch-all.

    Usage:
        tx = parse_sms("Rs.1,250 debited from A/c XX4521 at SWIGGY UPI...")
        if tx.parsed:
            print(tx.amount, tx.merchant_normalized, tx.category)
    """
    tx = Transaction(raw_sms=sms)

    if not sms or not sms.strip():
        tx.parse_error = "Empty SMS"
        return tx

    if not is_financial_sms(sms):
        tx.parse_error = "Not a financial SMS"
        return tx

    # Try bank-specific parsers first (most accurate)
    parsers = [
        parse_sbi,
        parse_hdfc,
        parse_icici,
        parse_axis,
        parse_kotak,
        parse_upi_generic,
        parse_generic_fallback,  # always last
    ]

    for parser in parsers:
        if parser(sms, tx):
            break

    if not tx.parsed:
        tx.parse_error = "No pattern matched — add this SMS to training data"

    return tx


def parse_batch(sms_list: list) -> list:
    """Parse a list of SMS messages. Returns list of Transaction objects."""
    return [parse_sms(sms) for sms in sms_list]


# ─────────────────────────────────────────────
# TEST IT — run: python sms_parser.py
# ─────────────────────────────────────────────

if __name__ == "__main__":
    test_sms = [
        # SBI
        "Rs.1,250.00 debited from A/c XX4521 on 14-Feb-25 at SWIGGY UPI. Avl Bal: Rs.8,432.10 -SBI",
        "Rs.500.00 credited to A/c XX4521 on 14-Feb-25 by NEFT from RAHUL SHARMA",

        # HDFC
        "Rs 499 debited from HDFC Bank a/c **4521 on 14-02-25 at NETFLIX. Avl bal: Rs 12,300",
        "INR 2,100 spent on HDFC Credit Card ending 4521 at AMAZON on 14/02/2025 12:30:05",

        # ICICI
        "ICICI Bank Acct XX4521 debited for Rs 1,800.00 on 14-Feb-25; IRCTC credited. Avl Bal: Rs 5,200",
        "Dear Customer, Rs 340.00 debited from A/c no. XX4521 on 14/02/2025 at APOLLO PHARMACY",

        # UPI Generic (PhonePe / GPay)
        "Sent Rs.650 to zepto@okicici via UPI. Ref: 405234123456. Available Balance: Rs.9,800",
        "Money received! Rs.2,100 from Rahul Sharma via UPI Ref: 405234999888",
        "Your UPI txn of Rs.1250 to VPA swiggy@ybl on 14-02-25 is successful. UPI Ref No. 123456789012",

        # Axis
        "Rs.1250.00 debited from Axis Bank Acct XX4521 on 14-02-2025 for BOOKMYSHOW. Avl Bal: Rs 3,400",

        # Not financial — should be filtered
        "Your OTP for login is 482910. Valid for 10 minutes. Do not share.",
        "Congratulations! You've won a prize. Click here to claim.",
    ]

    print("=" * 60)
    print("SpendSense SMS Parser — Test Run")
    print("=" * 60)

    success = 0
    for i, sms in enumerate(test_sms):
        tx = parse_sms(sms)
        print(f"\n[{i+1}] SMS: {sms[:60]}...")
        if tx.parsed:
            success += 1
            print(f"    ✅ Amount:   ₹{tx.amount:,.2f} ({tx.type})")
            print(f"    🏪 Merchant: {tx.merchant_normalized} ({tx.category})")
            print(f"    🏦 Bank:     {tx.bank} | A/c: XX{tx.account_last4 or '????'}")
            print(f"    📡 Channel:  {tx.channel}")
            if tx.balance:
                print(f"    💰 Balance:  ₹{tx.balance:,.2f}")
            if tx.upi_ref:
                print(f"    🔗 UPI Ref:  {tx.upi_ref}")
        else:
            print(f"    ⏭️  Skipped:  {tx.parse_error}")

    financial_sms = [s for s in test_sms if is_financial_sms(s)]
    print(f"\n{'='*60}")
    print(f"Result: {success}/{len(financial_sms)} financial SMS parsed successfully")
    print(f"{'='*60}")