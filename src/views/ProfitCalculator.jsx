import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const mockDefaults = {
  "Wheat": { yield: 20, seed_cost: 1500, fert_cost: 3000, labor: 5000 },
  "Rice": { yield: 25, seed_cost: 1200, fert_cost: 4000, labor: 8000 },
  "Cotton": { yield: 12, seed_cost: 2500, fert_cost: 5000, labor: 7000 },
  "Soybean": { yield: 8, seed_cost: 2000, fert_cost: 2500, labor: 4000 },
};

const COLORS = ['#16a34a', '#15803d', '#a3896c', '#14532d'];

export default function ProfitCalculator() {
  const [crop, setCrop] = useState("Wheat");
  const [acres, setAcres] = useState(5);
  const [expPrice, setExpPrice] = useState(2200);

  const data = mockDefaults[crop];
  
  const totalYield = data.yield * acres;
  const revenue = totalYield * expPrice;
  
  const costSeed = data.seed_cost * acres;
  const costFert = data.fert_cost * acres;
  const costLabor = data.labor * acres;
  const totalCost = costSeed + costFert + costLabor;
  
  const profit = revenue - totalCost;
  const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  const chartData = [
    { name: 'Seeds', value: costSeed },
    { name: 'Fertilizer', value: costFert },
    { name: 'Labor', value: costLabor },
    { name: 'Profit', value: profit > 0 ? profit : 0 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-slide-up">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-leaf-800 flex items-center gap-3">
          <Calculator className="w-8 h-8" /> Vyapaar Mode
        </h1>
        <p className="text-earth-600 mt-2">Estimate your Returns on Investment (ROI) before you sow.</p>
      </header>

      <div className="premium-card p-6 mb-8 bg-earth-100/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-semibold text-earth-700 block mb-1">Select Crop</label>
            <select 
              value={crop} onChange={e => setCrop(e.target.value)}
              className="w-full p-2.5 bg-white border border-earth-200 rounded-xl"
            >
              {Object.keys(mockDefaults).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-earth-700 block mb-1">Land Size (Acres)</label>
            <input 
              type="number" min="1" value={acres} onChange={e => setAcres(Number(e.target.value))}
              className="w-full p-2.5 bg-white border border-earth-200 rounded-xl"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-earth-700 block mb-1">Expected Rate (₹/Quintal)</label>
            <input 
              type="number" min="1" value={expPrice} onChange={e => setExpPrice(Number(e.target.value))}
              className="w-full p-2.5 bg-white border border-earth-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projections */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-earth-900">Financial Projection</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-5">
              <p className="text-sm font-medium text-earth-600">Total Cost</p>
              <p className="text-2xl font-bold text-earth-900 mt-1">₹{totalCost.toLocaleString()}</p>
            </div>
            <div className="premium-card p-5">
              <p className="text-sm font-medium text-earth-600">Expected Revenue</p>
              <p className="text-2xl font-bold text-earth-900 mt-1">₹{revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${profit > 0 ? 'bg-leaf-50 border-leaf-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold ${profit > 0 ? 'text-leaf-700' : 'text-red-700'}`}>
                  {profit > 0 ? 'Net Profit' : 'Net Loss'}
                </p>
                <p className={`text-4xl font-black mt-1 ${profit > 0 ? 'text-leaf-800' : 'text-red-800'}`}>
                  ₹{Math.abs(profit).toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-full ${profit > 0 ? 'bg-leaf-200 text-leaf-800' : 'bg-red-200 text-red-800'}`}>
                {profit > 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
              <span className="font-medium opacity-80">Expected ROI</span>
              <span className="text-lg font-bold">{roi.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="premium-card p-6 flex flex-col">
          <h2 className="text-xl font-bold text-earth-900 mb-6">Cost Breakdown</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#a3896c" tick={{ fill: '#735946' }} />
                <YAxis stroke="#a3896c" tick={{ fill: '#735946' }} />
                <Tooltip 
                  cursor={{fill: '#f4eee5'}}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
