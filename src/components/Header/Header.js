import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
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
    }, 300);

    return () => {
      clearInterval(typingInterval);
    };
  }, [count, isTyping, fullText]);

  return (
    <header className="header">
      <h1 className={`title ${isTyping ? "typing" : "blinking"}`}>{title}</h1>
    </header>
  );
};

export default Header;
