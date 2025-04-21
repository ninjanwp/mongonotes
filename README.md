# MongoDB Notes Application

This is a simple note-taking application built with Next.js and MongoDB, providing full CRUD (Create, Read, Update, Delete) functionality in a Google Docs-style interface.

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js with React (App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Styling**: Tailwind CSS

### Directory Structure

```
mongonotes/
├── lib/
│   └── mongodb.js         # MongoDB connection utility
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── notes/     # API endpoints for notes CRUD operations
│   │   │       ├── route.tsx
│   │   │       └── [id]/
│   │   │           └── route.tsx
│   │   ├── note/[id]/     # Individual note editing page
│   │   │   └── page.tsx
│   │   ├── page.tsx       # Dashboard/main page
│   │   └── layout.tsx     # App layout
```

## How It Works

### MongoDB Connection (lib/mongodb.js)

The MongoDB connection is managed by a utility file that creates a client connection and exports it for use throughout the application. It handles connection pooling in development and production environments.

### API Routes (CRUD Operations)

#### 1. List All Notes (`GET /api/notes`)

- Fetches all notes from the MongoDB collection
- Returns notes as JSON with collection name

#### 2. Create New Note (`POST /api/notes`)

- Receives note data from request body
- Inserts a new document in MongoDB
- Returns success status and the new note ID

#### 3. Update Existing Note (`PUT /api/notes`)

- Receives updated note data with _id
- Uses MongoDB's updateOne operation to modify the document
- Implements autosave functionality in the UI

#### 4. Delete Note (`DELETE /api/notes?id=<note_id>`)

- Takes note ID from query parameters
- Removes the document from MongoDB
- Returns success status

#### 5. Get Single Note (`GET /api/notes/<note_id>`)

- Receives note ID from URL path parameters
- Fetches specific note by ID
- Returns the note data as JSON

### Dashboard Page (src/app/page.tsx)

The main dashboard page displays all notes in a grid layout with:

- **Collection Name**: Shows at the top
- **Create Button**: Creates a new note and redirects to the editor
- **Note Cards**: Each displays:
  - Title
  - Content preview with ellipsis for long content
  - Last updated date
  - Options menu with delete functionality

Key functionality:

```javascript
// Create new note
const createNewNote = async () => {
  const newNote = {
    title: "Untitled Note",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNote),
  });
  
  const result = await response.json();
  router.push(`/note/${result.id}`); // Redirect to editor
};

// Delete note
const deleteNote = async (id, e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (window.confirm('Are you sure?')) {
    await fetch(`/api/notes?id=${id}`, {
      method: 'DELETE',
    });
    await fetchNotes(); // Refresh list
  }
};
```

### Note Editor Page (src/app/note/[id]/page.tsx)

The note editor provides a Google Docs-style experience:

- **Editable Title**: Click to edit the note title
- **Content Area**: Large text area for note content
- **Auto-save**: Changes are automatically saved after typing stops
- **Back Button**: Returns to dashboard

Key functionality:

```javascript
// Fetch note data
useEffect(() => {
  const fetchNote = async () => {
    const response = await fetch(`/api/notes/${noteId}`);
    const data = await response.json();
    setNote(data.note);
  };
  fetchNote();
}, [noteId]);

// Debounced auto-save
const debouncedSave = (updatedNote) => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  saveTimeoutRef.current = setTimeout(() => {
    saveNote(updatedNote);
  }, 1000); // 1 second delay
};

// Handle content change
const handleContentChange = (e) => {
  const updatedNote = { ...note, content: e.target.value };
  setNote(updatedNote);
  debouncedSave(updatedNote);
};
```

## Data Flow

1. **Dashboard → Editor Flow**:
   - User clicks "New Note" on dashboard
   - App creates empty note in database
   - Redirects to editor with the new note ID
   - Editor loads note and allows editing

2. **Auto-save Flow**:
   - User edits note title or content
   - App waits for typing to stop (debounce)
   - PUT request updates note in database
   - Status indicator shows "Saving..." then "All changes saved"

3. **Delete Flow**:
   - User clicks ellipsis menu on a note card
   - Selects "Delete" option
   - Confirmation prompt appears
   - On confirm, DELETE request removes note
   - Dashboard refreshes to show updated list

## MongoDB Data Structure

Notes are stored with this schema:

```javascript
{
  _id: ObjectId,       // MongoDB-generated unique identifier
  title: String,       // Note title
  content: String,     // Note content
  updatedAt: Date,     // Last modification timestamp
  createdAt: Date      // Creation timestamp
}
```

## Key UI Elements

1. **Dashboard Card View**:
   - Grid layout showing note previews
   - Truncated content with ellipsis
   - Click anywhere on card to open note

2. **Google Docs Style Editor**:
   - Clean, minimal interface
   - Editable title (click to edit)
   - Full-height content area
   - Auto-save indicator
   - Back navigation

## How to Extend

- **Rich Text Editing**: Add a WYSIWYG editor like Quill
- **Tags/Categories**: Add metadata to organize notes
- **User Authentication**: Add NextAuth.js for multi-user support
- **Search**: Implement full-text search via MongoDB
