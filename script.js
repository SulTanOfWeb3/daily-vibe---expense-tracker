// State management
let selectedMood = null;
let entries = [];

// Mood emoji mapping
const moodEmojis = {
  amazing: '😄',
  good: '🙂',
  okay: '😐',
  rough: '😔',
  struggling: '😢'
};

const moodColors = {
  amazing: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  good: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  okay: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  rough: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  struggling: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
};

// DOM elements
const vibeForm = document.getElementById('vibeForm');
const dateInput = document.getElementById('dateInput');
const notesInput = document.getElementById('notesInput');
const moodButtons = document.querySelectorAll('.mood-btn');
const entriesList = document.getElementById('entriesList');
const totalEntriesEl = document.getElementById('totalEntries');
const currentStreakEl = document.getElementById('currentStreak');
const clearAllBtn = document.getElementById('clearAllBtn');

// Initialize
function init() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  
  // Load entries from localStorage
  loadEntries();
  
  // Add event listeners
  moodButtons.forEach(btn => {
    btn.addEventListener('click', selectMood);
  });
  
  vibeForm.addEventListener('submit', handleSubmit);
  clearAllBtn.addEventListener('click', clearAllEntries);
  
  // Render initial state
  renderEntries();
  updateStats();
}

// Select mood
function selectMood(e) {
  const mood = e.currentTarget.dataset.mood;
  selectedMood = mood;
  
  // Update UI
  moodButtons.forEach(btn => {
    btn.classList.remove('border-blue-500', 'bg-blue-50');
    btn.classList.add('border-gray-200');
  });
  
  e.currentTarget.classList.remove('border-gray-200');
  e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  
  if (!selectedMood) {
    alert('Please select a mood');
    return;
  }
  
  const entry = {
    id: Date.now(),
    date: dateInput.value,
    mood: selectedMood,
    notes: notesInput.value.trim(),
    timestamp: new Date().toISOString()
  };
  
  // Add to entries
  entries.unshift(entry);
  
  // Save to localStorage
  saveEntries();
  
  // Reset form
  notesInput.value = '';
  selectedMood = null;
  moodButtons.forEach(btn => {
    btn.classList.remove('border-blue-500', 'bg-blue-50');
    btn.classList.add('border-gray-200');
  });
  
  // Update UI
  renderEntries();
  updateStats();
}

// Render entries
function renderEntries() {
  if (entries.length === 0) {
    entriesList.innerHTML = '<p class="text-gray-500 text-center py-8">No entries yet. Start tracking your vibes!</p>';
    return;
  }
  
  entriesList.innerHTML = entries.map(entry => {
    const colors = moodColors[entry.mood];
    const emoji = moodEmojis[entry.mood];
    const formattedDate = new Date(entry.date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `
      <div class="border ${colors.border} ${colors.bg} rounded-xl p-4">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${emoji}</span>
            <div>
              <p class="font-semibold ${colors.text} capitalize">${entry.mood}</p>
              <p class="text-sm text-gray-600">${formattedDate}</p>
            </div>
          </div>
          <button 
            onclick="deleteEntry(${entry.id})"
            class="text-gray-400 hover:text-red-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        ${entry.notes ? `<p class="text-gray-700 text-sm mt-2 pl-12">${entry.notes}</p>` : ''}
      </div>
    `;
  }).join('');
}

// Update stats
function updateStats() {
  totalEntriesEl.textContent = entries.length;
  currentStreakEl.textContent = calculateStreak();
}

// Calculate streak
function calculateStreak() {
  if (entries.length === 0) return '0 days';
  
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffTime = currentDate - entryDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return `${streak} ${streak === 1 ? 'day' : 'days'}`;
}

// Delete entry
function deleteEntry(id) {
  if (confirm('Delete this entry?')) {
    entries = entries.filter(entry => entry.id !== id);
    saveEntries();
    renderEntries();
    updateStats();
  }
}

// Clear all entries
function clearAllEntries() {
  if (confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
    entries = [];
    saveEntries();
    renderEntries();
    updateStats();
  }
}

// LocalStorage functions
function saveEntries() {
  localStorage.setItem('vibeCheckEntries', JSON.stringify(entries));
}

function loadEntries() {
  const stored = localStorage.getItem('vibeCheckEntries');
  if (stored) {
    entries = JSON.parse(stored);
  }
}

// Initialize app
init();