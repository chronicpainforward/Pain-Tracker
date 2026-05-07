import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TrackerPage from './pages/TrackerPage';
import ResourcesPage from './pages/ResourcesPage';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem'
      }}>
        <Link to="/" style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#534AB7',
          textDecoration: 'none'
        }}>
          ChronicPainForward
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/tracker', label: 'Tracker' },
            { path: '/resources', label: 'Resources' }
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive(path) ? 500 : 400,
                color: isActive(path) ? '#534AB7' : '#6b7280',
                background: isActive(path) ? '#EEEDFE' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
