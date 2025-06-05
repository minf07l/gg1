import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Admin password
const ADMIN_PASSWORD = "ggtomathggtomathggtomath";

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'register_opened': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Olimpiad card component for listing (minimal info)
const OlimpiadCard = ({ olimpiad, onEdit, onDelete, onViewDetails, isAdmin }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="flex-1"
          onClick={() => onViewDetails(olimpiad)}
        >
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {olimpiad.name}
          </h3>
          <p className="text-sm text-gray-600">{olimpiad.subject}</p>
        </div>
        <StatusBadge status={olimpiad.status} />
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={() => onViewDetails(olimpiad)}
          className="text-blue-500 text-sm hover:text-blue-700 transition-colors"
        >
          View Details →
        </button>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(olimpiad);
              }}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(olimpiad.id);
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Olimpiad detail view component
const OlimpiadDetailView = ({ olimpiad, features, onBack, onEdit, onDelete, isAdmin }) => {
  if (!olimpiad) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 hover:text-blue-700 transition-colors mb-4"
        >
          ← Back to Olimpiads
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {olimpiad.avatar && (
                <img 
                  src={olimpiad.avatar} 
                  alt={olimpiad.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{olimpiad.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{olimpiad.subject}</p>
                <div className="mt-3">
                  <StatusBadge status={olimpiad.status} />
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="flex space-x-3">
                <button
                  onClick={() => onEdit(olimpiad)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(olimpiad.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Level</h3>
                <p className="text-gray-700">{olimpiad.level}</p>
              </div>
              
              {olimpiad.dates && olimpiad.dates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">DATES</h3>
                  <div className="space-y-2">
                    {olimpiad.dates.map((date, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900">{date.text}</p>
                        <p className="text-gray-600">{new Date(date.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {features.length > 0 && olimpiad.dynamic_features && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-3">
                  {features.map(feature => {
                    const value = olimpiad.dynamic_features[feature.id];
                    if (!value || value === 'none') return null;
                    
                    return (
                      <div key={feature.id} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium text-gray-900 mb-1">{feature.name}</p>
                        {feature.type === 'img' ? (
                          <img 
                            src={value} 
                            alt={feature.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          <p className="text-gray-700">{value}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Password prompt component
const PasswordPrompt = ({ onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onSubmit();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Admin Access</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Access
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Advanced filtering component
const AdvancedFiltering = ({ olimpiads, onFilterChange }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique subjects from olimpiads
  const uniqueSubjects = [...new Set(olimpiads.map(o => o.subject))].sort();

  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSearch = () => {
    onFilterChange({
      subjects: selectedSubjects,
      status: selectedStatus,
      searchTerm: searchTerm.trim()
    });
  };

  const clearFilters = () => {
    setSelectedSubjects([]);
    setSelectedStatus('all');
    setSearchTerm('');
    onFilterChange({
      subjects: [],
      status: 'all',
      searchTerm: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Olimpiads</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search by Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Search by Name</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter olimpiad name..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="register_opened">Register Opened</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Subject (Multi-select)</label>
          <div className="border rounded px-3 py-2 max-h-32 overflow-y-auto">
            {uniqueSubjects.length > 0 ? (
              uniqueSubjects.map(subject => (
                <label key={subject} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="rounded"
                  />
                  <span className="text-sm">{subject}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500">No subjects available</p>
            )}
          </div>
          {selectedSubjects.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">Selected: {selectedSubjects.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3 mt-6">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

// Admin form component
const AdminForm = ({ olimpiad, features, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: olimpiad?.name || '',
    subject: olimpiad?.subject || '',
    level: olimpiad?.level || '',
    status: olimpiad?.status || 'upcoming',
    avatar: olimpiad?.avatar || '',
    dates: olimpiad?.dates || [],
    dynamic_features: olimpiad?.dynamic_features || {}
  });

  const [newDate, setNewDate] = useState({ text: '', date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const addDatePair = () => {
    if (newDate.text && newDate.date) {
      setFormData(prev => ({
        ...prev,
        dates: [...prev.dates, newDate]
      }));
      setNewDate({ text: '', date: '' });
    }
  };

  const removeDatePair = (index) => {
    setFormData(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };

  const updateFeatureValue = (featureId, value) => {
    setFormData(prev => ({
      ...prev,
      dynamic_features: {
        ...prev.dynamic_features,
        [featureId]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {olimpiad ? 'Edit Olimpiad' : 'Create New Olimpiad'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="upcoming">Upcoming</option>
              <option value="register_opened">Register Opened</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">DATES</label>
            <div className="space-y-2">
              {formData.dates.map((date, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={date.text}
                    className="flex-1 border rounded px-3 py-1 text-sm"
                    readOnly
                  />
                  <input
                    type="date"
                    value={date.date}
                    className="border rounded px-3 py-1 text-sm"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => removeDatePair(index)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newDate.text}
                  onChange={(e) => setNewDate(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Event description"
                  className="flex-1 border rounded px-3 py-1 text-sm"
                />
                <input
                  type="date"
                  value={newDate.date}
                  onChange={(e) => setNewDate(prev => ({ ...prev, date: e.target.value }))}
                  className="border rounded px-3 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={addDatePair}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          
          {features.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Dynamic Features</label>
              {features.map(feature => (
                <div key={feature.id} className="mb-2">
                  <label className="block text-xs text-gray-600 mb-1">{feature.name}</label>
                  {feature.type === 'text' ? (
                    <input
                      type="text"
                      value={formData.dynamic_features[feature.id] || 'none'}
                      onChange={(e) => updateFeatureValue(feature.id, e.target.value)}
                      className="w-full border rounded px-3 py-1 text-sm"
                    />
                  ) : feature.type === 'img' ? (
                    <input
                      type="url"
                      value={formData.dynamic_features[feature.id] || ''}
                      onChange={(e) => updateFeatureValue(feature.id, e.target.value)}
                      className="w-full border rounded px-3 py-1 text-sm"
                      placeholder="Image URL"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.dynamic_features[feature.id] || ''}
                      onChange={(e) => updateFeatureValue(feature.id, e.target.value)}
                      className="w-full border rounded px-3 py-1 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {olimpiad ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Feature management component
const FeatureManager = ({ features, onCreateFeature, onDeleteFeature }) => {
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: '', type: 'text' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateFeature(newFeature);
    setNewFeature({ name: '', type: 'text' });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Dynamic Features</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Feature
        </button>
      </div>
      
      <div className="space-y-2">
        {features.map(feature => (
          <div key={feature.id} className="flex justify-between items-center p-2 border rounded">
            <div>
              <span className="font-medium">{feature.name}</span>
              <span className="text-sm text-gray-600 ml-2">({feature.type})</span>
            </div>
            <button
              onClick={() => onDeleteFeature(feature.id)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Feature</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Name</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Feature Type</label>
                <select
                  value={newFeature.type}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="text">Text</option>
                  <option value="img">Image</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App component
function App() {
  const [olimpiads, setOlipiads] = useState([]);
  const [features, setFeatures] = useState([]);
  const [filteredOlipiads, setFilteredOlipiads] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOlimpiad, setEditingOlimpiad] = useState(null);
  const [selectedOlimpiad, setSelectedOlimpiad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({
    subjects: [],
    status: 'all',
    searchTerm: ''
  });

  // Fetch data
  useEffect(() => {
    fetchOlipiads();
    fetchFeatures();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = olimpiads;
    
    // Filter by status
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(o => o.status === currentFilters.status);
    }
    
    // Filter by subjects
    if (currentFilters.subjects.length > 0) {
      filtered = filtered.filter(o => currentFilters.subjects.includes(o.subject));
    }
    
    // Filter by search term
    if (currentFilters.searchTerm) {
      filtered = filtered.filter(o => 
        o.name.toLowerCase().includes(currentFilters.searchTerm.toLowerCase())
      );
    }
    
    setFilteredOlipiads(filtered);
  }, [olimpiads, currentFilters]);

  const fetchOlipiads = async () => {
    try {
      const response = await axios.get(`${API}/olimpiads`);
      setOlipiads(response.data);
    } catch (error) {
      console.error('Error fetching olimpiads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const response = await axios.get(`${API}/features`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsAdmin(true);
    setShowPasswordPrompt(false);
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
  };

  const handleViewDetails = (olimpiad) => {
    setSelectedOlimpiad(olimpiad);
  };

  const handleBackToList = () => {
    setSelectedOlimpiad(null);
  };

  const handleSaveOlimpiad = async (formData) => {
    try {
      if (editingOlimpiad) {
        await axios.put(`${API}/olimpiads/${editingOlimpiad.id}`, formData);
      } else {
        await axios.post(`${API}/olimpiads`, formData);
      }
      await fetchOlipiads();
      setShowForm(false);
      setEditingOlimpiad(null);
    } catch (error) {
      console.error('Error saving olimpiad:', error);
    }
  };

  const handleDeleteOlimpiad = async (id) => {
    if (window.confirm('Are you sure you want to delete this olimpiad?')) {
      try {
        await axios.delete(`${API}/olimpiads/${id}`);
        await fetchOlipiads();
        if (selectedOlimpiad && selectedOlimpiad.id === id) {
          setSelectedOlimpiad(null);
        }
      } catch (error) {
        console.error('Error deleting olimpiad:', error);
      }
    }
  };

  const handleCreateFeature = async (featureData) => {
    try {
      await axios.post(`${API}/features`, featureData);
      await fetchFeatures();
      await fetchOlipiads(); // Refresh to get updated dynamic features
    } catch (error) {
      console.error('Error creating feature:', error);
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature? It will be removed from all olimpiads.')) {
      try {
        await axios.delete(`${API}/features/${featureId}`);
        await fetchFeatures();
        await fetchOlipiads(); // Refresh to get updated dynamic features
      } catch (error) {
        console.error('Error deleting feature:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show detail view if an olimpiad is selected
  if (selectedOlimpiad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Olimpiad Management</h1>
              <button
                onClick={handleAdminToggle}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isAdmin 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isAdmin ? 'Exit Admin' : 'Admin Mode'}
              </button>
            </div>
          </div>
        </header>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <OlimpiadDetailView
            olimpiad={selectedOlimpiad}
            features={features}
            onBack={handleBackToList}
            onEdit={(olimpiad) => {
              setEditingOlimpiad(olimpiad);
              setShowForm(true);
            }}
            onDelete={handleDeleteOlimpiad}
            isAdmin={isAdmin}
          />
        </div>

        {/* Forms */}
        {showForm && (
          <AdminForm
            olimpiad={editingOlimpiad}
            features={features}
            onSave={handleSaveOlimpiad}
            onCancel={() => {
              setShowForm(false);
              setEditingOlimpiad(null);
            }}
          />
        )}

        {showPasswordPrompt && (
          <PasswordPrompt
            onSubmit={handlePasswordSuccess}
            onCancel={handlePasswordCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Olimpiad Management</h1>
            <button
              onClick={handleAdminToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isAdmin 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isAdmin ? 'Exit Admin' : 'Admin Mode'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Features Management */}
        {isAdmin && (
          <div className="mb-8">
            <FeatureManager
              features={features}
              onCreateFeature={handleCreateFeature}
              onDeleteFeature={handleDeleteFeature}
            />
          </div>
        )}

        {/* Advanced Filtering */}
        <AdvancedFiltering
          olimpiads={olimpiads}
          onFilterChange={handleFilterChange}
        />

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Showing {filteredOlipiads.length} of {olimpiads.length} olimpiads
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => {
                setEditingOlimpiad(null);
                setShowForm(true);
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Add Olimpiad
            </button>
          )}
        </div>

        {/* Olimpiads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOlipiads.map(olimpiad => (
            <OlimpiadCard
              key={olimpiad.id}
              olimpiad={olimpiad}
              onEdit={(olimpiad) => {
                setEditingOlimpiad(olimpiad);
                setShowForm(true);
              }}
              onDelete={handleDeleteOlimpiad}
              onViewDetails={handleViewDetails}
              isAdmin={isAdmin}
            />
          ))}
        </div>

        {filteredOlipiads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No olimpiads found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <AdminForm
          olimpiad={editingOlimpiad}
          features={features}
          onSave={handleSaveOlimpiad}
          onCancel={() => {
            setShowForm(false);
            setEditingOlimpiad(null);
          }}
        />
      )}

      {showPasswordPrompt && (
        <PasswordPrompt
          onSubmit={handlePasswordSuccess}
          onCancel={handlePasswordCancel}
        />
      )}
    </div>
  );
}

export default App;