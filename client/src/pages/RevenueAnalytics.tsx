import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { revenueService, type MonthlyRevenue, type RevenueSummary } from '../services/revenueService';
import type { User } from '../services/authService';
import type { AppPage } from '../utils/navigation';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/analytics.css';

interface RevenueAnalyticsProps {
  onNavigate?: (page: AppPage) => void;
  onLogout?: () => void;
  user?: User | null;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  onNavigate = () => {},
  onLogout = () => {},
  user,
}) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthly, setMonthly] = useState<MonthlyRevenue | null>(null);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [monthlyData, summaryData] = await Promise.all([
        revenueService.getMonthly(month, year),
        revenueService.getSummary(),
      ]);
      setMonthly(monthlyData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const chartData = monthly?.dailyBreakdown.map(d => ({
    date: `Day ${d.day}`,
    revenue: d.revenue,
    sessions: d.sessionCount,
  })) || [];

  const topTablesData = summary?.topTables.map(t => ({
    name: t.name,
    usageCount: t.usageCount,
    revenue: t.totalRevenue,
  })) || [];

  const topFnbData = summary?.topFnb.map(f => ({
    name: f.name,
    orders: f.totalQuantity,
    revenue: f.totalRevenue,
  })) || [];

  const stats = [
    { label: 'Monthly Revenue', value: formatCurrency(monthly?.totalRevenue || 0), change: `${monthly?.sessionCount || 0} sessions`, icon: '💰' },
    { label: 'Table Revenue', value: formatCurrency(monthly?.totalTableCost || 0), change: 'Tables', icon: '🎱' },
    { label: 'F&B Revenue', value: formatCurrency(monthly?.totalFnbCost || 0), change: 'Food & Drinks', icon: '🍽️' },
    { label: 'Avg Per Day', value: formatCurrency(monthly?.averagePerDay || 0), change: 'Daily average', icon: '📈' },
  ];

  return (
    <MainLayout
      currentPage="revenue-reports"
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
      userName={user?.fullName || 'User'}
      userRole={user?.role || 'staff'}
    >
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1>Revenue Analytics</h1>
            <p>Performance metrics and financial overview</p>
          </div>
          <div className="date-range-picker">
            <Calendar size={20} />
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="date-input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="date-input"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = now.getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading revenue data...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-change">{stat.change}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Revenue Trend Chart */}
              <div className="chart-card full-width">
                <h2>Daily Revenue - {new Date(2000, month - 1).toLocaleString('en', { month: 'long' })} {year}</h2>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#555" fontSize={11} />
                      <YAxis stroke="#555" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2330',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#edf0f5' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#d4a853"
                        strokeWidth={2}
                        dot={{ fill: '#d4a853', r: 3 }}
                        activeDot={{ r: 5, fill: '#e5bc6a' }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>No revenue data for this period</div>
                )}
              </div>

              {/* Top Tables */}
              <div className="chart-card">
                <h2>Top 5 Tables</h2>
                {topTablesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topTablesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#555" fontSize={11} />
                      <YAxis stroke="#555" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2330',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#edf0f5' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="usageCount"
                        fill="#2d8a5e"
                        name="Usage Count"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>No data</div>
                )}
              </div>

              {/* Top F&B Items */}
              <div className="chart-card">
                <h2>Top F&B Items</h2>
                {topFnbData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topFnbData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#555" fontSize={11} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#555" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2330',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#edf0f5' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="orders"
                        fill="#d4a853"
                        name="Orders"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>No data</div>
                )}
              </div>
            </div>

            {/* Detailed Tables */}
            <div className="detailed-tables">
              <div className="detail-table-card">
                <h3>Top Performing Tables (by Revenue)</h3>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Sessions</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.topTables || []).map((table, idx) => (
                      <tr key={idx}>
                        <td>{table.name}</td>
                        <td>{table.usageCount}</td>
                        <td className="revenue-value">{formatCurrency(table.totalRevenue)}</td>
                      </tr>
                    ))}
                    {(!summary?.topTables || summary.topTables.length === 0) && (
                      <tr><td colSpan={3} style={{ textAlign: 'center' }}>No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="detail-table-card">
                <h3>Top F&B Items (by Orders)</h3>
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.topFnb || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.totalQuantity}</td>
                        <td className="revenue-value">{formatCurrency(item.totalRevenue)}</td>
                      </tr>
                    ))}
                    {(!summary?.topFnb || summary.topFnb.length === 0) && (
                      <tr><td colSpan={3} style={{ textAlign: 'center' }}>No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All-time Summary */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <div className="stat-label">All-time Revenue</div>
                  <div className="stat-value">{formatCurrency(summary?.totalRevenue || 0)}</div>
                  <div className="stat-change">{summary?.sessionCount || 0} total sessions</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default RevenueAnalytics;
