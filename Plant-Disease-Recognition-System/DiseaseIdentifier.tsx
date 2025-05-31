import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import axios from 'axios';

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
      const response = await axios.post<UploadResponse>('/api/upload', formData, {
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
    <div className="min-h-screen bg-white">
      <nav className="bg-gray-900 text-white p-4">
        <div className="container mx-auto">
          <a 
            href="http://localhost:5173/disease" 
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Back
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">
            Plant Disease Recognition
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <label className="w-full max-w-md">
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <div className="cursor-pointer text-center p-6 border-2 border-dashed border-green-500 rounded-lg hover:border-green-600 transition-colors">
                      <div className="text-lg font-medium text-gray-700 mb-2">Upload Image</div>
                      <div className="text-sm text-gray-500">Click to select or drag and drop</div>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={!file || isLoading}
                    className={`mt-6 px-8 py-3 text-lg font-medium rounded-md text-white transition-colors
                      ${
                        !file || isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {isLoading ? 'Processing...' : 'Analyze Image'}
                  </button>
                </div>
              </div>
            </form>

            {preview && prediction && (
              <div className="mt-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={preview}
                      alt="Uploaded plant"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4">{prediction.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Cause:</h4>
                        <p className="text-gray-600">{prediction.cause}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">Cure:</h4>
                        <p className="text-gray-600">{prediction.cure}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiseaseIdentifier; 