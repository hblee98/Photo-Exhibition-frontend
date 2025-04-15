import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"
import Gallery from "./components/Gallery/Gallery"
import MobileHeader from "./components/MobileHeader/MobileHeader"
import MobileGallery from "./components/MobileGallery/MobileGallery"
import PhotoManagement from "./components/Admin/PhotoManagement"
import Login from './components/Admin/Login';
import ProtectedRoute from './components/ProtectedRoute';


const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hblee98.com' 
  : '';

const API_ENDPOINTS = {
  REGIONS: `${API_BASE_URL}/api/photos/regions`,
  ALL_PHOTOS: `${API_BASE_URL}/api/photos/thumbnails`,
  LOGIN: `${API_BASE_URL}/api/admin/login`
};

const App = () => {
  
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(undefined);
  const [allPhotos, setAllPhotos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const galleryRef = useRef();
  const mobileGalleryRef = useRef();

  useEffect(() => {
    // Fetch regions
    fetch(API_ENDPOINTS.REGIONS, {
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const sortedData = data.sort((a, b) => a.localeCompare(b));
        setRegions(sortedData);
      })
      .catch((error) => console.error("Error fetching regions:", error));
  }, []); 

  useEffect(() => {
    fetch(API_ENDPOINTS.ALL_PHOTOS, {
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const formattedPhotos = data.map(photo => ({
          ...photo,
          thumbnailFilePath: `${API_BASE_URL}${photo.thumbnailFilePath}`,
          originFilePath: `${API_BASE_URL}${photo.originFilePath}`
        }));
        setAllPhotos(formattedPhotos); 
      })
      .catch((error) => {
        console.error("Error fetching all photos:", error);
      });
  }, []);

  const checkIsMobile = () => {
    const isMobileWidth = window.innerWidth <= 768;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileWidth || isMobileDevice);
  };
  useEffect(() => {
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <div className="content">
          <Routes>
            <Route path="/" element={
              isMobile ? (
                <>
                  <MobileHeader onReset={() => {
                    if (mobileGalleryRef.current) {
                      mobileGalleryRef.current.handleReset();
                    }
                  }} />
                  <MobileGallery 
                    ref={mobileGalleryRef}
                    allPhotos={allPhotos}
                    selectedRegion={selectedRegion}
                  />
                </>
              ) : (
                <>
                  <Header onGalleryClick={() => {
                    if (galleryRef.current) {
                      galleryRef.current.handleReset();
                    }
                  }} />
                  <Sidebar regions={regions} setSelectedRegion={setSelectedRegion} />
                  <Gallery 
                    ref={galleryRef}
                    allPhotos={allPhotos}
                    selectedRegion={selectedRegion}
                  />
                </>
              )
            } />
            <Route path="/login" element={<Login />} />
            <Route
              path="/login/*"
              element={
                <ProtectedRoute>
                  <PhotoManagement photos={allPhotos} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/photo-management"
              element={
                <ProtectedRoute>
                  <PhotoManagement photos={allPhotos} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  )
};

export default App;
