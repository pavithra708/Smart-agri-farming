import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface PredictionResult {
  name: string;
  cause: string;
  cure: string;
}

interface UploadResponse {
  result: boolean;
  imagePath: string;
  prediction: PredictionResult;
}

const DiseaseIdentifier: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('img', file);

    try {
      const response = await axios.post<UploadResponse>('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.result) {
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Plant Disease Recognition
          </h1>

          <div className="container mx-auto text-center">
            <a 
              href="http://127.0.0.1:8000/upload/"
              className="inline-block"
            >
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 w-64">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="mx-auto" 
                  width="120" 
                  height="120" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

                <p className="mt-4 text-xl font-semibold text-green-600">
                  Upload Plant Photo
                </p>
              </div>
            </a>
          </div>

         
          
          </div>
          </main>
        </div>
      
   
  );
};

export default DiseaseIdentifier;
