import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiPaperclip, FiSearch, FiClock, FiFile, FiDownload, FiStar, FiBell, FiActivity, FiTerminal, FiLock, FiUnlock, FiMoreVertical, FiChevronDown } from 'react-icons/fi';
import './New.css';
import './EditNewsModal.css';
import SideMenu from "../SideMenu/Side_menu";
import Topbar from "../Topbar/Topbar";

const API_URL = `${import.meta.env.VITE_API_URL}/api/news`;

function mapApiNewsData(apiData) {
  // Map API fields to UI fields
  return apiData.map(item => ({
    NewsId: item.newsId,
    Title: item.title,
    Category: item.category,
    Content: item.content,
    CreatedAt: item.created_at,
    Attachment: item.attachment,
    isPinned: item.isPinned === true || item.isPinned === 1 ? 1 : 0, // Ensure isPinned is always 0 or 1
    Hidenews: item.Hidenews === true || item.Hidenews === 1 ? 1 : 0
  }));
}

function New() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    content: '',
    attachment: null
  });
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hiddenNews, setHiddenNews] = useState(new Set());
  const [pinnedNews, setPinnedNews] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const categories = [
    { value: 'Announcement', label: 'Announcement' },
    { value: 'Activity', label: 'Activity' },
    { value: 'IT', label: 'IT' }
  ];
  // Mock news data
  const mockNews = [
    {
      NewsId: "NEWS001",
      Title: "Company-wide System Update",
      Category: "IT",
      Content: "We will be performing a system-wide update this weekend. All systems will be unavailable from Saturday 22:00 to Sunday 02:00. Please save all your work before the maintenance window.\n\nKey Updates:\n- Security patches\n- Performance improvements\n- New features deployment",
      CreatedAt: "2025-05-30T09:00:00",
      Attachment: "system_update_notice.pdf",
      isPinned: 1,
      Hidenews: 0
    },
    {
      NewsId: "NEWS002",
      Title: "Annual Company Outing 2025",
      Category: "Activity",
      Content: "Mark your calendars! Our annual company outing is scheduled for June 15th, 2025. This year, we're heading to Paradise Beach Resort for a day of team building, fun activities, and relaxation.\n\nPlease fill out the participation form by June 5th.",
      CreatedAt: "2025-05-29T14:30:00",
      Attachment: "company_outing_2025.jpg",
      isPinned: 1,
      Hidenews: 0
    },
    {
      NewsId: "NEWS003",
      Title: "New Project Management Tool Implementation",
      Category: "Announcement",
      Content: "Starting from next month, we will be transitioning to a new project management tool. Training sessions will be conducted throughout June.\n\nSchedule:\n- June 1: Introduction\n- June 3: Basic Training\n- June 5: Advanced Features",
      CreatedAt: "2025-05-28T11:15:00",
      Attachment: "new_pm_tool_guide.pdf",
      isPinned: 0,
      Hidenews: 0
    },
    {
      NewsId: "NEWS004",
      Title: "Office Renovation Schedule",
      Category: "Announcement",
      Content: "The office renovation will begin on June 10th. During this time, teams will be temporarily relocated to different floors. Please check the attached seating plan for your temporary workspace.",
      CreatedAt: "2025-05-27T16:45:00",
      Attachment: "renovation_plan.pdf",
      isPinned: 0,
      Hidenews: 0
    },
    {
      NewsId: "NEWS005",
      Title: "New Employee Benefits Program",
      Category: "Announcement",
      Content: "We're excited to announce updates to our employee benefits program, including enhanced healthcare coverage and new wellness initiatives. These changes will take effect from July 1st, 2025.",
      CreatedAt: "2025-05-26T10:20:00",
      Attachment: "benefits_update_2025.pdf",
      isPinned: 0,
      Hidenews: 1
    }
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // Sort news to show pinned items first, then by date
      const sortedNews = mockNews.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return b.isPinned - a.isPinned;
        }
        return new Date(b.CreatedAt) - new Date(a.CreatedAt);
      });

      // Filter out hidden news for user role immediately
      const filteredSortedNews = userRole === 'user' 
        ? sortedNews.filter(item => !item.Hidenews)
        : sortedNews;

      setNews(filteredSortedNews);

      // Initialize pinned and hidden states
      const hiddenSet = new Set(
        sortedNews.filter(item => item.Hidenews === 1).map(item => item.NewsId)
      );
      const pinnedSet = new Set(
        sortedNews.filter(item => item.isPinned === 1).map(item => item.NewsId)
      );
      setHiddenNews(hiddenSet);
      setPinnedNews(pinnedSet);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleTogglePin = async (newsId) => {
    try {
      const isCurrentlyPinned = pinnedNews.has(newsId);
      const response = await axios.put(`${API_URL}/${newsId}/toggle-pin`, {
        isPinned: !isCurrentlyPinned ? 1 : 0
      });
      if (response.data.success) {
        // Always refetch news to sync state with DB
        await fetchNews();
      } else {
        throw new Error(response.data.message || 'Failed to update pin status');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      alert(error.response?.data?.error || error.message || 'Failed to update pin status. Please try again.');
    }
  };

  const handleOpenModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setForm({
        title: item.Title,
        category: item.Category,
        content: item.Content,
        attachment: null
      });
      setPreview(item.Attachment ? `/uploads/${item.Attachment}` : null);
    } else {
      setForm({ title: '', category: '', content: '', attachment: null });
      setPreview(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setForm({ title: '', category: '', content: '', attachment: null });
    setPreview(null);
  };

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      setForm(f => ({ ...f, attachment: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const newNewsItem = {
        NewsId: editItem ? editItem.NewsId : `NEWS${Date.now()}`,
        Title: form.title,
        Category: form.category,
        Content: form.content,
        CreatedAt: new Date().toISOString(),
        Attachment: form.attachment ? form.attachment.name : null,
        isPinned: 0,
        Hidenews: 0
      };

      if (editItem) {
        // Update existing news
        setNews(prevNews => 
          prevNews.map(item => 
            item.NewsId === editItem.NewsId ? newNewsItem : item
          )
        );
      } else {
        // Add new news
        setNews(prevNews => [...prevNews, newNewsItem]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Failed to save news. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    setSelectedNews(id);
    setDeleteModalOpen(true);
  };  const confirmDelete = async () => {
    try {
      // เรียก API เพื่อลบข่าวจาก Render database
      const response = await axios.delete(`${API_URL}/${selectedNews}`);
      
      // ตรวจสอบการตอบกลับจาก API
      if (response.status === 200) {
        // ลบข้อมูลออกจาก state ในแอพ
        setNews(prevNews => prevNews.filter(item => item.NewsId !== selectedNews));
        
        // ลบออกจากรายการที่ปักหมุดถ้ามี
        setPinnedNews(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedNews);
          return newSet;
        });
        
        // ลบออกจากรายการที่ซ่อนถ้ามี
        setHiddenNews(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedNews);
          return newSet;
        });
        
        // ปิด modal และล้างค่าที่เลือก
        setDeleteModalOpen(false);
        setSelectedNews(null);
        
        // แจ้งเตือนว่าลบสำเร็จ
      } else {
        throw new Error('Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      // แสดงข้อความ error ที่ได้จาก server หรือข้อความ default
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to delete news. Please try again.');
    }
  };

  const filteredNews = news
    .filter(item => 
      // For user role, only show non-hidden news
      (userRole === 'user' ? !hiddenNews.has(item.NewsId) : true) &&
      // Apply search filter
      (item.Title?.toLowerCase().includes(search.toLowerCase()) ||
       item.Category?.toLowerCase().includes(search.toLowerCase()) ||
       item.Content?.toLowerCase().includes(search.toLowerCase()))
    );

  // Add this function
  

  

  // Add this function to handle visibility toggle
  const handleToggleVisibility = async (newsId) => {
    try {
      // Get the current hidden state
      const isCurrentlyHidden = hiddenNews.has(newsId);
      
      // Update the database
      await axios.put(`${API_URL}/${newsId}/toggle-visibility`, {
        Hidenews: !isCurrentlyHidden ? 1 : 0
      });

      // Update local state
      setHiddenNews(prev => {
        const newSet = new Set(prev);
        if (newSet.has(newsId)) {
          newSet.delete(newsId);
        } else {
          newSet.add(newsId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update visibility status. Please try again.');
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);  const toggleDropdown = (newsId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setOpenDropdownId(currentId => currentId === newsId ? null : newsId);
  };

  return (
    <div className="dashboard-container" data-user-role={userRole}>
      <div className="dashboard-main">
        <ul className="circles">
          {[...Array(15)].map((_, i) => (
            <li key={i}></li>
          ))}
        </ul>
        
        <SideMenu />
        <div className="dashboard-content">
          <Topbar pageTitle="News" pageSubtitle="Company News & Announcements" />
          
          <div className="news-card">
            {userRole !== 'user' && (
              <div className="news-toolbar">
                <div className="news-search-wrap">
                  <FiSearch className="news-search-icon" />
                  <input
                    className="news-search"
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                
              </div>
            )}
            {userRole === 'user' && (
              <div className="news-toolbar">
                <div className="news-search-wrap" style={{ width: '100%' }}>
                  <FiSearch className="news-search-icon" />
                  <input
                    className="news-search"
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="news-list-table">
              {/* Table layout and columns */}
              <table className="news-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Created</th>
                    {userRole !== 'user' && <th className="action-col">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.length === 0 ? (
                    <tr>
                      <td colSpan={userRole !== 'user' ? "4" : "3"} className="no-news">No news found</td>
                    </tr>
                  ) : filteredNews.map(item => (
                    <tr 
                      key={item.NewsId} 
                      className={`
                        ${pinnedNews.has(item.NewsId) ? 'pinned' : ''} 
                        ${hiddenNews.has(item.NewsId) ? 'hidden-row' : ''}
                      `}
                      onClick={() => userRole === 'user' ? handleView(item) : null}
                      style={userRole === 'user' ? { cursor: 'pointer' } : {}}
                    >
                      <td>{item.Title}</td>
                      <td>
                        <div className={`button ${item.Category.toLowerCase()}`}>
                          {item.Category === 'Announcement' ? (
                            <FiBell className="category-icon" />
                          ) : item.Category === 'Activity' ? (
                            <FiActivity className="category-icon" />
                          ) : (
                            <FiTerminal className="category-icon" />
                          )}
                          <span className="lable">{item.Category}</span>
                        </div>
                      </td>
                      <td>{item.CreatedAt ? new Date(item.CreatedAt).toLocaleDateString() : '-'}</td>
                      {userRole !== 'user' && (
                        <td className="action-col">
                          <div className="desktop-actions">
                            <button
                              className={`icon-btn action-pin ${item.isPinned ? 'pinned' : ''}`}
                              onClick={() => handleTogglePin(item.NewsId)}
                              title={item.isPinned ? 'Unpin News' : 'Pin News'}
                            >
                              <FiStar />
                            </button>
                            <button 
                              className="icon-btn action-view" 
                              title="View" 
                              onClick={() => handleView(item)}
                            >
                              <FiEye />
                            </button>
                            
                            
                          </div>
                          <div className="mobile-actions">
                            <button 
                              type="button"
                              className="action-dropdown-toggle"
                              onClick={(e) => toggleDropdown(item.NewsId, e)}
                              title="Actions menu"
                            >
                              <FiMoreVertical size={20} />
                            </button>
                            <div className={`action-dropdown-content ${openDropdownId === item.NewsId ? 'show' : ''}`}>
                              <button
                                className="action-dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePin(item.NewsId);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiStar size={18} />
                                {item.isPinned ? 'Unpin' : 'Pin'}
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(item);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiEye size={18} />
                                View
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(item);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiEdit size={18} />
                                Edit
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility(item.NewsId);
                                  setOpenDropdownId(null);
                                }}
                              >
                                {hiddenNews.has(item.NewsId) ? <FiUnlock size={18} /> : <FiLock size={18} />}
                                {hiddenNews.has(item.NewsId) ? 'Show' : 'Hide'}
                              </button>
                              <button
                                className="action-dropdown-item delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.NewsId);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <FiTrash2 size={18} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h3>{editItem ? 'Edit News' : 'Add News'}</h3>
              <button className="edit-close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="edit-news-form">
              <div className="edit-form-group">
                <label>Title</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter news title"
                />
              </div>
              <div className="edit-form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="edit-form-group">
                <label>Content</label>
                <textarea 
                  name="content" 
                  value={form.content} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter news content"
                  rows="6"
                />
              </div>
              <div className="edit-form-group">
                <label>Attachment</label>
                <div className="edit-file-input-wrapper">
                  <input 
                    type="file" 
                    name="attachment" 
                    onChange={handleChange} 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    id="file-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload" className="edit-file-upload-label">
                    <FiPaperclip /> {form.attachment ? 'Change file' : 'Choose a file'}
                  </label>
                  {form.attachment && (
                    <div className="selected-file">
                      <FiFile /> {form.attachment.name}
                    </div>
                  )}
                </div>
                {preview && (
                  <div className="edit-file-preview">
                    <a href={preview} target="_blank" rel="noopener noreferrer">
                      <FiFile />
                      <span>Current attachment - Click to preview</span>
                    </a>
                  </div>
                )}
              </div>
              <div className="edit-modal-actions">
                <button type="button" onClick={handleCloseModal} className="edit-modal-btn edit-btn-cancel">
                  Cancel
                </button> 
                <button type="submit" className="edit-modal-btn edit-btn-save">
                  {editItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 4.44772 8.44772 4 9 4H15C15.5523 4 16 4.44772 16 5V7M8 7H16" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Delete News</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="delete-button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>{selectedItem.Title}</h3>
                <div className={`button ${selectedItem.Category.toLowerCase()}`}>
                  {selectedItem.Category === 'Announcement' ? (
                    <FiBell className="category-icon" />
                  ) : selectedItem.Category === 'Activity' ? (
                    <FiActivity className="category-icon" />
                  ) : (
                    <FiTerminal className="category-icon" />
                  )}
                  <span className="lable">{selectedItem.Category}</span>
                  {userRole !== 'user' && selectedItem.isPinned === 1 && (
                    <FiStar style={{ marginLeft: '8px', color: '#F59E0B' }} />
                  )}
                </div>
              </div>
              <button 
                className="close-btn" 
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedItem(null);
                }}
              >×</button>
            </div>
            <div className="view-content">
              <div className="view-meta">
                <div className="created-at">
                  <FiClock className="meta-icon" />
                  {new Date(selectedItem.CreatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="content-section">
                <div className="content-box">
                  {selectedItem.Content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {selectedItem.Attachment && (
                <div className="attachment-section">
                  <div className="attachment-header">
                    <FiPaperclip className="attachment-icon" />
                    Attachment
                  </div>
                  <div className="attachment-preview">
                    {isImageFile(selectedItem.Attachment) ? (
                      <div className="image-preview-container">
                        <img 
                          src={`/uploads/${selectedItem.Attachment}`} 
                          alt="News attachment"
                          className="attachment-image"
                        />
                      </div>
                    ) : (
                      <a 
                        href={`/uploads/${selectedItem.Attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        <span className="filename">{selectedItem.Attachment}</span>
                        <FiDownload style={{ marginLeft: '8px' }} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {userRole !== 'user' && (
                <div className="view-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenModal(selectedItem);
                    }}
                  >
                    <FiEdit /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default New;