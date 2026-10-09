import { useCallback, useEffect, useRef, useState } from 'react';
import aboutImage from './assets/about-construction-team.jpg';
import hotelImage from './assets/project-hotel.jpg';
import homeImage from './assets/project-home.jpg';
import infrastructureImage from './assets/infrastructure.jpg';
import visionImage from './assets/our-vision-lightbulb.png';
import missionImage from './assets/our-mission-dartboard.png';
import contactImage from './assets/contact-construction.png';
import homeConstructionImage from './assets/home-construction.jpg';
import constructionVideo from './assets/construction-video.mp4';
// import adminBannerBg from './assets/admin-banner-bg.png'; // Please uncomment after copying the image!
import './App.css';
import './AdminSidebar.css';
import './Profile.css';
import { ClientProjectRequestForm } from './components/ClientProjectRequestForm';
import { ClientRequestsList } from './components/ClientRequestsList';
import { AdminProjectRequestsList } from './components/AdminProjectRequestsList';
import { AdminProjectRequestDetails } from './components/AdminProjectRequestDetails';
import { AdminProjectDetails } from './components/AdminProjectDetails';
import { NotificationBell } from './components/NotificationBell';
import { ClientNotifications } from './components/ClientNotifications';
import { EngineerProjectRequestsList } from './components/EngineerProjectRequestsList';
import { EngineerProjectRequestDetails } from './components/EngineerProjectRequestDetails';
import { ClientProjectsList } from './components/ClientProjectsList';
import { ClientProjectDetails } from './components/ClientProjectDetails';
import { EngineerProjectsList } from './components/EngineerProjectsList';
import { EngineerProjectDetails } from './components/EngineerProjectDetails';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const heroImages = [hotelImage, homeImage, infrastructureImage];
const roles = [
  { value: 'ADMIN_PROJECT_MANAGER', label: 'Admin' },
  { value: 'ADMIN_PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'SITE_ENGINEER', label: 'Site Engineer' },
  { value: 'FIELD_WORKER', label: 'Field Worker' },
  { value: 'CLIENT', label: 'Client / Building Owner' },
  { value: 'MATERIAL_SUPPLIER', label: 'Material Supplier' },
  { value: 'FINANCE_OFFICER_ACCOUNTANT', label: 'Finance Officer / Accountant' },
];

async function getCsrfToken() {
  const response = await fetch(`${API_URL}/api/auth/csrf`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Could not connect securely to the server. Please try again.');
  }
  return response.text();
}

async function sendAuthRequest(path, payload) {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail
      || errorBody.message
      || (response.status === 400
        ? 'The backend rejected this login role. Restart the Spring Boot backend in IntelliJ and try again.'
        : response.status === 401
          ? 'Email, password, or selected account type is incorrect.'
          : response.status === 403
            ? 'This account does not have permission for the selected account type.'
            : response.status === 409
              ? 'An account with this email already exists.'
              : `The server could not complete the request (HTTP ${response.status}). Check the Spring Boot backend logs.`);
    throw new Error(message || errorBody.title || errorBody.error || 'The server rejected the request.');
  }
  return response.status === 204 ? null : response.json();
}

/* 
function ClientRequestRow({ request }) {
  const submitted = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString()
    : 'Recently submitted';

  return (
    <article className="client-request-row">
      <span className="client-request-icon" aria-hidden="true">▤</span>
      <div className="client-request-info">
        <strong>{request.projectName}</strong>
        <span>{request.projectType} <span>·</span> {request.location}</span>
      </div>
      <span className={`client-status-badge status-${request.status.toLowerCase()}`}>
        {request.status.replaceAll('_', ' ').toLowerCase()}
      </span>
      <time>{submitted}</time>
    </article>
  );
} 
*/

