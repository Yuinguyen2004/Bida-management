import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserPlus, Star } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { customerService, type Customer } from '../services/customerService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/management.css';

interface CustomerManagementProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

const TIER_OPTIONS = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'platinum', label: 'Platinum' },
] as const;

const getTierClass = (tier: string) => {
  switch (tier) {
    case 'platinum': return 'tier-platinum';
    case 'gold': return 'tier-gold';
    case 'silver': return 'tier-silver';
    default: return 'tier-bronze';
  }
};

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleEdit = (customer: Customer) => {
    setEditingId(customer._id);
    setEditData({ ...customer });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      if (isAdding) {
        await customerService.create({
          name: editData.name || '',
          phone: editData.phone || '',
          email: editData.email || '',
          membershipTier: editData.membershipTier || 'bronze',
          notes: editData.notes || '',
        });
        setIsAdding(false);
      } else {
        await customerService.update(editingId, {
          name: editData.name,
          phone: editData.phone,
          email: editData.email,
          membershipTier: editData.membershipTier,
          notes: editData.notes,
          isActive: editData.isActive,
        });
      }
      setEditingId(null);
      setEditData({});
      await fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerService.delete(id);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleAddNew = () => {
    const tempId = 'new-' + Date.now();
    const newCustomer: Customer = {
      _id: tempId,
      name: '',
      phone: '',
      email: '',
      membershipTier: 'bronze',
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      notes: '',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    setCustomers([...customers, newCustomer]);
    setEditingId(tempId);
    setEditData(newCustomer);
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    if (isAdding) {
      setCustomers(customers.filter(c => c._id !== editingId));
      setIsAdding(false);
    }
    setEditingId(null);
    setEditData({});
  };

  const handleRecordVisit = async (id: string) => {
    try {
      await customerService.recordVisit(id);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record visit');
    }
  };

  const handleAddPoints = async (id: string) => {
    const input = prompt('Enter points to add:');
    if (!input) return;
    const points = parseInt(input, 10);
    if (isNaN(points) || points <= 0) {
      setError('Points must be a positive number');
      return;
    }
    try {
      await customerService.addPoints(id, points);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add points');
    }
  };

  const activeCount = customers.filter(c => c.isActive).length;
  const tierCounts = customers.reduce(
    (acc, c) => {
      acc[c.membershipTier] = (acc[c.membershipTier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading) {
    return (
      <MainLayout currentPage="customers" onNavigate={onNavigate} onLogout={onLogout} user={user} userName={user?.fullName || 'User'} userRole={user?.role || 'staff'}>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading customers...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      currentPage="customers"
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
      userName={user?.fullName || 'User'}
      userRole={user?.role || 'staff'}
    >
      <div className="management-container">
        {/* Header */}
        <div className="management-header">
          <div>
            <h1>Customer CRM</h1>
            <p>Manage customers, memberships, and loyalty points</p>
          </div>
          {isAdmin ? (
            <button className="add-btn" onClick={handleAddNew}>
              <Plus size={20} />
              Add Customer
            </button>
          ) : (
            <span className="read-only-note">Staff View -- Record visits &amp; add points</span>
          )}
        </div>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
            <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
          </div>
        )}

        {/* Search */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total: {customers.length}</span>
            <span className="filter-chip">Active: {activeCount}</span>
          </div>
        </div>

        {/* Table */}
        <div className="data-table crm-table">
          <div className="table-header">
            <div className="header-cell">Name</div>
            <div className="header-cell">Phone</div>
            <div className="header-cell">Tier</div>
            <div className="header-cell">Points</div>
            <div className="header-cell">Visits</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="table-body">
              {filteredCustomers.map(customer => (
                <div key={customer._id} className="table-row">
                  {editingId === customer._id ? (
                    <>
                      <div className="cell">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="edit-input"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="cell">
                        <input
                          type="text"
                          value={editData.phone || ''}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="edit-input"
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.membershipTier || 'bronze'}
                          onChange={(e) => setEditData({ ...editData, membershipTier: e.target.value as Customer['membershipTier'] })}
                          className="edit-input"
                        >
                          {TIER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="cell">
                        <span className="price">{customer.points}</span>
                      </div>
                      <div className="cell">
                        <span>{customer.visitCount}</span>
                      </div>
                      <div className="cell">
                        <select
                          value={editData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'active' })}
                          className="edit-input"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="cell actions">
                        <button className="action-save" onClick={handleSave}>Save</button>
                        <button className="action-cancel" onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="cell">
                        <div>
                          <span className="cell-text">{customer.name}</span>
                          {customer.email && (
                            <div className="cell-subtext">{customer.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="cell">
                        <span className="cell-text">{customer.phone}</span>
                      </div>
                      <div className="cell">
                        <span className={`badge ${getTierClass(customer.membershipTier)}`}>
                          {customer.membershipTier}
                        </span>
                      </div>
                      <div className="cell">
                        <span className="price">{customer.points.toLocaleString()}</span>
                      </div>
                      <div className="cell">
                        <span>{customer.visitCount}</span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge status-${customer.isActive ? 'available' : 'unavailable'}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="action-btn visit"
                          title="Record Visit"
                          onClick={() => handleRecordVisit(customer._id)}
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          className="action-btn points"
                          title="Add Points"
                          onClick={() => handleAddPoints(customer._id)}
                        >
                          <Star size={16} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              className="action-btn edit"
                              title="Edit"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => handleDelete(customer._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">&#x1F50D;</div>
              <div className="empty-text">No customers found matching your search</div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Total Customers</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Active</span>
            <span className="stat-value">{activeCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Gold+</span>
            <span className="stat-value">{(tierCounts.gold || 0) + (tierCounts.platinum || 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">{formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomerManagement;
