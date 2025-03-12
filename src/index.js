import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

window.onload = function() {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
