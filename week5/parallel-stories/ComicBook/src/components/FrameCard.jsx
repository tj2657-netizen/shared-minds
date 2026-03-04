import React from 'react';
import { useReputation } from '../hooks/useReputation';
import { upvoteFrame, removeUpvote } from '../services/reputationService';
import './Comic.css';

export default function FrameCard({
  frame,
  author,
  comicId,
  userId,
  onExpand,
}) {
  const { upvoteCount, hasUpvoted } = useReputation(frame.id, userId);
  const [isUpvoting, setIsUpvoting] = React.useState(false);

  const handleUpvote = async () => {
    setIsUpvoting(true);
    try {
      if (hasUpvoted) {
        await removeUpvote(comicId, frame.id, userId, frame.authorId);
      } else {
        await upvoteFrame(comicId, frame.id, userId, frame.authorId);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date =
      timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="frame-card">
      <div className="frame-header">
        <div className="frame-author">
          {author?.avatar && (
            <img
              src={author.avatar}
              alt={author.displayName}
              className="author-avatar"
            />
          )}
          <div>
            <h4>{author?.displayName || 'Anonymous'}</h4>
            <small>{formatDate(frame.createdAt)}</small>
          </div>
        </div>
        <button
          className={`btn-upvote ${hasUpvoted ? 'upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={isUpvoting}
          title={hasUpvoted ? 'Remove upvote' : 'Upvote'}
        >
          👍 {upvoteCount}
        </button>
      </div>

      <img
        src={frame.imageUrl}
        alt="Frame"
        className="frame-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
        }}
      />

      <p className="frame-text">{frame.textContent}</p>

      <button onClick={onExpand} className="btn btn-secondary btn-small">
        🎭 Expand Branches
      </button>
    </div>
  );
}
