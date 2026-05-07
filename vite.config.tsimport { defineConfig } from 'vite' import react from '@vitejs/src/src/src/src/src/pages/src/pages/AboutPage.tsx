export default function AboutPage() {
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
        About Chronic Pain Forward
      </h1>
      
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Our Mission
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          lineHeight: '1.8',
          marginBottom: '1rem'
        }}>
          Chronic Pain Forward was created to empower individuals living with chronic pain 
          to better understand, track, and manage their condition. We believe that detailed 
          documentation and pattern recognition are key to improving quality of life and 
          facilitating better communication with healthcare providers.
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Built by Healthcare Professionals
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          lineHeight: '1.8',
          marginBottom: '1rem'
        }}>
          This tracker was designed by a nurse who understands chronic pain from both 
          clinical and personal perspectives. Every feature has been carefully crafted 
          to address real needs in pain management documentation, medical communication, 
          and administrative tasks like tax filing.
        </p>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#534AB7',
          marginBottom: '1rem'
        }}>
          Your Privacy Matters
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          lineHeight: '1.8'
        }}>
          All your data is stored locally in your browser. We don't have access to your 
          entries, and nothing is sent to external servers. Your health information 
          remains completely private and under your control.
        </p>
      </div>
    </div>
  );
}
