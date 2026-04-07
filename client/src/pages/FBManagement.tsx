import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { fnbService, type FnbItem } from '../services/fnbService';
import { fnbCategoryService, type FnbCategory, type FnbCategoryPayload } from '../services/fnbCategoryService';
import { toastService } from '../services/toastService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import { formatCodeLabel } from '../utils/formatCodeLabel';
import '../styles/management.css';

interface FBManagementProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

interface CategoryFormState {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const createEmptyCategoryForm = (sortOrder = 0): CategoryFormState => ({
  code: '',
  name: '',
  description: '',
  isActive: true,
  sortOrder,
});

const mapCategoryToForm = (category: FnbCategory): CategoryFormState => ({
  code: category.code,
  name: category.name,
  description: category.description || '',
  isActive: category.isActive,
  sortOrder: category.sortOrder,
});

export const FBManagement: React.FC<FBManagementProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [fbItems, setFbItems] = useState<FnbItem[]>([]);
  const [categories, setCategories] = useState<FnbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FnbItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryEditData, setCategoryEditData] = useState<CategoryFormState>(createEmptyCategoryForm());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [items, categoryData] = await Promise.all([
        fnbService.getAll(),
        fnbCategoryService.getAll(true),
      ]);
      setFbItems(items);
      setCategories(categoryData);
    } catch (err) {
      console.error('Failed to fetch F&B management data:', err);
      const message = 'Failed to load menu items';
      setError(message);
      toastService.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const categoryLabelMap = useMemo(
    () =>
      categories.reduce<Record<string, string>>((accumulator, category) => {
        accumulator[category.code] = category.name;
        return accumulator;
      }, {}),
    [categories]
  );

  const getCategoryLabel = (categoryCode: string) => categoryLabelMap[categoryCode.toLowerCase()] || formatCodeLabel(categoryCode);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [categories]
  );

  const selectableCategories = useMemo(() => {
    const options = new Map<string, FnbCategory>();

    activeCategories.forEach((category) => {
      options.set(category.code, category);
    });

    if (editData.category) {
      const currentCategory = categories.find((category) => category.code === editData.category);
      options.set(
        editData.category,
        currentCategory || {
          _id: editData.category,
          code: editData.category,
          name: getCategoryLabel(editData.category),
          description: '',
          isActive: false,
          sortOrder: 9999,
        }
      );
    }

    return Array.from(options.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [activeCategories, categories, editData.category]);

  const filteredItems = useMemo(
    () =>
      fbItems.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          getCategoryLabel(item.category).toLowerCase().includes(query)
        );
      }),
    [fbItems, searchQuery, categoryLabelMap]
  );

  const handleEdit = (item: FnbItem) => {
    setError('');
    setEditingId(item._id);
    setEditData({ ...item });
  };

  const handleSave = async () => {
    if (!editingId) {
      return;
    }

    if (!editData.category) {
      const message = 'Category is required';
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      if (isAdding) {
        await fnbService.create({
          name: editData.name || '',
          category: editData.category,
          price: editData.price || 0,
          isAvailable: editData.isAvailable !== false,
          image: editData.image || '',
        });
        setIsAdding(false);
        toastService.success('Item created successfully');
      } else {
        await fnbService.update(editingId, {
          name: editData.name,
          category: editData.category,
          price: editData.price,
          isAvailable: editData.isAvailable,
          image: editData.image,
        });
        toastService.success('Item updated successfully');
      }

      setEditingId(null);
      setEditData({});
      setError('');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save item';
      setError(message);
      toastService.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await fnbService.delete(id);
      setError('');
      toastService.success('Item deleted successfully');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete item';
      setError(message);
      toastService.error(message);
    }
  };

  const handleAddNew = () => {
    if (!activeCategories.length) {
      const message = 'Create at least one active category before adding menu items';
      setError(message);
      toastService.error(message);
      return;
    }

    const tempId = `new-${Date.now()}`;
    const newItem: FnbItem = {
      _id: tempId,
      name: '',
      category: activeCategories[0].code,
      price: 0,
      isAvailable: true,
      image: '',
    };

    setError('');
    setFbItems((current) => [...current, newItem]);
    setEditingId(tempId);
    setEditData(newItem);
    setIsAdding(true);
  };

  const handleCancelEdit = () => {
    if (isAdding) {
      setFbItems((current) => current.filter((item) => item._id !== editingId));
      setIsAdding(false);
    }

    setEditingId(null);
    setEditData({});
  };

  const handleEditCategory = (category: FnbCategory) => {
    setError('');
    setEditingCategoryId(category._id);
    setCategoryEditData(mapCategoryToForm(category));
  };

  const handleSaveCategory = async () => {
    if (!editingCategoryId) {
      return;
    }

    const payload: FnbCategoryPayload = {
      code: categoryEditData.code.trim().toLowerCase(),
      name: categoryEditData.name.trim(),
      description: categoryEditData.description.trim(),
      isActive: categoryEditData.isActive,
      sortOrder: Number(categoryEditData.sortOrder) || 0,
    };

    if (!payload.code || !payload.name) {
      const message = 'Category code and name are required';
      setError(message);
      toastService.error(message);
      return;
    }

    try {
      if (isAddingCategory) {
        await fnbCategoryService.create(payload);
        setIsAddingCategory(false);
        toastService.success('Category created successfully');
      } else {
        await fnbCategoryService.update(editingCategoryId, payload);
        toastService.success('Category updated successfully');
      }

      setEditingCategoryId(null);
      setCategoryEditData(createEmptyCategoryForm());
      setError('');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save category';
      setError(message);
      toastService.error(message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await fnbCategoryService.delete(id);
      setError('');
      toastService.success('Category deleted successfully');
      await loadData();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete category';
      setError(message);
      toastService.error(message);
    }
  };

  const handleAddNewCategory = () => {
    const tempId = `new-category-${Date.now()}`;
    const nextSortOrder = Math.max(...categories.map((category) => category.sortOrder || 0), 0) + 1;
    const newCategory: FnbCategory = {
      _id: tempId,
      code: '',
      name: '',
      description: '',
      isActive: true,
      sortOrder: nextSortOrder,
    };

    setError('');
    setCategories((current) => [...current, newCategory]);
    setEditingCategoryId(tempId);
    setCategoryEditData(createEmptyCategoryForm(nextSortOrder));
    setIsAddingCategory(true);
  };

  const handleCancelCategoryEdit = () => {
    if (isAddingCategory) {
      setCategories((current) => current.filter((category) => category._id !== editingCategoryId));
      setIsAddingCategory(false);
    }

    setEditingCategoryId(null);
    setCategoryEditData(createEmptyCategoryForm());
  };

  if (loading) {
    return (
      <MainLayout
        currentPage="fb-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
        userName={user?.fullName || 'User'}
        userRole={user?.role || 'staff'}
      >
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
      <div className="management-container management-stack">
        <section className="management-section">
          <div className="management-header">
            <div>
              <h1>Food & Beverage Management</h1>
              <p>Manage your menu items and the category catalog used across ordering flows.</p>
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

          <div className="search-section">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name, category, or label..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-chips">
              <span className="filter-chip">Total Items: {fbItems.length}</span>
              <span className="filter-chip">Available: {fbItems.filter((item) => item.isAvailable).length}</span>
              <span className="filter-chip">Active Categories: {activeCategories.length}</span>
            </div>
          </div>

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
                {filteredItems.map((item) => (
                  <div key={item._id} className="table-row">
                    {editingId === item._id ? (
                      <>
                        <div className="cell">
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                            className="edit-input"
                            placeholder="Item name"
                          />
                        </div>
                        <div className="cell">
                          <select
                            value={editData.category || ''}
                            onChange={(event) => setEditData({ ...editData, category: event.target.value })}
                            className="edit-input"
                          >
                            {selectableCategories.map((category) => (
                              <option key={category.code} value={category.code}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="cell">
                          <input
                            type="number"
                            value={editData.price || 0}
                            onChange={(event) => setEditData({ ...editData, price: parseFloat(event.target.value) || 0 })}
                            className="edit-input"
                            step="1000"
                          />
                        </div>
                        <div className="cell">
                          <select
                            value={editData.isAvailable ? 'available' : 'unavailable'}
                            onChange={(event) => setEditData({ ...editData, isAvailable: event.target.value === 'available' })}
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
                          <div>
                            <span className="badge">{item.categoryLabel || getCategoryLabel(item.category)}</span>
                            <div className="cell-subtext">{item.category}</div>
                          </div>
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
                <div className="empty-text">No items found matching your search.</div>
              </div>
            )}
          </div>

          <div className="stats-footer">
            <div className="stat">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{fbItems.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Available</span>
              <span className="stat-value">{fbItems.filter((item) => item.isAvailable).length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Value</span>
              <span className="stat-value">{formatCurrency(fbItems.reduce((sum, item) => sum + item.price, 0))}</span>
            </div>
          </div>
        </section>

        <section className="management-section">
          <div className="management-section__header">
            <div>
              <h2>F&B Categories</h2>
              <p>CRUD the category master data that menu items and staff filters rely on.</p>
            </div>
            <button className="add-btn" onClick={handleAddNewCategory}>
              <Plus size={20} />
              Add Category
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

            {categories.length > 0 ? (
              <div className="table-body">
                {categories
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                  .map((category) => (
                    <div key={category._id} className="table-row">
                      {editingCategoryId === category._id ? (
                        <>
                          <div className="cell">
                            <input
                              type="text"
                              value={categoryEditData.name}
                              onChange={(event) => setCategoryEditData({ ...categoryEditData, name: event.target.value })}
                              className="edit-input"
                              placeholder="Category name"
                            />
                          </div>
                          <div className="cell">
                            <input
                              type="text"
                              value={categoryEditData.code}
                              onChange={(event) => setCategoryEditData({ ...categoryEditData, code: event.target.value })}
                              className="edit-input"
                              placeholder="category-code"
                            />
                          </div>
                          <div className="cell">
                            <input
                              type="number"
                              value={categoryEditData.sortOrder}
                              onChange={(event) =>
                                setCategoryEditData({ ...categoryEditData, sortOrder: parseInt(event.target.value, 10) || 0 })
                              }
                              className="edit-input"
                              min="0"
                            />
                          </div>
                          <div className="cell">
                            <select
                              value={categoryEditData.isActive ? 'active' : 'inactive'}
                              onChange={(event) =>
                                setCategoryEditData({ ...categoryEditData, isActive: event.target.value === 'active' })
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
                              value={categoryEditData.description}
                              onChange={(event) => setCategoryEditData({ ...categoryEditData, description: event.target.value })}
                              className="edit-input"
                              placeholder="Optional description"
                            />
                          </div>
                          <div className="cell actions">
                            <button className="action-save" onClick={handleSaveCategory}>Save</button>
                            <button className="action-cancel" onClick={handleCancelCategoryEdit}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="cell">
                            <span className="cell-text">{category.name}</span>
                          </div>
                          <div className="cell">
                            <span className="badge">{category.code}</span>
                          </div>
                          <div className="cell">
                            <span className="cell-text">{category.sortOrder}</span>
                          </div>
                          <div className="cell">
                            <span className={`status-badge status-${category.isActive ? 'available' : 'unavailable'}`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="cell">
                            <span className="cell-text">{category.description || 'No description'}</span>
                          </div>
                          <div className="cell actions">
                            <button
                              className="action-btn edit"
                              title="Edit category"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete category"
                              onClick={() => handleDeleteCategory(category._id)}
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
                <div className="empty-text">No categories configured yet.</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default FBManagement;
