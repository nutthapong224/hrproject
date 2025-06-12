import { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaRegUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import bgDashboard from "/src/assets/bgdashboard.png"
import '../AnimationCircles/AnimationCircles.css'
import './Login.css'

// Animation circles component
const AnimationCircles = () => (
  <>
    <ul className="circles">
      {[...Array(25)].map((_, i) => (
        <li key={`top-${i}`}></li>
      ))}
    </ul>
    <ul className="circles-bottom">
      {[...Array(25)].map((_, i) => (
        <li key={`bottom-${i}`}></li>
      ))}
    </ul>
  </>
)

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  })

  // Check for remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    const rememberedPassword = localStorage.getItem('rememberedPassword')
    
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail)
      setPassword(rememberedPassword)
      setRememberMe(true)
    }
  }, [])

  // เพิ่ม state สำหรับเช็คขนาดหน้าจอ
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth <= 1024)

  // เพิ่ม effect เพื่อติดตามการเปลี่ยนแปลงขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      email: '',
      password: ''
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    }

    setFormErrors(newErrors)
    return isValid
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    try {
      // Check admin credentials
      if (email === 'admin@gmail.com' && password === '111111') {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberedPassword', password)
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
        }
        
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('token', 'admin-token')
        navigate('/news'); // Redirect to News page
        return
      }

      // Check superadmin credentials
      if (email === 'superadmin@gmail.com' && password === '111111') {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberedPassword', password)
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
        }
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', 'superadmin')
        localStorage.setItem('token', 'superadmin-token')
        navigate('/news'); // Redirect to News page
        return
      }

      // Check for user credentials
      if (email === 'user@gmail.com' && password === '111111') {
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberedPassword', password)
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
        }        // Store login status and auth info for user
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', 'user')
        localStorage.setItem('token', 'user-token')
        localStorage.setItem('employeeId', '1') // Use first mock employee ID
        navigate('/news')
        return
      }

      // For other credentials, proceed with API call
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
          localStorage.setItem('rememberedPassword', password)
        } else {
          localStorage.removeItem('rememberedEmail')
          localStorage.removeItem('rememberedPassword')
        }

        // Store login status and auth info
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userRole', data.user.role)
        localStorage.setItem('token', data.token)
        navigate('/news'); // Redirect to News page
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('The email or password you entered is incorrect.')
      console.error('Login error:', err)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const formVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  }

  return (
    <motion.div 
      className="login-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      {isMobileOrTablet && <AnimationCircles />}
      
      {/* แสดง dashboard preview เฉพาะบน desktop */}
      {!isMobileOrTablet && (
        <motion.div 
          className="login-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img src={bgDashboard} alt="Dashboard Preview" className="dashboard-preview" />
        </motion.div>
      )}
      
      <motion.div 
        className="login-right"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="login-form">
          <motion.div 
            className="app-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FaRegUser className="user-icon" />
            <span>HRMS</span>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="app-title">Welcome 👋</h2>
            <p className="app-subtitle">Please login here</p>
          </motion.div>

          <form onSubmit={handleLogin}>
            {/* Email input with icon */}
            <div className="group">
              <svg className="icon" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18.75v-12z" strokeLinejoin="round" strokeLinecap="round"></path>
                <path d="M21.75 6.75l-9.75 7.5-9.75-7.5" strokeLinejoin="round" strokeLinecap="round"></path>
              </svg>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFormErrors(prev => ({ ...prev, email: '' }))
                  setError('')
                }}
                className={`input ${formErrors.email ? 'error' : ''}`}
                autoComplete="username"
              />
            </div>            {formErrors.email && (
              <motion.div 
                className="error-text"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {formErrors.email}
              </motion.div>
            )}

            {/* Password input with icon and toggle */}
            <div className="group" style={{ position: 'relative' }}>
              <svg className="icon" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinejoin="round" strokeLinecap="round"></path>
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFormErrors(prev => ({ ...prev, password: '' }))
                  setError('')
                }}
                className={`input ${formErrors.password ? 'error' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{ right: 10, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>            {formErrors.password && (
              <motion.div 
                className="error-text"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {formErrors.password}
              </motion.div>
            )}

            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <div className="remember-forgot-container">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <motion.button 
              type="submit"
              className="login-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Login