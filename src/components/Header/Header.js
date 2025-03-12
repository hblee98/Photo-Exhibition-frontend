import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = ({ onReset }) => {
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const fullText = process.env.REACT_APP_APP_NAME || 'Photo Exhibition';

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
    <header>
      <h1
        className={`title ${isTyping ? "typing" : "blinking"}`}
        onClick={onReset}
      >{title}
      </h1>
    </header>
  );
};

export default Header;
