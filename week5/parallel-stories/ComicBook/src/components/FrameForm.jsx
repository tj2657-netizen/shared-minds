import React, { useState } from 'react';
import { addFrameToComic } from '../services/comicService';
import './Comic.css';

export default function FrameForm({
  comicId,
  parentFrameId,
  userId,
  onFrameAdded,
  previousText,
}) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addFrameToComic(
        comicId,
        text,
        imageUrl || 'https://via.placeholder.com/400x300?text=Comic+Frame',
        parentFrameId,
        userId
      );

      setText('');
      setImageUrl('');
      onFrameAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="frame-form">
      <h3>➕ Add Next Frame</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="frameImage">Image URL (optional)</label>
          <input
            id="frameImage"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="frameText">Frame Text</label>
          <textarea
            id="frameText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Continue the story..."
            rows={5}
            required
          />
          <small>{text.length} characters</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Publishing...' : 'Add Frame'}
          </button>
        </div>
      </form>
    </div>
  );
}
