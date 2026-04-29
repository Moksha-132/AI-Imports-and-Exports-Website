import re, io, logging, random
from pathlib import Path
log = logging.getLogger("trade-ocr")
try:
    import fitz
    CAN_PDF = True
except:
    CAN_PDF = False
try:
    import pytesseract
    from PIL import Image
    pytesseract.pytesseract.tesseract_cmd = r'F:\Program Files\Tesseract-OCR\tesseract.exe'
    CAN_OCR = True
except:
    CAN_OCR = False
def get_text(bits, name):
    ext, text = Path(name).suffix.lower(), ""
    try:
        if ext == ".pdf" and CAN_PDF:
            doc = fitz.open(stream=bits, filetype="pdf")
            text = "\n".join([p.get_text() for p in doc])
            doc.close()
        elif ext in [".png", ".jpg", ".jpeg"] and CAN_OCR:
            text = pytesseract.image_to_string(Image.open(io.BytesIO(bits)).convert("L"), config="--psm 6")
    except Exception as e:
        log.error(f"OCR Fail: {e}")
    return text.strip()
def parse(text):
    res = {"invoice_no": None, "vendor": None, "amount": 0.0, "currency": "USD", "hsn_codes": [], "items": []}    
    inv = re.search(r'\b(INV[-/][A-Z0-9][-A-Z0-9/]{2,20})\b', text, re.I) or re.search(r'invoice\s*(?:no|#)[:\s#]*([A-Z0-9][-A-Z0-9/]{2,20})', text, re.I)
    if inv: res["invoice_no"] = inv.group(1).upper()
    v_re = r'([A-Z][A-Za-z0-9 \t&.-]{2,50}(?:Pvt\.?|Ltd\.?|Inc\.?|Corp\.?|LLC|GmbH|Solar|Exports?|Industries|International|Trade|Group|Systems|Services|Logistics)\.?)'
    v_match = re.search(v_re, text, re.I)
    if v_match: res["vendor"] = v_match.group(1).strip()
    else:
        v_lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
        if v_lines: res["vendor"] = v_lines[0]
    if not res["vendor"]: res["vendor"] = "Unknown Entity"
    c_match = re.search(r'BILL\s+TO\s*(?:/\s*CONSIGNEE)?[:\s\n]*([A-Z][A-Za-z0-9 \t&.-]{3,40})', text, re.I)
    res["client_name"] = c_match.group(1).strip() if c_match else "Primary Client"
    
    amt = re.search(r'TOTAL\s+DUE\s*(?:[A-Z]{3})?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2}))', text, re.I) or re.search(r'(?:total|amount)[:\s]*(?:[A-Z]{3})?\s*\$?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)', text, re.I)
    if amt:
        try: res["amount"] = float(amt.group(1).replace(",", ""))
        except: pass
    cur = re.search(r'\b(USD|INR|EUR|GBP|AED)\b', text)
    if cur: res["currency"] = cur.group(1).upper()
    countries = ["United States", "India", "Singapore", "Germany", "France", "United Kingdom", "Canada", "Mexico", "Brazil", "Australia", "Japan", "China", "UAE"]
    for c in countries:
        if re.search(rf'\b{c}\b', text, re.I):
            res["destination"] = c
            break
    if not res.get("destination"): res["destination"] = "United States" # Default fallback
    hsn_p = r'\b([1-9][0-9]{3}(?:\.[0-9]{2}){1,2})\b'
    res["hsn_codes"] = list(dict.fromkeys(re.findall(hsn_p, text)))    
    # Detect Transport Mode
    mode = "Sea"
    if re.search(r'\b(air|flight|plane|awb|courier)\b', text, re.I): mode = "Air"
    elif re.search(r'\b(truck|road|land|lorry)\b', text, re.I): mode = "Land"
    res["transport_mode"] = mode
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 8]
    ex = {'invoice', 'total', 'tax', 'date', 'amount', 'buyer', 'seller', 'address', 'vendor'}
    for l in lines:
        if not any(w in l.lower() for w in ex) and re.search(r'[a-zA-Z]{3,}', l):
            h_match = re.search(hsn_p, l)
            name = re.sub(hsn_p, '', l)
            name = re.sub(r'\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?', '', name).strip().strip('-').strip(':').strip()
            if len(name) > 3:
                res["items"].append({
                    "name": name[:64],
                    "hsn": h_match.group(1) if h_match else (res["hsn_codes"][0] if res["hsn_codes"] else "Pending")
                })
            if len(res["items"]) >= 6: break
    return res
def summarize(d):
    if not d["invoice_no"]: return "Manual check needed."
    opts = [f"Processed {d['invoice_no']} from {d['vendor']}.", f"Found invoice {d['invoice_no']} ({d['vendor']})."]
    m = random.choice(opts)
    if d['amount']: m += f" Total: {d['currency']} {d['amount']:,.2f}."
    return m
def process(bits, name):
    txt = get_text(bits, name)
    if not txt: return {"invoice_no": None, "vendor": "Unknown", "amount": 0, "currency": "USD", "hsn_codes": [], "items": [], "humanized_summary": "Unreadable."}
    p = parse(txt)
    p["raw_text_preview"], p["humanized_summary"] = txt[:500], summarize(p)
    return p