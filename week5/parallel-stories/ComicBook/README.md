# Parallel Comic - Collaborative Comic Book Platform

A multi-user web application for creating and contributing to branching narrative comic stories.

## 🎯 Features

✅ **Multi-User Authentication** - Register/login with Firebase (or fallback mode)
✅ **Comic Creation** - Start new comics with opening frames
✅ **Story Branching** - Create alternate continuations from any frame
✅ **Visual Navigation** - D3.js powered node graph showing story branches
✅ **Reputation System** - Upvote frames and track user reputation
✅ **Collaborative** - Multiple users can contribute to the same comic
✅ **Responsive** - Works on mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account (free tier available)

### Installation

```bash
cd parallel-stories/ComicBook
npm install
```

### Configuration

1. **Create a Firebase Project**
   - Go to https://console.firebase.google.com
   - Create a new project

2. **Enable Services**
   - Authentication → Email/Password
   - Firestore Database

3. **Get Your Config**
   - Project Settings → Your apps → Web
   - Copy the config

4. **Create `.env.local`**
   ```
   VITE_FIREBASE_API_KEY=your_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Development

```bash
npm run dev
```

Opens at http://localhost:3001

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

(Requires Firebase CLI: `npm install -g firebase-tools`)

## 📊 Database Schema

### Firestore Collections

```
users/{uid}
├── displayName (string)
├── email (string)
├── reputation (number)
├── contributions (number)
├── avatar (string)
└── createdAt (timestamp)

comics/{comicId}
├── title (string)
├── authorId (string)
├── createdAt (timestamp)
├── updatedAt (timestamp)
└── frames/{frameId}
    ├── textContent (string)
    ├── imageUrl (string)
    ├── authorId (string)
    ├── parentId (string or null)
    ├── createdAt (timestamp)
    ├── upvoteCount (number)
    └── upvoters (array)

upvotes/{upvoteId}
├── comicId (string)
├── frameId (string)
├── userId (string)
├── authorId (string)
└── timestamp (timestamp)
```

## 🔐 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }
    match /comics/{comicId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if resource.data.authorId == request.auth.uid;
      
      match /frames/{frameId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update: if resource.data.authorId == request.auth.uid;
      }
    }
    match /upvotes/{upvoteId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📁 Project Structure

```
ComicBook/
├── src/
│   ├── firebase.js                 # Firebase config
│   ├── services/
│   │   ├── authService.js          # Auth operations
│   │   ├── comicService.js         # Comic CRUD
│   │   └── reputationService.js    # Upvote system
│   ├── hooks/
│   │   ├── useAuth.js              # Auth hook
│   │   ├── useComics.js            # Comics hook
│   │   └── useReputation.js        # Reputation hook
│   ├── components/
│   │   ├── App.jsx                 # Main app
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── UserProfile.jsx
│   │   ├── ComicCreator.jsx
│   │   ├── FrameCard.jsx
│   │   ├── FrameForm.jsx
│   │   ├── FrameGraph.jsx
│   │   ├── Auth.css
│   │   ├── Comic.css
│   │   ├── FrameGraph.css
│   │   └── App.css
│   ├── main.jsx
│   └── App.css
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design Features

- **Dark Theme** - Purple gradient with glassmorphism effects
- **Responsive Layout** - Mobile-first design
- **Smooth Animations** - Transitions and hover effects
- **Node-Based Navigation** - Visual D3.js graph for story exploration
- **Real-time Updates** - Firebase Firestore integration

## 💡 How It Works

1. **User Registration** - Create account with email/password
2. **Create Comic** - Start a new comic with title + first frame
3. **Add Frames** - Continue the story by adding new frames
4. **Branching** - Each frame can have multiple continuations
5. **Upvoting** - Appreciate good frames by upvoting
6. **Reputation** - Earn reputation through upvotes

## 🚀 Growth Path

The architecture supports scaling:
- **Single Frame** → Multiple frames per comic
- **Linear** → Branching narratives
- **Small Comics** → Large storyboards (100+ frames)
- **Frame Images** → Comic panels with layout
- **Text** → Speech bubbles, panels, metadata
- **Future** → Animated storyboards, real-time collab

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Firebase 10** - Backend (Auth + Firestore)
- **D3.js 7** - Data visualization
- **CSS3** - Styling with flexbox/grid

## 📝 Functions Overview

### authService.js
- `registerUser()` - Create new account
- `loginUser()` - Authenticate user
- `logoutUser()` - Sign out
- `getUserProfile()` - Fetch user data
- `updateUserProfile()` - Update reputation/stats

### comicService.js
- `createComic()` - Start new comic
- `getComic()` - Fetch comic with frames
- `getAllComics()` - List all comics
- `addFrameToComic()` - Add continuation
- `getUserComics()` - Get user's comics

### reputationService.js
- `upvoteFrame()` - Upvote a frame
- `removeUpvote()` - Remove upvote
- `hasUserUpvoted()` - Check upvote status
- `getUpvoteCount()` - Get frame upvotes

## 🎓 Learning Features

This project demonstrates:
- ✅ React hooks (useState, useEffect)
- ✅ Firebase Authentication & Firestore
- ✅ Component composition
- ✅ State management patterns
- ✅ D3.js data visualization
- ✅ Responsive CSS design
- ✅ Error handling
- ✅ localStorage fallback

## 📄 License

MIT

## 🤝 Contributing

This is a collaborative platform! Add frames, upvote stories, and help expand the comic universe.

---

**Built with ❤️ for creative storytellers everywhere** 🎨📚
