import React, { useState } from 'react';
import { PlusCircle, Pin, Edit2, Trash2 } from 'lucide-react';

// Define a Note interface
interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
}

const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]); // State for notes
  const [newNote, setNewNote] = useState<Note>({
    id: 0,
    title: '',
    content: '',
    pinned: false,
  }); // State for new note
  const [editMode, setEditMode] = useState<boolean>(false); // Edit mode flag
  const [editNoteId, setEditNoteId] = useState<number | null>(null); // ID of the note being edited
  const [showAlert, setShowAlert] = useState<boolean>(false); // Show alert flag
  const [activeNote, setActiveNote] = useState<Note | null>(null); // Active note for reading

  // Handle new note creation
  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    const note = { ...newNote, id: Date.now() };
    setNotes((prevNotes) => [...prevNotes, note]);
    setNewNote({ title: '', content: '', pinned: false, id: 0 });
  };

  // Handle note deletion
  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (activeNote && activeNote.id === id) {
      setActiveNote(null); // Close the active note if it was deleted
    }
  };

  // Handle note edit mode
  const handleEditNote = (id: number) => {
    const noteToEdit = notes.find((note) => note.id === id);
    if (noteToEdit) {
      setNewNote({
        title: noteToEdit.title,
        content: noteToEdit.content,
        pinned: noteToEdit.pinned,
        id: noteToEdit.id,
      });
      setEditMode(true);
      setEditNoteId(id);
    }
  };

  // Handle updating the note
  const handleUpdateNote = () => {
    const updatedNotes = notes.map((note) =>
      note.id === editNoteId ? { ...note, ...newNote } : note
    );
    setNotes(updatedNotes);
    setNewNote({ title: '', content: '', pinned: false, id: 0 });
    setEditMode(false);
    setEditNoteId(null);
  };

  // Handle pin/unpin action
  const handlePinNote = (id: number) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
    );
  };

  // Handle note selection to read
  const handleSelectNote = (note: Note) => {
    setActiveNote(note); // Set the selected note as active
  };

  // Sort notes (pinned ones first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned === b.pinned) return b.id - a.id;
    return b.pinned ? -1 : 1;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white">My Notes</h2>
        </div>
        <div className="space-y-3 p-4">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`group rounded-lg p-4 transition-all duration-200 hover:shadow-lg 
                ${note.pinned ? 'bg-amber-50 border-l-4 border-amber-400' : 'bg-white border border-gray-100'}`}
              onClick={() => handleSelectNote(note)} // Set the clicked note as active
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePinNote(note.id)}
                    className={`p-1.5 rounded-full hover:bg-white/50 ${note.pinned ? 'text-amber-500' : 'text-gray-400'}`}
                  >
                    <Pin size={16} />
                  </button>
                  <button
                    onClick={() => handleEditNote(note.id)}
                    className="p-1.5 rounded-full hover:bg-white/50 text-blue-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-full hover:bg-white/50 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeNote ? (
          // If a note is selected, show it in a larger view
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeNote.title}</h2>
            <p className="text-lg text-gray-700">{activeNote.content}</p>
          </div>
        ) : (
          // Otherwise, show the note creation/edit form
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editMode ? 'Edit Note' : 'Create New Note'}
            </h2>

            {showAlert && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
                Please fill in both title and content
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note Title"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Note Content"
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={newNote.pinned}
                  onChange={() => setNewNote({ ...newNote, pinned: !newNote.pinned })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span>Pin this note</span>
              </label>
              <button
                onClick={editMode ? handleUpdateNote : handleCreateNote}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg 
                  hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <PlusCircle size={20} />
                <span>{editMode ? 'Update Note' : 'Create Note'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
