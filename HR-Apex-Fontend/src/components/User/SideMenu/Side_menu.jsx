import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  FaUsers, 
  FaFileAlt,
  FaMoneyBillWave,
  FaEnvelope,
  FaCalendarAlt,
  FaRegCalendarCheck,
  FaCog,
  FaUser,
} from 'react-icons/fa'
import { BsGrid } from 'react-icons/bs'
import { BiSun, BiMoon } from 'react-icons/bi'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTheme } from '../../../context/ThemeContext'
import './Side_menu.css'
import PropTypes from 'prop-types';

// ปรับ props ให้รองรับ mobile overlay
const SideMenu = ({ isMinimized, onToggleMinimize, hasPopup, isOpen, onClose }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const userRole = localStorage.getItem('userRole');
  const employeeId = localStorage.getItem('employeeId');

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) onClose();

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen])
  
  const menuItems = [
  { icon: <FaEnvelope />, text: 'News', path: '/employee/news' },
  { 
    icon: <FaUsers />, 
    text: userRole === 'user' ? 'My Profile' : 'All Employees', 
    path: userRole === 'user' ? `/employee/employee/${employeeId}` : '/employee/employees'
  },
  { icon: <FaFileAlt />, text: 'Disbursement', path: '/employee/disbursement' },
  { 
    icon: <FaMoneyBillWave />, 
    text: 'Payroll', 
    path: userRole === 'user' ? `/employee/payroll-detail/${employeeId}` : '/employee/payroll' 
  },
  { icon: <FaCalendarAlt />, text: 'Leaves', path: '/employee/leaves' },
  { icon: <FaRegCalendarCheck />, text: 'Holidays', path: '/employee/holidays' },
  ...(userRole !== 'user' ? [{ icon: <FaUser />, text: 'Account', path: '/employee/account' }] : []),
  { icon: <FaCog />, text: 'Settings', path: '/employee/settings' },
];


  const isActive = (path) => {
  const currentPath = location.pathname;

  if (path === '/employee/employees' && 
    (currentPath === '/employee/employees' || 
     currentPath === '/employee/new-employee' || 
     currentPath.startsWith('/employee/employee/') ||
     currentPath === '/employee/all-employees')) {
    return true;
  }
  if (currentPath === '/employee/addnews' && path === '/employee/news') {
    return true;
  }
  if (currentPath === '/employee/adddisburse' && path === '/employee/disbursement') {
    return true;
  }
  if (currentPath.startsWith('/employee/payroll-detail/') && path === '/employee/payroll') {
    return true;
  }
  if ((currentPath === '/employee/newholiday' || currentPath.startsWith('/employee/holidays')) && path === '/employee/holidays') {
    return true;
  }
  if (currentPath.startsWith('/employee/account') || 
      currentPath.startsWith('/employee/edit-account')) {
    return path === '/employee/account';
  }
  return currentPath === path;
};


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      <motion.div
        className={`side-menu${isMinimized ? ' minimized' : ''}${hasPopup ? ' has-popup' : ''}${isOpen ? ' mobile-open' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="logo-container">          <h1 
            className="logo"
            onClick={() => {
              if (window.innerWidth <= 768) {
                if (typeof onClose === 'function') {
                  onClose(); // ปิดเมนูมือถือจริง
                } else if (typeof onToggleMinimize === 'function') {
                  onToggleMinimize(true); // fallback
                }
              } else {
                onToggleMinimize(); // Toggle minimize on desktop
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="logo-icon">∞</span>
            <span className="logo-text">{!isMinimized && 'HRMS'}</span>
          </h1>
        </div>

        <nav className="menu-items">
          {menuItems.map((item, index) => (
            <motion.div 
              key={index}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={item.path} 
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                title={isMinimized ? item.text : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isMinimized && <span className="menu-text">{item.text}</span>}
              </Link>
            </motion.div>
          ))}
        </nav>

        {!isMinimized && (
          <div className="theme-toggle">
            <label className="theme-switch">
              <span className="theme-sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ffd43b"><circle r="5" cy="12" cx="12"></circle><path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path></g></svg>
              </span>
              <span className="theme-moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path></svg>
              </span>
              <input
                type="checkbox"
                className="theme-input"
                checked={isDark}
                onChange={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              />
              <span className="theme-slider"></span>
            </label>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

SideMenu.propTypes = {
  isMinimized: PropTypes.bool,
  onToggleMinimize: PropTypes.func,
  hasPopup: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SideMenu;