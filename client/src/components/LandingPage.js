import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-brand">
          <h1>💻 Coding Habit Builder</h1>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/signup/student" className="btn-signup">Get Started</Link>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Build Your Coding Habit</h1>
          <p className="hero-subtitle">
            Master programming through gamified learning, daily challenges, and real-time competition
          </p>
          <div className="hero-buttons">
            <Link to="/signup/student" className="btn-primary-large">
              Start Learning Now
            </Link>
            <Link to="/login" className="btn-secondary-large">
              I Already Have an Account
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="code-animation">
            <div className="code-line">function buildHabit() {'{'}</div>
            <div className="code-line">  const skill = 'coding';</div>
            <div className="code-line">  const practice = daily();</div>
            <div className="code-line">  return mastery;</div>
            <div className="code-line">{'}'}</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Why Choose Coding Habit Builder?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Gamified Learning</h3>
            <p>Learn through interactive games with 200+ levels across Easy, Intermediate, and Hard difficulties</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Streak System</h3>
            <p>Build consistency with daily 30-minute practice sessions and maintain your streak</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Real-time Competition</h3>
            <p>Compete with other students on leaderboards and see who's on top</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Multiple Languages</h3>
            <p>Master C, C++, Java, and Python with structured lessons and coding challenges</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Assignments & Notes</h3>
            <p>Access teacher assignments and download PDF notes for quick reference</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Earn Badges</h3>
            <p>Unlock achievements and badges as you progress through your coding journey</p>
          </div>
        </div>
      </div>

      <div className="levels-section">
        <h2 className="section-title">Choose Your Challenge Level</h2>
        <div className="levels-grid">
          <div className="level-card easy">
            <h3>Easy</h3>
            <div className="level-badge">50 Levels</div>
            <p>Multiple Choice Questions</p>
            <p className="level-desc">Perfect for beginners. Test your basic coding concepts with MCQ questions.</p>
          </div>
          <div className="level-card intermediate">
            <h3>Intermediate</h3>
            <div className="level-badge">100 Levels</div>
            <p>Code Block Arrangement</p>
            <p className="level-desc">Arrange jumbled code blocks in the correct order. Build your problem-solving skills.</p>
          </div>
          <div className="level-card hard">
            <h3>Hard</h3>
            <div className="level-badge">50 Levels</div>
            <p>Code Writing Challenge</p>
            <p className="level-desc">Write complete programs. Only the fastest 5 students pass each level!</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Start Your Coding Journey?</h2>
        <p>Join thousands of students building their coding habits every day</p>
        <Link to="/signup/student" className="btn-cta">
          Create Free Account
        </Link>
        <div className="user-types">
          <Link to="/signup/student" className="user-link">Sign up as Student</Link>
          <span>or</span>
          <Link to="/signup/teacher" className="user-link">Sign up as Teacher</Link>
        </div>
      </div>

      <footer className="landing-footer">
        <p>&copy; 2024 Coding Habit Builder. All rights reserved.</p>
        <p>Build your coding skills, one day at a time.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

