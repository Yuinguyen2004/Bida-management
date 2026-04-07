import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { tableService, type Table } from '../services/tableService';
import { toastService } from '../services/toastService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/management.css';

interface TableManagementProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

const TABLE_TYPE_OPTIONS = [
  { value: 'pool', label: 'Pool' },
  { value: 'carom', label: 'Carom' },
  { value: 'lo', label: 'Lo' },
] as const;

const getTableTypeLabel = (type: string) => {
  const normalizedType = type.toLowerCase();
  return TABLE_TYPE_OPTIONS.find((option) => option.value === normalizedType)?.label ?? type;
};

export const TableManagement: React.FC<TableManagementProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Table>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchTables = async () => {
    try {
      const data = await tableService.getAll();
      setTables(data);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = tables
    .filter(table =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.tableNumber || 0) - (b.tableNumber || 0));

  const handleEdit = (table: Table) => {
    setEditingId(table._id);
    setEditData({ ...table });
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (!editData.tableNumber) {
      setError('Table Number is required');
      return;
    }
    try {
      const positionPayload = {
        row: editData.position?.row ?? 0,
        col: editData.position?.col ?? 0,
      };
      if (isAdding) {
        await tableService.create({
          tableNumber: editData.tableNumber,
          name: editData.name || '',
          type: editData.type || 'pool',
          pricePerHour: editData.pricePerHour || 0,
          status: 'available',
          position: positionPayload,
        });
        setIsAdding(false);
        toastService.success('Table created successfully');
      } else {
        await tableService.update(editingId, {
          tableNumber: editData.tableNumber,
          name: editData.name,
          type: editData.type,
          pricePerHour: editData.pricePerHour,
          status: editData.status,
          position: positionPayload,
        });
        toastService.success('Table updated successfully');
      }
      setEditingId(null);
      setEditData({});
      await fetchTables();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save table';
      setError(message);
      toastService.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await tableService.delete(id);
      toastService.success('Table deleted successfully');
      await fetchTables();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete table';
      setError(message);
      toastService.error(message);
    }
  };

  const handleAddNew = () => {
    const tempId = 'new-' + Date.now();
    const nextTableNumber = Math.max(...tables.map(t => t.tableNumber || 0), 0) + 1;
    const newTable: Table = {
      _id: tempId,
      tableNumber: nextTableNumber,
      name: '',
      type: 'pool',
      pricePerHour: 0,
      status: 'available',
    };
    setTables([...tables, newTable]);
    setEditingId(tempId);
    setEditData(newTable);
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    if (isAdding) {
      setTables(tables.filter(t => t._id !== editingId));
      setIsAdding(false);
    }
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return (
      <MainLayout currentPage="table-management" onNavigate={onNavigate} onLogout={onLogout} user={user} userName={user?.fullName || 'User'} userRole={user?.role || 'staff'}>
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading tables...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      currentPage="table-management"
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
            <h1>Billiard Table Management</h1>
            <p>Manage your tables and pricing</p>
          </div>
          <button className="add-btn" onClick={handleAddNew}>
            <Plus size={20} />
            Add Table
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
              placeholder="Search by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total: {tables.length}</span>
            <span className="filter-chip">Available: {tables.filter(t => t.status === 'available').length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table">
          <div className="table-header table-header--with-pos">
            <div className="header-cell">Table #</div>
            <div className="header-cell">Table Name</div>
            <div className="header-cell">Type</div>
            <div className="header-cell">Price/Hour</div>
            <div className="header-cell">Row</div>
            <div className="header-cell">Col</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {filteredTables.length > 0 ? (
            <div className="table-body">
              {filteredTables.map(table => (
                <div key={table._id} className="table-row table-row--with-pos">
                  {editingId === table._id ? (
                    <>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.tableNumber || ''}
                          onChange={(e) => setEditData({ ...editData, tableNumber: parseInt(e.target.value) || 0 })}
                          className="edit-input"
                          placeholder="Table #"
                          min="1"
                        />
                      </div>
                      <div className="cell">
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="edit-input"
                          placeholder="Table name"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.type || 'pool'}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          className="edit-input"
                        >
                          {TABLE_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.pricePerHour || 0}
                          onChange={(e) => setEditData({ ...editData, pricePerHour: parseFloat(e.target.value) })}
                          className="edit-input"
                          step="5000"
                        />
                      </div>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.position?.row ?? 0}
                          onChange={(e) => setEditData({ ...editData, position: { ...editData.position, row: parseInt(e.target.value) || 0 } })}
                          className="edit-input"
                          placeholder="Row"
                          min="0"
                        />
                      </div>
                      <div className="cell">
                        <input
                          type="number"
                          value={editData.position?.col ?? 0}
                          onChange={(e) => setEditData({ ...editData, position: { ...editData.position, col: parseInt(e.target.value) || 0 } })}
                          className="edit-input"
                          placeholder="Col"
                          min="0"
                        />
                      </div>
                      <div className="cell">
                        <select
                          value={editData.status || 'available'}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value as Table['status'] })}
                          className="edit-input"
                        >
                          <option value="available">Available</option>
                          <option value="maintenance">Maintenance</option>
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
                        <span className="cell-text" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>#{table.tableNumber}</span>
                      </div>
                      <div className="cell">
                        <span className="cell-text">{table.name}</span>
                      </div>
                      <div className="cell">
                        <span className="badge">{getTableTypeLabel(table.type)}</span>
                      </div>
                      <div className="cell">
                        <span className="price">{formatCurrency(table.pricePerHour)}</span>
                      </div>
                      <div className="cell">
                        <span className="cell-text">{table.position?.row ?? 0}</span>
                      </div>
                      <div className="cell">
                        <span className="cell-text">{table.position?.col ?? 0}</span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge status-${table.status}`}>
                          {table.status === 'available' ? 'Available' : table.status === 'playing' ? 'In Use' : 'Maintenance'}
                        </span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="action-btn edit"
                          title="Edit"
                          onClick={() => handleEdit(table)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => handleDelete(table._id)}
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
              <div className="empty-text">No tables found matching your search</div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Total Tables</span>
            <span className="stat-value">{tables.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <span className="stat-value">{tables.filter(t => t.status === 'available').length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">In Use</span>
            <span className="stat-value">{tables.filter(t => t.status === 'playing').length}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TableManagement;
