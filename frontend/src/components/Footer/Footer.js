import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-sections">
          <div className="footer-section">
            <h3>About INA TRADING</h3>
            <p className="footer-description">
              B2B & D2C Platform for Indonesian MSMEs, Cooperatives & Industries entering global markets
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/news">News</Link>
              <Link to="/explore">Explore</Link>
              <Link to="/export-products">Export Products</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <div className="footer-contact">
              <p>
                <i className="fas fa-envelope"></i>
                Email: admin@inatrading.co.id
              </p>
              <p>
                <i className="fas fa-whatsapp"></i>
                WhatsApp: +62 811 8119 044
              </p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">INA TRADING © Copyright 2024 by METASMESTA. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/inatrading.co.id/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 