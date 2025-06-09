import React, { useState, useEffect } from 'react';
import { ImageViewer } from './ImageViewer';
import { ImageFile, imageService } from './ImageService';

const DocsPage: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the image service to load all available images
      const loadedImages = await imageService.loadImages();
      setImages(loadedImages);
    } catch (err) {
      setError('Failed to load test documentation images');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="docs-loading">
        <h2>Loading Visual Test Documentation...</h2>
        <p>Gathering snapshot files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="docs-error">
        <h2>Error Loading Documentation</h2>
        <p>{error}</p>
        <button onClick={loadImages}>Retry</button>
      </div>
    );
  }

  return (
    <div className="docs-page">
      <ImageViewer 
        images={images} 
        title="Orpheus Engine - Visual Test Documentation"
      />
    </div>
  );
};

export default DocsPage;
