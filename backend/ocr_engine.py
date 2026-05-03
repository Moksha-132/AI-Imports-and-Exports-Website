import re, io, logging, random
from pathlib import Path
from typing import Dict, List, Any, Optional
logger = logging.getLogger("trade-ocr")
try:
    import fitz 
    CAN_HANDLE_PDF = True
except ImportError: CAN_HANDLE_PDF = False
try:
    import pytesseract
    from PIL import Image
    pytesseract.pytesseract.tesseract_cmd = r'F:\Program Files\Tesseract-OCR\tesseract.exe'
    CAN_HANDLE_OCR = True
except ImportError: CAN_HANDLE_OCR = False
def extract_text_from_binary(file_bytes: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    txt = ""
    try:
        if ext == ".pdf" and CAN_HANDLE_PDF:
            with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                txt = "\n".join([p.get_text() for p in doc])
        elif ext in [".png", ".jpg", ".jpeg"] and CAN_HANDLE_OCR:
            txt = pytesseract.image_to_string(Image.open(io.BytesIO(file_bytes)).convert("L"), config="--psm 6")
    except Exception as e: logger.error(f"Text extract fail: {e}")
    return txt.strip()

def parse_extracted_text(text: str) -> Dict[str, Any]:
    res = {"invoice_no": None, "vendor": None, "amount": 0.0, "currency": "USD", "hsn_codes": [], "items": [], "destination": "United States", "client_name": "Primary Client"}
    hsn_p, inv_p = r'\b([1-9][0-9]{3}(?:\.[0-9]{2}){1,2})\b', [r'\b(INV[-/][A-Z0-9][-A-Z0-9/]{2,20})\b', r'invoice\s*(?:no|#)[:\s#]*([A-Z0-9][-A-Z0-9/]{2,20})']
    v_p = r'([A-Z][A-Za-z0-9 \t&.-]{2,50}(?:Pvt\.?|Ltd\.?|Inc\.?|Corp\.?|LLC|GmbH|Solar|Exports?|Industries|International|Trade|Group|Systems|Services|Logistics)\.?)'
    res["hsn_codes"] = list(dict.fromkeys(re.findall(hsn_p, text))) 
    for p in inv_p:
        m = re.search(p, text, re.I)
        if m: res["invoice_no"] = m.group(1).upper(); break
    vm = re.search(v_p, text, re.I)
    if vm: res["vendor"] = vm.group(1).strip()
    else:
        ls = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
        if ls: res["vendor"] = ls[0]
    if not res["vendor"]: res["vendor"] = "Unknown Entity"
    cm = re.search(r'BILL\s+TO\s*(?:/\s*CONSIGNEE)?[:\s\n]*([A-Z][A-Za-z0-9 \t&.-]{3,40})', text, re.I)
    if cm: res["client_name"] = cm.group(1).strip()
    amt_p = [r'TOTAL\s+DUE\s*(?:[A-Z]{3})?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2}))', r'(?:total|amount)[:\s]*(?:[A-Z]{3})?\s*\$?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)']
    for p in amt_p:
        am = re.search(p, text, re.I)
        if am:
            try: res["amount"] = float(am.group(1).replace(",", "")); break
            except: continue
    cur = re.search(r'\b(USD|INR|EUR|GBP|AED)\b', text)
    if cur: res["currency"] = cur.group(1).upper()
    countries = ["United States", "India", "Singapore", "Germany", "France", "United Kingdom", "Canada", "Mexico", "Brazil", "Australia", "Japan", "China", "UAE"]
    bs = re.search(r'(?:BILL\s+TO|BUYER|CONSIGNEE)[:\s\n]*(.*?)(?:\n\n|ITEM DETAILS|$)', text, re.I | re.S)
    found, area = [], bs.group(1) if bs else text
    for c in countries:
        if re.search(rf'\b{c}\b', area, re.I): found.append(c)
    if found: res["destination"] = found[-1]
    else:
        for c in reversed(countries):
            if re.search(rf'\b{c}\b', text, re.I): res["destination"] = c; break
    ls, si = [l.strip() for l in text.split('\n') if len(l.strip()) > 2], 0
    for i, l in enumerate(ls):
        if any(k in l.lower() for k in ["description", "item details", "qty", "unit price"]) and len(l) < 50: si = i + 1; break
    ex = {'invoice', 'total', 'tax', 'date', 'amount', 'buyer', 'seller', 'address', 'vendor', 'page', 'tel:', 'email:', 'hsn code', 'description', 'unit price', 'duty', 'customs', 'declaration', 'signature', 'authorized', 'origin', 'insurance', 'freight', 'charges'}
    for i in range(si, len(ls)):
        l = ls[i]
        if any(w in l.lower() for w in ex) or len(l) < 4 or res["vendor"] in l or res["client_name"] in l: continue
        if re.search(r'[a-zA-Z]{5,}', l):
            nm = re.sub(hsn_p, '', l)
            nm = re.sub(r'\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?', '', nm).strip().strip('-').strip(':').strip()
            nm = re.sub(r'^\d+\s*', '', nm)
            if len(nm) < 5: continue
            hsn = None
            for o in [1, 2]:
                if i + o < len(ls):
                    hm = re.search(hsn_p, ls[i+o])
                    if hm: hsn = hm.group(1); break
            if not hsn: hsn = res["hsn_codes"][0] if res["hsn_codes"] else "Pending"
            res["items"].append({"name": nm[:64], "hsn": hsn})
            if len(res["items"]) >= 10: break
    return res

def create_humanized_summary(data: Dict[str, Any]) -> str:
    if not data["invoice_no"]: return "Manual review recommended."
    m = random.choice([f"Processed invoice {data['invoice_no']} from {data['vendor']}.", f"Identified document {data['invoice_no']} by {data['vendor']}."])
    if data['amount'] > 0: m += f" Value: {data['currency']} {data['amount']:,.2f}."
    return m
    
def process_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    txt = extract_text_from_binary(file_bytes, filename)
    if not txt: return {"invoice_no": None, "vendor": "Unknown", "amount": 0, "currency": "USD", "hsn_codes": [], "items": [], "humanized_summary": "Unreadable."}
    p = parse_extracted_text(txt); p["raw_text_preview"], p["humanized_summary"] = txt[:500], create_humanized_summary(p)
    return p