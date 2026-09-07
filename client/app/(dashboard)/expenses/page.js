"use client";
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { Receipt, Plus, Search, Trash2, Calendar, Users } from 'lucide-react';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Groceries',
    group: '',
    description: '',
    splitType: 'Equal',
  });
  const [customSplits, setCustomSplits] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Rent', 'Groceries', 'Food', 'Utilities', 'Internet', 'Transport', 'Entertainment', 'Other'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, grpRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/groups')
      ]);
      setExpenses(expRes.data.data || []);
      const grps = grpRes.data.data || [];
      setGroups(grps);
      if (grps.length > 0 && !formData.group) {
        setFormData(prev => ({ ...prev, group: grps[0]._id }));
        setGroupMembers(grps[0].members || []);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGroupSelectForModal = (groupId) => {
    const selected = groups.find(g => g._id === groupId);
    setFormData(prev => ({ ...prev, group: groupId }));
    const members = selected ? selected.members : [];
    setGroupMembers(members);
    const initialSplits = {};
    members.forEach(m => { initialSplits[m._id] = ''; });
    setCustomSplits(initialSplits);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.group) {
      alert('Please select a group');
      return;
    }
    const numAmount = Number(formData.amount);
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      let splitsPayload = [];

      if (formData.splitType === 'Equal') {
        const participants = groupMembers.map(m => m._id);
        const splitAmount = Number((numAmount / participants.length).toFixed(2));
        splitsPayload = participants.map((p, idx) => ({
          user: p,
          amount: idx === 0 ? Number((splitAmount + (numAmount - (splitAmount * participants.length))).toFixed(2)) : splitAmount
        }));
      } else if (formData.splitType === 'Custom Amount') {
        let total = 0;
        splitsPayload = groupMembers.map(m => {
          const amt = Number(customSplits[m._id] || 0);
          total += amt;
          return { user: m._id, amount: amt };
        });
        if (Math.abs(total - numAmount) > 0.05) {
          alert(`Total custom amounts (₹${total.toFixed(2)}) must equal total expense (₹${numAmount.toFixed(2)})`);
          setSubmitting(false);
          return;
        }
      } else if (formData.splitType === 'Percentage') {
        let totalPct = 0;
        splitsPayload = groupMembers.map(m => {
          const pct = Number(customSplits[m._id] || 0);
          totalPct += pct;
          const amt = Number(((numAmount * pct) / 100).toFixed(2));
          return { user: m._id, amount: amt, percentage: pct };
        });
        if (Math.abs(totalPct - 100) > 0.05) {
          alert(`Total percentages (${totalPct}%) must equal 100%`);
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title: formData.title,
        amount: numAmount,
        category: formData.category,
        description: formData.description,
        group: formData.group,
        paidBy: user?._id || user?.id,
        participants: groupMembers.map(m => m._id),
        splitType: formData.splitType,
        splits: splitsPayload
      };

      await api.post('/expenses', payload);
      setShowModal(false);
      setFormData({
        title: '',
        amount: '',
        category: 'Groceries',
        group: groups[0]?._id || '',
        description: '',
        splitType: 'Equal'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesGroup = selectedGroup === 'all' || (exp.group && (exp.group._id === selectedGroup || exp.group === selectedGroup));
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesCategory && matchesSearch;
  });

  const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Receipt className="text-primary" size={32} /> Expenses
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track, filter, and record shared bills across all your student flat groups.
          </p>
        </div>
        <Button onClick={() => {
          if (groups.length === 0) {
            alert('Please create or join a group first.');
            return;
          }
          setShowModal(true);
        }} className="flex items-center gap-2">
          <Plus size={18} /> Add New Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Expenses Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
            <p className="text-xs text-gray-400 mt-1">Under selected filters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Group Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Filtered expenditure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Flat Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-gray-400 mt-1">Expense sharing circles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search expense title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="all">All Groups</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Expense Records</span>
            <span className="text-xs font-normal text-gray-500">
              Showing {filteredExpenses.length} of {expenses.length} expenses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No expenses found.</p>
              <p className="text-gray-400 text-sm mt-1">Try changing filters or add your first group expense.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => {
                const isPayer = exp.paidBy?._id === user?.id || exp.paidBy === user?.id;
                const mySplit = exp.splits?.find(s => (s.user?._id || s.user) === user?.id);

                return (
                  <div
                    key={exp._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors bg-white shadow-sm gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-base text-text">{exp.title}</h4>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded">
                          {exp.category}
                        </span>
                        {exp.group?.name && (
                          <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                            <Users size={12} /> {exp.group.name}
                          </span>
                        )}
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {exp.splitType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>Paid by <strong>{isPayer ? 'You' : exp.paidBy?.name || 'Roommate'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(exp.date).toLocaleDateString()}
                        </span>
                        {mySplit && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">
                              Your share: ₹{mySplit.amount.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-500 italic mt-1">{exp.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xl font-bold text-text">₹{exp.amount.toFixed(2)}</div>
                        <span className="text-xs text-gray-400">Total Bill</span>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Record New Expense</span>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Group</label>
                  <select
                    required
                    value={formData.group}
                    onChange={(e) => handleGroupSelectForModal(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-white"
                  >
                    {groups.map(g => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expense Title</label>
                  <Input
                    required
                    placeholder="e.g. WiFi Bill, Monthly Groceries, Swiggy"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Total Amount (₹)</label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-white"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Split Method</label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-md">
                    {['Equal', 'Custom Amount', 'Percentage'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, splitType: type })}
                        className={`py-1.5 text-xs font-medium rounded transition-all ${
                          formData.splitType === type ? 'bg-white text-primary shadow-sm font-bold' : 'text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.splitType !== 'Equal' && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
                    <p className="text-xs font-medium text-gray-600">
                      Specify {formData.splitType === 'Percentage' ? 'percentage (%)' : 'exact amount (₹)'} per member:
                    </p>
                    {groupMembers.map(m => (
                      <div key={m._id} className="flex items-center justify-between text-xs gap-2">
                        <span className="truncate max-w-[150px] font-medium">{m.name}</span>
                        <div className="flex items-center gap-1 w-32">
                          <input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={customSplits[m._id] || ''}
                            onChange={(e) => setCustomSplits({ ...customSplits, [m._id]: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-right"
                          />
                          <span className="text-gray-500 font-semibold">{formData.splitType === 'Percentage' ? '%' : '₹'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Optional Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Add details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Expense'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
