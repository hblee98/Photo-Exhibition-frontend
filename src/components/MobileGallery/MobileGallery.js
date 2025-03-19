  import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
  import MobileFilmItem from "../MobileFilmItem/MobileFilmItem";
  import "./MobileGallery.css";
  import characterImg from "../../assets/hb.PNG";

  const MobileGallery = forwardRef(({ allPhotos }, ref) => { 
    const [loading, setLoading] = useState(true);
    const [loadedPhotos, setLoadedPhotos] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [filmRotation, setFilmRotation] = useState({ x: 0, y: 0 });
    const [showFrontSide, setShowFrontSide] = useState(false);
    const [isFlipped, setIsFlipped] = useState(true);
    const [isCharacterFlipped, setIsCharacterFlipped] = useState(false);
    const [isCharacterMoved, setIsCharacterMoved] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [targetRotation, setTargetRotation] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleReset = () => {
      setSelectedFilm(null);
      setShowFrontSide(false);
      setIsCharacterMoved(false);
      setRotationAngle(0);
      setTargetRotation(0);
      setIsFlipped(true);
      setIsCharacterFlipped(false);
    };

    useImperativeHandle(ref, () => ({
      handleReset
    }));

    useEffect(() => {
      if (!allPhotos || allPhotos.length === 0) return;

      const loadPhotosInBatches = async () => {
        setLoading(true);
        const loadedImages = new Set();
        const totalImagesCount = allPhotos.length + 1;

        const preloadImage = async (src, id) => {
          try {
            const response = await fetch(src);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                loadedImages.add(id);
                const progress = (loadedImages.size / totalImagesCount) * 100;
                setLoadingProgress(Math.min(progress, 100));
                resolve();
              };
              img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
              };
              img.src = objectUrl;
            });
          } catch (error) {
            console.error(`Error loading image ${src}:`, error);
            throw error;
          }
        };

        try {

          await preloadImage(characterImg, 'character');

          await Promise.all(allPhotos.map(photo => 
            preloadImage(photo.thumbnailFilePath, photo.id)
          ));

          setLoadedPhotos(allPhotos);
          
          if (loadedImages.size >= totalImagesCount) {
            setLoading(false);
            setShowFrontSide(false);
          }
        } catch (error) {
          console.error('Error loading images:', error);
          setLoading(false);
        }
      };

      loadPhotosInBatches();
    }, [allPhotos]);

    useEffect(() => {
      let animationFrameId;
      
      const animate = () => {
        setRotationAngle(current => {
          const diff = targetRotation - current;
          if (Math.abs(diff) < 0.01) {
            return targetRotation;
          }
          const speed = isCharacterMoved ? 0.1 : 0.2;
          return current + diff * speed;
        });
        
        animationFrameId = requestAnimationFrame(animate);
      };
      
      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [targetRotation, isCharacterMoved]);

    useEffect(() => {
      const handleScroll = (e) => {
        if (!isCharacterMoved) {
          const maxDelta = 5;
          const delta = Math.max(Math.min(e.deltaX * 0.5, maxDelta), -maxDelta);
          setTargetRotation(prev => prev + delta);
        } else {
          const maxDelta = 3;
          const delta = Math.max(Math.min(e.deltaY * 0.5, maxDelta), -maxDelta);
          setTargetRotation(prev => prev + delta);
        }
      };

      const handleTouchStart = (e) => {
        if (!isCharacterMoved) {
          setTouchStart(e.touches[0].clientX);
        } else {
          setTouchStart(e.touches[0].clientY);
        }
        setIsDragging(true);
      };

      const handleTouchMove = (e) => {
        if (!touchStart || !isDragging) return;

        let delta;
        if (!isCharacterMoved) {
          const touchEnd = e.touches[0].clientX;
          delta = (touchEnd - touchStart) * 0.5;
        } else {
          const touchEnd = e.touches[0].clientY;
          delta = (touchStart - touchEnd) * 0.5;
        }

        const maxDelta = !isCharacterMoved ? 5 : 3;
        const limitedDelta = Math.max(Math.min(delta, maxDelta), -maxDelta);
        
        setTargetRotation(prev => prev + (!isCharacterMoved ? -limitedDelta : limitedDelta));
        setTouchStart(!isCharacterMoved ? e.touches[0].clientX : e.touches[0].clientY);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        setTouchStart(null);
      };

      window.addEventListener('wheel', handleScroll, { passive: true });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }, [touchStart, isDragging, isCharacterMoved]);
    

    if (loading) {
      return (
        <div className="mobile-loading-screen">
          <div className="mobile-loading-bar-container">
            <div className="mobile-loading-bar" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="mobile-loading-text">
            Loading Memories... {Math.round(loadingProgress)}%
          </div>
        </div>
      );
    }

    const calculateFilmPosition = (index) => {
      const angleStep = 360 / loadedPhotos.length;
      const angle = angleStep * index + rotationAngle;
      const normalizedAngle = ((angle % 360) + 360) % 360;
      const radian = normalizedAngle * (Math.PI / 180);
      
      if (!isCharacterMoved) {
        const radiusX = 130;
        const radiusY = 30;
        const tiltAngle = 5; 
        

        const centerVW = 50;
        const centerVH = 40;
        
        const x = Math.cos(radian) * radiusX;
        const y = Math.sin(radian) * radiusY;
        
        const tiltRadian = tiltAngle * (Math.PI / 180);
        
        const transformedX = x - centerVW;
        const transformedY = (y * Math.cos(tiltRadian) - (y * 0.5) * Math.sin(tiltRadian)) - centerVH;
        const transformedZ = y * Math.sin(tiltRadian) + (y * 0.5) * Math.cos(tiltRadian);

        const filmRotationY = angle + tiltAngle * Math.sin(radian);

        return {
          transform: `translate3d(${transformedX}vw, ${transformedY}vh, ${transformedZ}px) 
                    rotateY(${filmRotationY}deg)`,
          zIndex: Math.round(2000 + transformedZ)
        };
      }

      const radiusX = 40;
      const radiusY = 60;
      const tiltAngle = 5;
      
      const tiltRadian = tiltAngle * (Math.PI / 180);
      const x = Math.cos(radian) * radiusX;
      const y = Math.sin(radian) * (1/2) * radiusY;
      
      const tiltedY = y * Math.cos(tiltRadian) - x * Math.sin(tiltRadian);
      const zDepth = -Math.abs(Math.sin(radian)) * 40;

      const isSelected = selectedFilm && selectedFilm.id === loadedPhotos[index].id;
      const selectedZOffset = isSelected ? -1 : 0;  
      const selectedXOffset = isSelected ? 6 : 0;
      const selectedYOffset = isSelected ? -0.5 : 0; 
      
      const rotateY = normalizedAngle + 180;
      const zIndex = Math.floor(2000 + zDepth + (isSelected ? 100 : 0));
      
      return {
        transform: `translate3d(${x+selectedXOffset}vw, ${tiltedY+selectedYOffset}vh, ${zDepth + selectedZOffset}px) rotateY(${rotateY}deg)`,
        opacity: 1,
        zIndex
      };
    };

    return (
      <div className="mobile-gallery" onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedFilm(null);
        }
      }}>
        {selectedFilm && (
          <div 
            className="selected-film-container"
            onClick={() => setSelectedFilm(null)}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
              
              const film = document.querySelector(".selected-film-wrapper");
              if (!film) return;

              const touch = e.touches[0];
              const rect = film.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              const distanceX = touch.clientX - centerX;
              const distanceY = touch.clientY - centerY;
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
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              setFilmRotation({ x: 0, y: 0 });
            }}
          >
            <button 
              className="arrow-button left"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = loadedPhotos.findIndex(photo => photo.id === selectedFilm.id);
                const prevIndex = (currentIndex - 1 + loadedPhotos.length) % loadedPhotos.length;
                setSelectedFilm(loadedPhotos[prevIndex]);
                setIsFlipped(false);
                const angleStep = 360 / loadedPhotos.length;
                setTargetRotation(prev => prev + angleStep);
              }}
            >
              ←
            </button>
            <div 
              className="selected-film-wrapper"
              style={{
                transform: `
                  perspective(1000px)
                  rotateY(${filmRotation.y + (isFlipped ? 180 : 0)}deg) 
                  rotateX(${filmRotation.x}deg)
                `,
                transition: filmRotation.x === 0 && filmRotation.y === 0 ? 'transform 0.3s ease' : 'none'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(prev => !prev);
              }}
            >
              <MobileFilmItem 
                film={selectedFilm}
                showFront={showFrontSide}
                isFlipped={isFlipped}
              />
            </div>
            <button 
              className="arrow-button right"
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = loadedPhotos.findIndex(photo => photo.id === selectedFilm.id);
                const nextIndex = (currentIndex + 1) % loadedPhotos.length;
                setSelectedFilm(loadedPhotos[nextIndex]);
                setIsFlipped(false);

                const angleStep = 360 / loadedPhotos.length;
                setTargetRotation(prev => prev - angleStep);
              }}
            >
              →
            </button>
          </div>
        )}
        <div
          className={`mobile-character-container ${isCharacterMoved ? 'moved' : ''}`}
        >
          <img 
            src={characterImg} 
            alt="character"
            style={{
              transform: `scaleX(${isCharacterFlipped ? -1 : 1})`,
              transition: 'transform 0.3s ease'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isCharacterFlipped) {
                setIsCharacterFlipped(true);
                setShowFrontSide(true);
              } else if (!isCharacterMoved) {
                const startRotation = rotationAngle;
                let start = null;
              
                setTargetRotation(rotationAngle);
                
                const animate = (timestamp) => {
                  if (!start) start = timestamp;
                  const progress = (timestamp - start) / 1500; 
                  
                  if (progress < 1) {
                    setRotationAngle(startRotation + (45 * progress));
                    requestAnimationFrame(animate);
                  } else {
                    const finalRotation = startRotation + 45;
                    setRotationAngle(finalRotation);
                    setTargetRotation(finalRotation);
                    
                    setTimeout(() => {
                      setIsCharacterMoved(true);

                      setTimeout(() => {
                        const targetAngle = 112;
                        const angleStep = 360 / loadedPhotos.length;
                        const targetIndex = Math.round(targetAngle / angleStep);
                        
                        if (targetIndex >= 0 && targetIndex < loadedPhotos.length) {
                          setTargetRotation(targetAngle);
                          setSelectedFilm(loadedPhotos[targetIndex]);
                          setIsFlipped(false);
                        }
    
                      }, 1000);
                    }, 500);
                  }
                };
                requestAnimationFrame(animate);
              } else {
                setShowFrontSide(prev => !prev);
              }
            }}
          />
          <div className={`click-me-text ${isCharacterMoved ? 'hidden' : ''}`}>
            Click me!
          </div>
        </div>
        <div className={`films-container ${isCharacterMoved ? 'rotated' : 'initial'}`}>
          {loadedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="mobile-film-wrapper"
              style={calculateFilmPosition(index)}
              onClick={() => {
                if (isCharacterMoved) {
                  const angleStep = 360 / loadedPhotos.length;
                  const currentIndex = loadedPhotos.findIndex(p => p.id === photo.id);

                  const selectedIndex = selectedFilm 
                    ? loadedPhotos.findIndex(p => p.id === selectedFilm.id)
                    : currentIndex;
                  
                  const totalLength = loadedPhotos.length;
                  const rawDiff = currentIndex - selectedIndex;
                  const normalizedDiff = ((rawDiff + totalLength / 2) % totalLength) - (totalLength / 2);
                  const indexDiff = Math.abs(normalizedDiff);
                  
                  if (indexDiff > 20) {
                    setSelectedFilm(photo);
                    setIsFlipped(false);
                  } else if (indexDiff <= 3) {
                    const rotationAmount = (indexDiff * angleStep) * 3;
                    const direction = normalizedDiff >= 0 ? -1 : 1;
                    setTargetRotation(prev => prev + (rotationAmount * direction));
                    
                    setTimeout(() => {
                      setSelectedFilm(photo);
                      setIsFlipped(false);
                    }, 500);
                  } else if (indexDiff <= 16) {
                    const rotationAmount = (indexDiff * angleStep) / 2;
                    const direction = normalizedDiff >= 0 ? -1 : 1;
                    setTargetRotation(prev => prev + (rotationAmount * direction));
                    
                    setTimeout(() => {
                      setSelectedFilm(photo);
                      setIsFlipped(false);
                    }, 500);
                  } else {
                    const remainder = indexDiff % 16;
                    const rotationAmount = remainder * angleStep;
                    const direction = normalizedDiff >= 0 ? 1 : -1;
                    setTargetRotation(prev => prev + (rotationAmount * direction));
                    
                    setTimeout(() => {
                      setSelectedFilm(photo);
                      setIsFlipped(false);
                    }, 500);
                  }
                }
              }}
            >
              <MobileFilmItem 
                film={photo}
                showFront={showFrontSide}
              />
            </div>
          ))}
        </div>
      </div>
    );
  });

  export default MobileGallery;
