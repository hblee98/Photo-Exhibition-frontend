import { useState, useEffect } from "react";
import "./PhotoItem.css";

const PhotoItem = ({ photo, scale = 1, showFront = false, isFlipped = false }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (photo) {
      const cachedUrl = localStorage.getItem(`photo-${photo.id}`);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
      } else {
        const url = `${photo.filePath}`;
        localStorage.setItem(`photo-${photo.id}`, url);
        setImageUrl(url);
      }
    }
  }, [photo]);

  useEffect(() => {
    if (photo) {
      setIsPortrait(photo.height > photo.width);
    }
  }, [photo]);
  
  if (!photo) return null;
  
  return (
    <div
      className={`film-frame ${isPortrait ? "mini" : "square"}`}
      style={{ transform: `scale(${scale})` }}
    >
      <div className={`film ${showFront ? 'front' : ''} ${isFlipped ? 'flipped' : ''}`}>
        <div className="front-side">
          <img
            src={imageUrl}
            alt={photo.description}
            className="photo-image"
          />
          <div className="text-container">
            <p className="text">{photo.description || "No description available"}</p>
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

export default PhotoItem;
