// Paste your Web3Forms access key here.
// Get one free at https://web3forms.com — enter yuval.tsabar@riverside.fm to receive submissions.
const WEB3FORMS_ACCESS_KEY = 'b2078a3f-5a15-416a-a5e2-8565aba6f249';

// Paste your Google Apps Script web app URL here (see apps-script.gs for setup steps).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkt8B1VDvP3WawiGCu9-PlqESpXsb1zAmsxA75OJBoyRSw6_JHG7d10t0s5Ppi0OlUPA/exec';

// ─── Date auto-populate ────────────────────────────────────────────────────

const dateField = document.getElementById('dateRequested');

function getCurrentDateTime() {
  return new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

dateField.value = getCurrentDateTime();

// ─── Character counters ────────────────────────────────────────────────────

function setupCounter(inputId, counterId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);

  function update() {
    const len = input.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.className = 'char-counter';
    if (len > max) counter.classList.add('over');
    else if (len >= max - 10) counter.classList.add('warn');
  }

  input.addEventListener('input', update);
  update();
}

setupCounter('metaTitle', 'metaTitle-counter', 60);
setupCounter('metaDescription', 'metaDescription-counter', 155);

// ─── Slug auto-format ──────────────────────────────────────────────────────
// Lowercase, replace spaces with hyphens, strip anything that isn't a-z 0-9 or hyphen.

document.getElementById('slug').addEventListener('input', function () {
  const pos = this.selectionStart;
  const cleaned = this.value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (cleaned !== this.value) {
    this.value = cleaned;
    this.setSelectionRange(pos, pos);
  }
});

// ─── Validation helpers ────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function setError(fieldId, message) {
  const field = document.getElementById(`field-${fieldId}`);
  const input = document.getElementById(fieldId);
  const errorEl = field.querySelector('.error-message');
  if (input) input.classList.add('invalid');
  if (errorEl) errorEl.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(`field-${fieldId}`);
  const input = document.getElementById(fieldId);
  const errorEl = field.querySelector('.error-message');
  if (input) input.classList.remove('invalid');
  if (errorEl) errorEl.textContent = '';
}

// Per-field validators — return an error string or null if valid.
const fieldValidators = {
  submittedBy: (val) => {
    if (!val) return 'Email is required.';
    if (!EMAIL_REGEX.test(val)) return 'Enter a valid email address.';
    return null;
  },
  requestedBy: (val) => {
    if (!val) return 'Email is required.';
    if (!EMAIL_REGEX.test(val)) return 'Enter a valid email address.';
    return null;
  },
  pageName: (val) => val ? null : 'Page name is required.',
  purpose: (val) => val ? null : 'Purpose is required.',
  metaTitle: (val) => val ? null : 'Meta title is required.',
  metaDescription: (val) => val ? null : 'Meta description is required.',
  slug: (val) => {
    if (!val) return 'Slug is required.';
    if (!SLUG_REGEX.test(val)) return 'Use lowercase letters, numbers, and hyphens only. No leading or trailing hyphens. Example: my-new-page';
    return null;
  },
  design: (val) => {
    if (!val) return null; // optional
    if (!isValidUrl(val)) return 'Enter a valid URL (must start with http:// or https://).';
    return null;
  },
  copy: (val) => {
    if (!val) return null; // optional
    if (!isValidUrl(val)) return 'Enter a valid URL (must start with http:// or https://).';
    return null;
  },
};

function validateField(fieldId) {
  const input = document.getElementById(fieldId);
  const val = input.value.trim();
  const error = fieldValidators[fieldId](val);
  if (error) setError(fieldId, error);
  else clearError(fieldId);
  return !error;
}

// ─── Live validation ───────────────────────────────────────────────────────
// Validate on blur; if a field already shows an error, re-validate on every keystroke.

const liveFields = Object.keys(fieldValidators);

liveFields.forEach((fieldId) => {
  const input = document.getElementById(fieldId);
  input.addEventListener('blur', () => validateField(fieldId));
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) validateField(fieldId);
  });
});

// ─── Full-form validation (used on submit) ─────────────────────────────────

function validateForm() {
  return liveFields.map(validateField).every(Boolean);
}

// ─── Submit ────────────────────────────────────────────────────────────────

document.getElementById('page-request-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');

  submitBtn.disabled = true;
  btnText.hidden = true;
  btnLoading.hidden = false;
  successMsg.hidden = true;
  errorMsg.hidden = true;

  const formData = {
    'Submitted At': dateField.value,
    'Submitted By': document.getElementById('submittedBy').value.trim(),
    'Requested By': document.getElementById('requestedBy').value.trim(),
    'Page Name': document.getElementById('pageName').value.trim(),
    'Purpose': document.getElementById('purpose').value.trim(),
    'Meta Title': document.getElementById('metaTitle').value.trim(),
    'Meta Description': document.getElementById('metaDescription').value.trim(),
    'Slug': document.getElementById('slug').value.trim(),
    'Add noindex Tag': document.getElementById('noindex').checked ? 'Yes' : 'No',
    'Design': document.getElementById('design').value.trim(),
    'Copy': document.getElementById('copy').value.trim(),
  };

  // Send to Google Sheets via Apps Script (fire and forget — no-cors means no response).
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams(formData),
  }).catch(() => {});

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Page Request: ${formData['Page Name']}`,
    from_name: 'Riverside Page Request Form',
    ...formData,
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      this.reset();
      dateField.value = getCurrentDateTime();
      document.getElementById('metaTitle-counter').textContent = '0 / 60';
      document.getElementById('metaTitle-counter').className = 'char-counter';
      document.getElementById('metaDescription-counter').textContent = '0 / 155';
      document.getElementById('metaDescription-counter').className = 'char-counter';
    } else {
      errorMsg.hidden = false;
    }
  } catch {
    errorMsg.hidden = false;
  } finally {
    submitBtn.disabled = false;
    btnText.hidden = false;
    btnLoading.hidden = true;
  }
});
