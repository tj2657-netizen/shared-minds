import React, { useState } from 'react';
import Login from './Auth/Login';
import Register from './Auth/Register';
import UserProfile from './Auth/UserProfile';
import StoryCreator from './Story/StoryCreator';
import StoryGraph from './Navigation/StoryGraph';
import FrameForm from './Story/FrameForm';
import FrameViewer from './Story/FrameViewer';
import { useAuth } from '../hooks/useAuth';
import { useStories } from '../hooks/useStories';
import './styles/App.css';

/**
 * Main App component
 * Orchestrates authentication, story viewing, and creation
 */
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const { stories, loading: storiesLoading } = useStories();

  // Get current story data
  const currentStory =
    currentStoryId && stories.find((s) => s.id === currentStoryId);

  // Get selected frame
  const selectedFrame =
    currentStory && selectedFrameId
      ? currentStory.frames?.find((f) => f.id === selectedFrameId)
      : currentStory?.frames?.[0];

  // Get author info for selected frame
  const frameAuthorId = selectedFrame?.authorId;
  const frameAuthor = user && user.uid === frameAuthorId ? user : null;

  // Handle authentication
  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        {authMode === 'login' ? (
          <Login
            onLoginSuccess={() => {
              setAuthMode('login');
            }}
          />
        ) : (
          <Register
            onRegisterSuccess={() => {
              setAuthMode('login');
            }}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>
              New here?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="link-button"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="link-button"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🌌 Parallel Stories</h1>
        <p className="app-tagline">Explore infinite narrative universes</p>
        <UserProfile user={user} />
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {!currentStoryId ? (
            // Story Selection View
            <>
              <StoryCreator
                userId={user.uid}
                onStoryCreated={(storyId) => {
                  setCurrentStoryId(storyId);
                }}
              />

              <section className="stories-section">
                <h2>📚 All Stories</h2>
                {storiesLoading ? (
                  <div className="loading">Loading stories...</div>
                ) : stories.length === 0 ? (
                  <div className="no-stories">
                    <p>
                      No stories yet. Be the first to create one! ✍️
                    </p>
                  </div>
                ) : (
                  <div className="stories-grid">
                    {stories.map((story) => (
                      <div
                        key={story.id}
                        className="story-card"
                        onClick={() => setCurrentStoryId(story.id)}
                      >
                        <h3>{story.title}</h3>
                        <div className="story-meta">
                          {story.frames && (
                            <span>
                              {story.frames.length} frame
                              {story.frames.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="story-preview">
                          {story.frames?.[0]?.content.substring(0, 100)}...
                        </p>
                        <div className="story-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentStoryId(story.id);
                            }}
                            className="btn btn-primary btn-small"
                          >
                            Explore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            // Story View
            <>
              <button
                onClick={() => {
                  setCurrentStoryId(null);
                  setSelectedFrameId(null);
                }}
                className="btn btn-secondary btn-back"
              >
                ← Back to Stories
              </button>

              <h2>{currentStory?.title}</h2>

              {currentStory && (
                <>
                  {/* Story Graph Visualization */}
                  <StoryGraph
                    frames={currentStory.frames || []}
                    onFrameSelect={(frameId) => setSelectedFrameId(frameId)}
                  />

                  {/* Frame Viewer */}
                  {selectedFrame && (
                    <FrameViewer
                      frame={selectedFrame}
                      author={frameAuthor}
                      userId={user.uid}
                      onExpand={() => {}}
                    />
                  )}

                  {/* Frame Form for new continuation */}
                  <FrameForm
                    storyId={currentStoryId}
                    parentFrameId={selectedFrame?.id}
                    userId={user.uid}
                    previousContent={selectedFrame?.content || ''}
                    onFrameAdded={() => {
                      // Refresh story
                      setCurrentStoryId(null);
                      setTimeout(() => setCurrentStoryId(currentStoryId), 100);
                    }}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          © 2026 Parallel Stories. Collaborative storytelling for infinite universes. ✨
        </p>
      </footer>
    </div>
  );
}
