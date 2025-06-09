import React, { useState, useEffect } from 'react';
import './ImageViewer.css';
import { ImageFile } from './ImageService';

interface ImageViewerProps {
  images: ImageFile[];
  title?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, title = "Visual Test Documentation" }) => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [filter, setFilter] = useState<'all' | 'gif' | 'png'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredImages = images.filter(image => {
    const matchesFilter = filter === 'all' || image.type === filter;
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (image.component && image.component.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && selectedImage) {
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const handleImageClick = (image: ImageFile) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const getComponentName = (filename: string): string => {
    // Extract component name from filename like "Button.test.tsx.snap-button-renders-correctly-1.png"
    const match = filename.match(/^(.+?)\.test\.tsx\.snap/);
    return match ? match[1] : 'Unknown';
  };

  const getTestName = (filename: string): string => {
    // Extract test name from filename
    const match = filename.match(/snap-(.+)-\d+\.(png|gif)$/);
    if (match) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return filename.replace(/\.(png|gif)$/, '');
  };

  // Group images by component
  const groupedImages = filteredImages.reduce((groups, image) => {
    const component = image.component || getComponentName(image.name);
    if (!groups[component]) {
      groups[component] = [];
    }
    groups[component].push({
      ...image,
      component,
      testName: image.testName || getTestName(image.name)
    });
    return groups;
  }, {} as Record<string, ImageFile[]>);

  return (
    <div className="image-viewer">
      <div className="image-viewer-header">
        <h1>{title}</h1>
        
        <div className="image-viewer-controls">
          <input
            type="text"
            placeholder="Search components or tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({images.length})
            </button>
            <button 
              className={filter === 'gif' ? 'active' : ''}
              onClick={() => setFilter('gif')}
            >
              GIFs ({images.filter(img => img.type === 'gif').length})
            </button>
            <button 
              className={filter === 'png' ? 'active' : ''}
              onClick={() => setFilter('png')}
            >
              PNGs ({images.filter(img => img.type === 'png').length})
            </button>
          </div>
        </div>
      </div>

      <div className="image-viewer-content">
        {Object.entries(groupedImages).map(([component, componentImages]) => (
          <div key={component} className="component-section">
            <h2 className="component-title">{component}</h2>
            <div className="image-grid">
              {componentImages.map((image) => (
                <div key={image.path} className="image-card">
                  <div 
                    className="image-thumbnail"
                    onClick={() => handleImageClick(image)}
                  >
                    <img 
                      src={image.path} 
                      alt={image.testName}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <span className="image-type">{image.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="image-info">
                    <h4>{image.testName}</h4>
                    <p className="image-filename">{image.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredImages.length === 0 && (
          <div className="no-images">
            <p>No images found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <img src={selectedImage.path} alt={selectedImage.testName} />
            <div className="modal-info">
              <h3>{selectedImage.component} - {selectedImage.testName}</h3>
              <p>{selectedImage.name}</p>
              <span className="modal-type">{selectedImage.type.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
