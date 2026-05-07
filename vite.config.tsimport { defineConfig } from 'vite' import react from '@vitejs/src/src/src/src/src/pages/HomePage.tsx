import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 1.5rem'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Living Well with Chronic Pain
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#6b7280',
          maxWidth: '700px',
          margin: '0 auto 2rem'
        }}>
          A comprehensive daily tracker designed by healthcare professionals 
          to help you manage chronic pain, document symptoms, and communicate 
          effectively with your care team.
        </p>
        <Link
          to="/tracker"
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#534AB7',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          Start Tracking Today
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '4rem'
      }}>
        {[
          {
            title: 'Daily Pain Tracking',
            description: 'Log pain levels, locations, triggers, and interventions with our detailed body map system.',
            color: '#D85A30'
          },
          {
            title: 'Trend Analysis',
            description: 'Visualize patterns over time with charts and identify correlations between activities and pain.',
            color: '#534AB7'
          },
          {
            title: 'Doctor Reports',
            description: 'Generate comprehensive reports for medical appointments with all your data in one place.',
            color: '#185FA5'
          },
          {
            title: 'Tax Documentation',
            description: 'Track medical expenses and travel for CRA claims with automatic calculations.',
            color: '#0F6E56'
          }
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: feature.color + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: feature.color,
                borderRadius: '4px'
              }} />
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
