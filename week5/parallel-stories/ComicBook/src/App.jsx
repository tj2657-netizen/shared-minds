import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import UserProfile from './UserProfile';
import ComicCreator from './ComicCreator';
import FrameCard from './FrameCard';
import FrameForm from './FrameForm';
import FrameGraph from './FrameGraph';
import { useAuth } from '../hooks/useAuth';
import { useComics } from '../hooks/useComics';
import './App.css';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentComicId, setCurrentComicId] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const { comics, loading: comicsLoading } = useComics(currentComicId);

  const currentComic = comics[0];
  const selectedFrame =
    currentComic?.frames?.find((f) => f.id === selectedFrameId) ||
    currentComic?.frames?.[0];

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onLoginSuccess={() => setAuthMode('login')} />
        ) : (
          <Register
            onRegisterSuccess={() => setAuthMode('login')}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="link-button"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Have an account?{' '}
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
        <h1>📚 Parallel Comic</h1>
        <p>Collaborative comic book storytelling</p>
        <UserProfile user={user} onLogout={() => window.location.reload()} />
      </header>

      <main className="app-main">
        <div className="container">
          {!currentComicId ? (
            // Browse View
            <>
              <ComicCreator
                userId={user.uid}
                onComicCreated={(comicId) => setCurrentComicId(comicId)}
              />

              <section className="comics-section">
                <h2>📖 All Comics</h2>
                {comicsLoading ? (
                  <div className="loading">Loading comics...</div>
                ) : comics.length === 0 ? (
                  <div className="no-content">
                    <p>No comics yet. Create the first one! 🎨</p>
                  </div>
                ) : (
                  <div className="comics-grid">
                    {comics.map((comic) => (
                      <div
                        key={comic.id}
                        className="comic-card"
                        onClick={() => setCurrentComicId(comic.id)}
                      >
                        <h3>{comic.title}</h3>
                        <p className="comic-meta">
                          {comic.frameCount || 0} frames
                        </p>
                        <button className="btn btn-primary btn-small">
                          Read
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            // Comic Reading View
            <>
              <button
                onClick={() => {
                  setCurrentComicId(null);
                  setSelectedFrameId(null);
                }}
                className="btn btn-secondary btn-back"
              >
                ← Back to Comics
              </button>

              {currentComic && (
                <>
                  <h2>{currentComic.title}</h2>

                  {/* Frame Graph */}
                  <FrameGraph
                    frames={currentComic.frames || []}
                    onFrameSelect={(frameId) => setSelectedFrameId(frameId)}
                  />

                  {/* Frame Display */}
                  {selectedFrame && (
                    <FrameCard
                      frame={selectedFrame}
                      author={user}
                      comicId={currentComicId}
                      userId={user.uid}
                      onExpand={() => {}}
                    />
                  )}

                  {/* Add Frame Form */}
                  <FrameForm
                    comicId={currentComicId}
                    parentFrameId={selectedFrame?.id}
                    userId={user.uid}
                    previousText={selectedFrame?.textContent || ''}
                    onFrameAdded={() => {
                      setCurrentComicId(null);
                      setTimeout(() => setCurrentComicId(currentComicId), 100);
                    }}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 Parallel Comic - Where stories branch into infinite possibilities ✨</p>
      </footer>
    </div>
  );
}
