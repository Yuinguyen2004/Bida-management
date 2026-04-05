import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { fnbService, type FnbItem } from '../services/fnbService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/management.css';

interface StaffMenuProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  beverage: 'Beverage',
  nuoc: 'Nuoc',
  bia: 'Bia',
  snack: 'Snack',
};

const getCategoryLabel = (category: string) => CATEGORY_LABELS[category.toLowerCase()] ?? category;

export const StaffMenu: React.FC<StaffMenuProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const [items, setItems] = useState<FnbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuItems = await fnbService.getAll();
        setItems(menuItems);
      } catch (error) {
        console.error('Failed to load staff menu:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category.toLowerCase())));
    return ['all', ...uniqueCategories];
  }, [items]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  if (loading) {
    return (
      <MainLayout
        currentPage="staff-menu"
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
        userName={user?.fullName || 'User'}
        userRole={user?.role || 'staff'}
      >
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading service menu...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      currentPage="staff-menu"
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
      userName={user?.fullName || 'User'}
      userRole={user?.role || 'staff'}
    >
      <div className="management-container">
        <div className="management-header">
          <div>
            <h1>Service Menu</h1>
            <p>Browse the live menu before taking orders. Menu setup remains under admin control.</p>
          </div>
          <div className="read-only-note">Read-only menu for staff</div>
        </div>

        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by item name or category..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-chips">
            <span className="filter-chip">Total Items: {items.length}</span>
            <span className="filter-chip">Available: {items.filter((item) => item.isAvailable).length}</span>
          </div>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-chip-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Categories' : getCategoryLabel(category)}
            </button>
          ))}
        </div>

        <div className="data-table staff-menu-table">
          <div className="table-header">
            <div className="header-cell">Item</div>
            <div className="header-cell">Category</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Service Note</div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="table-body">
              {filteredItems.map((item) => (
                <div key={item._id} className="table-row">
                  <div className="cell">
                    <div>
                      <span className="cell-text">{item.name}</span>
                      <div className="cell-subtext">
                        {item.isAvailable ? 'Can be added to an active session' : 'Wait for admin restock/update'}
                      </div>
                    </div>
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
                  <div className="cell">
                    <span className="service-note">
                      {item.isAvailable ? 'Ready to order from table panel' : 'Hidden from new orders'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-text">No menu items found for this filter.</div>
            </div>
          )}
        </div>

        <div className="stats-footer">
          <div className="stat">
            <span className="stat-label">Visible Categories</span>
            <span className="stat-value">{categories.length - 1}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Ready To Serve</span>
            <span className="stat-value">{items.filter((item) => item.isAvailable).length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Unavailable</span>
            <span className="stat-value">{items.filter((item) => !item.isAvailable).length}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StaffMenu;
