import React, { useState } from 'react';
import { createComic } from '../services/comicService';
import './Comic.css';

export default function ComicCreator({ userId, onComicCreated }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const comicId = await createComic(
        title,
        text,
        imageUrl || 'https://via.placeholder.com/400x300?text=Comic+Frame',
        userId
      );
      
      setTitle('');
      setText('');
      setImageUrl('');
      onComicCreated?.(comicId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comic-creator">
      <h2>🎨 Start a New Comic</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Comic Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Mystery of Panel One"
            maxLength={100}
            required
          />
          <small>{title.length}/100</small>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://... (leave empty for placeholder)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Opening Frame Text</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write dialogue, narration, or description..."
            rows={6}
            required
          />
          <small>{text.length} characters</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={loading || !title.trim() || !text.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Creating...' : 'Create Comic'}
        </button>
      </form>
    </div>
  );
}
