import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { fnbService, type FnbItem } from '../services/fnbService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/management.css';

interface FBManagementProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}
// Define category options as a constant array
const CATEGORY_OPTIONS = [
  { value: 'food', label: 'Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'nuoc', label: 'Nuoc' },
  { value: 'bia', label: 'Bia' },
  { value: 'snack', label: 'Snack' },
] as const;

const getCategoryLabel = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  return CATEGORY_OPTIONS.find((option) => option.value === normalizedCategory)?.label ?? category;
};

export const FBManagement: React.FC<FBManagementProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [fbItems, setFbItems] = useState<FnbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FnbItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const items = await fnbService.getAll();
      setFbItems(items);
    } catch (err) {
      console.error('Failed to fetch F&B items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = fbItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: FnbItem) => {
    setEditingId(item._id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      if (isAdding) {
        await fnbService.create({
          name: editData.name || '',
          category: editData.category || 'food',
          price: editData.price || 0,
          isAvailable: editData.isAvailable !== false,
        });
        setIsAdding(false);
      } else {
        await fnbService.update(editingId, editData);
      }
      setEditingId(null);
      setEditData({});
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fnbService.delete(id);
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleAddNew = () => {
    const tempId = 'new-' + Date.now();
    const newItem: FnbItem = {
      _id: tempId,
      name: '',
      category: 'food',
      price: 0,
      isAvailable: true,
    };
    setFbItems([...fbItems, newItem]);
    setEditingId(tempId);
    setEditData(newItem);
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    if (isAdding) {
      setFbItems(fbItems.filter(item => item._id !== editingId));
      setIsAdding(false);
    }
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return (
      <MainLayout currentPage="fb-management" onNavigate={onNavigate} onLogout={onLogout} user={user} userName={user?.fullName || 'User'} userRole={user?.role || 'staff'}>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading menu items...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      currentPage="fb-management"
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
            <h1>Food & Beverage Management</h1>
            <p>Manage your menu items and inventory</p>
          </div>
          <button className="add-btn" onClick={handleAddNew}>
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
            <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
          </div>
        )}

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total Items: {fbItems.length}</span>
            <span className="filter-chip">Available: {fbItems.filter(i => i.isAvailable).length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table">
          <div className="table-header">
            <div className="header-cell">Item Name</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="table-body">
              {filteredItems.map(item => (
                <div key={item._id} className="table-row">
                  {editingId === item._id ? (
                    <>
                      <div className="cell">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="edit-input"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.category || 'food'}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="edit-input"
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.price || 0}
                          onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                          className="edit-input"
                          step="1000"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.isAvailable ? 'available' : 'unavailable'}
                          onChange={(e) => setEditData({ ...editData, isAvailable: e.target.value === 'available' })}
                          className="edit-input"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
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
                        <span className="cell-text">{item.name}</span>
                      </div>
                      <div className="cell">
                        <span className="badge">{getCategoryLabel(item.category)}</span>
                      </div>
                      <div className="cell">
                        <span className="price">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge status-${item.isAvailable ? 'available' : 'unavailable'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">No items found matching your search</div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Total Items</span>
            <span className="stat-value">{fbItems.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <span className="stat-value">{fbItems.filter(i => i.isAvailable).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">{formatCurrency(fbItems.reduce((sum, i) => sum + i.price, 0))}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FBManagement;
