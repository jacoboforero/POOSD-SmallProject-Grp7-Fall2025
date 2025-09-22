// detect if running locally (Docker) or in production
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const urlBase = isLocal ? "/api" : "http://poosdproj.xyz/api";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";
let allContacts = [];
let currentContactId = null;

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  }
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    firstName +
    ",lastName=" +
    lastName +
    ",userId=" +
    userId +
    ";expires=" +
    date.toGMTString();
}

// initialize page when loaded
window.onload = function () {
  readCookie();
  loadContacts();
  setupEventListeners();
};

function setupEventListeners() {
  document.querySelector(".refresh").addEventListener("click", refreshContacts);
  document
    .querySelector(".add-user")
    .addEventListener("click", showAddContactForm);
  document
    .querySelector("#searchInput")
    .addEventListener("input", searchContacts);
  document
    .querySelector('a[href="#logout"]')
    .addEventListener("click", doLogout);

  // add event listeners for modal buttons
  document
    .getElementById("updateContactBtn")
    .addEventListener("click", () => updateContact(currentContactId));
  document
    .getElementById("deleteContactBtn")
    .addEventListener("click", () => deleteContact(currentContactId));

  // Add keyboard navigation for modals
  document.addEventListener("keydown", handleModalKeyboard);
}

// show add contact modal
function showAddContactForm() {
  const modal = document.getElementById("addContactModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  // Focus on first input for accessibility
  document.getElementById("newFirstName").focus();

  // Trap focus within modal
  trapFocus(modal);
}

// close add contact modal
function closeAddContactModal() {
  const modal = document.getElementById("addContactModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  // clear form
  document.getElementById("newFirstName").value = "";
  document.getElementById("newLastName").value = "";
  document.getElementById("newEmail").value = "";
  document.getElementById("newPhone").value = "";
  document.getElementById("addContactResult").innerHTML = "";

  // Remove focus from add button to hide outline
  document.querySelector(".add-user").blur();
}

// show contact details modal
function showContactDetails(contactId) {
  currentContactId = contactId;
  const contact = allContacts.find((c) => c.id == contactId);
  if (!contact) return;

  document.getElementById("editFirstName").value = contact.firstName || "";
  document.getElementById("editLastName").value = contact.lastName || "";
  document.getElementById("editEmail").value = contact.email || "";
  document.getElementById("editPhone").value = contact.phone || "";
  document.getElementById("contactModalResult").innerHTML = "";

  const modal = document.getElementById("contactModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  // Focus on first input for accessibility
  document.getElementById("editFirstName").focus();

  // Trap focus within modal
  trapFocus(modal);
}

// close contact details modal
function closeContactModal() {
  const modal = document.getElementById("contactModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  currentContactId = null;

  // Return focus to the contact row that was clicked
  const contactRow = document.querySelector(
    `[data-contact-id="${currentContactId}"]`
  );
  if (contactRow) {
    contactRow.focus();
  }
}

function loadContacts() {
  let tmp = { userId: userId };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/ReadContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error && jsonObject.error !== "") {
          console.error("Error loading contacts:", jsonObject.error);
          allContacts = [];
          displayContacts(allContacts);
          return;
        }

        allContacts = [];
        if (jsonObject.results && jsonObject.results.length > 0) {
          jsonObject.results.forEach((contactString, index) => {
            const parts = contactString.split(", ");
            if (parts.length >= 4) {
              const nameParts = parts[0].split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              const phone = parts[1] || "";
              const email = parts[2] || "";
              const id = parts[3] || index; // Use the ID from the string, fallback to index

              allContacts.push({
                id: id,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email,
              });
            }
          });
        }

        displayContacts(allContacts);
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    console.error("Error loading contacts:", err.message);
  }
}

// display contacts in table
function displayContacts(contacts) {
  const tableBody = document.querySelector(".table-body");
  tableBody.innerHTML = "";

  if (contacts.length === 0) {
    const emptyRow = document.createElement("div");
    emptyRow.className = "row";
    emptyRow.innerHTML = '<div class="empty-contacts">no contacts found</div>';
    tableBody.appendChild(emptyRow);
    return;
  }

  contacts.forEach((contact, index) => {
    const row = document.createElement("div");
    row.className = "row contact-row";
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("data-contact-id", contact.id);
    row.setAttribute(
      "aria-label",
      `Contact: ${contact.firstName} ${contact.lastName}, Email: ${contact.email}, Phone: ${contact.phone}`
    );

    row.onclick = () => showContactDetails(contact.id);
    row.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showContactDetails(contact.id);
      }
    };

    row.innerHTML = `
          <div class="column">${contact.firstName || ""}</div>
          <div class="column">${contact.lastName || ""}</div>
          <div class="column">${contact.email || ""}</div>
          <div class="column">${contact.phone || ""}</div>
        `;
    tableBody.appendChild(row);
  });
}

// refresh contacts
function refreshContacts() {
  const refreshIcon = document.querySelector(".refresh");
  refreshIcon.style.transform = "rotate(360deg)";
  setTimeout(() => {
    refreshIcon.style.transform = "rotate(0deg)";
  }, 500);
  loadContacts();
}

