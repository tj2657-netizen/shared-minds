# Parallel Stories - Collaborative Storytelling Platform

A multi-user web application for creating and exploring branching narrative universes.

## Setup Instructions

### 1. Prerequisites
- Node.js v16+ and npm
- Firebase project account (free tier available at https://console.firebase.google.com)

### 2. Installation

```bash
cd parallel-stories
npm install
```

### 3. Firebase Configuration

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Click "Create Project"
   - Name it "parallel-stories"
   - Enable Google Analytics (optional)

2. **Enable Authentication:**
   - In Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password"

3. **Enable Firestore Database:**
   - In Firebase Console → Firestore Database
   - Create database in production mode
   - Add these security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read: if true;
         allow write: if request.auth.uid == uid;
       }
       match /stories/{storyId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if resource.data.authorId == request.auth.uid;
       }
       match /stories/{storyId}/frames/{frameId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update, delete: if resource.data.authorId == request.auth.uid;
       }
       match /upvotes/{upvoteId} {
         allow read: if true;
         allow create: if request.auth != null;
       }
     }
   }
   ```

4. **Get Firebase Config:**
   - Project Settings → Your apps → Web app
   - Copy the config object
   - Create `.env.local` file in project root:
   ```
   VITE_FIREBASE_API_KEY=xxx
   VITE_FIREBASE_AUTH_DOMAIN=xxx
   VITE_FIREBASE_PROJECT_ID=xxx
   VITE_FIREBASE_STORAGE_BUCKET=xxx
   VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
   VITE_FIREBASE_APP_ID=xxx
   ```

### 4. Development

```bash
npm run dev
```

Opens http://localhost:3000

### 5. Build & Deploy

```bash
npm run build
npm run deploy
```

(Requires Firebase CLI: `npm install -g firebase-tools` and `firebase login`)

## Project Structure

```
parallel-stories/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── Story/
│   │   │   ├── StoryCreator.jsx
│   │   │   ├── FrameForm.jsx
│   │   │   └── FrameViewer.jsx
│   │   ├── Navigation/
│   │   │   ├── StoryGraph.jsx
│   │   │   └── NodeCanvas.jsx
│   │   ├── AI/
│   │   │   └── SuggestionBox.jsx
│   │   └── App.jsx
│   ├── services/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── storyService.js
│   │   └── reputationService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useStories.js
│   │   └── useReputation.js
│   ├── App.css
│   └── main.jsx
├── public/
│   └── index.html
├── package.json
├── vite.config.js
├── .env.local
└── README.md
```

## Firestore Schema

### Collections:

**users/{uid}**
```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "reputation": 42,
  "contributions": 5,
  "avatar": "https://...",
  "createdAt": Timestamp
}
```

**stories/{storyId}**
```json
{
  "title": "The Quantum Detective",
  "authorId": "uid123",
  "createdAt": Timestamp,
  "updated": Timestamp
}
```

**stories/{storyId}/frames/{frameId}**
```json
{
  "content": "Lorem ipsum...",
  "authorId": "uid123",
  "parentFrameId": "frameId456" (or null for root),
  "imageUrl": "https://...",
  "timestamp": Timestamp,
  "upvoteCount": 5
}
```

**upvotes/{upvoteId}**
```json
{
  "frameId": "frameId123",
  "userId": "uid456",
  "timestamp": Timestamp
}
```

## Core Features

✅ Multi-user authentication with Firebase  
✅ Story creation and branching  
✅ Visual node-based story navigation  
✅ AI-assisted writing suggestions  
✅ Reputation system with upvoting  
✅ Dark mode UI  
✅ Responsive design  
✅ Superposition mode for comparing branches  

## Features Implemented

### 1. Authentication
- Email/password login with Firebase Auth
- Fallback to prompt() username if Firebase unavailable
- User profile creation and management

### 2. Story System
- Create root stories
- Add branching continuations
- Track parent-child relationships
- Display story frames with metadata

### 3. Visual Navigation
- D3.js-based node graph
- Interactive node clicking
- Pan and zoom canvas
- Animated branch expansion

### 4. AI Features
- "Suggest Continuation" button
- Mock AI response generation
- Preview before publishing

### 5. Reputation
- Upvote story branches
- Prevent duplicate upvotes
- Display user reputation scores
- Contribution tracking

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
