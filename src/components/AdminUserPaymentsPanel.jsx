import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../api/client';

export default function AdminUserPaymentsPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      const rows = await apiGet('/admin/users');
      setUsers(rows || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(userId, payment_status) {
    try {
      const updated = await apiPatch(
        `/admin/users/${userId}/payment-status`,
        { payment_status }
      );

      setUsers(prev =>
        prev.map(u => (u.id === updated.id ? updated : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <p>Loading users…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Admin: User Payments</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Payment</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.payment_status || 'none'}
                  onChange={e =>
                    updateStatus(user.id, e.target.value)
                  }
                >
                  <option value="none">None</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}