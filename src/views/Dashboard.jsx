import React, { useState, useEffect } from 'react';
import { CloudRain, IndianRupee, Sprout, Landmark, Plus, Droplets, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

// Mock user for now
const USER_ID = 1;
const API_URL = 'http://localhost:8000/api';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [weather, setWeather] = useState({ temp: 'Loading...', wind: 'Loading...' });
  const [soilTest, setSoilTest] = useState(null);
  
  // Expense Form State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Seeds', amount: 500 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Expenses
      const expRes = await axios.get(`${API_URL}/expenses/${USER_ID}`);
      setExpenses(expRes.data);
      
      // 2. Fetch Weather (Default Delhi)
      const wRes = await axios.get(`${API_URL}/weather?city=Delhi`);
      setWeather(wRes.data);
      
      // 3. Fetch Latest Soil Test
      const soilRes = await axios.get(`${API_URL}/soil-tests/latest/${USER_ID}`);
      setSoilTest(soilRes.data);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/expenses`, {
        user_id: USER_ID,
        category: newExpense.category,
        amount: Number(newExpense.amount),
        date: new Date().toISOString().split('T')[0]
      });
      setShowExpenseForm(false);
      fetchDashboardData(); // Refresh chart
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Group expenses for chart
  const expenseChartData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-leaf-800">Farm Dashboard</h1>
        <p className="text-earth-600 mt-2">Welcome back! Here is your live farm summary.</p>
      </header>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard 
          title="Total Expense" 
          value={`₹${totalExpense.toLocaleString()}`} 
          subtitle="Current Month" 
          icon={IndianRupee} 
        />
        <MetricCard 
          title="Weather (Live)" 
          value={weather.temp} 
          subtitle={weather.wind} 
          icon={CloudRain} 
        />
        <MetricCard 
          title="Soil Health" 
          value={soilTest ? "Tested" : "Pending"} 
          subtitle={soilTest ? `Crop: ${soilTest.crop}` : "Action Needed"} 
          icon={Sprout} 
        />
        <MetricCard 
          title="Govt Scheme" 
          value="PM-Kisan" 
          subtitle="Active" 
          icon={Landmark} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 premium-card p-6">
          <h2 className="text-xl font-bold text-earth-900 mb-6">Financial Tracker</h2>
          {expenseChartData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#a3896c" tick={{ fill: '#735946' }} />
                  <YAxis stroke="#a3896c" tick={{ fill: '#735946' }} />
                  <Tooltip 
                    cursor={{fill: '#f4eee5'}}
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center bg-earth-50 rounded-xl border border-earth-100">
              <p className="text-earth-500">No expenses logged yet. Use the tool on the right.</p>
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <h3 className="font-bold text-lg text-earth-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-leaf-600" />
              Quick Actions
            </h3>
            
            <div className="space-y-4">
              {/* Expense Logger */}
              {showExpenseForm ? (
                <form onSubmit={handleAddExpense} className="bg-earth-50 p-4 rounded-xl border border-earth-200 animate-slide-up">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-earth-700">Category</label>
                      <select 
                        className="w-full mt-1 p-2 bg-white border border-earth-200 rounded-lg text-sm"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      >
                        <option>Seeds</option>
                        <option>Fertilizer</option>
                        <option>Labor</option>
                        <option>Pesticide</option>
                        <option>Fuel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-earth-700">Amount (₹)</label>
                      <input 
                        type="number" 
                        className="w-full mt-1 p-2 bg-white border border-earth-200 rounded-lg text-sm"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 btn-primary text-sm py-1.5">Save</button>
                      <button type="button" onClick={() => setShowExpenseForm(false)} className="px-3 py-1.5 bg-earth-200 text-earth-700 rounded-lg text-sm font-medium hover:bg-earth-300">Cancel</button>
                    </div>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setShowExpenseForm(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-earth-200 hover:border-leaf-300 hover:shadow-sm transition-all group"
                >
                  <span className="font-medium text-earth-800 group-hover:text-leaf-700">Log Expense</span>
                  <Plus className="w-4 h-4 text-earth-400 group-hover:text-leaf-600" />
                </button>
              )}

              {/* Other Actions */}
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-earth-200 hover:border-leaf-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Droplets className="w-4 h-4" /></div>
                  <div className="text-left">
                    <p className="font-medium text-earth-800 group-hover:text-leaf-700">Irrigation</p>
                    <p className="text-xs text-earth-500">Mark field as watered</p>
                  </div>
                </div>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-earth-200 hover:border-leaf-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FlaskConical className="w-4 h-4" /></div>
                  <div className="text-left">
                    <p className="font-medium text-earth-800 group-hover:text-leaf-700">Book Soil Test</p>
                    <p className="text-xs text-earth-500">Request at nearest KVK</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="premium-card p-6 flex flex-col relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 text-earth-100 group-hover:text-leaf-50 transition-colors duration-500 pointer-events-none">
        <Icon className="w-32 h-32 opacity-50 transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-leaf-100 text-leaf-700 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-earth-600">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-earth-900 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-leaf-600 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}
