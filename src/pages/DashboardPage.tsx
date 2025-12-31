import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";
import illu5 from "../assets/illu5.jpg";
import illu6 from "../assets/illu6.jpg";
import illu7 from "../assets/illu7.jpg";
import illu8 from "../assets/illu8.jpg";
import illu9 from "../assets/illu9.jpg";
import illu4 from "../assets/illu4.jpg";

const images = [illu5, illu6, illu7, illu8, illu9, illu4];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    // show loader a bit longer before routing
    setTimeout(() => navigate("/assessment"), 1500);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">Speech Therapy Platform</div>
        {/* Account Menu */}
        <div className="account-menu">
          <button className="account-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="account-text">Account</span>
            <div className="user-icon">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-user-info">
                <div className="dropdown-user-name">{user?.fullName}</div>
                <div className="dropdown-user-email">{user?.email}</div>
              </div>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout-btn" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <div className="dashboard-main">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-title">Menu</h3>
              <ul className="nav-list">
                <li><button className="nav-item active">Dashboard</button></li>
                <li><button className="nav-item">My Sessions</button></li>
                <li><button className="nav-item">Progress</button></li>
                <li><button className="nav-item">Settings</button></li>
              </ul>
            </div>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="dashboard-content">
          <div className="content-wrapper">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome, {user?.fullName}!</h1>
              <p className="welcome-subtitle">Start your speech therapy journey and track your progress</p>
            </div>
            {/* Clean infinite rotating carousel: always shows perfectly visible 3, no clones needed. */}
            <div className="teams-slider-outer">
              <ul className="teams-slider-list" style={{width:'100%',marginLeft:0,display:'flex',justifyContent:'center',alignItems:'flex-end'}}>
                {[0,1,2].map((offset)=>(
                  (()=>{
                    const idx=(current+offset)%images.length;
                    let extraClass = '';
                    if(offset===0){ extraClass=' left-slide'; }
                    if(offset===1){ extraClass=' active-slide'; }
                    if(offset===2){ extraClass=' right-slide'; }
                    return (
                      <li
                        className={'teams-slider-item'+extraClass}
                        style={{ width: '30%', minWidth: 180, height:210, margin:'0 0.5vw', transition:'none', zIndex: offset===1?3:1, position: 'relative', overflow: 'hidden'}}
                        key={images[idx]+"-"+idx}
                        >
                          <figure style={{
                              transform: offset===1? 'scale(1.05) translateY(-14px)': 'scale(0.94)',
                              transition:'transform 1.08s cubic-bezier(0.32,0.64,0.35,1)',
                              borderRadius:14,
                              boxShadow: offset===0 ? '0 17px 36px 0 rgba(255, 255, 255, 0.1)' : '0 17px 36px rgba(255, 255, 255, 0.05)'
                          }}>
                            <img src={images[idx]} alt={"slide "+idx} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:14}}/>
                          </figure>
                      </li>
                    );
                  })()
                ))}
              </ul>
            </div>
            {/* CTA Button as before */}
            <button
              className="start-journey-button centered-wide"
              onClick={handleStart}
              disabled={isNavigating}
              style={{ position: 'absolute', left: '50%', top: '86%', transform: 'translate(-50%, 0)', width: '60%' }}
            >
              {isNavigating ? "Preparing..." : "Start Your Journey Now"}
            </button>
          </div>
        </main>
      </div>
      {isNavigating && (
        <div className="nav-loader-overlay" aria-label="Loading next page">
          <div className="loader-bubble" />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
