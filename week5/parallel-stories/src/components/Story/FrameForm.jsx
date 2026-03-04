import React, { useState } from 'react';
import { addFrameToStory } from '../../services/storyService';
import { generateAISuggestion } from '../../services/storyService';
import '../styles/Story.css';

/**
 * Component for adding a new frame (continuation) to a story
 * @param {string} storyId - Story ID
 * @param {string} parentFrameId - Parent frame ID
 * @param {string} userId - Current user's ID
 * @param {string} previousContent - Content of previous frame (for context)
 * @param {Function} onFrameAdded - Callback after frame creation
 */
export default function FrameForm({
  storyId,
  parentFrameId,
  userId,
  previousContent,
  onFrameAdded,
}) {
  const [content, setContent] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetSuggestion = () => {
    // Get AI suggestion for continuation
    const aiSuggestion = generateAISuggestion(previousContent);
    setSuggestion(aiSuggestion);
    setShowSuggestion(true);
  };

  const handleUseSuggestion = () => {
    setContent(suggestion);
    setShowSuggestion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addFrameToStory(
        storyId,
        content,
        parentFrameId,
        userId,
        null // No image URL for now
      );
      setContent('');
      setSuggestion('');
      setShowSuggestion(false);
      onFrameAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="frame-form">
      <h3>📝 Add Continuation</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="frameContent">Continue the Story</label>
          <textarea
            id="frameContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happens next...?"
            rows={5}
            required
          />
        </div>

        <div className="frame-actions">
          <button
            type="button"
            onClick={handleGetSuggestion}
            className="btn btn-secondary"
            disabled={loading}
          >
            💡 Suggest Continuation
          </button>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Publishing...' : 'Publish Frame'}
          </button>
        </div>

        {showSuggestion && (
          <div className="suggestion-box">
            <h4>🤖 AI Suggestion:</h4>
            <p>{suggestion}</p>
            <div className="suggestion-actions">
              <button
                type="button"
                onClick={handleUseSuggestion}
                className="btn btn-small btn-primary"
              >
                Use This
              </button>
              <button
                type="button"
                onClick={() => setShowSuggestion(false)}
                className="btn btn-small btn-secondary"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}
