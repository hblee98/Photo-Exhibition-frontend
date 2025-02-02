import React, { useEffect, useState } from "react";
import PhotoItem from "../PhotoItem/PhotoItem";
import "./Gallery.css";

const Gallery = ({
  allPhotos,
  photos,
  selectedRegion,
  selectedPhoto,
  setSelectedPhoto,
  setCenter,
  center
}) => {

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [radiusX, setRadiusX] = useState(400);
  const [radiusY, setRadiusY] = useState(200);
  const zDepth = 50;
  const angleStep = 360 / allPhotos.length;
  const [loading, setLoading] = useState(true);
  const [loadedPhotos, setLoadedPhotos] = useState([]);
  const BATCH_SIZE = 10;
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showFrontSide, setShowFrontSide] = useState(false);

  const [filmRotation, setFilmRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

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
    const updateCenter = () => {
      const container = document.querySelector(".gallery");
      if (container) {
        const rect = container.getBoundingClientRect();
        const containerCenterX = rect.width / 2;
        const containerCenterY = rect.height / 2;
        setCenter({ x: containerCenterX, y: containerCenterY });
      }
    };

    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => {
      window.removeEventListener("resize", updateCenter);
    };
  }, [setCenter]);

  useEffect(() => {
    if (!allPhotos || allPhotos.length === 0) return;

    const loadPhotosInBatches = async () => {
      setLoading(true);
      const totalPhotos = shuffleArray([...allPhotos], Date.now());
      const loadedPhotosArray = [];
      const totalBatches = Math.ceil(totalPhotos.length / BATCH_SIZE);

      for (let i = 0; i < totalPhotos.length; i += BATCH_SIZE) {
        const batch = totalPhotos.slice(i, i + BATCH_SIZE);
        
        await new Promise(resolve => {
          setTimeout(() => {
            loadedPhotosArray.push(...batch);
            setLoadedPhotos([...loadedPhotosArray]);
            const currentBatch = Math.ceil(i / BATCH_SIZE) + 1;
            const progress = (currentBatch / totalBatches) * 100;
            setLoadingProgress(progress);
            resolve();
          }, 1000);
        });
      }

      setTimeout(() => {
        setLoading(false);
        setShowFrontSide(false);
      }, 1000);
    };

    loadPhotosInBatches();
  }, [allPhotos]);

  useEffect(() => {
    setIsRotating(!selectedRegion && !selectedPhoto);
  }, [selectedRegion, selectedPhoto]);

  useEffect(() => {
    if (!isRotating) return;
   
    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const innerWidth = window.innerWidth;
      if (innerWidth > 0) {
        const relativeX = clientX / innerWidth;
        const newAngle = relativeX * 360;
        setRotationAngle((prevAngle) => prevAngle + (newAngle - prevAngle) * 0.05);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isRotating]);
  
  useEffect(() => {
    const updateRadii = () => {
      const newRadiusX = window.innerWidth * 0.35;
      const newRadiusY = window.innerHeight * 0.25;
      if (newRadiusX !== radiusX || newRadiusY !== radiusY) {
        setRadiusX(newRadiusX);
        setRadiusY(newRadiusY);
      }
    };
    updateRadii();
    window.addEventListener("resize", updateRadii);
    return () => {
      window.removeEventListener("resize", updateRadii);
    };
  }, [radiusX, radiusY]);

  useEffect(() => {
    const handleExitClick = (e) => {
      const popup = document.querySelector(".photo-item");
      if (popup && popup.contains(e.target)) {
        return;
      }
      setSelectedPhoto(null);
    };
    document.addEventListener("click", handleExitClick);
    return () => {
      document.removeEventListener("click", handleExitClick);
    };
  }, [setSelectedPhoto]);
  
  useEffect(() => {
    if (selectedRegion === undefined) {
      setShowFrontSide(false);
    } else {
      setShowFrontSide(true);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedPhoto) return;
    
    const handleMouseMove = (e) => {
      const film = document.querySelector(".photo-center");
      if (!film) return; 
      const rect = film.getBoundingClientRect();  

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const boundaryWidth = rect.width * 1.4;
      const boundaryHeight = rect.height * 1.4;
      
      if (
        Math.abs(mouseX) > boundaryWidth / 2 ||
        Math.abs(mouseY) > boundaryHeight / 2
      ) {
        setFilmRotation({ x: 0, y: 0 });
        return;
      }

      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const maxDistance = Math.sqrt((rect.width / 2) * (rect.width / 2) + (rect.height / 2) * (rect.height / 2));
      
      const weight = Math.min(distance / maxDistance, 1);
      
      const relativeX = (mouseX / (rect.width / 2)) * weight;
      const relativeY = (mouseY / (rect.height / 2)) * weight;

      const MAX_ROTATION = 20;
      const rotateY = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, relativeX * 30));
      const rotateX = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, -relativeY * 30));
      
      setFilmRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedPhoto]);

  useEffect(() => {
    setIsFlipped(false);
  }, [selectedPhoto]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-bar-container">
          <div 
            className="loading-bar" 
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <div className="loading-text">
          Loading Photos... {Math.round(loadingProgress)}%
        </div>
      </div>
    );
  }

  return (
    <div className="gallery"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedPhoto(null);
        }
      }}
    >
      <div className="circle-container">
        {loadedPhotos.map((photo, index) => {
          const angle = angleStep * index + rotationAngle;
          const centerYOffset = window.innerHeight * 0.05;
          const x = radiusX * Math.cos((angle * Math.PI) / 180);
          const y = radiusY * Math.sin((angle * Math.PI) / 180) + centerYOffset;
          const z =
            photos.some((p) => p.id === photo.id)
              ? zDepth
              : 0;
          const rotateY = angle;
          
          // Divide conditions
          const isPhotoSelected = selectedPhoto && selectedPhoto.id === photo.id;
          const isRegionSelected = selectedRegion && photo.region === selectedRegion;
          
          let wrapperClass;
          if (isPhotoSelected) {
            wrapperClass = "selected"
          } else if (isRegionSelected) {
            wrapperClass = "region-selected"
          } else if (!selectedPhoto && !selectedRegion) {
            wrapperClass = "default"
          } else {
            wrapperClass = "not-selected"
          }

          const shouldShowFront = showFrontSide;
          
          return (
            <div
              key={photo.id}
              className={`photo-wrapper ${wrapperClass}`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (shouldShowFront) {
                  setSelectedPhoto(photo);
                }
              }}
            >
              <PhotoItem 
                photo={photo} 
                scale={1} 
                angle={rotateY} 
                showFront={showFrontSide}
              />
            </div>
          );
        })}
      </div>
      {selectedPhoto && (
        <div 
          className={`photo-center ${selectedPhoto.height > selectedPhoto.width ? 'mini' : 'square'}`}
          style={{
            position: "absolute",
            top: `${window.innerHeight * 0.6}px`,
            left: `${window.innerWidth * 0.5}px`,
            transform: `translate(-50%, -50%) 
                        perspective(1000px)
                        rotateY(${filmRotation.y + (isFlipped ? 180 : 0)}deg) 
                        rotateX(${filmRotation.x}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(prev => !prev);
          }}
        >
          <PhotoItem 
            photo={selectedPhoto}
            showFront={true}
            isFlipped={isFlipped}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
