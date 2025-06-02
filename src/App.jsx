import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/todos');
      setTodos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.name.trim()) {
      alert('Please enter a task name!');
      return;
    }
    try {
      const todoWithPriority = { ...newTodo, priority };
      if (editId) {
        const response = await axios.put(`http://localhost:5000/todos/${editId}`, todoWithPriority);
        setTodos(todos.map(todo => todo.todo_id === editId ? response.data : todo));
        setEditId(null);
      } else {
        const response = await axios.post('http://localhost:5000/todos', todoWithPriority);
        setTodos([...todos, response.data]);
      }
      setNewTodo({ name: '', description: '' });
      setPriority('medium');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await axios.delete(`http://localhost:5000/todos/${id}`);
        setTodos(todos.filter(todo => todo.todo_id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditTodo = (todo) => {
    setNewTodo({ name: todo.name, description: todo.description });
    setPriority(todo.priority || 'medium');
    setEditId(todo.todo_id);
    setIsModalOpen(true);
  };

  const toggleComplete = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo.todo_id === id);
      const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };
      const response = await axios.put(`http://localhost:5000/todos/${id}`, updatedTodo);
      setTodos(todos.map(todo => todo.todo_id === id ? response.data : todo));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = 
      todo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      (selectedCategory === 'completed' && todo.completed) || 
      (selectedCategory === 'active' && !todo.completed);
    
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-5xl">
        {/* Premium Header */}
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            TaskMaster Pro
          </h1>
          <p className="text-gray-500 font-light tracking-wide">Elevate your productivity with elegant task management</p>
        </header>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 text-sm font-medium ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory('active')}
                  className={`px-4 py-2 text-sm font-medium ${selectedCategory === 'active' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setSelectedCategory('completed')}
                  className={`px-4 py-2 text-sm font-medium ${selectedCategory === 'completed' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Completed
                </button>
              </div>

              <button
                onClick={() => {
                  setEditId(null);
                  setNewTodo({ name: '', description: '' });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No tasks found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm ? 'No tasks match your search. Try different keywords.' : 'Start by creating your first task.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Task
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTodos.map(({ todo_id, name, description, completed, priority }) => (
                <li key={todo_id} className={`hover:bg-gray-50 transition-colors duration-150 ${completed ? 'bg-gray-50' : ''}`}>
                  <div className="px-6 py-5 flex items-start">
                    <button
                      onClick={() => toggleComplete(todo_id)}
                      className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border ${completed ? 'bg-indigo-600 border-indigo-600 flex items-center justify-center' : 'border-gray-300'}`}
                      aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {completed && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-lg font-medium ${completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {name}
                          </h3>
                          {description && (
                            <p className={`mt-1 text-sm ${completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {description}
                            </p>
                          )}
                        </div>
                        {priority && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEditTodo({ todo_id, name, description, priority })}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        aria-label={`Edit todo ${name}`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo_id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label={`Delete todo ${name}`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stats Footer */}
        <footer className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-3 sm:mb-0">
        
          </div>
          <div className="flex items-center space-x-4">
            <p>&copy; {new Date().getFullYear()} TaskMaster Pro</p>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>Premium Edition</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Premium Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editId ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditId(null);
                    setNewTodo({ name: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="task-name"
                    type="text"
                    placeholder="What needs to be done?"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newTodo.name}
                    onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="task-description"
                    placeholder="Add some details..."
                    rows={3}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPriority('low')}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center text-sm font-medium ${priority === 'low' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${priority === 'low' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('medium')}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center text-sm font-medium ${priority === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={`py-2 px-3 border rounded-lg flex items-center justify-center text-sm font-medium ${priority === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${priority === 'high' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                      High
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditId(null);
                  setNewTodo({ name: '', description: '' });
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTodo}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                disabled={!newTodo.name.trim()}
              >
                {editId ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;