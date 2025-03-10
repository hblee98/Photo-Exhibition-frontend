import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"
import Gallery from "./components/Gallery/Gallery"
import MobileHeader from "./components/MobileHeader/MobileHeader"
import MobileGallery from "./components/MobileGallery/MobileGallery"

const API_ENDPOINTS = {
  REGIONS: '/api/photos/regions',
  ALL_PHOTOS: '/api/photos/thumbnails'
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
          thumbnailFilePath: `${photo.thumbnailFilePath}`,
          originFilePath: `${photo.originFilePath}`
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
    <div className="app">
      <div className="content">
        {isMobile ? (
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
              <Header onReset={() => {
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
        )}
      </div>
    </div>
  )
};

export default App;
