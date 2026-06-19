import React from "react";
import footImage from "../assets/emsy.PNG";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/emsarj/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/emsarjclothings",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@emsarjclothings",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
];

export default function EmsarjFooter() {
  return (
    <footer className="emsarj-footer">
      <div className="footer-main">
        <div className="footer-left">
          <h2 className="footer-headline">JOIN THE EMSARJ FAMILY HERE.</h2>
          
          <div className="footer-email-section">
            <input 
              type="email" 
              placeholder="EMAIL" 
              className="footer-email-input"
            />
            <button className="footer-submit-btn">→</button>
          </div>

          <div className="footer-social-section">
            <span className="social-label">SOCIAL PAGES</span>
            <div className="footer-socials">
              {socials.map((s) => (
                <a 
                  key={s.label} 
                  href={s.href} 
                  className="social-icon-btn"
                  aria-label={s.label} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} EMSARJ. ALL RIGHTS RESERVE.</p>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-character-wrapper">
            <img 
              src={footImage} 
              alt="Emsarj character" 
              className="footer-character" 
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .emsarj-footer {
          background: #f3f3f3;

          padding: 40px 60px 20px;
          font-family: 'Arial', sans-serif;
          border-top: 1px solid #e0d8d0;
          position: relative;
          width: 100%;
        }

        .footer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
          gap: 40px;
        }

        .footer-left {
          flex: 1;
          max-width: 60%;
        }

        .footer-headline {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 20px 0;
          letter-spacing: 1px;
          font-family: 'Georgia', serif;
        }

        .footer-email-section {
          display: flex;
          align-items: center;
          border-bottom: 2px solid #1a1a1a;
          max-width: 350px;
          margin-bottom: 25px;
        }

        .footer-email-input {
          flex: 1;
          padding: 10px 0;
          border: none;
          background: transparent;
          font-size: 14px;
          letter-spacing: 1px;
          outline: none;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .footer-email-input::placeholder {
          color: #999;
          font-weight: 400;
        }

        .footer-submit-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #1a1a1a;
          padding: 0 0 0 10px;
          transition: transform 0.2s ease;
        }

        .footer-submit-btn:hover {
          transform: translateX(5px);
        }

        .footer-social-section {
          margin-bottom: 30px;
        }

        .social-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
          letter-spacing: 2px;
        }

        .footer-socials {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .social-icon-btn {
          color: #1a1a1a;
          transition: transform 0.2s ease, color 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .social-icon-btn:hover {
          transform: scale(1.1);
          color: #c0392b;
        }

        .footer-copyright {
          margin-top: 30px;
        }

        .footer-copyright p {
          font-size: 12px;
          color: #666;
          letter-spacing: 1px;
          font-weight: 400;
          margin: 0;
        }

        .footer-right {
          flex: 0 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .footer-character-wrapper {
          position: relative;
        }

        .footer-character {
          width: 120px;
          height: auto;
          display: block;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .emsarj-footer {
            padding: 30px 20px 20px;
          }

          .footer-main {
            flex-direction: column;
            gap: 30px;
          }

          .footer-left {
            max-width: 100%;
            width: 100%;
          }

          .footer-headline {
            font-size: 20px;
          }

          .footer-email-section {
            max-width: 100%;
          }

          .footer-right {
            width: 100%;
            justify-content: center;
          }

          .footer-character {
            width: 80px;
          }

          .footer-socials {
            gap: 15px;
          }

          .social-icon-btn svg {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .emsarj-footer {
            padding: 20px 15px 15px;
          }

          .footer-headline {
            font-size: 18px;
          }

          .footer-email-input {
            font-size: 12px;
          }

          .footer-character {
            width: 60px;
          }

          .social-label {
            font-size: 12px;
          }
        }
      `}</style>
    </footer>
  );
}