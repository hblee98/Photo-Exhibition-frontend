import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"
import Gallery from "./components/Gallery/Gallery"

const App = () => {

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
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
        console.log("Fetched regions:", data);
        const sortedData = data.sort((a, b) => a.localeCompare(b));
        setRegions(sortedData);
      })
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);

  
  
  useEffect(() => {
    setPhotos([]); 
    const endpoint = selectedRegion
      ? `/api/photos/regions/${selectedRegion}`
      : `/api/photos/all`;

    fetch(endpoint, {
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
        console.log("Fetched photos:", data);
        setPhotos(data);

      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
  
      });
    console.log("Selected region :", selectedRegion);
  }, [selectedRegion]);



  

  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar regions={regions} setSelectedRegion={setSelectedRegion} />
        <Gallery photos={photos} selectedRegion={selectedRegion} />
      </div>
    </div>

  )
};

export default App;
