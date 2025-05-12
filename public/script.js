function addPhone() {
  const container = document.getElementById('phones-container');
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'phones[]';
  input.placeholder = 'Phone';
  container.appendChild(input);
}

function addEmail() {
  const container = document.getElementById('emails-container');
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'emails[]';
  input.placeholder = 'Email';
  container.appendChild(input);
}

let editingContactId = null;

function editContact(id) {
  fetch('/api/contacts')
    .then(res => res.json())
    .then(contacts => {
      const contact = contacts.find(c => c.id === id);
      if (!contact) return;

      document.getElementById('name').value = contact.name;
      document.getElementById('phones-container').innerHTML =
        `<label>Phone(s):</label>` +
        contact.phones.map(phone =>
          `<input type="text" name="phones[]" value="${phone}" />`
        ).join('');

      document.getElementById('emails-container').innerHTML =
        `<label>Email(s):</label>` +
        contact.emails.map(email =>
          `<input type="email" name="emails[]" value="${email}" />`
        ).join('');

      document.getElementById('form-title').innerText = 'Update Contact';
      editingContactId = id;
    });
}

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const phones = Array.from(document.querySelectorAll('input[name="phones[]"]')).map(i => i.value);
  const emails = Array.from(document.querySelectorAll('input[name="emails[]"]')).map(i => i.value);

  const endpoint = editingContactId ? `/update/${editingContactId}` : '/submit';
  const method = editingContactId ? 'PUT' : 'POST';

  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phones, emails })
  });

  if (res.ok) {
    alert(editingContactId ? 'Contact updated!' : 'Contact added!');
    this.reset();
    editingContactId = null;
    document.getElementById('form-title').innerText = 'Add New Contact';
    loadContacts();
  } else {
    alert('Operation failed');
  }
});

async function loadContacts() {
  const res = await fetch('/api/contacts');
  const contacts = await res.json();

  const tbody = document.getElementById('contacts-body');
  tbody.innerHTML = '';

  contacts.forEach(contact => {
    const phones = contact.phones.join(', ');
    const emails = contact.emails.join(', ');

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${phones}</td>
      <td>${emails}</td>
      <td><button onclick="editContact(${contact.id})">Edit</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Real-time search setup (only once)
document.getElementById('search').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const rows = document.querySelectorAll('#contacts-body tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const matches = Array.from(cells).some(cell =>
      cell.textContent.toLowerCase().includes(query)
    );
    row.style.display = matches ? '' : 'none';
  });
});

window.onload = loadContacts;
