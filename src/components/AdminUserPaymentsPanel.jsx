import React, { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../api/client';

export default function AdminUserPaymentsPanel() {
  const [users, setUsers] = useState([]);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
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

  async function resetPassword() {
    const email = resetEmail.trim();
    const password = resetPasswordValue || '';
    const user = users.find(
      u => String(u.email).toLowerCase() === email.toLowerCase()
    );

    if (!email) {
      alert('Enter the user email first.');
      return;
    }

    if (!user) {
      alert('No user found with that email.');
      return;
    }

    if (password.length < 8) {
      alert('Temporary password must be at least 8 characters.');
      return;
    }

    if (!confirm(`Reset password for ${user.email}?`)) {
      return;
    }

    try {
      await apiPatch(
        `/admin/users/${user.id}/reset-password`,
        { password }
      );

      setResetEmail('');
      setResetPasswordValue('');
      alert(`Password reset for ${user.email}`);
    } catch (err) {
      alert(err.message || 'Failed to reset password');
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

      <div
        style={{
          marginBottom: 18,
          padding: 12,
          border: '1px solid rgba(148,163,184,0.35)',
          borderRadius: 12,
        }}
      >
        <h4 style={{ marginTop: 0 }}>Reset user password</h4>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="User email"
            style={{ minWidth: 260 }}
          />

          <input
            type="text"
            value={resetPasswordValue}
            onChange={e => setResetPasswordValue(e.target.value)}
            placeholder="Temporary password"
            style={{ minWidth: 220 }}
          />

          <button type="button" onClick={resetPassword}>
            Reset Password
          </button>
        </div>

        <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 0 }}>
          Enter the user&apos;s email exactly as shown below, then set a temporary password.
        </p>
      </div>

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