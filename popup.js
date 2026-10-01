const pwInput = document.getElementById('pw');
const msg = document.getElementById('msg');

pwInput.addEventListener('paste', () => navigator.clipboard.writeText('').catch(() => {}));

document.getElementById('form').onsubmit = async (e) => {
  e.preventDefault();
  const pw = pwInput.value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    // Ask the page which positions it wants first, so the full password never enters the page's process.
    const frames = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => [...document.querySelectorAll('input[maxlength="1"]')]
        .map((el) => !el.disabled && !el.readOnly),
    });
    const login = frames.find((f) => f.result?.includes(true));
    if (!login) return (msg.textContent = 'No password boxes found on this page.');
    const boxes = login.result;
    // Pekao24 shows 16 boxes whatever the password length.
    if (boxes.length !== 16) return (msg.textContent = `Expected 16 password boxes, found ${boxes.length}.`);
    const positions = boxes.flatMap((wanted, i) => (wanted ? [i] : []));
    // A mistyped client number gets a random mask that can point past the end of the password.
    if (positions.at(-1) >= pw.length) {
      return (msg.textContent = `Page asks for character ${positions.at(-1) + 1}, password has ${pw.length}. Check the client number.`);
    }
    // A tampered page can enable every box to harvest the password.
    if (positions.length < 3 || positions.length >= pw.length) {
      return (msg.textContent = `Page asks for ${positions.length} of ${pw.length} characters, refusing.`);
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id, documentIds: [login.documentId] },
      args: [positions.map((i) => [i, pw[i]])],
      func: (chars) => {
        const inputs = document.querySelectorAll('input[maxlength="1"]');
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        for (const [i, char] of chars) {
          inputs[i].focus();
          setValue.call(inputs[i], char);
          inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[i].dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
    });
    window.close();
  } catch (err) {
    msg.textContent = err.message;
  }
};
