import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  List, 
  PlusSquare, 
  Calendar, 
  BarChart3,
  Eye,
  Heart,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Backendurl } from '../App';

const UserDashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalLikes: 0,
    pendingAppointments: 0,
    topProperty: null
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const timestamp = Date.now();
      const [propertiesRes, appointmentsRes] = await Promise.all([
        axios.get(`${Backendurl}/api/products/user-list?t=${timestamp}`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        axios.get(`${Backendurl}/api/appointments/all?t=${timestamp}`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ]);

      if (propertiesRes.data.success) {
        const properties = propertiesRes.data.property;
        const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
        const totalLikes = properties.reduce((sum, prop) => sum + (prop.likes || 0), 0);
        const topProperty = properties.reduce((max, prop) => 
          (prop.views || 0) > (max?.views || 0) ? prop : max, null
        );

        setStats(prev => ({
          ...prev,
          totalProperties: properties.length,
          totalViews,
          totalLikes,
          topProperty
        }));
      }

      if (appointmentsRes.data.success) {
        const pendingCount = appointmentsRes.data.appointments.filter(apt => apt.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingAppointments: pendingCount }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Add manual refresh function
  const refreshStats = () => {
    setLoading(true);
    fetchDashboardStats();
  };

  const isDashboardHome = false; // Always show outlet since properties page now includes dashboard

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  const QuickAction = ({ to, icon: Icon, title, description, color }) => (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-l-4"
        style={{ borderLeftColor: color }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;