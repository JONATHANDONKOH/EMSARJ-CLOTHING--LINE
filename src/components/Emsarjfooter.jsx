import footImage from "../assets/foot-image.png";


const socials = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/emsarjclothings",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/emsarj/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@emsarjclothings",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.473 12.01v-.017c.027-3.579.877-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.018 5.13.878 6.887 2.482 1.688 1.542 2.637 3.68 2.82 6.357l-2.857.192c-.291-3.717-2.547-5.788-6.86-5.818-2.816.018-4.977.926-6.425 2.698-1.357 1.66-2.043 4.018-2.063 7.007.02 2.989.706 5.35 2.063 7.01 1.448 1.772 3.61 2.68 6.425 2.698 2.537-.015 4.217-.657 5.278-2.019.878-1.127 1.33-2.785 1.346-4.924a7.03 7.03 0 0 1-1.382.137c-1.74 0-3.14-.476-4.157-1.416-.968-.896-1.476-2.14-1.476-3.596 0-1.523.545-2.793 1.574-3.673 1.017-.871 2.44-1.328 4.11-1.328.607 0 1.198.075 1.763.224a5.87 5.87 0 0 1 1.513.633l-.002-.046c-.013-.3-.013-.598-.013-.894s0-.594.013-.894l2.857-.18c.006.359.006.72.006 1.074s0 .714-.006 1.074l.002.046a8.754 8.754 0 0 1 .4 2.613c-.018 2.792-.64 4.994-1.85 6.54-1.435 1.832-3.647 2.76-6.574 2.779zm.9-10.895c-1.607 0-2.64.817-2.64 2.137 0 1.318 1.033 2.096 2.76 2.096.556 0 1.098-.094 1.604-.277.506-.183.948-.453 1.306-.8-.16-1.977-1.235-3.156-3.03-3.156z" />
      </svg>
    ),
  },
];

export default function EmsarjFooter() {
  return (
    <footer className="emsarj-footer">

      <span className="sparkle sparkle-1">✦</span>
      <span className="sparkle sparkle-2">✦</span>
      <span className="sparkle sparkle-3">✦</span>
      <span className="sparkle sparkle-4">✦</span>

      <div className="footer-content">
        <h2 className="footer-headline">Join the Emsarj Family Here!</h2>
        <p className="footer-sub">
          FOLLOW US &amp; <strong>SUBSCRIBE</strong> FOR <strong>EXCLUSIVE</strong> DEALS
        </p>
        <div className="footer-socials">
          {socials.map((s) => (
            <a key={s.label} href={s.href} className="social-icon-btn"
              aria-label={s.label} target="_blank" rel="noopener noreferrer">
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="footer-right">
        <div className="speech-bubble">
          NEVER MISS<br />A <span className="bubble-sale">SALE!</span>
        </div>
        <img src={footImage} alt="Emsarj character" className="footer-character" />
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Emsarj. All rights reserved.</p>

      </div>


    </footer>
  );
}