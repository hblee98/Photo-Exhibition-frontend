import React, { useState, useEffect } from "react";
import Header from "./components/Header/Header"
import Sidebar from "./components/Sidebar/Sidebar"

const App = () => {

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);


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
  

  return (
    <div className="container">
      <Header />
      <Sidebar regions={regions} />
    </div>
  );
};

export default App;
