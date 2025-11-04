import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  List, 
  PlusSquare, 
  Calendar, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ArrowLeft,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/home-regular-24.png';
import LanguageSwitcher from './LanguageSwitcher';

const UserNavbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/user/properties', label: t('user_admin.dashboard'), icon: LayoutDashboard },
    { path: '/user/add-property', label: t('user_admin.add_property'), icon: PlusSquare },
    { path: '/user/appointments', label: t('user_admin.appointments'), icon: Calendar },
  ];

  const mainNavItems = [
    { path: '/', label: t('navbar.home'), icon: Home },
    { path: '/properties', label: t('navbar.properties'), icon: List },
    { path: '/map', label: t('navbar.map'), icon: Calendar },
    { path: '/contact', label: t('navbar.contact'), icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg"
            >
              <img src={logo} alt="OurHome logo" className="w-6 h-6" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
              OurHome
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Main Site Navigation */}
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </div>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            {/* User Dashboard Navigation */}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </div>
              </Link>
            ))}
            
            <LanguageSwitcher />
            
            <Link
              to="/profile"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                Profile
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ml-2"
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-1.5" />
                {t('navbar.logout')}
              </div>
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg"
        >
          <div className="px-2 pt-2 pb-4 space-y-1">
            {/* Main Site Navigation */}
            <div className="border-b border-gray-200 pb-2 mb-2">
              <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Main Site</p>
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* User Dashboard Navigation */}
            <div className="border-b border-gray-200 pb-2 mb-2">
              <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
            
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </div>
            </Link>
            
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5 mr-2" />
                {t('navbar.logout')}
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default UserNavbar;