import { useState, useEffect } from "react";
import "./MobileFilmItem.css";

const MobileFilmItem = ({ film, scale = 1, showFront = false, isFlipped = false, forceSquare = false }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {    
    if (film) {
      const cachedUrl = localStorage.getItem(`mobile-film-${film.id}`);  
      if (cachedUrl) { 
        setImageUrl(cachedUrl);
      } else {
        const url = `${film.thumbnailFilePath}`;
        localStorage.setItem(`mobile-film-${film.id}`, url);
        setImageUrl(url);
      }
    }
  }, [film]);

  useEffect(() => {
    if (film) {
      setIsPortrait(film.height > film.width);
    }
  }, [film]);
  
  if (!film) return null;
  
  return (
    <div
      className={`mobile-film-frame ${forceSquare ? "square" : (isPortrait ? "mini" : "square")}`}
      style={{ transform: `scale(${scale})` }}
    >
      <div className={`mobile-film ${showFront ? 'front' : ''} ${isFlipped ? 'flipped' : ''}`}>
        <div className="mobile-front-side">
          <img
            src={imageUrl}
            alt={film.description}
            className="mobile-photo-image"
          />
          <div className="mobile-text-container">
            <p className="mobile-text">{film.description || "No description available"}</p>
          </div>
        </div>
        <div className="mobile-back-side">
          <div className="mobile-text-top"/>
          <div className="mobile-center"></div>
          <div className="mobile-text-bottom">Hanbin Lee</div> 
        </div>
      </div>
    </div>
  );
};

export default MobileFilmItem; 