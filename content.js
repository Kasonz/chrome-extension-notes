let observer;
let currentUrl = window.location.href;

// Main function to check/show notes
function checkAndShowNotes() {
  // Clear existing ribbons
  document.querySelectorAll(".personal-ribbon").forEach((el) => el.remove());

  chrome.storage.local.get("notes", (data) => {
    const notes = data.notes || [];
    const currentUrl = window.location.href;

    notes.forEach((noteEntry) => {
      let shouldShow = false;
      if (noteEntry.matchType === "contains") {
        shouldShow = currentUrl.includes(noteEntry.url);
      } else if (noteEntry.matchType === "equals") {
        shouldShow = currentUrl === noteEntry.url;
      }

      if (shouldShow) {
        const ribbon = document.createElement("div");
        ribbon.className = "personal-ribbon";
        ribbon.textContent = noteEntry.note;
        document.body.appendChild(ribbon);
      }
    });
  });
}

// Detect SPA navigation changes
function setupSPAObservation() {
  // 1. Observe URL changes via History API
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    checkAndShowNotes();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    checkAndShowNotes();
  };

  // 2. Listen for hash changes
  window.addEventListener("hashchange", checkAndShowNotes);

  // 3. Observe DOM mutations (for SPAs that re-render content)
  observer = new MutationObserver((mutations) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      checkAndShowNotes();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Initial check
checkAndShowNotes();

// Setup SPA detection
setupSPAObservation();
