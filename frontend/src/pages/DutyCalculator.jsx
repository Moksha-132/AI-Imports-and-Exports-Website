import React, { useState } from 'react';
import { Calculator, Globe2, ArrowRight, Info, DollarSign, Search, ChevronRight, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';

const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

const SearchableDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filteredOptions = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-3 relative">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer flex justify-between items-center group focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5 transition-all shadow-sm">
        <span className="font-black text-slate-900">{value || `Select ${label}`}</span>
        <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 bg-slate-50/50 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" autoFocus placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} onClick={(e) => e.stopPropagation()}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all" />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? filteredOptions.map(o => (
              <div key={o} onClick={() => { onChange(o); setIsOpen(false); setQuery(''); }}
                className="px-6 py-3.5 hover:bg-amber-50 hover:text-amber-600 text-sm font-black text-slate-600 cursor-pointer transition-colors">
                {o}
              </div>
            )) : <div className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No matches</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const DutyCalculator = () => {
  const [origin, setOrigin] = useState('Singapore');
  const [destination, setDestination] = useState('United States');
  const [hsnCode, setHsnCode] = useState('8471.30.00');
  const [value, setValue] = useState('50000');
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = () => {
    setIsCalculating(true);
    setError(null);
    
    apiFetch('/duty', {
      method: 'POST',
      body: JSON.stringify({ hsn_code: hsnCode, origin: origin, destination: destination, value: parseFloat(value) })
    })
    .then(data => {
      const v = parseFloat(value);
      setCalculation({ base_value: v, basic_duty: data.total_tax * 0.7, gst_vat: data.total_tax * 0.2, other_taxes: data.total_tax * 0.1, total_taxes: data.total_tax, currency: data.currency });
      setIsCalculating(false);
    })
    .catch(err => {
      setError(err.message);
      setIsCalculating(false);
    });
  };
  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-6 flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight mb-10">
              <Calculator className="text-amber-500" /> Parameters
            </h3>
            <div className="space-y-10">
              <SearchableDropdown label="Origin Country" value={origin} onChange={setOrigin} options={COUNTRIES} />
              <SearchableDropdown label="Destination Country" value={destination} onChange={setDestination} options={COUNTRIES} />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">HSN Code</label>
                <input type="text" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm" />
                </div>
              </div>
              <button onClick={handleCalculate} disabled={isCalculating}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95">
                {isCalculating ? 'Calculating...' : 'Calculate Duty'}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          {calculation ? (
            <div className="h-full bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between mb-12 pb-10 border-b border-slate-50">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Origin</p>
                    <p className="text-xl font-black text-slate-900">{origin}</p>
                  </div>
                  <ArrowRight className="text-amber-500" size={24} />
                  <div className="text-center">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</p>
                    <p className="text-xl font-black text-slate-900">{destination}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">Customs Duty (Est.)</span>
                  <span className="text-slate-900 font-black">${(calculation.basic_duty || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">VAT / GST (Est.)</span>
                  <span className="text-slate-900 font-black">${(calculation.gst_vat || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">Surcharges</span>
                  <span className="text-slate-900 font-black">${(calculation.other_taxes || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-10 border-t border-slate-100 text-4xl">
                  <span className="text-slate-900 font-black tracking-tight">Total Duty</span>
                  <span className="text-amber-600 font-black tracking-tight">${(calculation.total_taxes || 0).toLocaleString()} {calculation.currency || 'USD'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mb-8">
                <Globe2 size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Run calculation</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DutyCalculator;