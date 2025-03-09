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
