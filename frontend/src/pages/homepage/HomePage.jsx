import React, { useRef } from 'react';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './HomePage.css';

const HomePage = () => {
  const mainRef = useRef(null);

  const handleScrollToFeatures = () => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="hero-section text-center">
        <div className="container hero-text">
          <h1 style={{display: 'block'}}>Effortless <span>1on1</span> Scheduling: Your Key to Streamlined Meetings</h1>
          <p className="lead">Say goodbye to the hassle of coordinating schedules. With our intuitive platform, effortlessly arrange 1-on-1 meetings with just a few clicks. Prioritize what matters most – meaningful connections – while we handle the logistics for you.</p>
        </div>
        <section className="call-to-action text-center my-4">
          <Link to="/login" className="btn btn-primary btn-lg">Get Started</Link>
                    <button className="btn btn-primary btn-lg" onClick={handleScrollToFeatures}>Learn More</button>
        </section>
      </header>
      <main className="container my-5" id="body" ref={mainRef}>
        <section className="features my-4">
          <h2 className="text-center">Features</h2>
          <div className="row">
            <div className="col feature-border mx-2">
              <h3 className="text-center">Create Accounts</h3>
              <p>Sign up and manage your profile for personalized scheduling. Manage your personal details and keep your information secure.</p>
            </div>
            <div className="col feature-border mx-2">
              <h3 className="text-center">Manage Contacts</h3>
              <p>Easily add and organize your contacts for meetings. Invite people from your contacts list to a meeting calendar to see what time works for everyone.</p>
            </div>
            <div className="col feature-border mx-2">
              <h3 className="text-center">Efficient Scheduling</h3>
              <p>Set up and view your meetings with a user-friendly calendar. Automatically find suitable times for everyone and avoid scheduling conflicts.</p>
            </div>
          </div>
          <Link to="/login" className="btn btn-primary btn-lg">Get Started</Link>
        </section>
      </main>
      <footer className="footer text-center align-items-center">
        <p>&copy; 2024 1on1 Meetings. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
