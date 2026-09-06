"use client";
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        setGroups(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text">Welcome back, {user?.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
          </CardContent>
        </Card>
        
        {/* Placeholder for now - could add a dashboard stats endpoint */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 font-medium">You Owe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-danger">₹0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 font-medium">You Are Owed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">₹0</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
        {groups.length === 0 ? (
          <p className="text-gray-500">You are not in any groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <Card key={group._id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{group.description}</p>
                  <p className="text-xs text-gray-400">{group.members.length} members</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
