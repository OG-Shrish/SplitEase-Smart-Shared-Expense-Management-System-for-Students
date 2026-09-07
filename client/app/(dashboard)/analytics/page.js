"use client";
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PieChart as PieIcon, TrendingUp, DollarSign, Calendar, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [loading, setLoading] = useState(true);

  const colors = [
    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const grpRes = await api.get('/groups');
      const grpList = grpRes.data.data || [];
      setGroups(grpList);

      if (selectedGroupId === 'all') {
        const res = await api.get('/analytics');
        setAnalytics(res.data.data);
      } else {
        const [grpAnalytics, monthlyRes] = await Promise.all([
          api.get(`/analytics/group/${selectedGroupId}`),
          api.get(`/analytics/group/${selectedGroupId}/monthly`)
        ]);
        setAnalytics({
          totalSpending: grpAnalytics.data.data?.totalSpending || 0,
          categoryData: grpAnalytics.data.data?.categoryData || [],
          monthlyData: monthlyRes.data.data || [],
          totalExpenses: grpAnalytics.data.data?.categoryData?.reduce((a, c) => a + c.value, 0) || 0
        });
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroupId]);

  const total = analytics?.totalSpending || 0;
  const categories = analytics?.categoryData || [];
  const monthly = analytics?.monthlyData || [];

  const topCategory = categories.length > 0 
    ? [...categories].sort((a, b) => b.value - a.value)[0] 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <PieIcon className="text-primary" size={32} /> Spending Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visual insights, category breakdown, and monthly expenditure trends.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-white shadow-sm"
          >
            <option value="all">All Groups (Overall)</option>
            {groups.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>Total Spending</span>
              <DollarSign size={18} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Total recorded bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>Top Category</span>
              <TrendingUp size={18} className="text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text truncate">
              {topCategory ? topCategory.name : 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {topCategory ? `₹${topCategory.value.toFixed(2)} (${((topCategory.value / (total || 1)) * 100).toFixed(0)}%)` : 'No expenses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>Active Categories</span>
              <Layers size={18} className="text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-gray-400 mt-1">Expenditure sectors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>Timeline Range</span>
              <Calendar size={18} className="text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthly.length || 1} mo</div>
            <p className="text-xs text-gray-400 mt-1">Spending months</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading metrics...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No spending data recorded for this selection.
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat, idx) => {
                  const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0;
                  const color = colors[idx % colors.length];

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          {cat.name}
                        </span>
                        <span className="font-bold text-gray-800">
                          ₹{cat.value.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-gray-500">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading trends...</div>
            ) : monthly.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No monthly data available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {monthly.map((m) => {
                  const maxMonthly = Math.max(...monthly.map(x => x.amount), 1);
                  const pct = ((m.amount / maxMonthly) * 100).toFixed(0);

                  return (
                    <div key={m.month} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{m.month}</span>
                        <span className="font-bold text-primary">₹{m.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-primary/80 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
