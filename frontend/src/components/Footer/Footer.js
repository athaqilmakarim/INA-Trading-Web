import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="copyright">INA TRADING © Copyright 2024 by Perum PERURI.</p>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/developer">Developer</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 