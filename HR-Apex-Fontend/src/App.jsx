import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Admin/Login/Login'
import ForgotPassword from './components/Admin/ForgotPassword/ForgotPassword'
import Account from './components/Admin/Account/Account'
import ResetPassword from './components/Admin/ResetPassword/ResetPassword'
import AllEmployees from './components/Admin/AllEmployees/AllEmployees'
import NewEmployees from './components/Admin/NewEmployees/NewEmployees'
import ProfileDetail from './components/Admin/ProfileDetail/ProfileDetail'
import New from './components/Admin/Newspage/New'
import AddNew from './components/Admin/Newspage/AddNews/Addnew'
import Leaves from './components/Admin/Leaves/leaves'
import Payroll from './components/Admin/Payroll/Payroll'
import PayrollDetail from './components/Admin/PayrollDetail/PayrollDetail'
import Disbursement from './components/Admin/Disbursement/disbursement'
import Adddisburse from './components/Admin/Disbursement/Adddisburse'
import LeaveDetail from './components/Admin/Leaves/leavesdetail'
import Setting from './components/Admin/Layout/setting'
import Holidays from './components/Admin/holidays/holidays'
import NewHoliday from './components/Admin/holidays/newholiday'
import EditAccount from './components/Admin/Account/EditAccount'
import ConfirmOTP from './components/Admin/ForgotPassword/confirmOTP'
import { ThemeProvider } from './context/ThemeContext'
import Home from './components/User/Home/Home'
import './styles/global.css'
import UserEditAccount from './components/User/Account/EditAccount'

import UserAccount from './components/User/Account/Account'
import UserProfileDetail from './components/User/ProfileDetail/ProfileDetail'

import UserLeaves from './components/User/Leaves/leaves'
import UserPayroll from './components/User/Payroll/Payroll'
import UserPayrollDetail from './components/User/PayrollDetail/PayrollDetail'
import UserDisbursement from './components/User/Disbursement/disbursement'
import UserAdddisburse from './components/User/Disbursement/Adddisburse'
import UserLeaveDetail from './components/User/Leaves/leavesdetail'
import UserSetting from './components/User/Layout/setting'
import UserHolidays from './components/User/holidays/holidays'
import UserNewHoliday from './components/User/holidays/newholiday'
import './styles/global.css'
import UserNotification from './components/User/Notifications/Notification'
import UserNew from './components/User/Newspage/New'

import PrivateRoute from './components/PrivateRoute';






function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/OTP" element={<ConfirmOTP />} />

          {/* User routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <Home />
              </PrivateRoute>
            }
          />

          {/* Admin and Superadmin routes */}
          <Route
            path="/all-employees"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <AllEmployees />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={<Navigate to="/all-employees" replace />}
          />
          <Route
            path="/new-employee"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <NewEmployees />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <ProfileDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/news"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <New />
              </PrivateRoute>
            }
          />
          <Route
            path="/addnews"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <AddNew />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Leaves />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaves/detail/:empId"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <LeaveDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Payroll />
              </PrivateRoute>
            }
          />
          <Route
            path="/payroll-detail/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <PayrollDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/disbursement"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Disbursement />
              </PrivateRoute>
            }
          />
          <Route
            path="/adddisburse"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Adddisburse />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Setting />
              </PrivateRoute>
            }
          />
          <Route
            path="/holidays"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Holidays />
              </PrivateRoute>
            }
          />
          <Route
            path="/newholiday/:monthIndex"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <NewHoliday />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-account/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <EditAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <PrivateRoute allowedRoles={['admin', 'superadmin']}>
                <Notification />
              </PrivateRoute>
            }
          />


                    {/* Employee routes */}
          
          
          
          <Route
            path="/employee/leave-detail/:empId"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <LeaveDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/payroll"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <Payroll />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/payroll-detail/:id"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <PayrollDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/notifications"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <Notification />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <ProfileDetail />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/employee/home"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/account"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/edit-account"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserEditAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserLeaves />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/leave-detail/:empId"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserLeaveDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/payroll"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserPayroll />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/payroll-detail/:id"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserPayrollDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/disbursement"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserDisbursement />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/add-disburse"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserAdddisburse />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/holidays"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserHolidays />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/newholiday/:monthIndex"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserNewHoliday />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/settings"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserSetting />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/notifications"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserNotification />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/profile/:id"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserProfileDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/news"
            element={
              <PrivateRoute allowedRoles={['employee']}>
                <UserNew />
              </PrivateRoute>
            }
          />

        </Routes>
        
      </HashRouter>
    </ThemeProvider>
  )

}


export default App
