"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [debts, setDebts] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleData, setSettleData] = useState(null);

  // New Expense state
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Other',
    description: '',
    splitType: 'Equal'
  });

  const fetchData = async () => {
    try {
      const [grpRes, expRes, debtRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/balances/group/${id}/simplify`)
      ]);
      setGroup(grpRes.data.data);
      setExpenses(expRes.data.data);
      setDebts(debtRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      // For simple equal split: all group members participate, logged in user pays
      const payload = {
        ...newExpense,
        amount: Number(newExpense.amount),
        group: id,
        paidBy: JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id, // simple trick to get user ID from token
        participants: group.members.map(m => m._id)
      };
      await api.post('/expenses', payload);
      setShowExpenseModal(false);
      setNewExpense({ title: '', amount: '', category: 'Other', description: '', splitType: 'Equal' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settlements', {
        fromUser: settleData.from._id,
        toUser: settleData.to._id,
        amount: settleData.amount,
        group: id,
        status: 'Completed'
      });
      setShowSettleModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle');
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">{group.name}</h1>
          <p className="text-gray-500">{group.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowMemberModal(true)}>Add Member</Button>
          <Button onClick={() => setShowExpenseModal(true)}>Add Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? <p className="text-gray-500">No expenses yet.</p> : (
                <div className="space-y-4">
                  {expenses.map(exp => (
                    <div key={exp._id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-gray-500">Paid by {exp.paidBy.name} • {new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{exp.amount}</div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{exp.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {group.members.map(m => (
                  <li key={m._id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simplified Debts</CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length === 0 ? <p className="text-gray-500">All settled up!</p> : (
                <div className="space-y-4">
                  {debts.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                      <div>
                        <strong>{d.from.name}</strong> owes <strong>{d.to.name}</strong>
                        <div className="text-danger font-bold">₹{d.amount}</div>
                      </div>
                      <Button size="sm" onClick={() => {
                        setSettleData(d);
                        setShowSettleModal(true);
                      }}>Settle</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader><CardTitle>Add Member</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <Input required type="email" placeholder="User's email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowMemberModal(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader><CardTitle>Add Expense (Equal Split)</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input required value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input required type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                    {['Rent', 'Groceries', 'Food', 'Utilities', 'Internet', 'Transport', 'Entertainment', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
                  <Button type="submit">Add</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showSettleModal && settleData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Confirm Settlement</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-4">Mark as settled: <strong>{settleData.from.name}</strong> paid <strong>{settleData.to.name}</strong> <span className="font-bold text-success">₹{settleData.amount}</span>.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowSettleModal(false)}>Cancel</Button>
                <Button onClick={handleSettle}>Confirm</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