// search contacts
function searchContacts() {
  const searchTerm = document
    .querySelector(".search-box input")
    .value.toLowerCase()
    .trim();
  if (searchTerm === "") {
    loadContacts();
    return;
  }

  // implement your search API call here
  let tmp = { userId: userId, search: searchTerm };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/SearchContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        if (jsonObject.error && jsonObject.error !== "") {
          displayContacts([]);
          return;
        }

        let searchResults = [];
        if (jsonObject.results && jsonObject.results.length > 0) {
          jsonObject.results.forEach((contactString, index) => {
            const parts = contactString.split(", ");
            if (parts.length >= 4) {
              const nameParts = parts[0].split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";
              const phone = parts[1] || "";
              const email = parts[2] || "";
              const id = parts[3] || index; // Use the ID from the string, fallback to index

              searchResults.push({
                id: id,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email,
              });
            }
          });
        }
        displayContacts(searchResults);
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    console.error("Error searching contacts:", err.message);
  }
}

// add new contact
function addContact() {
  const firstName = document.getElementById("newFirstName").value.trim();
  const lastName = document.getElementById("newLastName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const phone = document.getElementById("newPhone").value.trim();

  if (!firstName || !lastName) {
    const resultDiv = document.getElementById("addContactResult");
    resultDiv.innerHTML = "first and last name are required";
    resultDiv.className = "form-result";
    return;
  }

  if (!email && !phone) {
    const resultDiv = document.getElementById("addContactResult");
    resultDiv.innerHTML = "email and phone number is required";
    resultDiv.className = "form-result";
    return;
  }

  if (email && !email.includes("@")) {
    const resultDiv = document.getElementById("addContactResult");
    resultDiv.innerHTML = "please enter a valid email address";
    resultDiv.className = "form-result";
    return;
  }

  const tmp = {
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
  };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/CreateContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          let jsonObject = JSON.parse(xhr.responseText);
          if (jsonObject.error && jsonObject.error !== "") {
            const resultDiv = document.getElementById("addContactResult");
            resultDiv.innerHTML = jsonObject.error;
            resultDiv.className = "form-result";
            return;
          }

          const resultDiv = document.getElementById("addContactResult");
          resultDiv.innerHTML = "contact added successfully!";
          resultDiv.className = "form-result success";
          // Force green color with inline styles
          resultDiv.style.color = "#2e7d32";
          resultDiv.style.backgroundColor = "#e8f5e8";
          resultDiv.style.borderLeft = "4px solid #2e7d32";
          console.log("Success message class set to:", resultDiv.className);
          console.log(
            "Element styles:",
            window.getComputedStyle(resultDiv).color
          );

          setTimeout(() => {
            closeAddContactModal();
            loadContacts();
          }, 1500);
        } else {
          const resultDiv = document.getElementById("addContactResult");
          resultDiv.innerHTML = "Failed to add contact";
          resultDiv.className = "form-result";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    const resultDiv = document.getElementById("addContactResult");
    resultDiv.innerHTML = err.message;
    resultDiv.className = "form-result";
  }
}

// update contact
function updateContact(contactId) {
  const firstName = document.getElementById("editFirstName").value.trim();
  const lastName = document.getElementById("editLastName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editPhone").value.trim();

  if (!firstName || !lastName) {
    document.getElementById("contactModalResult").innerHTML =
      "First and Last name are required";
    return;
  }

  if (!email && !phone) {
    document.getElementById("contactModalResult").innerHTML =
      "Email or phone number is required";
    return;
  }

  if (email && !email.includes("@")) {
    document.getElementById("contactModalResult").innerHTML =
      "Please enter a valid email address";
    return;
  }

  const tmp = {
    id: contactId,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    userId: userId,
  };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/UpdateContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          let jsonObject = JSON.parse(xhr.responseText);
          if (jsonObject.error && jsonObject.error !== "") {
            document.getElementById("contactModalResult").innerHTML =
              jsonObject.error;
            return;
          }
          closeContactModal();
          loadContacts();
        } else {
          document.getElementById("contactModalResult").innerHTML =
            "Failed to update contact";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactModalResult").innerHTML = err.message;
  }
}

// delete contact
function deleteContact(contactId) {
  if (
    !confirm(
      "Are you sure you want to delete this contact? This action cannot be undone."
    )
  ) {
    return;
  }

  const tmp = { id: contactId, userId: userId };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/DeleteContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          let jsonObject = JSON.parse(xhr.responseText);
          if (jsonObject.error && jsonObject.error !== "") {
            document.getElementById("contactModalResult").innerHTML =
              jsonObject.error;
            return;
          }
          closeContactModal();
          loadContacts();
        } else {
          document.getElementById("contactModalResult").innerHTML =
            "Failed to delete contact";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactModalResult").innerHTML = err.message;
  }
}

// logout
function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

// Accessibility functions

// Trap focus within modal for keyboard navigation
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

// Handle keyboard navigation for modals
function handleModalKeyboard(e) {
  if (e.key === "Escape") {
    const addModal = document.getElementById("addContactModal");
    const contactModal = document.getElementById("contactModal");

    if (!addModal.classList.contains("hidden")) {
      closeAddContactModal();
    } else if (!contactModal.classList.contains("hidden")) {
      closeContactModal();
    }
  }
}
