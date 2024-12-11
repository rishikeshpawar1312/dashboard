'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Trash2, 
  Loader2, 
  Star, 
  Filter, 
  Search, 
  Tag, 
  Archive, 
  PinOff, 
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  semester?: string;
  subject?: string;
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
}

// Extended categories for B.Tech students
const categories = [
  'All', 
  'Mathematics', 
  'Physics', 
  'Chemistry', 
  'Programming', 
  'Electronics', 
  'Mechanical', 
  'General'
];

const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

export default function BTechNotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Enhanced state management
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [notification, setNotification] = useState('');

  // Additional UI states
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchNotes();
    }
  }, [status, router]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        setNotification('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotification('Network error. Please try again.');
    }
  };

  // Enhanced note creation with more metadata
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          category, 
          semester, 
          subject,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          createdAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Reset form fields
        setTitle('');
        setContent('');
        setCategory('');
        setSemester('');
        setSubject('');
        setTags('');
        
        setNotification('Note created successfully!');
        fetchNotes();
      } else {
        setNotification('Failed to create note.');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      setNotification('Error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced filtering and search
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const categoryMatch = selectedCategory === 'All' || note.category === selectedCategory;
      const semesterMatch = !selectedSemester || note.semester === selectedSemester;
      const searchMatch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return categoryMatch && semesterMatch && searchMatch;
    });
  }, [notes, selectedCategory, selectedSemester, searchQuery]);

  // Copy note content functionality
  const handleCopyNote = (note: Note) => {
    navigator.clipboard.writeText(note.content)
      .then(() => setNotification('Note copied to clipboard!'))
      .catch(err => console.error('Copy failed', err));
  };

  // Pin/Unpin note functionality
  const handlePinNote = async (noteId: string, pin: boolean) => {
    try {
      const response = await fetch(`/api/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, pinned: pin })
      });
  
      if (response.ok) {
        fetchNotes();
        setNotification(pin ? 'Note pinned!' : 'Note unpinned');
      } else {
        const errorMessage = await response.text();
        console.error('Pin/Unpin error:', errorMessage);
      }
    } catch (error) {
      console.error('Pin/Unpin error:', error);
    }
  };
  
  // Sorting notes (pinned first, then by creation date)
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredNotes]);
 
  async function handleDelete(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // Remove the note from the UI by filtering it out
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      } else {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('An error occurred while deleting the note.');
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
        {/* Advanced Search and Filtering */}
        <div className="mb-6 flex items-center space-x-2">
            <div className="flex-grow relative">
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            <button
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                <Filter className="w-5 h-5" />
            </button>
        </div>

        {/* Advanced Filtering Dropdown */}
        {isAdvancedFilterOpen && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md grid grid-cols-2 gap-4">
                <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Semesters</option>
                    {semesters.map((sem) => (
                        <option key={sem} value={sem}>
                            {sem}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
        )}

        {/* Create Note Form */}
        <div className="bg-white rounded-lg shadow-md mb-8 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Note Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                    placeholder="Note Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <div className="grid grid-cols-2 gap-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select Category</option>
                        {categories.slice(1).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((sem) => (
                            <option key={sem} value={sem}>
                                {sem}
                            </option>
                        ))}
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Tags (comma-separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Note
                </button>
            </form>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
            {sortedNotes.map((note) => (
                <div
                    key={note.id}
                    className={`bg-white rounded-lg shadow-md p-6 relative ${
                        note.pinned ? "border-2 border-yellow-400" : ""
                    }`}
                >
                    {/* Note Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold">{note.title}</h3>
                            {note.tags && note.tags.length > 0 && (
                                <div className="flex space-x-1">
                                    {note.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Note Actions */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePinNote(note.id, !note.pinned)}
                                className={`hover:bg-gray-100 p-1 rounded ${
                                    note.pinned ? "text-yellow-500" : "text-gray-500"
                                }`}
                            >
                                {note.pinned ? (
                                    <PinOff className="w-4 h-4" />
                                ) : (
                                    <Star className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => handleCopyNote(note)}
                                className="text-gray-500 hover:bg-gray-100 p-1 rounded"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(note.id)}
                                disabled={isDeleting === note.id}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                                {isDeleting === note.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Note Metadata */}
                    <div className="text-sm text-gray-500 mb-2 flex justify-between">
                        <span>
                            <Calendar className="inline-block w-4 h-4 mr-1 align-middle" />
                            {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        {note.semester && (
                            <span>
                                <Tag className="inline-block w-4 h-4 mr-1 align-middle" />
                                {note.semester}
                            </span>
                        )}
                    </div>

                    {/* Note Content */}
                    <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                </div>
            ))}
        </div>
    </div>
)};
