import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/contact', {
        name,
        email,
        message: msg
      });

      if (res.data.success) {
        toast.success('Your message has been sent successfully. Support will reply within 24 hours.');
        setName('');
        setEmail('');
        setMsg('');
      } else {
        toast.error(res.data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container container">
      <div className="page-header text-center">
        <h1>Contact Support</h1>
        <p>Have questions regarding pooja services, slot cancellations, or donations? Contact our support staff.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info-card card">
          <h2>Get in Touch</h2>
          <p className="card-subtitle">Feel free to contact us via the following methods:</p>

          <div className="info-items">
            <div className="info-item">
              <Mail className="contact-icon" />
              <div>
                <h4>Email Support</h4>
                <p>vennapusashok8@gmail.com</p>
              </div>
            </div>

            <div className="info-item">
              <Phone className="contact-icon" />
              <div>
                <h4>Helpline</h4>
                <p>+91 9948287427</p>
              </div>
            </div>

            <div className="info-item">
              <MapPin className="contact-icon" />
              <div>
                <h4>Administrative Office</h4>
                <p>Kammavaripalem, Mudlamuru Mandal, Prakasam District, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-card card">
          <h2>Send Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="4"
                className="form-control"
                placeholder="Type your message..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100 send-msg-btn" disabled={loading}>
              <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-container {
          padding-top: 40px;
          padding-bottom: 80px;
          min-height: calc(100vh - 200px);
        }

        .text-center {
          text-align: center;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          margin-top: 30px;
        }

        .contact-info-card, .contact-form-card {
          padding: 32px;
        }

        .contact-info-card h2, .contact-form-card h2 {
          font-size: 1.5rem;
          color: var(--secondary);
          margin-bottom: 12px;
          font-weight: 700;
        }

        .card-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 30px;
        }

        .info-items {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .contact-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 4px;
        }

        .info-item h4 {
          font-size: 1rem;
          color: var(--secondary);
          margin-bottom: 4px;
          font-weight: 600;
        }

        .info-item p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .send-msg-btn {
          padding: 12px;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
