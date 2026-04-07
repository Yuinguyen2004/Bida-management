import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { tableService, type Table } from '../services/tableService';
import { tableTypeService, type TableType, type TableTypePayload } from '../services/tableTypeService';
import { toastService } from '../services/toastService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import { formatCodeLabel } from '../utils/formatCodeLabel';
import '../styles/management.css';

interface TableManagementProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

interface TableTypeFormState {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const createEmptyTypeForm = (sortOrder = 0): TableTypeFormState => ({
  code: '',
  name: '',
  description: '',
  isActive: true,
  sortOrder,
});

const mapTypeToForm = (type: TableType): TableTypeFormState => ({
  code: type.code,
  name: type.name,
  description: type.description || '',
  isActive: type.isActive,
  sortOrder: type.sortOrder,
});

export const TableManagement: React.FC<TableManagementProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Table>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeEditData, setTypeEditData] = useState<TableTypeFormState>(createEmptyTypeForm());
  const [isAddingType, setIsAddingType] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [tableData, typeData] = await Promise.all([
        tableService.getAll(),
        tableTypeService.getAll(true),
      ]);
      setTables(tableData);
      setTableTypes(typeData);
    } catch (err) {
      console.error('Failed to fetch table management data:', err);
      const message = 'Failed to load table management data';
      setError(message);
      toastService.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const tableTypeLabelMap = useMemo(
    () =>
      tableTypes.reduce<Record<string, string>>((accumulator, type) => {
        accumulator[type.code] = type.name;
        return accumulator;
      }, {}),
    [tableTypes]
  );

  const getTableTypeLabel = (typeCode: string) => tableTypeLabelMap[typeCode.toLowerCase()] || formatCodeLabel(typeCode);

  const activeTableTypes = useMemo(
    () => tableTypes.filter((type) => type.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [tableTypes]
  );

  const selectableTableTypes = useMemo(() => {
    const options = new Map<string, TableType>();

    activeTableTypes.forEach((type) => {
      options.set(type.code, type);
    });

    if (editData.type) {
      const currentType = tableTypes.find((type) => type.code === editData.type);
      options.set(
        editData.type,
        currentType || {
          _id: editData.type,
          code: editData.type,
          name: getTableTypeLabel(editData.type),
          description: '',
          isActive: false,
          sortOrder: 9999,
        }
      );
    }

    return Array.from(options.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [activeTableTypes, editData.type, tableTypes]);

  const filteredTables = useMemo(
    () =>
      tables
        .filter((table) => {
          const query = searchQuery.toLowerCase();
          return (
            table.name.toLowerCase().includes(query) ||
            table.type.toLowerCase().includes(query) ||
            getTableTypeLabel(table.type).toLowerCase().includes(query)
          );
        })
        .sort((a, b) => (a.tableNumber || 0) - (b.tableNumber || 0)),
    [tables, searchQuery, tableTypeLabelMap]
  );

  const handleEdit = (table: Table) => {
    setError('');
    setEditingId(table._id);
    setEditData({ ...table });
  };

  const handleSave = async () => {
    if (!editingId) {
      return;
    }

    if (!editData.tableNumber) {
      const message = 'Table number is required';
      setError(message);
      toastService.error(message);
      return;
    }

    if (!editData.type) {
      const message = 'Table type is required';
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      const editingTable = tables.find((table) => table._id === editingId);
      const isPlayingTable = editingTable?.status === 'playing';
      const positionPayload = {
        row: editData.position?.row ?? 0,
        col: editData.position?.col ?? 0,
      };

      if (isAdding) {
        await tableService.create({
          tableNumber: editData.tableNumber,
          name: editData.name || '',
          type: editData.type,
          pricePerHour: editData.pricePerHour || 0,
          status: 'available',
          position: positionPayload,
        });
        setIsAdding(false);
        toastService.success('Table created successfully');
      } else {
        const updatePayload: Partial<Table> = {
          tableNumber: editData.tableNumber,
          name: editData.name,
          type: editData.type,
          pricePerHour: editData.pricePerHour,
          position: positionPayload,
        };

        if (!isPlayingTable) {
          updatePayload.status = editData.status;
        }

        await tableService.update(editingId, updatePayload);
        toastService.success('Table updated successfully');
      }

      setEditingId(null);
      setEditData({});
      setError('');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save table';
      setError(message);
      toastService.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    const table = tables.find((item) => item._id === id);
    if (table?.status === 'playing') {
      const message = 'Complete the active session before deleting this table';
      setError(message);
      toastService.error(message);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      await tableService.delete(id);
      setError('');
      toastService.success('Table deleted successfully');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete table';
      setError(message);
      toastService.error(message);
    }
  };

  const handleAddNew = () => {
    if (!activeTableTypes.length) {
      const message = 'Create at least one active table type before adding tables';
      setError(message);
      toastService.error(message);
      return;
    }

    const tempId = `new-${Date.now()}`;
    const nextTableNumber = Math.max(...tables.map((table) => table.tableNumber || 0), 0) + 1;
    const newTable: Table = {
      _id: tempId,
      tableNumber: nextTableNumber,
      name: '',
      type: activeTableTypes[0].code,
      pricePerHour: 0,
      status: 'available',
      position: { row: 0, col: 0 },
    };

    setError('');
    setTables((current) => [...current, newTable]);
    setEditingId(tempId);
    setEditData(newTable);
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    if (isAdding) {
      setTables((current) => current.filter((table) => table._id !== editingId));
      setIsAdding(false);
    }

    setEditingId(null);
    setEditData({});
  };

  const handleEditType = (tableType: TableType) => {
    setError('');
    setEditingTypeId(tableType._id);
    setTypeEditData(mapTypeToForm(tableType));
  };

  const handleSaveType = async () => {
    if (!editingTypeId) {
      return;
    }

    const payload: TableTypePayload = {
      code: typeEditData.code.trim().toLowerCase(),
      name: typeEditData.name.trim(),
      description: typeEditData.description.trim(),
      isActive: typeEditData.isActive,
      sortOrder: Number(typeEditData.sortOrder) || 0,
    };

    if (!payload.code || !payload.name) {
      const message = 'Type code and name are required';
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      if (isAddingType) {
        await tableTypeService.create(payload);
        setIsAddingType(false);
        toastService.success('Table type created successfully');
      } else {
        await tableTypeService.update(editingTypeId, payload);
        toastService.success('Table type updated successfully');
      }

      setEditingTypeId(null);
      setTypeEditData(createEmptyTypeForm());
      setError('');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save table type';
      setError(message);
      toastService.error(message);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this table type?')) {
      return;
    }

    try {
      await tableTypeService.delete(id);
      setError('');
      toastService.success('Table type deleted successfully');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete table type';
      setError(message);
      toastService.error(message);
    }
  };

  const handleAddNewType = () => {
    const tempId = `new-type-${Date.now()}`;
    const nextSortOrder = Math.max(...tableTypes.map((type) => type.sortOrder || 0), 0) + 1;
    const newType: TableType = {
      _id: tempId,
      code: '',
      name: '',
      description: '',
      isActive: true,
      sortOrder: nextSortOrder,
    };

    setError('');
    setTableTypes((current) => [...current, newType]);
    setEditingTypeId(tempId);
    setTypeEditData(createEmptyTypeForm(nextSortOrder));
    setIsAddingType(true);
  };

  const handleCancelTypeEdit = () => {
    if (isAddingType) {
      setTableTypes((current) => current.filter((type) => type._id !== editingTypeId));
      setIsAddingType(false);
    }

    setEditingTypeId(null);
    setTypeEditData(createEmptyTypeForm());
  };

  if (loading) {
    return (
      <MainLayout
        currentPage="table-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
        userName={user?.fullName || 'User'}
        userRole={user?.role || 'staff'}
      >
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
      <div className="management-container management-stack">
        <section className="management-section">
          <div className="management-header">
            <div>
              <h1>Billiard Table Management</h1>
              <p>Manage your tables, pricing, and the type catalog that powers the floor setup.</p>
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

          <div className="search-section">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, type, or label..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-chips">
              <span className="filter-chip">Total: {tables.length}</span>
              <span className="filter-chip">Available: {tables.filter((table) => table.status === 'available').length}</span>
              <span className="filter-chip">Active Types: {activeTableTypes.length}</span>
            </div>
          </div>

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
                {filteredTables.map((table) => (
                  <div key={table._id} className="table-row table-row--with-pos">
                    {editingId === table._id ? (
                      <>
                        <div className="cell">
                          <input
                            type="number"
                            value={editData.tableNumber || ''}
                            onChange={(event) => setEditData({ ...editData, tableNumber: parseInt(event.target.value, 10) || 0 })}
                            className="edit-input"
                            placeholder="Table #"
                            min="1"
                          />
                        </div>
                        <div className="cell">
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                            className="edit-input"
                            placeholder="Table name"
                          />
                        </div>
                        <div className="cell">
                          <select
                            value={editData.type || ''}
                            onChange={(event) => setEditData({ ...editData, type: event.target.value })}
                            className="edit-input"
                          >
                            {selectableTableTypes.map((type) => (
                              <option key={type.code} value={type.code}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="cell">
                          <input
                            type="number"
                            value={editData.pricePerHour || 0}
                            onChange={(event) => setEditData({ ...editData, pricePerHour: parseFloat(event.target.value) || 0 })}
                            className="edit-input"
                            step="5000"
                          />
                        </div>
                        <div className="cell">
                          <input
                            type="number"
                            value={editData.position?.row ?? 0}
                            onChange={(event) =>
                              setEditData({
                                ...editData,
                                position: { ...editData.position, row: parseInt(event.target.value, 10) || 0 },
                              })
                            }
                            className="edit-input"
                            min="0"
                          />
                        </div>
                        <div className="cell">
                          <input
                            type="number"
                            value={editData.position?.col ?? 0}
                            onChange={(event) =>
                              setEditData({
                                ...editData,
                                position: { ...editData.position, col: parseInt(event.target.value, 10) || 0 },
                              })
                            }
                            className="edit-input"
                            min="0"
                          />
                        </div>
                        <div className="cell">
                          {table.status === 'playing' ? (
                            <div>
                              <span className="status-badge status-playing">In Use</span>
                              <div className="cell-subtext">Status locks until checkout</div>
                            </div>
                          ) : (
                            <select
                              value={editData.status || 'available'}
                              onChange={(event) => setEditData({ ...editData, status: event.target.value as Table['status'] })}
                              className="edit-input"
                            >
                              <option value="available">Available</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          )}
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
                          <div>
                            <span className="badge">{table.typeLabel || getTableTypeLabel(table.type)}</span>
                            <div className="cell-subtext">{table.type}</div>
                          </div>
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
                            title={table.status === 'playing' ? 'Complete session before deleting' : 'Delete'}
                            onClick={() => handleDelete(table._id)}
                            disabled={table.status === 'playing'}
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
                <div className="empty-text">No tables found matching your search.</div>
              </div>
            )}
          </div>

          <div className="stats-footer">
            <div className="stat">
              <span className="stat-label">Total Tables</span>
              <span className="stat-value">{tables.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Available</span>
              <span className="stat-value">{tables.filter((table) => table.status === 'available').length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">In Use</span>
              <span className="stat-value">{tables.filter((table) => table.status === 'playing').length}</span>
            </div>
          </div>
        </section>

        <section className="management-section">
          <div className="management-section__header">
            <div>
              <h2>Table Types</h2>
              <p>CRUD the master list that admins can assign to each billiard table.</p>
            </div>
            <button className="add-btn" onClick={handleAddNewType}>
              <Plus size={20} />
              Add Type
            </button>
          </div>

          <div className="data-table master-data-table">
            <div className="table-header">
              <div className="header-cell">Name</div>
              <div className="header-cell">Code</div>
              <div className="header-cell">Order</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Description</div>
              <div className="header-cell">Actions</div>
            </div>

            {tableTypes.length > 0 ? (
              <div className="table-body">
                {tableTypes
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                  .map((tableType) => (
                    <div key={tableType._id} className="table-row">
                      {editingTypeId === tableType._id ? (
                        <>
                          <div className="cell">
                            <input
                              type="text"
                              value={typeEditData.name}
                              onChange={(event) => setTypeEditData({ ...typeEditData, name: event.target.value })}
                              className="edit-input"
                              placeholder="Type name"
                            />
                          </div>
                          <div className="cell">
                            <input
                              type="text"
                              value={typeEditData.code}
                              onChange={(event) => setTypeEditData({ ...typeEditData, code: event.target.value })}
                              className="edit-input"
                              placeholder="type-code"
                            />
                          </div>
                          <div className="cell">
                            <input
                              type="number"
                              value={typeEditData.sortOrder}
                              onChange={(event) =>
                                setTypeEditData({ ...typeEditData, sortOrder: parseInt(event.target.value, 10) || 0 })
                              }
                              className="edit-input"
                              min="0"
                            />
                          </div>
                          <div className="cell">
                            <select
                              value={typeEditData.isActive ? 'active' : 'inactive'}
                              onChange={(event) =>
                                setTypeEditData({ ...typeEditData, isActive: event.target.value === 'active' })
                              }
                              className="edit-input"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                          <div className="cell">
                            <input
                              type="text"
                              value={typeEditData.description}
                              onChange={(event) => setTypeEditData({ ...typeEditData, description: event.target.value })}
                              className="edit-input"
                              placeholder="Optional description"
                            />
                          </div>
                          <div className="cell actions">
                            <button className="action-save" onClick={handleSaveType}>Save</button>
                            <button className="action-cancel" onClick={handleCancelTypeEdit}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="cell">
                            <span className="cell-text">{tableType.name}</span>
                          </div>
                          <div className="cell">
                            <span className="badge">{tableType.code}</span>
                          </div>
                          <div className="cell">
                            <span className="cell-text">{tableType.sortOrder}</span>
                          </div>
                          <div className="cell">
                            <span className={`status-badge status-${tableType.isActive ? 'available' : 'unavailable'}`}>
                              {tableType.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="cell">
                            <span className="cell-text">{tableType.description || 'No description'}</span>
                          </div>
                          <div className="cell actions">
                            <button
                              className="action-btn edit"
                              title="Edit type"
                              onClick={() => handleEditType(tableType)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete type"
                              onClick={() => handleDeleteType(tableType._id)}
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
                <div className="empty-text">No table types configured yet.</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default TableManagement;
