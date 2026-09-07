"use client";
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { Wallet, CheckCircle2, ArrowUpRight, ArrowDownLeft, Users, RefreshCw } from 'lucide-react';

export default function BalancesPage() {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [memberBalances, setMemberBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settlement Modal State
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleItem, setSettleItem] = useState(null);
  const [settling, setSettling] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [balRes, grpRes] = await Promise.all([
        api.get('/balances'),
        api.get('/groups')
      ]);
      setBalanceData(balRes.data.data);
      const grpList = grpRes.data.data || [];
      setGroups(grpList);

      if (grpList.length > 0) {
        const targetId = selectedGroupId === 'all' ? grpList[0]._id : selectedGroupId;
        await fetchGroupDetails(targetId);
      }
    } catch (err) {
      console.error('Failed to fetch balances', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    if (!groupId || groupId === 'all') return;
    try {
      const [simplifyRes, membersRes] = await Promise.all([
        api.get(`/balances/group/${groupId}/simplify`),
        api.get(`/balances/group/${groupId}`)
      ]);
      setSimplifiedDebts(simplifyRes.data.data || []);
      setMemberBalances(membersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch group debts', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId);
    if (groupId !== 'all') {
      fetchGroupDetails(groupId);
    }
  };

  const handleSettleConfirm = async () => {
    if (!settleItem) return;
    try {
      setSettling(true);
      await api.post('/settlements', {
        fromUser: settleItem.from._id,
        toUser: settleItem.to._id,
        amount: settleItem.amount,
        group: selectedGroupId === 'all' ? groups[0]?._id : selectedGroupId,
        status: 'Completed'
      });
      setShowSettleModal(false);
      setSettleItem(null);
      await fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle debt');
    } finally {
      setSettling(false);
    }
  };

  const totalOwe = balanceData?.totalOwe || 0;
  const totalOwed = balanceData?.totalOwed || 0;
  const netBalance = balanceData?.netBalance || (totalOwed - totalOwe);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-2">
            <Wallet className="text-primary" size={32} /> Balances &amp; Settlements
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time net member ledgers and simplified debt settlement transactions.
          </p>
        </div>
        <Button variant="outline" onClick={fetchOverview} className="flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-danger">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>You Owe (Total Dues)</span>
              <ArrowUpRight size={18} className="text-danger" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-danger">₹{totalOwe.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Total pending payments to flatmates</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>You Are Owed</span>
              <ArrowDownLeft size={18} className="text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">₹{totalOwed.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1">Pending dues owed to you</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${netBalance >= 0 ? 'border-primary' : 'border-amber-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
              <span>Net Ledger Position</span>
              <Wallet size={18} className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-amber-600'}`}>
              {netBalance >= 0 ? `+₹${netBalance.toFixed(2)}` : `-₹${Math.abs(netBalance).toFixed(2)}`}
            </div>
            <p className="text-xs text-gray-400 mt-1">Across {groups.length} active flat groups</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <span className="font-semibold text-sm">Select Flat Group to Settle:</span>
          </div>
          <div className="w-full sm:w-72">
            <select
              value={selectedGroupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="all">All Groups Overview</option>
              {groups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Simplified Debts to Settle</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                Greedy Algorithm
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Calculating debts...</div>
            ) : simplifiedDebts.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={40} className="mx-auto text-success mb-2" />
                <p className="font-semibold text-text">All settled up!</p>
                <p className="text-xs text-gray-400 mt-1">No outstanding balances or debts in this group.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {simplifiedDebts.map((debt, index) => {
                  const isDebtor = debt.from?._id === user?.id || debt.from === user?.id;
                  const isCreditor = debt.to?._id === user?.id || debt.to === user?.id;

                  return (
                    <div
                      key={index}
                      className={`p-3.5 rounded-lg border flex justify-between items-center transition-all ${
                        isDebtor
                          ? 'bg-red-50/60 border-red-200'
                          : isCreditor
                          ? 'bg-green-50/60 border-green-200'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-text">
                          <strong className="text-gray-900">{debt.from.name}</strong> owes{' '}
                          <strong className="text-gray-900">{debt.to.name}</strong>
                        </div>
                        <div className="text-lg font-bold text-danger mt-0.5">₹{debt.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {isDebtor ? 'You must pay this amount' : isCreditor ? 'You will receive this amount' : 'Flatmate debt'}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSettleItem(debt);
                          setShowSettleModal(true);
                        }}
                      >
                        Settle Debt
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Net Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading members...</div>
            ) : memberBalances.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No members recorded in this group.
              </div>
            ) : (
              <div className="space-y-3">
                {memberBalances.map((item) => {
                  const isMe = (item.user?._id || item.user) === user?.id;
                  const bal = item.balance;

                  return (
                    <div
                      key={item.user?._id || item.user}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                          {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-text">
                            {item.user?.name} {isMe && <span className="text-xs text-primary font-normal">(You)</span>}
                          </div>
                          <div className="text-xs text-gray-400">{item.user?.email}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-bold text-base ${
                            bal > 0 ? 'text-success' : bal < 0 ? 'text-danger' : 'text-gray-500'
                          }`}
                        >
                          {bal > 0 ? `+₹${bal.toFixed(2)}` : bal < 0 ? `-₹${Math.abs(bal).toFixed(2)}` : '₹0.00'}
                        </div>
                        <span className="text-xs text-gray-400">
                          {bal > 0 ? 'gets back' : bal < 0 ? 'owes' : 'settled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showSettleModal && settleItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-lg">Confirm Settlement</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Record that <strong>{settleItem.from.name}</strong> paid{' '}
                <strong>{settleItem.to.name}</strong> the amount of{' '}
                <span className="font-bold text-success text-base">₹{settleItem.amount.toFixed(2)}</span>.
              </p>
              <div className="p-3 bg-gray-50 rounded text-xs text-gray-500 mb-4">
                This transaction marks the balance as cleared and balances the ledger.
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setShowSettleModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSettleConfirm} disabled={settling}>
                  {settling ? 'Confirming...' : 'Confirm & Settle'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
