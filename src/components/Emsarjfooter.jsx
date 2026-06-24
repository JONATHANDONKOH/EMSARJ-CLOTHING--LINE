import React, { useMemo, useState, useEffect } from "react";
import footImage from "../assets/emsy.PNG";
import { insertEmail } from "../context/emailfunction";

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

function IconMail({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconSend({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export default function EmsarjFooter() {
  const [email, setEmail] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonIcon = useMemo(() => {
    if (isSending) return "...";
    return isTyping ? <IconSend /> : <IconMail />;
  }, [isSending, isTyping]);

  const onSubmitEmail = async () => {
    if (isSending) return;
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      setIsSending(true);
      await insertEmail(trimmed, "");
      setEmail("");
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <footer className="emsarj-footer">
      <div className="footer-inner">

        {/* LEFT: bordered content box */}
        <div className="footer-box">
          <h2 className="footer-headline">JOIN THE EMSARJ FAMILY HERE.</h2>

          {/* ✅ MODIFIED: Email section with relative positioning on small screens - now 20px */}
          <div className="footer-email-section" style={{
            position: 'relative',
            top: isMobile ? '20px' : '0' // Changed from 10px to 20px
          }}>
            <span className="email-label">EMAIL</span>
            <input
              type="email"
              className="footer-email-input"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsTyping(true); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmitEmail(); } }}
              placeholder="send your message here"
              disabled={isSending}
            />
            <button
              className="footer-submit-btn"
              type="button"
              onClick={onSubmitEmail}
              disabled={isSending}
              aria-label="Send email"
              style={isSending ? { cursor: "not-allowed", opacity: 0.7 } : undefined}
            >
              {buttonIcon}
            </button>
          </div>

          {/* ✅ MODIFIED: Social section with relative positioning on small screens - now 20px */}
          <div className="footer-social-section" style={{
            position: 'relative',
            top: isMobile ? '20px' : '0' // Changed from 10px to 20px
          }}>
            <span className="social-label">SOCIAL PAGES</span>
            <div className="footer-socials">
              {socials.map((s) => (
                <a key={s.label} href={s.href} className="social-icon-btn" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright with relative positioning */}
          <div className="footer-copyright" style={{
            position: 'relative',
            top: isMobile ? '90px' : '0'
          }}>
            <p>© {new Date().getFullYear()} EMSARJ. ALL RIGHTS RESERVED.</p>
          </div>
        </div>

        {/* RIGHT: character image, pushed far right */}
        <div className="footer-character-col">
          <img src={footImage} alt="Emsarj character" className="footer-character" />
        </div>

      </div>
    </footer>
  );
}