function ClientEmptyState({ title, text }) {
  return (
    <div className="client-empty-state">
      <span aria-hidden="true">▤</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ClientPlaceholder({ icon, section, title, text }) {
  return (
    <>
      <div className="client-page-heading">
        <span className="eyebrow">{section}</span>
        <h1>{title}</h1>
        <p>Everything you need to manage your construction journey.</p>
      </div>
      <section className="client-panel">
        <ClientEmptyState title={`No ${title.toLowerCase()} yet`} text={text} />
      </section>
    </>
  );
}

function accountRoleLabel(role) {
  if (role === 'ADMIN_PROJECT_MANAGER') {
    return 'Admin / Project Manager';
  }
  return roles.find((option) => option.value === role)?.label
    || (role === 'CLIENT_BUILDING_OWNER' ? 'Client / Building Owner' : role.replaceAll('_', ' '));
}

function AccountProfile({ user }) {
  return (
    <div className="profile-page-wrapper">
      <div className="profile-banner-section">
        <div className="profile-banner-left">
          <span className="welcome-eyebrow">WELCOME BACK</span>
          <h2 className="profile-name-large">{user.fullName}</h2>
          <span className="profile-role-large">{accountRoleLabel(user.role)}</span>
          <span className="profile-status-pill"><span className="status-dot green"></span> Active Account</span>
        </div>
        
        <div className="profile-avatar-large">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        
        <div className="profile-banner-right">
          <p>Turning your<br/>construction ideas<br/>into reality</p>
        </div>
      </div>
      
      <div className="profile-actions-bar">
        <div className="profile-contact-items">
          <div className="contact-item">
            <span className="contact-icon-wrapper blue">✉</span>
            <div className="contact-info">
              <span className="contact-label">EMAIL ADDRESS</span>
              <span className="contact-value">{user.email}</span>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon-wrapper blue">📞</span>
            <div className="contact-info">
              <span className="contact-label">PHONE NUMBER</span>
              <span className="contact-value">{user.phoneNumber || '0712345678'}</span>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon-wrapper blue">📍</span>
            <div className="contact-info">
              <span className="contact-label">LOCATION</span>
              <span className="contact-value">Colombo, Sri Lanka</span>
            </div>
          </div>
        </div>
        <div className="profile-buttons">
          <button className="btn-edit-profile">✏ Edit Profile</button>
          <button className="btn-change-password">🔓 Change Password</button>
        </div>
      </div>
      
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper blue">📄</div>
          <div className="stat-info">
            <strong>12</strong>
            <span>Total Requests</span>
            <small>All project requests</small>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper green">✓</div>
          <div className="stat-info">
            <strong>8</strong>
            <span>Approved Projects</span>
            <small>Successfully approved</small>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper yellow">👷</div>
          <div className="stat-info">
            <strong>3</strong>
            <span>Active Projects</span>
            <small>Currently in progress</small>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper purple">💲</div>
          <div className="stat-info">
            <strong>5</strong>
            <span>Total Invoices</span>
            <small>View your invoices</small>
          </div>
        </div>
      </div>
      
      <div className="profile-details-grid">
        <div className="profile-detail-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-icon yellow">👤</span>
              <div>
                <h3>Personal Information</h3>
                <p>Your personal details and contact information.</p>
              </div>
            </div>
            <button className="btn-outline-small">Edit</button>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="detail-icon">✉</span>
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">📞</span>
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{user.phoneNumber || '0712345678'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">📍</span>
              <span className="detail-label">Address</span>
              <span className="detail-value">Colombo, Sri Lanka</span>
            </div>
          </div>
        </div>
        
        <div className="profile-detail-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-icon yellow">📋</span>
              <div>
                <h3>Account Information</h3>
                <p>Your account status and membership details.</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="detail-icon">🛡</span>
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-pill"><span className="status-dot green"></span> Active</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">📅</span>
              <span className="detail-label">Member Since</span>
              <span className="detail-value">January 15, 2024</span>
            </div>
            <div className="detail-row">
              <span className="detail-icon">👥</span>
              <span className="detail-label">User Role</span>
              <span className="detail-value">{accountRoleLabel(user.role)}</span>
            </div>
          </div>
        </div>
        
        <div className="profile-detail-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-icon yellow">🔒</span>
              <div>
                <h3>Security & Privacy</h3>
                <p>Manage your password and security settings.</p>
              </div>
            </div>
            <button className="btn-outline-small">Manage</button>
          </div>
          <div className="card-body">
            <div className="detail-row clickable">
              <span className="detail-icon">🔑</span>
              <span className="detail-label">Password</span>
              <span className="detail-value">••••••••</span>
              <span className="row-chevron">›</span>
            </div>
            <div className="detail-row clickable">
              <span className="detail-icon">🛡</span>
              <span className="detail-label">Two-Factor Authentication</span>
              <span className="detail-value">Not enabled</span>
              <span className="row-chevron">›</span>
            </div>
            <div className="detail-row clickable">
              <span className="detail-icon">💻</span>
              <span className="detail-label">Login Activity</span>
              <span className="detail-value text-link">View recent activity</span>
              <span className="row-chevron">›</span>
            </div>
          </div>
        </div>
        
        <div className="profile-detail-card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-icon yellow">🔔</span>
              <div>
                <h3>Communication Preferences</h3>
                <p>Choose how you want to be notified.</p>
              </div>
            </div>
            <button className="btn-outline-small">Edit</button>
          </div>
          <div className="card-body">
            <div className="detail-row">
              <span className="detail-icon">✉</span>
              <span className="detail-label">Email Notifications</span>
              <span className="detail-desc">Receive updates about your projects</span>
              <div className="toggle-switch active"><div className="toggle-knob"></div></div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">💬</span>
              <span className="detail-label">SMS Notifications</span>
              <span className="detail-desc">Receive important alerts via SMS</span>
              <div className="toggle-switch"><div className="toggle-knob"></div></div>
            </div>
            <div className="detail-row clickable">
              <span className="detail-icon">📞</span>
              <span className="detail-label">Preferred Contact Method</span>
              <span className="detail-value">Email</span>
              <span className="row-chevron">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactIcon({ type }) {
  const paths = {
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-8-8l2-2-2-5Z" />,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[type]}
    </svg>
  );
}

function SocialIcon({ type, label }) {
  const icons = {
    facebook: <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8h3.4Z" />,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.7" cy="6.7" r="1" className="social-icon-dot" /></>,
    youtube: <><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" className="social-icon-play" /></>,
    linkedin: <><path d="M6.5 9H3.8v11h2.7V9ZM5.15 7.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM20.2 13.7c0-3-1.6-4.9-4.2-4.9-1.4 0-2.4.7-2.9 1.5V9h-2.7v11h2.7v-5.8c0-1.5.3-3 2.2-3s2.2 1.7 2.2 3.1V20h2.7v-6.3Z" /></>,
  };

  return (
    <span className="landing-social-icon" role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {icons[type]}
      </svg>
    </span>
  );
}

function ContactSection() {
  return (
    <section className="landing-contact" id="contact">
      <img className="landing-contact-image" src={contactImage} alt="Construction plans and safety helmet at a building site" />
      <div className="landing-contact-card">
        <div className="landing-contact-prompt">
          <span className="landing-eyebrow">GET IN TOUCH</span>
          <h2>Ready to Start Your Project?</h2>
          <p>Contact us today for a free consultation and quote. We’re here to bring your vision to life.</p>
          <a className="landing-contact-button" href="mailto:Buildpro@gmail.com">
            Contact Us <ContactIcon type="arrow" />
          </a>
        </div>
        <div className="landing-contact-quick-details">
          <a href="tel:0701234567">
            <span className="landing-contact-icon"><ContactIcon type="phone" /></span>
            <span><strong>Call Us</strong><span>0701234567</span></span>
          </a>
          <a href="mailto:Buildpro@gmail.com">
            <span className="landing-contact-icon"><ContactIcon type="email" /></span>
            <span><strong>Email Us</strong><span>Buildpro@gmail.com</span></span>
          </a>
          <div>
            <span className="landing-contact-icon"><ContactIcon type="location" /></span>
            <span><strong>Our Location</strong><span>117 Viharamawatha, Malabe</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ onNavigate }) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-brand">
        <a className="landing-brand" href="/" aria-label="BuildPro home" onClick={(event) => {
          event.preventDefault();
          onNavigate('/');
        }}>
          <span className="landing-logo-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>Build<span>Pro</span></strong><small>CONSTRUCTION &amp; BUILDERS</small></span>
        </a>
        <p>Quality Construction. Lasting Value.</p>
        <div className="landing-footer-socials" aria-label="Social media">
          <SocialIcon type="facebook" label="Facebook" />
          <SocialIcon type="instagram" label="Instagram" />
          <SocialIcon type="youtube" label="YouTube" />
          <SocialIcon type="linkedin" label="LinkedIn" />
        </div>
      </div>
      <nav className="landing-footer-column" aria-label="Quick links">
        <h2>Quick Links</h2>
        <a href="/">Home</a>
        <a href="/about">About Us</a>
        <a href="/#services">Services</a>
        <a href="/#projects">Projects</a>
        <a href="/#contact">Contact Us</a>
      </nav>
      <div className="landing-footer-column">
        <h2>Our Services</h2>
        <a href="/#services">Home Construction</a>
        <a href="/#services">Remodeling</a>
        <a href="/#services">Commercial Construction</a>
        <a href="/#services">Renovation</a>
        <a href="/#services">Addition</a>
        <a href="/#services">General Contracting</a>
      </div>
      <div className="landing-footer-column landing-footer-contact">
        <h2>Get In Touch</h2>
        <div><ContactIcon type="location" /><span>117 Viharamawatha, Malabe</span></div>
        <a href="tel:0701234567"><ContactIcon type="phone" /><span>0701234567</span></a>
        <a href="mailto:Buildpro@gmail.com"><ContactIcon type="email" /><span>Buildpro@gmail.com</span></a>
        <div><ContactIcon type="clock" /><span>Weekday 8.00A.M - 6.00.PM</span></div>
      </div>
      <span className="landing-footer-tagline">BUILDPRO <span>·</span> CONSTRUCTION MANAGEMENT, MADE CLEAR.</span>
    </footer>
  );
}

function LandingPage({ currentPath, user, onNavigate, onLogin, onSignup, onLogout, onRequest, onDashboard, busy }) {
  const isAboutPage = currentPath === '/about';
  const isAboutDetailsPage = currentPath === '/about/learn-more';
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);
  const [videoFinished, setVideoFinished] = useState(false);
  const serviceCarouselRef = useRef(null);
  const landingPageRef = useRef(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const services = [
    { name: 'Home Construction', icon: '⌂', image: homeConstructionImage, description: 'Custom homes built with quality, comfort and style.' },
    { name: 'Remodeling', icon: '⚒', image: hotelImage, description: 'Transform your space with thoughtful design and expert craftsmanship.' },
    { name: 'Commercial Construction', icon: '▥', image: homeImage, description: 'Reliable construction solutions for your business.' },
    { name: 'Renovation', icon: '◉', image: contactImage, description: 'Upgrade, restore and add lasting value to your property.' },
    { name: 'Addition', icon: '+', image: aboutImage, description: 'Expand your home with carefully planned new spaces.' },
    { name: 'General Contracting', icon: '✓', image: infrastructureImage, description: 'One experienced team coordinating every stage of your project.' },
  ];
  const visibleServices = services.filter((service) => service.name.toLowerCase().includes(submittedSearch.toLowerCase()));
  const getServiceCardStep = () => {
    const viewport = serviceCarouselRef.current;
    const track = viewport && viewport.firstElementChild;
    const card = track && track.firstElementChild;
    if (!viewport || !track || !card) {
      return 0;
    }
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 16;
    return card.getBoundingClientRect().width + gap;
  };
  const scrollServices = (direction) => {
    const viewport = serviceCarouselRef.current;
    const step = getServiceCardStep();
    if (viewport && step) {
      viewport.scrollBy({ left: direction * step, behavior: 'smooth' });
    }
  };
  const selectService = (index) => {
    const viewport = serviceCarouselRef.current;
    const step = getServiceCardStep();
    if (viewport && step) {
      setActiveServiceIndex(index);
      viewport.scrollTo({ left: index * step, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (currentPath !== '/' || !videoFinished) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (heroSlide === heroImages.length - 1) {
        setHeroSlide(0);
        setVideoFinished(false);
        return;
      }
      setHeroSlide((slide) => slide + 1);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [currentPath, heroSlide, videoFinished]);

  useEffect(() => {
    const page = landingPageRef.current;
    if (!page || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-scroll-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    Array.from(page.children)
      .filter((element) => (
        (element.tagName === 'SECTION' && !element.classList.contains('landing-hero'))
        || element.tagName === 'FOOTER'
      ))
      .forEach((element) => {
        element.classList.add('landing-scroll-reveal');
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add('is-scroll-visible');
        } else {
          observer.observe(element);
        }
      });

    return () => observer.disconnect();
  }, [currentPath]);

  return (
    <main ref={landingPageRef} className={`landing-page${isAboutDetailsPage ? ' landing-about-details-page' : ''}`}>
      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="BuildPro home" onClick={(event) => {
          event.preventDefault();
          onNavigate('/');
        }}>
          <span className="landing-logo-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>Build<span>Pro</span></strong><small>CONSTRUCTION &amp; BUILDERS</small></span>
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a className="landing-nav-home" href="/" aria-current={currentPath === '/' ? 'page' : undefined}>Home</a>
          <a href="/about" aria-current={currentPath.startsWith('/about') ? 'page' : undefined} onClick={(event) => {
            event.preventDefault();
            onNavigate('/about');
          }}>About Us</a>
          <a href={currentPath === '/' ? '#services' : '/#services'}>Services</a>
          <a href={currentPath === '/' ? '#projects' : '/#projects'}>Projects</a>
          <a href={currentPath === '/' ? '#team' : '/#team'}>Our Team</a>
          <a href={currentPath === '/' ? '#contact' : '/#contact'}>Contact Us</a>
        </nav>
        <div className="landing-header-actions">
          {user ? (
            <>
              <button className="landing-secondary" type="button" onClick={onDashboard}>My Dashboard</button>
              <button className="landing-signup" type="button" onClick={onLogout} disabled={busy}>
                {busy ? 'Signing out…' : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <button className="landing-secondary" type="button" onClick={onLogin}>Log in</button>
              <button className="landing-signup" type="button" onClick={onSignup}>Create account</button>
            </>
          )}
        </div>
      </header>

      {isAboutPage ? (
        <>
        <section className="landing-about landing-about-page">
          <div className="landing-about-copy">
            <span className="landing-eyebrow">ABOUT US</span>
            <h1>A Trusted Construction Partner</h1>
            <p>BuildPro delivers reliable construction solutions with a strong focus on quality, safety, and clear communication. From planning to project completion, we work closely with every client to turn ideas into well-managed, durable, and successful construction projects.</p>
            <a className="landing-about-link" href="/about/learn-more" onClick={(event) => {
              event.preventDefault();
              onNavigate('/about/learn-more');
            }}>Learn more <span aria-hidden="true">→</span></a>
          </div>
          <img src={aboutImage} alt="Construction workers reviewing a building project" />
        </section>
        <section className="landing-about-values">
          <div className="landing-about-section-heading">
            <span className="landing-eyebrow">WHAT WE STAND FOR</span>
            <h2>Good construction starts with trust.</h2>
            <p>We bring care and accountability to every stage, so clients know what to expect and can feel confident in the result.</p>
          </div>
          <div className="landing-about-values-grid">
            <article>
              <span>01</span>
              <h3>Quality in every detail</h3>
              <p>We focus on durable materials, careful workmanship, and results made to last.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Safety always</h3>
              <p>We take responsibility for safe, considered work throughout the project.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Clear communication</h3>
              <p>We keep clients informed, involved, and aligned from planning to completion.</p>
            </article>
          </div>
        </section>
        <section className="landing-about-approach">
          <div className="landing-about-section-heading">
            <span className="landing-eyebrow">OUR APPROACH</span>
            <h2>From the first plan to the final handover.</h2>
          </div>
          <div className="landing-about-steps">
            <article><span>01</span><div><h3>Plan together</h3><p>We listen to your goals, understand the site, and agree on a clear direction.</p></div></article>
            <article><span>02</span><div><h3>Manage every detail</h3><p>Our team coordinates the work and keeps progress and priorities clear.</p></div></article>
            <article><span>03</span><div><h3>Deliver with care</h3><p>We complete the project with quality and a focus on a dependable handover.</p></div></article>
          </div>
        </section>
        <LandingFooter onNavigate={onNavigate} />
        </>
      ) : isAboutDetailsPage ? (
        <>
          <section className="landing-about-story-hero">
            <img src={aboutImage} alt="BuildPro team reviewing a construction project" />
            <div className="landing-about-story-title" aria-label="About BuildPro">
              <span>ABOUT</span>
              <span><em>BUILD</em>PRO</span>
            </div>
            <span className="landing-about-story-caption">QUALITY CONSTRUCTION. BUILT TO LAST.</span>
          </section>
          <section className="landing-about-story-intro">
            <span className="landing-eyebrow">WHO WE ARE</span>
            <p>BuildPro delivers reliable construction solutions with a strong focus on quality, safety, and clear communication. From planning to project completion, we work closely with every client to turn ideas into well-managed, durable, and successful construction projects.</p>
          </section>
          <section className="landing-about-story-values landing-about-story-vision">
            <h1 className="landing-about-vision-title">OUR <span>VISION</span></h1>
            <img src={visionImage} alt="Glowing light bulb illustration representing BuildPro's vision" />
            <p>We envision homes, workplaces, and communities shaped by dependable construction and thoughtful planning—places people can value and rely on for years to come.</p>
          </section>
          <section className="landing-about-story-values landing-about-story-mission">
            <h1 className="landing-about-mission-title">OUR <span>MISSION</span></h1>
            <p>We work closely with each client, bringing skilled teams, careful project management, and open communication together from the first plan through the final handover.</p>
            <img src={missionImage} alt="Yellow and navy dartboard representing BuildPro's mission" />
          </section>
          <LandingFooter onNavigate={onNavigate} />
        </>
      ) : (
      <>
      <section className="landing-hero">
        <div className={`landing-hero-media${videoFinished ? ' images-active' : ''}`} aria-hidden="true">
          {videoFinished ? (
            <img key={heroImages[heroSlide]} className="landing-hero-static" src={heroImages[heroSlide]} alt="" draggable="false" />
          ) : (
            <video
              key="hero-video"
              className="landing-hero-video"
              autoPlay
              muted
              playsInline
              onEnded={() => setVideoFinished(true)}
              onError={() => setVideoFinished(true)}
            >
              <source src={constructionVideo} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">QUALITY CONSTRUCTION. LASTING VALUE.</span>
          <h1>Building Your<br />Dreams, Together</h1>
          <p>We are a full-service construction company, delivering high-quality residential and commercial projects with a commitment to excellence, safety and on-time delivery.</p>
          <div className="landing-actions">
            <button className="landing-signup" type="button" onClick={onRequest}>{user ? 'Submit a Project Request' : 'Get a Free Quote'} <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <section className="landing-service-finder" aria-label="Find construction services">
          <h2>What are you looking for?</h2>
          <p>Find the right construction service for your project.</p>
          <form className="landing-service-search" onSubmit={(event) => {
            event.preventDefault();
            setSubmittedSearch(searchTerm.trim());
          }}>
            <input id="service-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search for services..." aria-label="Search for services" />
            <button type="submit" aria-label="Search services">⌕</button>
          </form>
          <div className="landing-service-tiles">
            {visibleServices.map((service) => (
              <button className="landing-service-tile" type="button" key={service.name} onClick={onRequest}>
                <span aria-hidden="true">{service.icon}</span><strong>{service.name}</strong>
              </button>
            ))}
            {visibleServices.length === 0 && <p className="landing-no-services">No matching services. Try another search.</p>}
          </div>
        </section>
        {videoFinished && (
          <div className="landing-carousel-dots" aria-label="Project image slides">
            <button type="button" className="landing-slide-arrow" aria-label="Previous project image" onClick={() => setHeroSlide((slide) => (slide + heroImages.length - 1) % heroImages.length)}>‹</button>
            <button type="button" className="landing-slide-arrow" aria-label="Next project image" onClick={() => setHeroSlide((slide) => (slide + 1) % heroImages.length)}>›</button>
            {heroImages.map((image, index) => (
              <button
                className={`landing-slide-dot${heroSlide === index ? ' selected' : ''}`}
                type="button"
                key={image}
                aria-label={`Show project image ${index + 1}`}
                aria-pressed={heroSlide === index}
                onFocus={() => setHeroSlide(index)}
                onClick={() => setHeroSlide(index)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="landing-about" id="about">
        <div className="landing-about-copy">
          <span className="landing-eyebrow">ABOUT US</span>
          <h2>A Trusted Construction Partner</h2>
          <p>BuildPro delivers reliable construction solutions with a strong focus on quality, safety, and clear communication. From planning to project completion, we work closely with every client to turn ideas into well-managed, durable, and successful construction projects.</p>
          <a className="landing-about-link" href="/about/learn-more" onClick={(event) => {
            event.preventDefault();
            onNavigate('/about/learn-more');
          }}>Learn more <span aria-hidden="true">→</span></a>
        </div>
        <img src={aboutImage} alt="Construction workers reviewing a building project" />
      </section>

      <section className="landing-services" id="services">
        <div className="landing-services-heading" id="how-it-works">
          <span className="landing-eyebrow">OUR SERVICES</span>
          <h2>We Build What You Imagine</h2>
          <p>From new construction to renovations, we offer a wide range of construction services tailored to your needs.</p>
        </div>
        <div className="landing-service-carousel" id="projects">
          <button className="landing-service-arrow landing-service-arrow--previous" type="button" aria-label="Previous services" onClick={() => scrollServices(-1)}>‹</button>
          <div className="landing-service-viewport" ref={serviceCarouselRef} onScroll={(event) => {
            const step = getServiceCardStep();
            if (step) {
              setActiveServiceIndex(Math.min(services.length - 1, Math.round(event.currentTarget.scrollLeft / step)));
            }
          }}>
            <div className="landing-service-track">
              {services.map((service) => (
                <article className="landing-service-card" key={service.name}>
                  <img src={service.image} alt={`${service.name} project`} />
                  <span className="landing-service-icon" aria-hidden="true">{service.icon}</span>
                  <div className="landing-service-card-copy">
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <a href="/#contact">Learn More <span aria-hidden="true">→</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <button className="landing-service-arrow landing-service-arrow--next" type="button" aria-label="Next services" onClick={() => scrollServices(1)}>›</button>
        </div>
        <div className="landing-service-pagination" aria-label="Choose a service">
          {services.map((service, index) => (
            <button
              className={index === activeServiceIndex ? 'is-active' : ''}
              type="button"
              key={service.name}
              aria-label={`Show ${service.name}`}
              aria-current={index === activeServiceIndex ? 'true' : undefined}
              onClick={() => selectService(index)}
            />
          ))}
        </div>
        <span id="team" className="landing-anchor" />
      </section>
      <ContactSection />
      <LandingFooter onNavigate={onNavigate} />
      </>
      )}
    </main>
  );
}

function App() {
  const [mode, setMode] = useState(() => window.location.pathname === '/signup' ? 'signup' : 'login');
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [clientRequests, setClientRequests] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');
  const [clientNotice, setClientNotice] = useState('');
  // const [requestBusy, setRequestBusy] = useState(false);
  // const [projectForm, setProjectForm] = useState({
  //   projectName: '',
  //   projectType: '',
  //   location: '',
  //   description: '',
  // });
  const [clientEditRequest, setClientEditRequest] = useState(null);

  const isSignup = mode === 'signup';

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    function syncPath() {
      setCurrentPath(window.location.pathname);
      if (window.location.pathname === '/signup') {
        setMode('signup');
      } else if (window.location.pathname === '/login') {
        setMode('login');
      }
    }
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  // Safety redirect if site engineer lands in the generic workspace layout
  useEffect(() => {
    if (user && user.role === 'SITE_ENGINEER' && currentPath.startsWith('/workspace/')) {
      navigate('/engineer/dashboard');
    }
  }, [user, currentPath, navigate]);

  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((response) => {
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Could not restore your sign-in session.');
        }
        return response.json();
      })
      .then((account) => {
        if (mounted && account) {
          setUser(account);
          const isPublicPath = window.location.pathname === '/' || window.location.pathname.startsWith('/about');
          if (account.role === 'ADMIN' || account.role === 'ADMIN_PROJECT_MANAGER') {
            if (!isPublicPath && !window.location.pathname.startsWith('/admin/')) {
              navigate('/admin/dashboard');
            }
          } else if (account.role === 'CLIENT' || account.role === 'CLIENT_BUILDING_OWNER') {
            if (!isPublicPath && !window.location.pathname.startsWith('/client/')) {
              navigate('/client/profile');
            }
          } else if (!isPublicPath && !window.location.pathname.startsWith('/workspace/')) {
            navigate('/workspace/profile');
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Could not connect to the server. Check that the backend is running.');
        }
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'ADMIN_PROJECT_MANAGER') {
      setAdminUsers([]);
      setDashboardError('');
      return undefined;
    }

    let mounted = true;
    setDashboardLoading(true);
    fetch(`${API_URL}/api/admin/users`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('The admin dashboard API was not found. Restart the Spring Boot backend in IntelliJ so it loads the latest code, then sign in again.');
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error('Your admin session has expired or does not have administrator access. Sign out and sign in again with the Admin role.');
          }
          throw new Error(`Unable to load team accounts (server error ${response.status}). Check the Spring Boot backend logs and try again.`);
        }
        return response.json();
      })
      .then((accounts) => {
        if (mounted) {
          setAdminUsers(accounts);
          setDashboardError('');
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setDashboardError(requestError.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setDashboardLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const isPublicPath = currentPath === '/' || currentPath.startsWith('/about');
    if ((user?.role === 'ADMIN' || user?.role === 'ADMIN_PROJECT_MANAGER')
      && !isPublicPath && !currentPath.startsWith('/admin/')) {
      navigate('/admin/dashboard');
    } else if ((user?.role === 'CLIENT' || user?.role === 'CLIENT_BUILDING_OWNER')
      && !isPublicPath && !currentPath.startsWith('/client/')) {
      navigate('/client/profile');
    } else if (user?.role === 'SITE_ENGINEER' 
      && !isPublicPath && !currentPath.startsWith('/engineer/')) {
      navigate('/engineer/dashboard');
    } else if (user
      && user.role !== 'ADMIN' && user.role !== 'ADMIN_PROJECT_MANAGER'
      && user.role !== 'CLIENT' && user.role !== 'CLIENT_BUILDING_OWNER'
      && user.role !== 'SITE_ENGINEER'
      && !isPublicPath && !currentPath.startsWith('/workspace/')) {
      navigate('/workspace/profile');
    }
  }, [currentPath, navigate, user]);

  useEffect(() => {
    if (user?.role !== 'CLIENT' && user?.role !== 'CLIENT_BUILDING_OWNER') {
      setClientRequests([]);
      setClientError('');
      return undefined;
    }

    let mounted = true;
    setClientLoading(true);
    fetch(`${API_URL}/api/client/requests`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? 'Your client session has expired. Please sign in again.'
            : `Could not load your project requests (HTTP ${response.status}).`);
        }
        return response.json();
      })
      .then((requests) => {
        if (!Array.isArray(requests)) {
          throw new Error('The server returned an invalid project request list.');
        }
        if (mounted) {
          setClientRequests(requests);
          setClientError('');
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setClientError(requestError.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setClientLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    navigate(nextMode === 'signup' ? '/signup' : '/login');
    setNotice('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (isSignup) {
        await sendAuthRequest('register', {
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role,
        });
        setNotice('Your account has been created. You can now sign in.');
        setMode('login');
        navigate('/login');
        setForm((current) => ({
          ...current,
          fullName: '',
          phoneNumber: '',
          confirmPassword: '',
        }));
        setForm((current) => ({ ...current, password: '', role: '' }));
      } else {
        const account = await sendAuthRequest('login', {
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setUser(account);
        
        // Proper role-based redirection immediately upon login
        if (account.role === 'ADMIN' || account.role === 'ADMIN_PROJECT_MANAGER') {
          navigate('/admin/dashboard');
        } else if (account.role === 'CLIENT' || account.role === 'CLIENT_BUILDING_OWNER') {
          navigate('/client/dashboard');
        } else if (account.role === 'SITE_ENGINEER') {
          navigate('/engineer/dashboard');
        } else {
          navigate('/workspace/dashboard');
        }
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await sendAuthRequest('logout');
      setUser(null);
      setMode('login');
      navigate('/login');
      setForm((current) => ({ ...current, password: '', role: '' }));
      setNotice('You have been signed out.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

/*
  async function handleProjectRequestSubmit(event) {
    event.preventDefault();
    setClientError('');
    setClientNotice('');
    setRequestBusy(true);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${API_URL}/api/client/requests`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(projectForm),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.message
          || `Could not submit your project request (HTTP ${response.status}).`);
      }
      const newRequest = await response.json();
      if (!newRequest || typeof newRequest.id !== 'number') {
        throw new Error('The server returned an invalid project request response.');
      }
      setClientRequests((current) => [newRequest, ...current]);
      setProjectForm({ projectName: '', projectType: '', location: '', description: '' });
      setClientNotice('Your project request was submitted successfully.');
      navigate('/client/project-requests');
    } catch (requestError) {
      setClientError(requestError.message);
    } finally {
      setRequestBusy(false);
    }
  }
*/

  const clientNavigation = [
    { section: 'PROJECTS', items: [
      { label: 'Submit Project Request', path: '/client/project-request/new', icon: '+' },
      { label: 'My Project Requests', path: '/client/requests', icon: '▤' },
      { label: 'My Projects', path: '/client/projects', icon: '⌂' },
      { label: 'Project Progress', path: '/client/progress', icon: '↗' },
    ] },
    { section: 'BILLING', items: [
      { label: 'My Invoices', path: '/client/invoices', icon: '＄' },
    ] },
    { section: 'ACCOUNT', items: [
      { label: 'Notifications', path: '/client/notifications', icon: '♧' },
      { label: 'Profile', path: '/client/profile', icon: '◉' },
    ] },
  ];
  const clientPageTitles = {
    '/client/dashboard': 'Profile',
    '/client/submit-request': 'Submit Project Request',
    '/client/project-request/new': 'Submit Project Request',
    '/client/project-requests': 'My Project Requests',
    '/client/requests': 'My Project Requests',
    '/client/projects': 'My Projects',
    '/client/progress': 'Project Progress',
    '/client/invoices': 'My Invoices',
    '/client/notifications': 'Notifications',
    '/client/profile': 'Profile',
  };

  const isSubmitRequestPage = currentPath === '/client/submit-request' || currentPath === '/client/project-request/new';
  const isRequestsListPage = currentPath === '/client/project-requests' || currentPath === '/client/requests';
  const clientProjectDetailsMatch = currentPath.match(/^\/client\/projects\/(\d+)$/);
  const clientPage = clientPageTitles[currentPath] ? currentPath : (isSubmitRequestPage ? '/client/project-request/new' : (isRequestsListPage ? '/client/requests' : (clientProjectDetailsMatch ? '/client/projects' : '/client/dashboard')));

  if ((user?.role === 'CLIENT' || user?.role === 'CLIENT_BUILDING_OWNER') && currentPath.startsWith('/client/')) {
    return (
      <main className="client-layout">
        <aside className="client-sidebar">
          <a className="client-brand" href="/client/dashboard" onClick={(event) => {
            event.preventDefault();
            navigate('/client/dashboard');
          }}>
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>BuildPro</span>
          </a>

          <nav className="client-navigation" aria-label="Client workspace">
            <a
              href="/client/dashboard"
              className={`client-nav-link${clientPage === '/client/dashboard' ? ' active' : ''}`}
              aria-current={clientPage === '/client/dashboard' ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate('/client/dashboard');
                setClientNotice('');
              }}
            >
              <span className="client-nav-icon" aria-hidden="true">▦</span> Dashboard
            </a>
            {clientNavigation.map((group) => (
              <div className="client-nav-group" key={group.section}>
                <span className="client-nav-heading">{group.section}</span>
                {group.items.map((item) => {
                  const isActive = clientPage === item.path
                    || (item.path === '/client/project-request/new' && isSubmitRequestPage)
                    || (item.path === '/client/requests' && isRequestsListPage);
                  return (
                    <a
                      href={item.path}
                      key={item.path}
                      className={`client-nav-link${isActive ? ' active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(item.path);
                        setClientNotice('');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: '12px' }}>
                        <span className="client-nav-icon" aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </div>
                      {item.label === 'Notifications' && (
                        <span className="nav-badge">3</span>
                      )}
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="client-sidebar-bottom">
            <div className="client-profile-summary">
              <span className="client-avatar">{user.fullName.charAt(0).toUpperCase()}</span>
              <span><strong>{user.fullName}</strong><small>Client / Building Owner</small></span>
            </div>
            <button className="client-logout" type="button" onClick={handleLogout} disabled={busy}>
              <span className="client-nav-icon" aria-hidden="true">↪</span>
              {busy ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </aside>

        <section className="client-content">
          <header className="client-topbar-modern">
            <div className="topbar-breadcrumb">
              BuildPro <span className="breadcrumb-divider">{'>'}</span> {clientProjectDetailsMatch ? `Project #${clientProjectDetailsMatch[1]}` : (clientPageTitles[currentPath] || 'Workspace')}
            </div>
            
            <div className="topbar-right">
              <div className="topbar-search">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search projects, invoices..." />
              </div>
              
              <div className="topbar-actions">
                <div className="notification-bell-wrapper">
                  <NotificationBell apiUrl={API_URL} getCsrfToken={getCsrfToken} onNavigate={navigate} />
                </div>
                
                <div className="topbar-profile">
                  <span className="topbar-avatar">{user.fullName.charAt(0).toUpperCase()}</span>
                  <span className="topbar-name">{user.fullName}</span>
                  <span className="topbar-chevron">▼</span>
                </div>
              </div>
              
              <button className="client-mobile-logout" type="button" onClick={handleLogout} disabled={busy}>
                {busy ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </header>

          <div className="client-main">
            {clientNotice && <p className="client-success-message" role="status">{clientNotice}</p>}

            {(clientPage === '/client/dashboard' || clientPage === '/client/profile') && (
              <>
                <AccountProfile user={user} />
              </>
            )}

            {isSubmitRequestPage && (
              <>
                <div className="client-page-heading">
                  <span className="eyebrow">PROJECTS</span>
                  <h1>{clientEditRequest ? 'Edit & Resubmit Request' : 'Submit Project Request'}</h1>
                  <p>Share a few details about your project so our team can get started.</p>
                </div>
                <ClientProjectRequestForm
                  apiUrl={API_URL}
                  getCsrfToken={getCsrfToken}
                  initialData={clientEditRequest}
                  isEdit={Boolean(clientEditRequest)}
                  onSubmitSuccess={(savedRequest, msg) => {
                    setClientRequests((prev) => [savedRequest, ...prev.filter((r) => r.id !== savedRequest.id)]);
                    setClientNotice(msg || 'Project request submitted successfully.');
                    setClientEditRequest(null);
                    navigate(currentPath === '/client/submit-request' ? '/client/project-requests' : '/client/requests');
                  }}
                />
              </>
            )}

            {isRequestsListPage && (
              <ClientRequestsList
                requests={clientRequests}
                loading={clientLoading}
                error={clientError}
                apiUrl={API_URL}
                onNewRequest={() => {
                  setClientEditRequest(null);
                  navigate(currentPath === '/client/project-requests' ? '/client/submit-request' : '/client/project-request/new');
                }}
                onEditRequest={(req) => {
                  setClientEditRequest(req);
                  navigate(currentPath === '/client/project-requests' ? '/client/submit-request' : '/client/project-request/new');
                }}
                onDeleteRequest={async (id) => {
                  try {
                    const csrfToken = await getCsrfToken();
                    const response = await fetch(`${API_URL}/api/client/requests/${id}`, {
                      method: 'DELETE',
                      credentials: 'include',
                      headers: {
                        'X-XSRF-TOKEN': csrfToken,
                      },
                    });
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      throw new Error(errorData.detail || errorData.message || 'Failed to delete request.');
                    }
                    setClientRequests((prev) => prev.filter((r) => r.id !== id));
                    setClientNotice('Project request deleted successfully.');
                  } catch (err) {
                    setClientError(err.message || 'An error occurred while deleting the request.');
                  }
                }}
              />
            )}

            {clientPage === '/client/projects' && (
              clientProjectDetailsMatch ? (
                <ClientProjectDetails
                  projectId={clientProjectDetailsMatch[1]}
                  apiUrl={API_URL}
                  onBack={() => navigate('/client/projects')}
                />
              ) : (
                <ClientProjectsList
                  apiUrl={API_URL}
                  onNavigate={navigate}
                />
              )
            )}
            {clientPage === '/client/progress' && (
              <ClientPlaceholder icon="↗" section="PROJECTS" title="Project Progress" text="Project updates, milestones, and progress reports will appear here when you have an active project." />
            )}
            {clientPage === '/client/invoices' && (
              <ClientPlaceholder icon="＄" section="BILLING" title="My Invoices" text="Invoices for your construction projects will be listed here when they are issued." />
            )}
            {clientPage === '/client/notifications' && (
              <ClientNotifications apiUrl={API_URL} getCsrfToken={getCsrfToken} onNavigate={navigate} />
            )}
            <p className="dashboard-footer">BUILDPRO <span>·</span> CONSTRUCTION MANAGEMENT</p>
          </div>
        </section>
      </main>
    );
  }

  if ((user?.role === 'ADMIN' || user?.role === 'ADMIN_PROJECT_MANAGER')
    && currentPath.startsWith('/admin/')) {
    const isAdminProfile = currentPath === '/admin/profile';
    const isProjectRequests = currentPath === '/admin/project-requests';
    const isProjects = currentPath === '/admin/projects';
    const requestDetailsMatch = currentPath.match(/^\/admin\/project-requests\/(\d+)$/);
    const projectDetailsMatch = currentPath.match(/^\/admin\/projects\/(\d+)$/);

    let pageTitle = 'Overview';
    if (isAdminProfile) pageTitle = 'My profile';
    else if (isProjectRequests) pageTitle = 'Project Requests';
    else if (isProjects) pageTitle = 'Projects';
    else if (requestDetailsMatch) pageTitle = `Request #${requestDetailsMatch[1]}`;
    else if (projectDetailsMatch) pageTitle = `Project #${projectDetailsMatch[1]}`;

    return (
      <main className="admin-layout">
        <aside className="admin-sidebar">
          <a className="admin-brand" href="/" aria-label="Buildwise home">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>BuildPro</span>
          </a>
          <span className="sidebar-section-label">WORKSPACE</span>
          <a className={`sidebar-link${currentPath === '/admin/dashboard' ? ' active' : ''}`} href="/admin/dashboard" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/dashboard');
          }}>
            <span aria-hidden="true">◫</span> Overview
          </a>
          <a className={`sidebar-link${isProjectRequests || requestDetailsMatch ? ' active' : ''}`} href="/admin/project-requests" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/project-requests');
          }}>
            <span aria-hidden="true">📋</span> Project Requests
          </a>
          <a className={`sidebar-link${isProjects || projectDetailsMatch ? ' active' : ''}`} href="/admin/projects" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/projects');
          }}>
            <span aria-hidden="true">🏢</span> Projects
          </a>

          <span className="sidebar-section-label" style={{ marginTop: '24px' }}>ACCOUNT</span>
          <a className={`sidebar-link${isAdminProfile ? ' active' : ''}`} href="/admin/profile" onClick={(event) => {
            event.preventDefault();
            navigate('/admin/profile');
          }}>
            <span aria-hidden="true">◉</span> My profile
          </a>
          <a className="sidebar-link" href="/admin/dashboard#team" onClick={(event) => {
            if (currentPath !== '/admin/dashboard') {
              event.preventDefault();
              navigate('/admin/dashboard');
              setTimeout(() => {
                document.getElementById('team')?.scrollIntoView();
              }, 100);
            }
          }}>
            <span aria-hidden="true">♧</span> Team accounts
            <span className="sidebar-count">{adminUsers.length}</span>
          </a>
          <div className="sidebar-bottom">
            <div className="admin-sidebar-profile">
              <span className="avatar">{user.fullName.charAt(0).toUpperCase()}</span>
              <span><strong>{user.fullName}</strong><small>Administrator</small></span>
            </div>
            <button className="sidebar-logout" type="button" onClick={handleLogout} disabled={busy}>
              <span aria-hidden="true">↪</span> {busy ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>

        <section className="admin-content" id="overview">
          <header className="admin-topbar">
            <span>Workspace <span className="breadcrumb-divider">/</span> {pageTitle}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <NotificationBell apiUrl={API_URL} getCsrfToken={getCsrfToken} onNavigate={navigate} />
              <span className="admin-online"><span /> Admin account</span>
            </div>
          </header>

          <div className="admin-main">
            {isAdminProfile && (
              <>
                <div className="dashboard-heading">
                  <div><span className="eyebrow">ACCOUNT</span><h1>My profile</h1><p>Your details for the account currently signed in.</p></div>
                  <div className="dashboard-date"><span>YOUR ROLE</span><strong>{accountRoleLabel(user.role)}</strong></div>
                </div>
                <AccountProfile user={user} className="client-panel client-profile-panel admin-profile-panel" />
              </>
            )}

            {isProjectRequests && (
              <AdminProjectRequestsList
                apiUrl={API_URL}
                getCsrfToken={getCsrfToken}
                onViewDetails={(id) => navigate(`/admin/project-requests/${id}`)}
                onProjectCreated={(id) => navigate(`/admin/projects/${id}`)}
              />
            )}

            {isProjects && (
              <div className="client-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', color: '#94a3b8' }}>🏢</div>
                <h3 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>Admin Projects Overview</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                  The full list of active construction projects will be implemented here.
                </p>
              </div>
            )}

            {requestDetailsMatch && (
              <AdminProjectRequestDetails
                requestId={requestDetailsMatch[1]}
                apiUrl={API_URL}
                getCsrfToken={getCsrfToken}
                onBack={() => navigate('/admin/project-requests')}
                onProjectCreated={(id) => navigate(`/admin/projects/${id}`)}
              />
            )}

            {projectDetailsMatch && (
              <AdminProjectDetails
                projectId={projectDetailsMatch[1]}
                apiUrl={API_URL}
                onBack={() => navigate('/admin/project-requests')}
                onViewRequest={(id) => navigate(`/admin/project-requests/${id}`)}
              />
            )}

            {currentPath === '/admin/dashboard' && (
              <div className="admin-overview-container">
                <div className="admin-welcome-banner">
                  <div className="admin-welcome-text">
                    <span className="eyebrow">ADMINISTRATION</span>
                    <h1>Welcome, {user.fullName.split(' ')[0]}.</h1>
                    <p>Manage your workspace and keep track of registered team accounts.</p>
                  </div>
                  <div className="admin-role-card">
                    <div className="admin-role-icon">👑</div>
                    <div className="admin-role-info">
                      <span className="role-label">YOUR ROLE</span>
                      <strong>Administrator</strong>
                    </div>
                    <span className="role-status"><span className="status-dot green"></span> Active</span>
                  </div>
                </div>

                {dashboardError && <p className="dashboard-error" role="alert">{dashboardError}</p>}

                <div className="admin-overview-stats">
                  <div className="stat-card new-stat">
                    <div className="stat-icon-wrapper blue">👥</div>
                    <div className="stat-content">
                      <span className="stat-title">Registered Accounts</span>
                      <strong>{dashboardLoading ? '—' : adminUsers.length}</strong>
                      <span className="stat-desc">Accounts in your workspace</span>
                    </div>
                  </div>
                  <div className="stat-card new-stat">
                    <div className="stat-icon-wrapper green">✓</div>
                    <div className="stat-content">
                      <span className="stat-title">Active Users</span>
                      <strong>{dashboardLoading ? '—' : adminUsers.length}</strong>
                      <span className="stat-desc">Currently active accounts</span>
                    </div>
                    <div className="stat-trend green">▲ 100%<br/><small>vs last month</small></div>
                  </div>
                  <div className="stat-card new-stat">
                    <div className="stat-icon-wrapper yellow">👷</div>
                    <div className="stat-content">
                      <span className="stat-title">Site Engineers</span>
                      <strong>{adminUsers.filter(u => u.role === 'SITE_ENGINEER').length}</strong>
                      <span className="stat-desc">Engineering team members</span>
                    </div>
                  </div>
                  <div className="stat-card new-stat">
                    <div className="stat-icon-wrapper purple">👤</div>
                    <div className="stat-content">
                      <span className="stat-title">Clients</span>
                      <strong>{adminUsers.filter(u => u.role === 'CLIENT' || u.role === 'CLIENT_BUILDING_OWNER').length}</strong>
                      <span className="stat-desc">Client / Building Owners</span>
                    </div>
                  </div>
                </div>

                <section className="team-directory-section">
                  <div className="directory-header">
                    <div className="directory-title">
                      <span className="eyebrow">WORKSPACE DIRECTORY</span>
                      <h2>Team accounts</h2>
                      <p>Accounts registered in the construction management workspace.</p>
                    </div>
                    <button className="btn-primary" onClick={() => alert("Add New Account modal would open here.")}>+ Add New Account</button>
                  </div>

                  {dashboardLoading ? (
                    <p className="team-message">Loading team accounts…</p>
                  ) : dashboardError ? (
                    <p className="team-message">Team accounts could not be loaded.</p>
                  ) : adminUsers.length === 0 ? (
                    <p className="team-message">There are no registered accounts yet.</p>
                  ) : (
                    <div className="directory-table-container">
                      <table className="custom-admin-table directory-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((account, index) => (
                            <tr key={account.id}>
                              <td>
                                <div className="table-client-cell">
                                  <div className={`table-avatar color-${index % 4}`}>{account.fullName.charAt(0).toUpperCase()}</div>
                                  <strong>{account.fullName}</strong>
                                </div>
                              </td>
                              <td>{account.email}</td>
                              <td>{account.phoneNumber || '0741234567'}</td>
                              <td>
                                <span className={`role-pill role-${account.role.toLowerCase()}`}>
                                  {account.role === 'SITE_ENGINEER' ? '👷' : account.role === 'CLIENT_BUILDING_OWNER' ? '👥' : '👑'} 
                                  {' '}{roles.find((role) => role.value === account.role)?.label || (account.role === 'CLIENT_BUILDING_OWNER' ? 'Client / Building Owner' : account.role)}
                                </span>
                              </td>
                              <td><span className="status-active"><span className="status-dot green"></span> Active</span></td>
                              <td>
                                <div className="action-menu-container">
                                  <button className="btn-action-more">⋮</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="admin-pagination-bar">
                        <span>Showing 1 to {adminUsers.length} of {adminUsers.length} accounts</span>
                        <div className="pagination-controls">
                          <button className="pagination-btn">{'<'}</button>
                          <button className="pagination-btn active">1</button>
                          <button className="pagination-btn">{'>'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
            <p className="dashboard-footer">BUILDPRO <span>·</span> CONSTRUCTION MANAGEMENT</p>
          </div>
        </section>
      </main>
    );
  }

  if (user && currentPath.startsWith('/workspace/')) {
    return (
      <main className="client-layout">
        <aside className="client-sidebar">
          <a className="client-brand" href="/workspace/profile" onClick={(event) => {
            event.preventDefault();
            navigate('/workspace/profile');
          }}><span className="brand-mark" aria-hidden="true">B</span><span>BuildPro</span></a>
          <nav className="client-navigation" aria-label="Account workspace">
            <a className={`client-nav-link${currentPath === '/workspace/dashboard' ? ' active' : ''}`} href="/workspace/dashboard" onClick={(event) => {
              event.preventDefault();
              navigate('/workspace/dashboard');
            }}><span className="client-nav-icon" aria-hidden="true">▦</span> Dashboard</a>
            <a className={`client-nav-link${currentPath === '/workspace/profile' ? ' active' : ''}`} href="/workspace/profile" onClick={(event) => {
              event.preventDefault();
              navigate('/workspace/profile');
            }}><span className="client-nav-icon" aria-hidden="true">◉</span> My profile</a>
          </nav>
          <div className="client-sidebar-bottom">
            <div className="client-profile-summary"><span className="client-avatar">{user.fullName.charAt(0).toUpperCase()}</span>
              <span><strong>{user.fullName}</strong><small>{accountRoleLabel(user.role)}</small></span></div>
            <button className="client-logout" type="button" onClick={handleLogout} disabled={busy}>↪ {busy ? 'Signing out…' : 'Sign out'}</button>
          </div>
        </aside>
        <section className="client-content">
          <header className="client-topbar"><span>BuildPro <span className="breadcrumb-divider">/</span> {currentPath === '/workspace/profile' ? 'My profile' : 'Dashboard'}</span>
            <span className="client-topbar-account"><span className="client-online-dot" /> {user.fullName}</span>
            <button className="client-mobile-logout" type="button" onClick={handleLogout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button>
          </header>
          <div className="client-main">
            {currentPath === '/workspace/dashboard' ? (
              <>
                <div className="client-page-heading"><span className="eyebrow">YOUR WORKSPACE</span><h1>Welcome, {user.fullName.split(' ')[0]}.</h1><p>Manage your account and stay connected to your construction team.</p></div>
                <AccountProfile user={user} />
              </>
            ) : (
              <>
                <div className="client-page-heading"><span className="eyebrow">ACCOUNT</span><h1>My profile</h1><p>Your details for the account currently signed in.</p></div>
                <AccountProfile user={user} />
              </>
            )}
            <p className="dashboard-footer">BUILDPRO <span>·</span> CONSTRUCTION MANAGEMENT</p>
          </div>
        </section>
      </main>
    );
  }

  if (user?.role === 'SITE_ENGINEER' && currentPath.startsWith('/engineer/')) {
    const isEngineerProfile = currentPath === '/engineer/profile';
    const isEngineerProjectRequests = currentPath === '/engineer/project-requests';
    const engineerRequestDetailsMatch = currentPath.match(/^\/engineer\/project-requests\/(\d+)$/);
    const isEngineerProjects = currentPath === '/engineer/projects';
    const engineerProjectDetailsMatch = currentPath.match(/^\/engineer\/projects\/(\d+)$/);

    let pageTitle = 'Dashboard';
    if (isEngineerProfile) pageTitle = 'My profile';
    else if (isEngineerProjectRequests) pageTitle = 'Technical Reviews';
    else if (engineerRequestDetailsMatch) pageTitle = `Request #${engineerRequestDetailsMatch[1]}`;
    else if (isEngineerProjects) pageTitle = 'Projects';
    else if (engineerProjectDetailsMatch) pageTitle = `Project #${engineerProjectDetailsMatch[1]}`;

    return (
      <main className="client-layout admin-layout">
        <aside className="admin-sidebar client-sidebar">
          <a className="client-brand" href="/engineer/dashboard" onClick={(e) => { e.preventDefault(); navigate('/engineer/dashboard'); }}>
            <span className="brand-mark">B</span>
            <span>BuildPro</span>
          </a>
          <nav className="client-navigation">
            <a href="/engineer/dashboard" className={`client-nav-link${currentPath === '/engineer/dashboard' ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/engineer/dashboard'); }}>
              <span className="client-nav-icon">▦</span> Dashboard
            </a>
            <div className="client-nav-group">
              <span className="client-nav-heading">PROJECTS</span>
              <a href="/engineer/project-requests" className={`client-nav-link${isEngineerProjectRequests || engineerRequestDetailsMatch ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/engineer/project-requests'); }}>
                <span className="client-nav-icon">▤</span> Technical Reviews
              </a>
              <a href="/engineer/projects" className={`client-nav-link${isEngineerProjects || engineerProjectDetailsMatch ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/engineer/projects'); }}>
                <span className="client-nav-icon">🏢</span> My Projects
              </a>
            </div>
            <div className="client-nav-group">
              <span className="client-nav-heading">ACCOUNT</span>
              <a href="/engineer/profile" className={`client-nav-link${isEngineerProfile ? ' active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/engineer/profile'); }}>
                <span className="client-nav-icon">◉</span> Profile
              </a>
            </div>
          </nav>
          <div className="client-sidebar-bottom">
            <div className="client-profile-summary">
              <span className="client-avatar">{user.fullName.charAt(0).toUpperCase()}</span>
              <span><strong>{user.fullName}</strong><small>Site Engineer</small></span>
            </div>
            <button className="client-logout" type="button" onClick={handleLogout} disabled={busy}>
              <span className="client-nav-icon">↪</span>
              {busy ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </aside>
        <section className="client-content admin-content">
          <header className="client-topbar admin-topbar">
            <span>Workspace <span className="breadcrumb-divider">/</span> {pageTitle}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <NotificationBell apiUrl={API_URL} getCsrfToken={getCsrfToken} onNavigate={navigate} />
              <span className="admin-online"><span /> Engineer account</span>
            </div>
          </header>
          <div className="client-main admin-main">
            {isEngineerProfile && (
              <>
                <div className="dashboard-heading">
                  <div><span className="eyebrow">ACCOUNT</span><h1>My profile</h1><p>Your details for the account currently signed in.</p></div>
                  <div className="dashboard-date"><span>YOUR ROLE</span><strong>Site Engineer</strong></div>
                </div>
                <AccountProfile user={user} className="client-panel client-profile-panel admin-profile-panel" />
              </>
            )}

            {isEngineerProjectRequests && (
              <EngineerProjectRequestsList
                apiUrl={API_URL}
                getCsrfToken={getCsrfToken}
                onViewDetails={(id) => navigate(`/engineer/project-requests/${id}`)}
              />
            )}

            {engineerRequestDetailsMatch && (
              <EngineerProjectRequestDetails
                requestId={engineerRequestDetailsMatch[1]}
                apiUrl={API_URL}
                getCsrfToken={getCsrfToken}
                onBack={() => navigate('/engineer/project-requests')}
              />
            )}

            {isEngineerProjects && (
              <EngineerProjectsList
                apiUrl={API_URL}
                onNavigate={navigate}
              />
            )}

            {engineerProjectDetailsMatch && (
              <EngineerProjectDetails
                projectId={engineerProjectDetailsMatch[1]}
                apiUrl={API_URL}
                onBack={() => navigate('/engineer/projects')}
              />
            )}

            {currentPath === '/engineer/dashboard' && (
              <>
                <div className="dashboard-heading">
                  <div>
                    <span className="eyebrow">WORKSPACE</span>
                    <h1>Welcome, {user.fullName}.</h1>
                    <p>Manage your assigned tasks and technical reviews.</p>
                  </div>
                </div>
                <div className="dashboard-stats">
                  <article className="stat-card" onClick={() => navigate('/engineer/project-requests')} style={{ cursor: 'pointer' }}>
                    <span className="stat-icon members">▤</span>
                    <span className="stat-label">ASSIGNED REQUESTS</span>
                    <strong>View</strong>
                    <span className="stat-caption">Technical assessments needed</span>
                  </article>
                </div>
              </>
            )}
            
            <p className="dashboard-footer">BUILDPRO <span>·</span> CONSTRUCTION MANAGEMENT</p>
          </div>
        </section>
      </main>
    );
  }


  if (currentPath === '/' || currentPath.startsWith('/about') || (!user && currentPath !== '/login' && currentPath !== '/signup')) {
    return (
      <LandingPage
        currentPath={currentPath}
        user={user}
        onNavigate={(path) => {
          navigate(path);
          window.scrollTo(0, 0);
        }}
        onLogin={() => changeMode('login')}
        onSignup={() => changeMode('signup')}
        onRequest={() => {
          if (!user) {
            changeMode('signup');
          } else if (user.role === 'CLIENT' || user.role === 'CLIENT_BUILDING_OWNER') {
            navigate('/client/submit-request');
          } else {
            navigate('/login');
          }
        }}
        onDashboard={() => {
          if (user.role === 'ADMIN' || user.role === 'ADMIN_PROJECT_MANAGER') {
            navigate('/admin/dashboard');
          } else if (user.role === 'CLIENT' || user.role === 'CLIENT_BUILDING_OWNER') {
            navigate('/client/dashboard');
          } else if (user.role === 'SITE_ENGINEER') {
            navigate('/engineer/dashboard');
          } else {
            navigate('/workspace/dashboard');
          }
        }}
        onLogout={handleLogout}
        busy={busy}
      />
    );
  }

  return (
    <main className="auth-layout">
      <section className="brand-panel" aria-label="Construction management" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2071&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <a className="brand" href="/" aria-label="Buildwise home">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>BuildPro</span>
        </a>
        <div className="brand-copy">
          <span className="eyebrow">CONSTRUCTION, CONNECTED</span>
          <h1>Build better.<br />Together.</h1>
          <p>One place for your people, projects, and progress.</p>
        </div>
        <div className="blueprint" aria-hidden="true">
          <div className="blueprint-building">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="blueprint-ground" />
          <span className="blueprint-label">YOUR NEXT PROJECT STARTS HERE</span>
        </div>
        <span className="brand-footer">BUILT FOR THE PEOPLE WHO BUILD.</span>
      </section>

      <section className="form-panel">
        <div className="form-wrap">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">B</span>
            <span>BuildPro</span>
          </div>

          {user ? (
            <section className="welcome-card" aria-live="polite">
              <span className="welcome-icon" aria-hidden="true">✓</span>
              <span className="eyebrow">SIGNED IN</span>
              <h2>Welcome, {user.fullName.split(' ')[0]}.</h2>
              <p>You are signed in as <strong>{user.role.replaceAll('_', ' ').toLowerCase()}</strong>.</p>
              <div className="account-detail">
                <span>{user.email}</span>
                <span>{user.phoneNumber}</span>
              </div>
              <button className="primary-button" type="button" onClick={handleLogout} disabled={busy}>
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
            </section>
          ) : (
            <>
              <div className="form-heading">
                <span className="eyebrow">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</span>
                <h2>{isSignup ? 'Create your account' : 'Sign in to your account'}</h2>
                <p>{isSignup ? 'Join your team and keep every project moving.' : 'Enter your details to access your workspace.'}</p>
              </div>

              <div className="auth-tabs" role="tablist" aria-label="Account access">
                <button
                  className={!isSignup ? 'active' : ''}
                  id="login-tab"
                  role="tab"
                  aria-selected={!isSignup}
                  type="button"
                  onClick={() => changeMode('login')}
                >
                  Sign in
                </button>
                <button
                  className={isSignup ? 'active' : ''}
                  id="signup-tab"
                  role="tab"
                  aria-selected={isSignup}
                  type="button"
                  onClick={() => changeMode('signup')}
                >
                  Create account
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {isSignup && (
                  <>
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Jordan Smith"
                      value={form.fullName}
                      onChange={updateField}
                      maxLength={120}
                      required
                    />

                    <label htmlFor="phoneNumber">Phone number</label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0700000000"
                      value={form.phoneNumber}
                      onChange={updateField}
                      pattern="0[0-9]{9}"
                      title="Enter a 10-digit phone number starting with 0, for example 0700000000."
                      required
                    />
                  </>
                )}

                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={updateField}
                  maxLength={254}
                  required
                />

                  <>
                    <label htmlFor="role">Account type</label>
                    <select id="role" name="role" value={form.role} onChange={updateField} required>
                      <option value="" disabled>Select your role</option>
                      {roles.map((role) => (
                        <option value={role.value} key={`${role.value}-${role.label}`}>{role.label}</option>
                      ))}
                    </select>
                  </>

                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                  value={form.password}
                  onChange={updateField}
                  minLength={isSignup ? 8 : undefined}
                  maxLength={72}
                  required
                />

                {isSignup && (
                  <>
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={updateField}
                      minLength={8}
                      maxLength={72}
                      required
                    />
                  </>
                )}

                {error && <p className="form-message error" role="alert">{error}</p>}
                {notice && <p className="form-message success" role="status">{notice}</p>}

                <button className="primary-button" type="submit" disabled={busy}>
                  {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
                  {!busy && <span aria-hidden="true">→</span>}
                </button>
              </form>

              <p className="form-switch">
                {isSignup ? 'Already have an account?' : 'New to Buildwise?'}{' '}
                <button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>
                  {isSignup ? 'Sign in' : 'Create an account'}
                </button>
              </p>
              <p className="secure-note"><span aria-hidden="true">⌑</span> Your account details are encrypted and secure</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
