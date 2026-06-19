import React from "react";
import footImage from "../assets/emsy.PNG";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/emsarj/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
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
            <span className="email-label">EMAIL</span>
            <input 
              type="email" 
              className="footer-email-input"
            />
            <button className="footer-submit-btn">✉</button>
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
          background: #f5f0eb;
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
          font-size: 22px;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0 0 25px 0;
          letter-spacing: 0.5px;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        .footer-email-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 8px;
          max-width: 400px;
        }

        .email-label {
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: 2px;
          min-width: 60px;
        }

        .footer-email-input {
          flex: 1;
          padding: 8px 0;
          border: none;
          background: transparent;
          font-size: 13px;
          letter-spacing: 0.5px;
          outline: none;
          color: #1a1a1a;
        }

        .footer-email-input::placeholder {
          color: #999;
          font-weight: 300;
          font-style: italic;
        }

        .footer-submit-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #1a1a1a;
          padding: 0 0 0 10px;
          transition: transform 0.2s ease;
        }

        .footer-submit-btn:hover {
          transform: translateX(3px);
        }

        .footer-social-section {
          margin-bottom: 25px;
        }

        .social-label {
          display: block;
          font-size: 14px;
          font-weight: 400;
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
          text-decoration: none;
          opacity: 0.8;
        }

        .social-icon-btn:hover {
          transform: scale(1.15);
          color: #c0392b;
          opacity: 1;
        }

        .social-icon-btn svg {
          display: block;
          width: 22px;
          height: 22px;
        }

        .footer-copyright {
          margin-top: 25px;
        }

        .footer-copyright p {
          font-size: 11px;
          color: #666;
          letter-spacing: 0.5px;
          font-weight: 300;
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
          width: 100px;
          height: auto;
          display: block;
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

          .email-label {
            font-size: 12px;
            min-width: 50px;
          }

          .footer-character {
            width: 60px;
          }

          .social-label {
            font-size: 12px;
          }

          .social-icon-btn svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </footer>
  );
}