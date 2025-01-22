import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"
import Gallery from "./components/Gallery/Gallery"

const App = () => {

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const[allPhotos, setAllPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);


  useEffect(() => {
    fetch(`/api/photos/regions`, {
      headers: {
        "Cache-Control": "no-cache",
      },
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
    fetch(`/api/photos/all`, {
      headers: {
        "Cache-Control": "no-cache",
      },
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
    if (selectedRegion) {
      const filteredPhotos = allPhotos.filter(
        (photo) => photo.region === selectedRegion
      );
      setPhotos(filteredPhotos);
    } else {
      setPhotos(allPhotos);
    }
  }, [selectedRegion, allPhotos]);
  

  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar regions={regions} setSelectedRegion={setSelectedRegion} />
        <Gallery 
          allPhotos={allPhotos}
          photos={photos}
          selectedRegion={selectedRegion}
        />
      </div>
    </div>

  )
};

export default App;

