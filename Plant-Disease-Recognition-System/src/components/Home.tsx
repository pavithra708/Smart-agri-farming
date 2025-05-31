import React, { useState, FormEvent } from 'react';
import { FaLeaf, FaVirus, FaBug, FaPrescriptionBottleAlt, FaPercentage } from 'react-icons/fa';

interface Prediction {
  name: string;
  cause: string;
  cure: string;
  confidence?: number;
}

const styles = {
  body: {
    background: '#f0f9f1',
  },
  hero: {
    background: 'linear-gradient(135deg, #28a745, #218838)',
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center' as const,
    borderRadius: '0 0 30px 30px',
  },
  formSection: {
    marginTop: '-40px',
  },
  cardCustom: {
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  },
  footer: {
    backgroundColor: '#212529',
    color: 'white',
    padding: '20px 0',
    marginTop: '50px',
    textAlign: 'center' as const,
  },
};

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setPrediction(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.prediction) {
        setPrediction(data.prediction);
      } else {
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <section style={styles.hero}>
        <h1><FaLeaf /> PHASAL</h1>
        <p className="lead">Smart Plant Disease Detection for Farmers 🌱</p>
      </section>

      <section className="container" style={styles.formSection}>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4" style={styles.cardCustom}>
              <h3 className="text-center mb-4 text-success">Upload Plant Leaf Image</h3>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <input
                    className="form-control"
                    type="file"
                    name="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-success" disabled={!file || loading}>
                    {loading ? 'Detecting...' : 'Detect Disease'}
                  </button>
                </div>
              </form>
            </div>

            {error && (
              <div className="alert alert-danger mt-4" role="alert">
                {error}
              </div>
            )}

            {prediction && (
              <div className="card mt-4 p-4" style={styles.cardCustom}>
                <h4 className="text-success mb-3"><FaVirus /> Disease Detected: {prediction.name}</h4>
                <p><strong><FaBug /> Cause:</strong> {prediction.cause}</p>
                <p><strong><FaPrescriptionBottleAlt /> Suggested Cure:</strong> {prediction.cure}</p>
                {prediction.confidence !== undefined && (
                  <p><strong><FaPercentage /> Confidence:</strong> {prediction.confidence}%</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>&copy; 2025 PHASAL | Empowering Agriculture with AI 🌿</p>
      </footer>
    </div>
  );
};

export default Home;
