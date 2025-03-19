import { useState, useEffect } from "react";
import "./FilmItem.css";

const FilmItem = ({ film, scale = 1, isFlipped = false }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  
  useEffect(() => {
    if (film) {
      const cachedUrl = localStorage.getItem(`film-${film.id}`);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
      } else {
        const url = `${film.thumbnailFilePath}`;
        localStorage.setItem(`film-${film.id}`, url);
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
      className={`film-frame ${isPortrait ? "mini" : "square"}`}
      style={{ 
        transform: `scale(${scale})`}}
    >
      <div className={`film ${isFlipped ? 'flipped' : ''}`}>
        <div className="front-side">
          <img
            src={imageUrl}
            alt={film.description}
            className="photo-image"
          />
          <div className="text-container">
            <p className="text">{film.description || "No description available"}</p>
          </div>
        </div>
        <div className="back-side">
          <div className="text-top"/>
          <div className="center"></div>
          <div className="text-bottom">Hanbin Lee</div> 
        </div>
      </div>
    </div>
  );
};

export default FilmItem; 