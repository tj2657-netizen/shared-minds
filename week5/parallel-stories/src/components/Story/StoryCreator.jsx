import React, { useState } from 'react';
import { createStory } from '../../services/storyService';
import '../styles/Story.css';

/**
 * Component for creating a new story
 * @param {string} userId - Current user's ID
 * @param {Function} onStoryCreated - Callback after story creation
 */
export default function StoryCreator({ userId, onStoryCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const storyId = await createStory(title, content, userId);
      setTitle('');
      setContent('');
      onStoryCreated?.(storyId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-creator">
      <h2>✨ Create New Story</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Story Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Quantum Detective"
            maxLength={100}
            required
          />
          <small>{title.length}/100 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="content">Opening Frame</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin your story here... The more vivid, the better!"
            rows={6}
            required
          />
          <small>{content.length} characters</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="btn btn-primary"
        >
          {loading ? 'Creating Story...' : 'Create Story'}
        </button>
      </form>
    </div>
  );
}
