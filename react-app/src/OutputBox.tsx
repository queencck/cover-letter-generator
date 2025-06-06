import { useState } from 'react';

interface OutputBoxProps {
  content: string;
}

const OutputBox = ({ content }: OutputBoxProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="border rounded shadow-sm" style={{ backgroundColor: '#212121' }}>
      <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom" style={{background: '#23272b', borderTopLeftRadius: '.25rem', borderTopRightRadius: '.25rem'}}>
        <span className="fw-semibold text-secondary">Generated Output</span>
        <button
          onClick={handleCopy}
          className="btn btn-sm btn-outline-secondary"
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        className="form-control border-0 no-focus-outline text-light bg-dark"
        value={content}
        readOnly
        style={{ 
          minHeight: '800px',
          padding: '20px',
          fontSize: '14px',
          backgroundColor: '#212121',
          color: '#f8f9fa',
          borderBottomLeftRadius: '.25rem',
          borderBottomRightRadius: '.25rem',
          resize: 'none',
          outline: 'none',
          boxShadow: 'none',
          border: '1px solid #343a40'
        }}
      />
      <style>{`
        .no-focus-outline:focus, .no-focus-outline:hover {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default OutputBox; 