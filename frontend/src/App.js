import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

// Olimpiad card component
const OlimpiadCard = ({ olimpiad, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {olimpiad.avatar && (
            <img 
              src={olimpiad.avatar} 
              alt={olimpiad.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{olimpiad.name}</h3>
            <p className="text-sm text-gray-600">{olimpiad.subject}</p>
          </div>
        </div>
        <StatusBadge status={olimpiad.status} />
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm"><span className="font-medium">Level:</span> {olimpiad.level}</p>
        
        {olimpiad.dates && olimpiad.dates.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">DATES:</p>
            {olimpiad.dates.map((date, index) => (
              <p key={index} className="text-sm text-gray-600 ml-2">
                {date.text}: {new Date(date.date).toLocaleDateString()}
              </p>
            ))}
          </div>
        )}
      </div>
      
      {isAdmin && (
        <div className="flex space-x-2 pt-4 border-t">
          <button
            onClick={() => onEdit(olimpiad)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(olimpiad.id)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOlimpiad, setEditingOlimpiad] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusCounts = {
    upcoming: olimpiads.filter(o => o.status === 'upcoming').length,
    register_opened: olimpiads.filter(o => o.status === 'register_opened').length,
    ongoing: olimpiads.filter(o => o.status === 'ongoing').length,
    completed: olimpiads.filter(o => o.status === 'completed').length,
  };

  // Fetch data
  useEffect(() => {
    fetchOlipiads();
    fetchFeatures();
  }, []);

  // Filter olimpiads
  useEffect(() => {
    let filtered = olimpiads;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOlipiads(filtered);
  }, [olimpiads, selectedStatus, searchTerm]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Olimpiad Management</h1>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
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

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div 
              key={status}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-colors ${
                selectedStatus === status ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {status.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <StatusBadge status={status} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
    </div>
  );
}

export default App;