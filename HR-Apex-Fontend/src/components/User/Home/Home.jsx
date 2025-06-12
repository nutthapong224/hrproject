import { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi';
import './Home.css';


const Home = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // ตรวจสอบ authentication
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');

    // ถ้ายังไม่ล็อกอิน ให้กลับไปหน้า login
    if (!token || !isLoggedIn) {
      navigate('/login');
      return;
    }

    // ถ้า role ไม่ใช่ admin ไม่ให้เข้า
    if (userRole !== 'employee') {
      navigate('/not-authorized');
      return;
    }







    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const DashboardCard = ({ icon: Icon, title, value, color }) => (
    <div className="dashboard-card">
      <div className={`card-icon ${color}`}>
        <Icon />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="floating-squares">
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
          <div className="square"></div>
        </div>
        <div className="hero-content">
          <h1>{greeting}, Cody</h1>
          <p>Welcome to your dashboard</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-cards">
        <DashboardCard
          icon={FiClock}
          title="Time"
          value="9:30 AM"
          color="bg-blue-500"
        />
        <DashboardCard
          icon={FiCalendar}
          title="Leave Balance"
          value="15 days"
          color="bg-green-500"
        />
        <DashboardCard
          icon={FiDollarSign}
          title="Next Payroll"
          value="May 30"
          color="bg-yellow-500"
        />
        <DashboardCard
          icon={FiUser}
          title="Department"
          value="IT"
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button">
            <FiCalendar className="text-purple-600" />
            <span>Request Leave</span>
          </button>
          <button className="action-button">
            <FiClock className="text-blue-600" />
            <span>View Attendance</span>
          </button>
          <button className="action-button">
            <FiDollarSign className="text-green-600" />
            <span>View Payslip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;