import React, { useState } from 'react';
import { useReputation } from '../../hooks/useReputation';
import { upvoteFrame, removeUpvote } from '../../services/reputationService';
import '../styles/Story.css';

/**
 * Component for displaying a story frame
 * @param {Object} frame - Frame object with content, author, timestamp
 * @param {Object} author - Author object with display name and avatar
 * @param {string} userId - Current user's ID
 * @param {Function} onExpand - Callback when user clicks to expand this frame
 */
export default function FrameViewer({ frame, author, userId, onExpand }) {
  const { upvoteCount, hasUpvoted } = useReputation(frame.id, userId);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [localUpvoted, setLocalUpvoted] = useState(hasUpvoted);
  const [localCount, setLocalCount] = useState(upvoteCount);

  const handleUpvote = async () => {
    setIsUpvoting(true);
    try {
      if (localUpvoted) {
        await removeUpvote(frame.id, userId, frame.authorId);
        setLocalCount(Math.max(0, localCount - 1));
      } else {
        await upvoteFrame(frame.id, userId, frame.authorId, frame.storyId);
        setLocalCount(localCount + 1);
      }
      setLocalUpvoted(!localUpvoted);
    } catch (error) {
      console.error('Error upvoting frame:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="frame-viewer">
      <div className="frame-header">
        <div className="frame-author">
          {author?.avatar && (
            <img
              src={author.avatar}
              alt={author?.displayName}
              className="author-avatar"
            />
          )}
          <div className="author-info">
            <h4>{author?.displayName || 'Anonymous'}</h4>
            <small>{formatDate(frame.timestamp)}</small>
          </div>
        </div>

        <button
          className={`btn-upvote ${localUpvoted ? 'upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={isUpvoting}
          title={localUpvoted ? 'Remove upvote' : 'Upvote this frame'}
        >
          👍 {localCount}
        </button>
      </div>

      <div className="frame-content">{frame.content}</div>

      {frame.imageUrl && (
        <img src={frame.imageUrl} alt="Frame illustration" className="frame-image" />
      )}

      <button onClick={onExpand} className="btn btn-secondary btn-small">
        🌳 Explore Branches
      </button>
    </div>
  );
}
