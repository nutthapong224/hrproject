import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiUpload, FiFile, FiCheck, FiBriefcase, FiUsers, FiMoreHorizontal } from 'react-icons/fi'
import SideMenu from '../SideMenu/Side_menu'
import Topbar from '../Topbar/Topbar'
import './NewEmployees.css'
import '../AnimationCircles/AnimationCircles.css'
import axios from 'axios'
import { motion } from 'framer-motion'

const truncateFileName = (fileName) => {
  if (!fileName) return '';
  if (fileName.length <= 25) return fileName;
  const extension = fileName.split('.').pop();
  const name = fileName.substring(0, fileName.lastIndexOf('.'));
  return `${name.substring(0, 15)}...${extension}`;
};

const NewEmployees = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    profileImage: null,
    firstName: '',
    lastName: '',
    nickname: '',
    age: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    religion: '',
    maritalStatus: '',
    nationality: '',
    currentAddress: '',
    currentSubdistrict: '',
    currentDistrict: '',
    currentProvince: '',
    currentZipCode: '',
    idCardAddress: '',
    idCardSubdistrict: '',
    idCardDistrict: '',
    idCardProvince: '',
    idCardZipCode: '',

    // Professional Information
    department: '',
    position: '',
    type: '',
    status: '',
    startDate: '',
    salary: '',

    // Bank Information
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    bankCode: '',

    // Family Information
    fatherName: '',
    fatherAge: '',
    fatherOccupation: '',
    motherName: '',
    motherAge: '',
    motherOccupation: '',
    spouseName: '',
    spouseAge: '',
    spouseOccupation: '',
    numberOfChildren: '',
    birthOrder: '',
    totalSiblings: '',
    numberOfBrothers: '',
    numberOfSisters: '',

    // Work & Education History
    workHistory: [{ company: '', position: '', start: '', end: '', salary: '', description: '' }],
    educationHistory: [{ level: '', field: '', institution: '', graduationYear: '' }],

    // Language Ability
    speaking: '',
    writing: '',
    reading: '',

    // Criminal/Civil Record
    hasCriminalRecord: '',
    criminalDetails: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactAddress: '',
    emergencyContactPhone: '',

    // Documents
    jobApplication: null,
    employmentContract: null,
    certificate: null,
    nationalId: null,
    householdRegistration: null,
    bankBook: null,
    documents: null,

    // Work Relocation
    canRelocate: '',
  })

  const [errors, setErrors] = useState({})
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const navigate = useNavigate()

  useEffect(() => {
    // Role-based access control
    const role = localStorage.getItem('userRole')
    if (!role) {
      navigate('/login')
      return
    }
    
    // Restrict access for admin users
    if (role === 'admin') {
      navigate('/employees')
      return
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      // Clear criminal details if hasCriminalRecord is set to 'no'
      if (name === 'hasCriminalRecord' && value === 'no') {
        return {
          ...prev,
          [name]: value,
          criminalDetails: ''
        }
      }
      return {
        ...prev,
        [name]: value
      }
    })
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = (e, fieldName) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName] ? [...prev[fieldName], ...fileArray] : fileArray
      }))
    }
  }

  const handleRemoveFile = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }))
  }

  const handleWorkHistoryChange = (idx, field, value) => {
    const updated = [...formData.workHistory]
    updated[idx][field] = value
    setFormData(prev => ({ ...prev, workHistory: updated }))
  }

  const handleEducationChange = (idx, field, value) => {
    const updated = [...formData.educationHistory]
    updated[idx][field] = value
    setFormData(prev => ({ ...prev, educationHistory: updated }))
  }
  const handleAddWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', position: '', start: '', end: '', salary: '', description: '' }]
    }))
  }

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [...prev.educationHistory, { level: '', field: '', institution: '', graduationYear: '' }]
    }))
  }

  const handleRemoveWorkHistory = (idx) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== idx)
    }))
  }

  const handleRemoveEducation = (idx) => {
    setFormData(prev => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, i) => i !== idx)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate Personal Information
    if (!formData.firstName) newErrors.firstName = 'First Name is required'
    if (!formData.lastName) newErrors.lastName = 'Last Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    if (!formData.dob) newErrors.dob = 'Date of Birth is required'
    
    // Validate Professional Information
    if (!formData.position) newErrors.position = 'Position is required'
    if (!formData.type) newErrors.type = 'Type is required'
    if (!formData.status) newErrors.status = 'Status is required'
    if (!formData.startDate) newErrors.startDate = 'Start Date is required'
    if (!formData.salary) newErrors.salary = 'Salary is required'
    
    // Validate Bank Information
    if (!formData.bankName) newErrors.bankName = 'Bank Name is required'
    if (!formData.accountNumber) newErrors.accountNumber = 'Account Number is required'
    if (formData.accountNumber && !/^\d{10,12}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account Number must be 10-12 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      window.scrollTo({
        top: document.querySelector('.error-text')?.offsetTop - 100,
        behavior: 'smooth'
      })
      return
    }

    try {
      const response = await axios.post('http://localhost:3001/api/employees', formData)
      if (response.data.employeeId) {
        setShowSuccessPopup(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to add employee. Please try again.')
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessPopup(false)
    navigate('/employees')
  }

  // Tab configuration
  const tabs = [
    {
      key: 'personal',
      label: 'Personal Info',
      icon: <FiUser />
    },
    {
      key: 'experience',
      label: 'Experience',
      icon: <FiBriefcase />
    },
    {
      key: 'family',
      label: 'Family Info',
      icon: <FiUsers />
    },
    {
      key: 'documents',
      label: 'Documents',
      icon: <FiFile />
    },
    {
      key: 'other',
      label: 'Other Info',
      icon: <FiMoreHorizontal />
    }
  ];

  return (
    <div className="dashboard-container">
      <SideMenu
        isMinimized={isMinimized}
        onToggleMinimize={setIsMinimized}
        mobileOpen={mobileOpen}
        onCloseMobileMenu={() => setMobileOpen(false)}
      />
      <div className="dashboard-main">
        <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
        <div className="tabs-container">
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <motion.div 
          className="dashboard-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="employee-form">
            {/* Personal Information Section */}
            {activeTab === 'personal' && (
              <div className="form-section">
                <h2 className="section-title">Personal Information</h2>
                
                <div className="profile-upload">
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                  <label htmlFor="profile-image" className="upload-area">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" />
                    ) : (
                      <FiUser />
                    )}
                  </label>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Nickname</label>
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Enter nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label>Date of Birth <span className="required">*</span></label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                    {errors.dob && <span className="error-text">{errors.dob}</span>}
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Marital Status</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>              </div>
                
                <div className="form-group full-width">
                  <div className="addresses-container">
                    <div className="address-section">
                      <h3>ที่อยู่ตามบัตรประชาชน</h3>
                      <div className="form-group full-width">
                        <label>ที่อยู่</label>
                        <textarea
                          name="idCardAddress"
                          placeholder="กรุณากรอกที่อยู่ตามบัตรประชาชน"
                          value={formData.idCardAddress}
                          onChange={handleChange}
                          rows="3"
                        />
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>แขวง/ตำบล</label>
                          <input
                            type="text"
                            name="idCardSubdistrict"
                            placeholder="กรุณากรอกแขวง/ตำบล"
                            value={formData.idCardSubdistrict}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>เขต/อำเภอ</label>
                          <input
                            type="text"
                            name="idCardDistrict"
                            placeholder="กรุณากรอกเขต/อำเภอ"
                            value={formData.idCardDistrict}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>จังหวัด</label>
                          <input
                            type="text"
                            name="idCardProvince"
                            placeholder="กรุณากรอกจังหวัด"
                            value={formData.idCardProvince}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>รหัสไปรษณีย์</label>
                          <input
                            type="text"
                            name="idCardZipCode"
                            placeholder="กรุณากรอกรหัสไปรษณีย์"
                            value={formData.idCardZipCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="address-section">
                      <h3>ที่อยู่ปัจจุบัน</h3>
                      <div className="form-group full-width">
                        <label>ที่อยู่</label>
                        <textarea
                          name="currentAddress"
                          placeholder="กรุณากรอกที่อยู่ปัจจุบัน"
                          value={formData.currentAddress}
                          onChange={handleChange}
                          rows="3"
                        />
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>แขวง/ตำบล</label>
                          <input
                            type="text"
                            name="currentSubdistrict"
                            placeholder="กรุณากรอกแขวง/ตำบล"
                            value={formData.currentSubdistrict}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>เขต/อำเภอ</label>
                          <input
                            type="text"
                            name="currentDistrict"
                            placeholder="กรุณากรอกเขต/อำเภอ"
                            value={formData.currentDistrict}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>จังหวัด</label>
                          <input
                            type="text"
                            name="currentProvince"
                            placeholder="กรุณากรอกจังหวัด"
                            value={formData.currentProvince}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>รหัสไปรษณีย์</label>
                          <input
                            type="text"
                            name="currentZipCode"
                            placeholder="กรุณากรอกรหัสไปรษณีย์"
                            value={formData.currentZipCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information Section */}
            {activeTab === 'personal' && (
              <div className="form-section">
                <h2 className="section-title">Professional Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Position <span className="required">*</span></label>
                    <input
                      type="text"
                      name="position"
                      placeholder="Enter position"
                      value={formData.position}
                      onChange={handleChange}
                    />
                    {errors.position && <span className="error-text">{errors.position}</span>}
                  </div>

                  <div className="form-group">
                    <label>Type <span className="required">*</span></label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="">Select type</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                    {errors.type && <span className="error-text">{errors.type}</span>}
                  </div>

                  <div className="form-group">
                    <label>Status <span className="required">*</span></label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                    </select>
                    {errors.status && <span className="error-text">{errors.status}</span>}
                  </div>

                  <div className="form-group">
                    <label>Start Date <span className="required">*</span></label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                    {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                  </div>

                  <div className="form-group">
                    <label>Salary <span className="required">*</span></label>
                    <input
                      type="number"
                      name="salary"
                      placeholder="Enter salary"
                      value={formData.salary}
                      onChange={handleChange}
                    />
                    {errors.salary && <span className="error-text">{errors.salary}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Work History */}
            {activeTab === 'experience' && (
              <div className="work-history-section experience-bg" style={{ backgroundImage: 'url(/src/assets/bgdashboard.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', padding: '24px 16px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.85)' }}>
                <h3>Work History</h3>
                <table className="work-history-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Position</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Salary</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>                    {formData.workHistory.map((work, idx) => (
                      <React.Fragment key={idx}>
                        <tr>
                          <td>
                            <input
                              type="text"
                              placeholder="Company name"
                              value={work.company}
                              onChange={e => handleWorkHistoryChange(idx, 'company', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="Position"
                              value={work.position}
                              onChange={e => handleWorkHistoryChange(idx, 'position', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="month"
                              value={work.start}
                              onChange={e => handleWorkHistoryChange(idx, 'start', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="month"
                              value={work.end}
                              onChange={e => handleWorkHistoryChange(idx, 'end', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              placeholder="Salary"
                              value={work.salary}
                              onChange={e => handleWorkHistoryChange(idx, 'salary', e.target.value)}
                            />
                          </td>
                          <td>
                            {formData.workHistory.length > 1 && (
                              <button
                                type="button"
                                className="btn-remove-row"
                                onClick={() => handleRemoveWorkHistory(idx)}
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                        <tr className="description-row">
                          <td colSpan="6">
                            <textarea
                              placeholder="Job description"
                              value={work.description}
                              onChange={e => handleWorkHistoryChange(idx, 'description', e.target.value)}
                              rows="3"
                              className="work-description"
                            />
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn-add-row" onClick={handleAddWorkHistory}>
                  + Add Work History
                </button>
              </div>
            )}

            {/* Education History */}
            {activeTab === 'experience' && (
              <div className="education-section experience-bg" style={{ backgroundImage: 'url(/src/assets/bgdashboard.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', padding: '24px 16px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.85)' }}>
                <h3>Education History</h3>
                <table className="work-history-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Field of Study</th>
                      <th>Institution</th>
                      <th>Year</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.educationHistory.map((edu, idx) => (
                      <tr key={idx}>
                        <td>
                          <select
                            value={edu.level}
                            onChange={e => handleEducationChange(idx, 'level', e.target.value)}
                          >
                            <option value="">Select Level</option>
                            <option value="high_school">มัธยมตอนปลาย</option>
                            <option value="vocational">ปวช.</option>
                            <option value="high_vocational">ปวท. / ปวส.</option>
                            <option value="bachelor">ปริญญาตรี</option>
                            <option value="master">ปริญญาโท</option>
                            <option value="doctorate">ปริญญาเอก</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Field of study"
                            value={edu.field}
                            onChange={e => handleEducationChange(idx, 'field', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Institution name"
                            value={edu.institution}
                            onChange={e => handleEducationChange(idx, 'institution', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Year"
                            value={edu.graduationYear}
                            onChange={e => handleEducationChange(idx, 'graduationYear', e.target.value)}
                            min="1950"
                            max="2025"
                          />
                        </td>
                        <td>
                          {formData.educationHistory.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-row"
                              onClick={() => handleRemoveEducation(idx)}
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="btn-add-row" onClick={handleAddEducation}>
                  + Add Education
                </button>
              </div>
            )}

            {/* Bank Information Section */}
            {activeTab === 'personal' && (
              <div className="form-section">
                <h2 className="section-title">Bank Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Bank Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="bankName"
                      placeholder="Enter bank name"
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                    {errors.bankName && <span className="error-text">{errors.bankName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      placeholder="Enter account holder name"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Number <span className="required">*</span></label>
                    <input
                      type="text"
                      name="accountNumber"
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={handleChange}
                    />
                    {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Family Information Section */}
            {activeTab === 'family' && (
              <div className="form-section">
                <h2 className="section-title">Family Information</h2>
                
                {/* Father's Information */}
                <div className="family-section">
                  <h3>Father's Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        placeholder="Father's name"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        name="fatherAge"
                        placeholder="Father's age"
                        value={formData.fatherAge}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        name="fatherOccupation"
                        placeholder="Father's occupation"
                        value={formData.fatherOccupation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="family-section">
                  <h3>Mother's Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="motherName"
                        placeholder="Mother's name"
                        value={formData.motherName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        name="motherAge"
                        placeholder="Mother's age"
                        value={formData.motherAge}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        name="motherOccupation"
                        placeholder="Mother's occupation"
                        value={formData.motherOccupation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Spouse Information */}
                <div className="family-section">
                  <h3>Spouse Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="spouseName"
                        placeholder="Spouse's name"
                        value={formData.spouseName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        name="spouseAge"
                        placeholder="Spouse's age"
                        value={formData.spouseAge}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        name="spouseOccupation"
                        placeholder="Spouse's occupation"
                        value={formData.spouseOccupation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Family Details */}
                <div className="family-section">
                  <h3>Family Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Children</label>
                      <input
                        type="number"
                        name="numberOfChildren"
                        placeholder="0"
                        value={formData.numberOfChildren}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Birth Order</label>
                      <input
                        type="number"
                        name="birthOrder"
                        placeholder="0"
                        value={formData.birthOrder}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Siblings</label>
                      <input
                        type="number"
                        name="totalSiblings"
                        placeholder="0"
                        value={formData.totalSiblings}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeTab === 'documents' && (
              <div className="form-section">
                <h2 className="section-title">Required Documents</h2>
                <div className="file-upload-section">
                  <div className="documents-grid">                  {/* Job Application */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> ใบสมัครงาน
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="job-application"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'jobApplication')}
                          hidden
                          multiple
                        />
                        <label htmlFor="job-application" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, DOC, DOCX</p>
                        </label>
                      </div>
                      {formData.jobApplication && formData.jobApplication.length > 0 && (
                        <div className="uploaded-files">
                          {formData.jobApplication.map((file, index) => (
                            <div key={index} className="uploaded-file">
                              <FiFile />
                              <span title={file.name}>{truncateFileName(file.name)}</span>
                              <button 
                                type="button" 
                                className="remove-file"
                                onClick={() => handleRemoveFile('jobApplication', index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>                  {/* Certificate */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> วุฒิบัตร
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="certificate"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 'certificate')}
                          hidden
                          multiple
                        />
                        <label htmlFor="certificate" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, JPG, JPEG</p>
                        </label>
                      </div>
                      {formData.certificate && formData.certificate.length > 0 && (
                        <div className="uploaded-files">
                          {formData.certificate.map((file, index) => (
                            <div key={index} className="uploaded-file">
                              <FiFile />
                              <span title={file.name}>{truncateFileName(file.name)}</span>
                              <button 
                                type="button" 
                                className="remove-file"
                                onClick={() => handleRemoveFile('certificate', index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* National ID */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> สำเนาบัตรประชาชน
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="national-id"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 'nationalId')}
                          hidden
                        />
                        <label htmlFor="national-id" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, JPG, JPEG</p>
                        </label>
                      </div>
                      {formData.nationalId && (
                        <div className="uploaded-files">
                          <div className="uploaded-file">
                            <FiFile />
                            <span title={formData.nationalId.name}>
                              {truncateFileName(formData.nationalId.name)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* House Registration */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> สำเนาทะเบียนบ้าน
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="house-registration"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 'householdRegistration')}
                          hidden
                        />
                        <label htmlFor="house-registration" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, JPG, JPEG</p>
                        </label>
                      </div>
                      {formData.householdRegistration && (
                        <div className="uploaded-files">
                          <div className="uploaded-file">
                            <FiFile />
                            <span title={formData.householdRegistration.name}>
                              {truncateFileName(formData.householdRegistration.name)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bank Account */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> สำเนาสมุดบัญชีธนาคาร
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="bank-book"
                          accept=".pdf,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 'bankBook')}
                          hidden
                        />
                        <label htmlFor="bank-book" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, JPG, JPEG</p>
                        </label>
                      </div>
                      {formData.bankBook && (
                        <div className="uploaded-files">
                          <div className="uploaded-file">
                            <FiFile />
                            <span title={formData.bankBook.name}>
                              {truncateFileName(formData.bankBook.name)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Employment Contract */}
                    <div className="document-upload-card">
                      <h3 className="document-title">
                        <FiFile /> สัญญาจ้าง
                      </h3>
                      <div className="upload-area-doc">
                        <input
                          type="file"
                          id="employment-contract"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'employmentContract')}
                          hidden
                        />
                        <label htmlFor="employment-contract" className="upload-label">
                          <div className="upload-icon">
                            <FiUpload />
                          </div>
                          <p>ลากไฟล์หรือ <span className="choose-text">เลือกไฟล์</span> เพื่ออัปโหลด</p>
                          <p className="supported-text">รองรับไฟล์: PDF, DOC, DOCX</p>
                        </label>
                      </div>
                      {formData.employmentContract && (
                        <div className="uploaded-files">
                          <div className="uploaded-file">
                            <FiFile />
                            <span title={formData.employmentContract.name}>
                              {truncateFileName(formData.employmentContract.name)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sections... */}
            {activeTab === 'other' && (
              <div className="form-section">
                <h2 className="section-title">Other</h2>
                
                {/* Language Ability Section */}
                <div className="language-ability-section">
                  <h3>Language Ability</h3>
                  <div className="language-grid">
                    {/* Speaking */}
                    <div className="language-row">
                      <div className="language-label">Speaking:</div>
                      <div className="language-options responsive-language-select">
                        <select
                          name="speaking"
                          value={formData.speaking}
                          onChange={handleChange}
                          className="language-select"
                        >
                          <option value="">Select</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>
                    {/* Writing */}
                    <div className="language-row">
                      <div className="language-label">Writing:</div>
                      <div className="language-options responsive-language-select">
                        <select
                          name="writing"
                          value={formData.writing}
                          onChange={handleChange}
                          className="language-select"
                        >
                          <option value="">Select</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>
                    {/* Reading */}
                    <div className="language-row">
                      <div className="language-label">Reading:</div>
                      <div className="language-options responsive-language-select">
                        <select
                          name="reading"
                          value={formData.reading}
                          onChange={handleChange}
                          className="language-select"
                        >
                          <option value="">Select</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Criminal Record Section */}
                <div className="criminal-record-section">
                  <h3>ประวัติทางกฎหมาย</h3>
                  <div className="criminal-record-container">
                    <div className="criminal-record-question">
                      <p>เคยต้องโทษทางแพ่งหรืออาญาหรือไม่</p>
                      <div className="criminal-options">
                        <label>
                          <input
                            type="radio"
                            name="hasCriminalRecord"
                            value="yes"
                            checked={formData.hasCriminalRecord === 'yes'}
                            onChange={handleChange}
                          />
                          เคย
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="hasCriminalRecord"
                            value="no"
                            checked={formData.hasCriminalRecord === 'no'}
                            onChange={handleChange}
                          />
                          ไม่เคย
                        </label>
                      </div>
                    </div>

                    {formData.hasCriminalRecord === 'yes' && (
                      <div className="criminal-details">
                        <label htmlFor="criminalDetails">รายละเอียด:</label>
                        <textarea
                          id="criminalDetails"
                          name="criminalDetails"
                          value={formData.criminalDetails}
                          onChange={handleChange}
                          placeholder="โปรดระบุรายละเอียดความผิดและโทษที่ได้รับ"
                          rows="3"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Relocation Section */}
                <div className="relocation-section">
                  <h3>การปฏิบัติงานต่างจังหวัด</h3>
                  <div className="relocation-container">
                    <p>สามารถไปปฏิบัติงานต่างจังหวัดได้หรือไม่</p>
                    <div className="relocation-options">
                      <label>
                        <input
                          type="radio"
                          name="canRelocate"
                          value="yes"
                          checked={formData.canRelocate === 'yes'}
                          onChange={handleChange}
                        />
                        ได้
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="canRelocate"
                          value="no"
                          checked={formData.canRelocate === 'no'}
                          onChange={handleChange}
                        />
                        ไม่ได้
                      </label>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="emergency-contact-section">
                  <h3>บุคคลที่ติดต่อได้กรณีฉุกเฉิน</h3>
                  
                  {/* คนที่ 1 */}
                  <div className="emergency-contact-container">
                    <h4>บุคคลที่ 1</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>ชื่อ-นามสกุล</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          placeholder="กรุณากรอกชื่อ-นามสกุล"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>ความเกี่ยวข้องกับผู้สมัคร</label>
                        <input
                          type="text"
                          name="emergencyContactRelation"
                          placeholder="กรุณาระบุความเกี่ยวข้อง"
                          value={formData.emergencyContactRelation}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>เบอร์โทรศัพท์</label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          placeholder="กรุณากรอกเบอร์โทรศัพท์"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>ที่อยู่</label>
                      <textarea
                        name="emergencyContactAddress"
                        placeholder="กรุณากรอกที่อยู่"
                        value={formData.emergencyContactAddress}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                  </div>

                  {/* คนที่ 2 */}
                  <div className="emergency-contact-container" style={{ marginTop: '20px' }}>
                    <h4>บุคคลที่ 2</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>ชื่อ-นามสกุล</label>
                        <input
                          type="text"
                          name="emergencyContactName2"
                          placeholder="กรุณากรอกชื่อ-นามสกุล"
                          value={formData.emergencyContactName2}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>ความเกี่ยวข้องกับผู้สมัคร</label>
                        <input
                          type="text"
                          name="emergencyContactRelation2"
                          placeholder="กรุณาระบุความเกี่ยวข้อง"
                          value={formData.emergencyContactRelation2}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>เบอร์โทรศัพท์</label>
                        <input
                          type="tel"
                          name="emergencyContactPhone2"
                          placeholder="กรุณากรอกเบอร์โทรศัพท์"
                          value={formData.emergencyContactPhone2}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>ที่อยู่</label>
                      <textarea
                        name="emergencyContactAddress2"
                        placeholder="กรุณากรอกที่อยู่"
                        value={formData.emergencyContactAddress2}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => navigate('/employees')}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {showSuccessPopup && (
        <>
          <div className="popup-overlay"></div>
          <div className="success-popup">
            <div className="success-icon">
              <FiCheck />
            </div>
            <h2 className="success-title">Success!</h2>
            <p className="success-message">Employee has been added successfully.</p>
            <button className="success-button" onClick={handleSuccessClose}>
              Continue
            </button>
          </div>
        </>
      )}

      <style>
        {`
          .uploaded-files {
            margin-top: 10px;
            max-height: 150px;
            overflow-y: auto;
            padding-right: 10px;
          }

          .uploaded-file {
            display: flex;
            align-items: center;
            background: #f5f5f5;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 5px;
            transition: all 0.3s ease;
          }

          .uploaded-file:hover {
            background: #e9e9e9;
          }

          .uploaded-file svg {
            margin-right: 8px;
            color: #666;
          }

          .uploaded-file span {
            flex: 1;
            margin-right: 8px;
            font-size: 0.9em;
            color: #333;
          }

          .remove-file {
            background: none;
            border: none;
            color: #ff4444;
            cursor: pointer;
            font-size: 1.2em;
            padding: 0 4px;
            transition: color 0.2s ease;
          }

          .remove-file:hover {
            color: #cc0000;
          }
        `}
      </style>
    </div>
  )
}

export default NewEmployees