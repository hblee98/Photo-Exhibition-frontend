import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"
import Gallery from "./components/Gallery/Gallery"

const API_ENDPOINTS = {
  REGIONS: '/api/photos/regions',
  ALL_PHOTOS: '/api/photos/all'
};

const App = () => {
  
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(undefined);
  const [allPhotos, setAllPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);


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
        setAllPhotos(data); 
        setPhotos(data);
      })
      .catch((error) => {
        console.error("Error fetching all photos:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedRegion === undefined) {
      setPhotos(allPhotos);
    } else if (selectedRegion === null) {
      setPhotos(allPhotos);
    } else {
      const filteredPhotos = allPhotos.filter(
        (photo) => photo.region === selectedRegion
      );
      setPhotos(filteredPhotos);
    }
  }, [selectedRegion, allPhotos]);

  return (
    <div className="app">
      <Header />
      <Sidebar regions={regions} setSelectedRegion={setSelectedRegion} />
      <div className="content">
        <Gallery 
          allPhotos={allPhotos}
          photos={photos}
          selectedRegion={selectedRegion}
          setSelectedPhoto={setSelectedPhoto}
          selectedPhoto={selectedPhoto}
        />
      </div>
    </div>
  )
};

export default App;