import React, { useEffect, useState } from "react";
import "./Gallery.css"

const Gallery = ({ photos, selectedRegion }) => {
  const transformImageURL = (url) => {
    if (!url) {
      return "";
    }
    if (url.includes("https://drive.google.com/uc?id=")) {
      return url.replace("uc?id=", "thumbnail?id=");
    }
    return url; 
  };
  
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  useEffect(() => {
    setVisiblePhotos([]);
    const uniquePhotos = photos.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );
    setVisiblePhotos(uniquePhotos);
  }, [photos, selectedRegion]);
  return (
    <div className="gallery">
      <h3>
        {selectedRegion ? `Photos from ${selectedRegion}` : "Photos from All Regions"}
      </h3>
      <div>
        {visiblePhotos.map((photo) => (
          <div key={photo.id}>
            <h4>{photo.title}</h4> 
            <p>Subregion: {photo.subRegion || "N/A"}</p> 
            <p>Description: {photo.description || "No description available"}</p>
            <p>ImageURL: {photo.imageURL || "No imageURL available"}</p>
            <img
              className="photo-item"
              src={transformImageURL(photo.imageURL)}
              alt={photo.title}
            />

            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
