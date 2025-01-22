import React, { useEffect, useState } from "react";
import "./Gallery.css";

const Gallery = ({ allPhotos, photos, selectedRegion, setSelectedPhoto }) => {

  const [shuffledPhotos, setShuffledPhotos] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const transformImageURL = (url) => {
    if (!url) {
      return "";
    }
    if (url.includes("https://drive.google.com/uc?id=")) {
      return url.replace("uc?id=", "thumbnail?id=");
    }
    return url;
  };
  const shuffleArray = (array, seed) => {
    const result = [...array];
    let currentIndex = result.length;
  
    // LCG Algorithm
    const random = (() => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280; 
        return s / 233280;
      };
    })();
  
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(random() * currentIndex);
      currentIndex--;
      [result[currentIndex], result[randomIndex]] = [
        result[randomIndex],
        result[currentIndex],
      ];
    }
  
    return result;
  };
  

  useEffect(() => {
    if (!allPhotos || allPhotos.length === 0) return;
    const seed = 12345;
    const shuffled = shuffleArray(allPhotos, seed);
    setShuffledPhotos(shuffled);
  }, [allPhotos]);

  useEffect(() => {
    const updateCenter = () => {
      const container = document.querySelector(".circle-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setCenter({ x: centerX, y: centerY });
      }
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => {
      window.removeEventListener("resize", updateCenter);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const innerWidth = window.innerWidth;
      if (innerWidth > 0) {
        const relativeX = clientX / innerWidth;
        const newAngle = relativeX * 360;
        setRotationAngle((prevAngle) => prevAngle + (newAngle - prevAngle)); 
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);



  const radiusX = 430; 
  const radiusY = 150; 
  const zDepth = 50; 
  const angleStep = 360 / allPhotos.length; 

  return (
    <div className="gallery">
      <h2 className="gallery-description">
        {selectedRegion
          ? `Photos from ${selectedRegion}`
          : "Photos from All Regions"}
      </h2>
      <div className="circle-container">
        {shuffledPhotos.map((photo, index) => {
          const angle = angleStep * index + rotationAngle; 
          const x = radiusX * Math.cos((angle * Math.PI) / 180); 
          const y = radiusY * Math.sin((angle * Math.PI) / 180); 
          const z =
          photos.some((p) => p.id === photo.id)
            ? zDepth 
            : 0;
          const rotateY = angle;

          return (
            <div
              key={photo.id}
              className={`photo-wrapper ${
                photos.some((p) => p.id === photo.id) ? "selected" : ""
              }`}
              style={{
                transform: `translate3d(${center.x + x}px, ${center.y + y}px, ${z}px) rotateY(${rotateY}deg)`,
              }}
            >
              <img
                src={transformImageURL(photo.imageURL)}
                alt={photo.title}
                className="photo-item"
                onClick={() => setSelectedPhoto(photo)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
