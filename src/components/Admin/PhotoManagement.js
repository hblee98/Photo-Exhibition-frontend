import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './PhotoManagement.css';

const PhotoManagement = ({ photos }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const deleteResponse = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete photo.');
      }

      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      setError('An error occurred while deleting the photo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      <Header onAdminClick={() => navigate('/')} />
      <div className="photo-management-container">
        <div className="page-header">
          <h1>Photo Management</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="photo-management-content">   
          <div className="photo-list-section">
            <h2>Photo List</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="photo-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-item">
                  <div className="photo-thumbnail">
                    <img 
                      src={photo.thumbnailFilePath} 
                      alt={photo.description} 
                      className="thumbnail-image"
                    />
                  </div>
                  <div className="photo-info">
                    <h3>{photo.description || 'No description'}</h3>
                    <p>Region: {photo.region || 'No region'}</p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(photo.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoManagement; 