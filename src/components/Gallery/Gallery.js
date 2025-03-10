import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import FilmItem from "../FilmItem/FilmItem";
import "./Gallery.css";
import characterImg from "../../assets/hb.PNG";

const Gallery = forwardRef(({allPhotos, selectedRegion}, ref) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [radiusX, setRadiusX] = useState(550);
  const [radiusY, setRadiusY] = useState(200);
  const angleStep = 360 / allPhotos.length;
  const [loading, setLoading] = useState(true);
  const [loadedPhotos, setLoadedPhotos] = useState([]);
  const BATCH_SIZE = 10;
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showFrontSide, setShowFrontSide] = useState(false);
  const [filmRotation, setFilmRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCharacterFlipped, setIsCharacterFlipped] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [showClickMe, setShowClickMe] = useState(true);

  const handleReset = () => {
    setSelectedFilm(null);
    setShowFrontSide(false);
    setRotationAngle(0);
    setShowClickMe(true);
  };

  useImperativeHandle(ref, () => ({
    handleReset
  }));

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
    setIsRotating(!selectedRegion && !selectedFilm);
  }, [selectedRegion, selectedFilm]);

  useEffect(() => {
    if (!isRotating) return;

    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const innerWidth = window.innerWidth;
      if (innerWidth > 0) {
        const relativeX = (clientX / innerWidth) * 2 - 1;
        const newAngle = relativeX * 15;
        const limitedAngle = Math.max(-15, Math.min(15, newAngle));
        setRotationAngle((prevAngle) => prevAngle + (limitedAngle - prevAngle));
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
      const popup = document.querySelector(".film-item");
      if (popup && popup.contains(e.target)) {
        console.log('popup done:');
        return;
      }
      setSelectedFilm(null);
    };
    document.addEventListener("click", handleExitClick);
    return () => {
      document.removeEventListener("click", handleExitClick);
    };
  }, [setSelectedFilm]);
  
  useEffect(() => {
    if (selectedRegion === undefined) {
      setShowFrontSide(false);
    } else {
      setShowFrontSide(true);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedFilm) return;
    
    const handleMouseMove = (e) => {
      const film = document.querySelector(".film-center");
      if (!film) return;

      const rect = film.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      const radius = rect.width * 0.8;
      
      if (distance < radius) {
        const normalizedX = distanceX / (rect.width / 2);
        const normalizedY = distanceY / (rect.height / 2);
        const rotateX = isFlipped ? -normalizedY * 20 : normalizedY * 20;
        const rotateY = isFlipped ? normalizedX * 20 : -normalizedX * 20;
        
        setFilmRotation({
          x: rotateX,
          y: rotateY
        });
      } else {
        setFilmRotation({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setFilmRotation({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.querySelector(".film-center")?.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.querySelector(".film-center")?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selectedFilm, isFlipped]);


  useEffect(() => {
    const handleMouseMove = (e) => {
      const galleryCenter = window.innerWidth / 2;
      setIsCharacterFlipped(e.clientX > galleryCenter);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
          Loading Memories... {Math.round(loadingProgress)}%
        </div>
      </div>
    );
  }

  const zOffsets = [-600, -150, -50, -100];

  return (
    <div className="gallery"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedFilm(null);
        }
      }}
    >
      <div className="circle-container">
        <div className="character-container">
          <img 
            src={characterImg} 
            alt="character"
            style={{ transform: `scaleX(${isCharacterFlipped ? -1 : 1})`}}
            onClick={(e) => {
              e.stopPropagation();
              setShowFrontSide(true);
              setShowClickMe(false);
            }}
          />
          <div className={`click-me-text ${!showClickMe ? 'hidden' : ''}`}>
            Click me!
          </div>
        </div>

        {loadedPhotos.map((photo, index) => {
          const totalPhotos = loadedPhotos.length;
          const photosPerSection = Math.ceil(totalPhotos / 4);
          const sectionIndex = Math.floor(index / photosPerSection);
          
          const angle = angleStep * index + rotationAngle;
          const sectionOffset = sectionIndex * (360 / 16);
          const adjustedAngle = angle + sectionOffset;

          const sectorRadiusX = radiusX + (sectionIndex * 30);
          const sectorRadiusY = radiusY + (sectionIndex * 20);
          
          const zDepthBase = zOffsets[sectionIndex] || 0;
          const zDepthWave = Math.sin((adjustedAngle * Math.PI) / 180) * 30;
          const zDepth = zDepthBase + zDepthWave;
          
          const scale = 1;

          const x = sectorRadiusX * Math.cos((adjustedAngle * Math.PI) / 180);
          const y = sectorRadiusY * Math.sin((adjustedAngle * Math.PI) / 180);
          
          const isFilmSelected = selectedFilm && selectedFilm.id === photo.id;
          const isRegionSelected = selectedRegion && photo.region === selectedRegion;
          
          let wrapperClass;
          if (isFilmSelected) {
            wrapperClass = "selected";
          } else if (isRegionSelected) {
            wrapperClass = "region-selected";
          } else if (!selectedFilm && !selectedRegion) {
            wrapperClass = "default";
          } else {
            wrapperClass = "not-selected";
          } 

          const shouldShowFront = showFrontSide;
          
          return (
            <div
              key={photo.id}
              className={`film-wrapper ${wrapperClass}`}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${zDepth}px) rotateY(${adjustedAngle}deg) scale(${scale})`,
                zIndex: 1000 + Math.round(zDepth),
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (shouldShowFront) {
                  setSelectedFilm(photo);
                }
              }}
            >
              <div
                style={{
                  transform: `rotateY(-${adjustedAngle}deg)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <FilmItem
                  film={photo}
                  showFront={showFrontSide}
                />
              </div>
            </div>
          );
        })}
      </div>
      {selectedFilm && (
        <div 
          className={`film-center ${selectedFilm.height > selectedFilm.width ? 'mini' : 'square'} ${isFlipped ? 'flipped' : ''}`}
          style={{
            position: "absolute",
            top: `${window.innerHeight * 0.4}px`,
            left: `${window.innerWidth * 0.4}px`,
            transform: `translate(-50%, -50%) 
                        perspective(1000px)
                        rotateY(${filmRotation.y + (isFlipped ? 180 : 0)}deg) 
                        rotateX(${filmRotation.x}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
            e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(prev => !prev);
          }}
        >
          <FilmItem 
            film={selectedFilm}
            showFront={true}
            isFlipped={isFlipped}
          />
        </div>
      )}
    </div>
  );
});

export default Gallery;