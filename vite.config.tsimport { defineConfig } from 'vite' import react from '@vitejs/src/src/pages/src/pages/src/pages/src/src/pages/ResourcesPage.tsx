export default function ResourcesPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '3rem 1.5rem'
    }}>
      <h1 style={{
        fontSize: '36px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '1rem'
      }}>
        Resources
      </h1>
      
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '2rem',
        lineHeight: '1.6'
      }}>
        Helpful information and support for managing chronic pain.
      </p>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Understanding Chronic Pain
        </h2>
        <ul style={{
          fontSize: '15px',
          color: '#4b5563',
          lineHeight: '1.8',
          paddingLeft: '1.5rem'
        }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Chronic pain persists beyond normal healing time, typically lasting more than 3 months
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            It can affect every aspect of daily life including sleep, mood, and physical function
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Documentation and pattern tracking are essential for effective treatment
          </li>
          <li>
            A multidisciplinary approach often yields the best outcomes
          </li>
        </ul>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Support Organizations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { name: 'Pain BC', desc: 'British Columbia pain resources and support' },
            { name: 'Canadian Pain Society', desc: 'National pain education and advocacy' },
            { name: 'Chronic Pain Association of Canada', desc: 'Community support and information' }
          ].map((org, i) => (
            <div key={i} style={{
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#111827',
                margin: '0 0 0.25rem'
              }}>
                {org.name}
              </p>
              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: 0
              }}>
                {org.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Management Strategies
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { title: 'Pacing', desc: 'Balance activity with rest periods' },
            { title: 'Movement', desc: 'Gentle exercise within tolerance' },
            { title: 'Sleep Hygiene', desc: 'Consistent sleep schedule and environment' },
            { title: 'Stress Management', desc: 'Mindfulness and relaxation techniques' },
            { title: 'Nutrition', desc: 'Anti-inflammatory diet approaches' },
            { title: 'Social Connection', desc: 'Maintain relationships and support networks' }
          ].map((strategy, i) => (
            <div key={i} style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 0.5rem'
              }}>
                {strategy.title}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {strategy.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
