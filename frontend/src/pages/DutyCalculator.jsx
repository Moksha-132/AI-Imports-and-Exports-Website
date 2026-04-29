import React, { useState } from 'react';
import { Calculator, Globe2, ArrowRight, Info, DollarSign, Search, ChevronRight, AlertCircle } from 'lucide-react';

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

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-3 relative">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div 
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 cursor-pointer flex justify-between items-center group focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5 transition-all shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold">{value || `Select ${label}`}</span>
        <ChevronRight size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                autoFocus
                placeholder="Search countries..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt}
                  className="px-5 py-3 hover:bg-amber-50 hover:text-amber-600 text-sm font-bold text-slate-600 cursor-pointer transition-colors"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-slate-400 text-xs font-bold italic">No results found</div>
            )}
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

    fetch('http://localhost:8000/duty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hsn_code: hsnCode,
        origin: origin,
        destination: destination,
        value: parseFloat(value)
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Calculation failed. Please ensure the backend is running.");
      return res.json();
    })
    .then(data => {
      const val = parseFloat(value);
      setCalculation({
        base_value: val,
        basic_duty: data.total_tax * 0.7, 
        gst_vat: data.total_tax * 0.2,   
        other_taxes: data.total_tax * 0.1,
        total_taxes: data.total_tax,
        currency: data.currency
      });
      setIsCalculating(false);
    })
    .catch(err => {
      console.error("Duty Calc Error:", err);
      setError(err.message);
      setIsCalculating(false);
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 bg-white">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <Calculator className="text-amber-500" />
              Parameters
            </h3>
            <div className="space-y-8">
              <SearchableDropdown 
                label="Origin Country" 
                value={origin} 
                onChange={setOrigin} 
                options={COUNTRIES} 
              />
              <SearchableDropdown 
                label="Destination Country" 
                value={destination} 
                onChange={setDestination} 
                options={COUNTRIES} 
              />
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">HSN Code</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Consignment Value (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleCalculate} 
                disabled={isCalculating}
                className="bg-black text-white font-black uppercase tracking-widest w-full mt-6 py-5 rounded-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Duty'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {calculation ? (
            <div className="glass-card p-10 h-full animate-in fade-in slide-in-from-right-4 duration-500 bg-white">
              <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Origin</p>
                    <p className="text-lg font-black text-slate-900">{origin}</p>
                  </div>
                  <ArrowRight className="text-amber-500" size={24} />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Destination</p>
                    <p className="text-lg font-black text-slate-900">{destination}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">Basic Customs Duty (Est.)</span>
                  <span className="text-slate-900 font-black">${(calculation.basic_duty || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">VAT / GST (Est.)</span>
                  <span className="text-slate-900 font-black">${(calculation.gst_vat || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="text-slate-500 font-medium">Surcharge & Other Taxes</span>
                  <span className="text-slate-900 font-black">${(calculation.other_taxes || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-8 border-t border-slate-100 text-3xl">
                  <span className="text-slate-900 font-black">Total Estimated Duty</span>
                  <span className="text-amber-600 font-black">${(calculation.total_taxes || 0).toLocaleString()} {calculation.currency || 'USD'}</span>
                </div>
              </div>


            </div>
          ) : (
            <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center bg-white">
              <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
                <Globe2 size={48} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-300">Run a calculation to see the breakdown</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DutyCalculator;