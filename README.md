# pekao24-masked-fill

Browser extension that fills the Pekao24 masked password form. Paste your full password into the popup, click **Fill**, and only the characters the bank asks for go into the right boxes.

## Why

Pekao24 keeps forgetting the trusted device, so every login asks for the masked password: a different set of character positions each time, one box per character. Password managers cannot fill that, so you end up counting characters by hand.

## Install (Chrome, Brave, Edge, other Chromium browsers)

1. `git clone https://github.com/smorcirl/pekao24-masked-fill`
2. Open `chrome://extensions` (`brave://extensions`, `edge://extensions`).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the cloned folder.

## Security

- Nothing stored, no network access, unreachable by other extensions and websites.
- Runs only on `*.pekao24.pl`, which gets only the requested characters.
- Clipboard cleared after paste.

Filled characters are visible to the page and to extensions that can read it, same as typing.

**USE AT YOUR OWN RISK**
