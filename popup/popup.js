document.addEventListener("DOMContentLoaded", () => {
  const notesList = document.getElementById("notesList");
  const form = document.getElementById("noteForm");
  const cancelBtn = document.getElementById("cancelEdit");
  let notes = [];

  // Load existing notes
  function loadNotes() {
    chrome.storage.local.get(["notes"], (result) => {
      notes = result.notes || [];
      renderNotes();
    });
  }

  // Render notes list
  function renderNotes() {
    notesList.innerHTML = notes
      .map(
        (note, index) => `
      <div class="note-item">
        <div class="note-content">
          <strong>${note.url}</strong> (${note.matchType})<br>
          ${note.note}
        </div>
        <div class="note-actions">
          <button class="edit-btn" data-index="${index}">edit</button>
          <button class="delete-btn" data-index="${index}">Remove</button>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners to new buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", handleEdit);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", handleDelete);
    });
  }

  // Handle edit button click
  function handleEdit(e) {
    const index = e.target.dataset.index;
    const note = notes[index];

    document.getElementById("editIndex").value = index;
    document.getElementById("urlInput").value = note.url;
    document.getElementById("noteInput").value = note.note;
    document.getElementById("matchType").value = note.matchType;
  }

  // Handle delete button click
  function handleDelete(e) {
    const index = e.target.dataset.index;
    notes.splice(index, 1);
    chrome.storage.local.set({ notes }, loadNotes);
  }

  // Cancel edit
  cancelBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("editIndex").value = "-1";
  });

  // Form submission handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newNote = {
      url: document.getElementById("urlInput").value,
      note: document.getElementById("noteInput").value,
      matchType: document.getElementById("matchType").value,
    };

    const editIndex = parseInt(document.getElementById("editIndex").value);

    if (editIndex >= 0) {
      // Update existing note
      notes[editIndex] = newNote;
    } else {
      // Add new note
      notes.push(newNote);
    }

    chrome.storage.local.set({ notes }, () => {
      form.reset();
      document.getElementById("editIndex").value = "-1";
      loadNotes();
    });
  });

  // Initial setup
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    document.getElementById("urlInput").value = tabs[0].url;
  });
  loadNotes();
});
