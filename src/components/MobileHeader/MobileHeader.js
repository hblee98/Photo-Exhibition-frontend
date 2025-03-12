import React, { useState, useEffect } from "react";
import "./MobileHeader.css";

const MobileHeader = ({ onReset }) => {
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const fullText = 'Photo Exhibition';

  useEffect(() => {
    if (!isTyping) return;

    const typingInterval = setInterval(() => {
      setTitle((prevTitleValue) => {
        const result = prevTitleValue + fullText[count];
        setCount(count + 1);

        if (count + 1 >= fullText.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
        }

        return result;
      });
    }, 200);

    return () => {
      clearInterval(typingInterval);
    };
  }, [count, isTyping, fullText]);

  const handleClick = () => {
    onReset();
    setTitle('');
    setCount(0);
    setIsTyping(true);
  };

  return (
    <header className="mobile-header">
      <h1 
        className={`mobile-title ${isTyping ? "typing" : "blinking"}`}
        onClick={handleClick}
      >
        {title}
      </h1>
    </header>
  );
};

export default MobileHeader;
