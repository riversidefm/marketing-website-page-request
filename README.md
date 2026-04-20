# Page Request Form — Riverside

An internal form for requesting new pages on riverside.com. Submissions are sent to a Google Sheet and trigger an email notification.

---

## How it works

1. A team member fills out the form at `index.html`
2. On submit, the data is sent to two places:
   - **Google Sheets** — a new row is appended to the sheet via Google Apps Script
   - **Email** — a notification is sent to yuval.tsabar@riverside.fm via Web3Forms

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The form UI |
| `style.css` | Styling |
| `script.js` | Validation, character counters, and form submission |
| `apps-script.gs` | Google Apps Script — paste this into the Google Sheet to enable Sheets integration |

---

## Configuration

Both credentials live at the top of `script.js`:

```js
const WEB3FORMS_ACCESS_KEY = '...'; // from web3forms.com
const APPS_SCRIPT_URL = '...';      // from Google Apps Script deployment
```

---

## Google Sheets setup

1. Open the Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace any existing code with the contents of `apps-script.gs` → Save
4. **Deploy → New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: **Anyone**
5. Copy the URL — it must start with `https://script.google.com/macros/s/...`
6. Paste it as `APPS_SCRIPT_URL` in `script.js`

To deploy a new version after code changes: **Deploy → Manage deployments → edit (pencil icon) → Version: New version → Deploy**

> The sheet's column headers must match the form field names exactly (asterisks in headers are stripped automatically).

---

## Email setup

1. Go to [web3forms.com](https://web3forms.com)
2. Enter the destination email to get a free access key
3. Paste it as `WEB3FORMS_ACCESS_KEY` in `script.js`

---

## Running locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Form fields

| Field | Required | Notes |
|---|---|---|
| Submitted At | — | Auto-populated with date and time, read-only |
| Submitted By | Yes | Must be a valid email |
| Requested By | Yes | Email of whoever originally requested the page |
| Page Name | Yes | |
| Purpose | Yes | |
| Meta Title | Yes | Max 60 characters recommended |
| Meta Description | Yes | Max 155 characters recommended |
| Slug | Yes | Lowercase, numbers, hyphens only (e.g. `my-new-page`) |
| Noindex | — | Checkbox — whether to prevent search engine indexing |
| Design | No | Must be a valid URL if provided |
| Copy | No | Must be a valid URL if provided |
