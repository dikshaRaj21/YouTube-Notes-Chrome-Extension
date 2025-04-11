document.getElementById('saveNote').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      let video = document.querySelector('video');
      return video ? Math.floor(video.currentTime) : null;
    }
  }, (injectionResults) => {
    const time = injectionResults[0].result;
    const noteText = document.getElementById('noteInput').value;
    if (noteText && time !== null) {
      const note = { text: noteText, time, url: tab.url };
      chrome.storage.sync.get({ notes: [] }, data => {
        const notes = data.notes;
        notes.push(note);
        chrome.storage.sync.set({ notes }, loadNotes);
        document.getElementById('noteInput').value = '';
      });
    }
  });
});

function loadNotes() {
  chrome.storage.sync.get({ notes: [] }, data => {
    const container = document.getElementById('notesList');
    container.innerHTML = '';
    data.notes.forEach(note => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>[${note.time}s]</strong>: ${note.text}`;
      div.className = "noteItem";
      div.onclick = () => {
        chrome.tabs.create({ url: `${note.url.split('&')[0]}?t=${note.time}` });
      };
      container.appendChild(div);
    });
  });
}

loadNotes();