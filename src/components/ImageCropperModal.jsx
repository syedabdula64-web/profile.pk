import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

export default function ImageCropperModal({ imageSrc, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedBlob);
    } catch (e) {
      console.error(e);
      setProcessing(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Crop Profile Photo</h3>
          <button onClick={onCancel} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.cropperContainer}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio for avatar
            cropShape="round" // Show round overlay
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div style={styles.controls}>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="zoom-range"
            style={{ width: '100%' }}
          />
        </div>

        <div style={styles.footer}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={processing}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={processing}>
            {processing ? 'Processing...' : 'Save & Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-subtle)',
  },
  header: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '20px',
    cursor: 'pointer'
  },
  cropperContainer: {
    position: 'relative',
    width: '100%',
    height: '350px',
    backgroundColor: '#333'
  },
  controls: {
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid var(--border-subtle)'
  },
  footer: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  }
};
