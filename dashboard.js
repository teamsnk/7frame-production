
/* =========================================================
   7FRAME PRODUCTION STUDIO
   File: dashboard.js
   Demo-only audition management. No backend or API.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "7frame_audition_dashboard_v1";

  const STATUSES = [
    "New",
    "Reviewing",
    "Shortlisted",
    "Scheduled",
    "Selected",
    "Rejected"
  ];

  const ROLES = [
    "Lead Actor",
    "Supporting Actor",
    "Female Lead",
    "Child Artist",
    "Model",
    "Voice Artist",
    "Background Artist",
    "Other"
  ];

  const DEMO_APPLICANTS = [
    {
      id: "demo-1001",
      name: "Ayesha Rahman",
      age: 24,
      email: "ayesha.demo@example.com",
      phone: "+880 1700-000001",
      location: "Dhaka, Bangladesh",
      role: "Female Lead",
      experience: "3–5 years",
      portfolio: "https://example.com/",
      status: "Shortlisted",
      notes: "Demo record. Review acting showreel.",
      appliedAt: "2026-10-18T10:30:00.000Z"
    },
    {
      id: "demo-1002",
      name: "Arif Hasan",
      age: 27,
      email: "arif.demo@example.com",
      phone: "+880 1700-000002",
      location: "Sylhet, Bangladesh",
      role: "Lead Actor",
      experience: "1–2 years",
      portfolio: "",
      status: "New",
      notes: "",
      appliedAt: "2026-10-20T08:15:00.000Z"
    },
    {
      id: "demo-1003",
      name: "Nusrat Jahan",
      age: 22,
      email: "nusrat.demo@example.com",
      phone: "+880 1700-000003",
      location: "Chattogram, Bangladesh",
      role: "Model",
      experience: "3–5 years",
      portfolio: "https://example.com/",
      status: "Scheduled",
      notes: "Demo record. Audition time to be confirmed.",
      appliedAt: "2026-10-21T13:00:00.000Z"
    },
    {
      id: "demo-1004",
      name: "Tanvir Ahmed",
      age: 30,
      email: "tanvir.demo@example.com",
      phone: "+880 1700-000004",
      location: "Dhaka, Bangladesh",
      role: "Supporting Actor",
      experience: "5+ years",
      portfolio: "https://example.com/",
      status: "Reviewing",
      notes: "Demo record. Experienced supporting role.",
      appliedAt: "2026-10-22T09:45:00.000Z"
    },
    {
      id: "demo-1005",
      name: "Maliha Chowdhury",
      age: 21,
      email: "maliha.demo@example.com",
      phone: "+880 1700-000005",
      location: "Sylhet, Bangladesh",
      role: "Voice Artist",
      experience: "Beginner",
      portfolio: "",
      status: "New",
      notes: "",
      appliedAt: "2026-10-23T11:20:00.000Z"
    },
    {
      id: "demo-1006",
      name: "Fahim Islam",
      age: 26,
      email: "fahim.demo@example.com",
      phone: "+880 1700-000006",
      location: "Rajshahi, Bangladesh",
      role: "Background Artist",
      experience: "1–2 years",
      portfolio: "",
      status: "Rejected",
      notes: "Demo record. Example of a closed application.",
      appliedAt: "2026-10-24T15:10:00.000Z"
    }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const elements = {
    sidebar: $("#dashSidebar"),
    overlay: $("#dashOverlay"),
    menuToggle: $("#dashMenuToggle"),
    addButton: $("#openAddModal"),
    modal: $("#applicantModal"),
    detailModal: $("#detailModal"),
    form: $("#applicantForm"),
    modalTitle: $("#modalTitle"),
    tableBody: $("#applicantsTableBody"),
    emptyState: $("#emptyState"),
    search: $("#applicantSearch"),
    statusFilter: $("#statusFilter"),
    roleFilter: $("#roleFilter"),
    tableSummary: $("#tableSummary"),
    toast: $("#dashToast")
  };

  let applicants = [];
  let activePipelineStatus = "All";
  let currentDetailId = null;
  let toastTimeout = null;
  let lastFocusedElement = null;

  function cloneDemoApplicants() {
    return DEMO_APPLICANTS.map((applicant) => ({ ...applicant }));
  }

  function isValidApplicant(item) {
    return Boolean(
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.email === "string" &&
      typeof item.role === "string" &&
      typeof item.experience === "string" &&
      STATUSES.includes(item.status) &&
      typeof item.appliedAt === "string"
    );
  }

  function loadApplicants() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw !== null) {
        const parsed = JSON.parse(raw);

        if (
          Array.isArray(parsed) &&
          parsed.every(isValidApplicant)
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Unable to load local audition data:", error);
    }

    return cloneDemoApplicants();
  }

  function saveApplicants() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
      return true;
    } catch (error) {
      console.error("Unable to save audition data:", error);
      showToast("Could not save data. Browser storage may be unavailable.");
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  function safeExternalURL(value) {
    if (!value) return "";

    try {
      const url = new URL(value);

      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.href;
      }
    } catch (_) {
      return "";
    }

    return "";
  }

  function initials(name) {
    return String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function statusClass(status) {
    return String(status || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function statusBadge(status) {
    const safeStatus = escapeHTML(status);
    const className = statusClass(status);

    return `
      <span class="dash-status-badge status-badge-${className}">
        <span class="dash-status-dot status-${className}"></span>
        ${safeStatus}
      </span>
    `;
  }

  function showToast(message) {
    if (!elements.toast) return;

    window.clearTimeout(toastTimeout);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");

    toastTimeout = window.setTimeout(() => {
      elements.toast.classList.remove("is-visible");
    }, 2800);
  }

  function openModal(modal) {
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const firstInput = $("input:not([type='hidden']), select, textarea, button", modal);

    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 20);
    }
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.hidden = true;

    const anotherModalOpen = [elements.modal, elements.detailModal].some(
      (item) => item && !item.hidden
    );

    if (!anotherModalOpen) {
      document.body.style.overflow = "";
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function setMenuOpen(isOpen) {
    if (!elements.sidebar || !elements.overlay) return;

    elements.sidebar.classList.toggle("is-open", isOpen);
    elements.overlay.classList.toggle("is-visible", isOpen);

    if (elements.menuToggle) {
      elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
      elements.menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close dashboard menu" : "Open dashboard menu"
      );
    }
  }

  function getFilteredApplicants() {
    const query = (elements.search?.value || "").trim().toLowerCase();
    const status = elements.statusFilter?.value || "All";
    const role = elements.roleFilter?.value || "All";

    return applicants
      .filter((applicant) => {
        const searchText = [
          applicant.name,
          applicant.email,
          applicant.phone,
          applicant.role,
          applicant.location
        ].join(" ").toLowerCase();

        const matchesSearch = !query || searchText.includes(query);
        const matchesStatus = status === "All" || applicant.status === status;
        const matchesRole = role === "All" || applicant.role === role;
        const matchesPipeline =
          activePipelineStatus === "All" ||
          applicant.status === activePipelineStatus;

        return matchesSearch && matchesStatus && matchesRole && matchesPipeline;
      })
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }

  function updateRoleFilter() {
    if (!elements.roleFilter) return;

    const previousValue = elements.roleFilter.value || "All";

    const uniqueRoles = [...new Set([
      ...ROLES,
      ...applicants.map((applicant) => applicant.role)
    ])].filter(Boolean).sort();

    elements.roleFilter.innerHTML = [
      '<option value="All">All roles</option>',
      ...uniqueRoles.map((role) =>
        `<option value="${escapeHTML(role)}">${escapeHTML(role)}</option>`
      )
    ].join("");

    elements.roleFilter.value = uniqueRoles.includes(previousValue)
      ? previousValue
      : "All";
  }

  function renderStats() {
    const count = (status) =>
      applicants.filter((item) => item.status === status).length;

    const total = applicants.length;
    const newCount = count("New");
    const reviewingCount = count("Reviewing");
    const shortlistedCount = count("Shortlisted");
    const scheduledCount = count("Scheduled");

    $("#statTotal").textContent = total;
    $("#statNew").textContent = newCount;
    $("#statShortlisted").textContent = shortlistedCount;
    $("#statScheduled").textContent = scheduledCount;
    $("#sidebarApplicantCount").textContent = total;

    $("#pipeNew").textContent = newCount;
    $("#pipeReviewing").textContent = reviewingCount;
    $("#pipeShortlisted").textContent = shortlistedCount;
    $("#pipeScheduled").textContent = scheduledCount;

    const pipelineTotal = Math.max(total, 1);

    $("#barNew").style.width = `${(newCount / pipelineTotal) * 100}%`;
    $("#barReviewing").style.width = `${(reviewingCount / pipelineTotal) * 100}%`;
    $("#barShortlisted").style.width = `${(shortlistedCount / pipelineTotal) * 100}%`;
    $("#barScheduled").style.width = `${(scheduledCount / pipelineTotal) * 100}%`;
  }

  function renderTable() {
    const filtered = getFilteredApplicants();

    elements.tableBody.innerHTML = filtered.map((applicant) => `
      <tr>
        <td>
          <div class="dash-applicant-cell">
            <div class="dash-applicant-avatar">${escapeHTML(initials(applicant.name))}</div>
            <div>
              <span class="dash-applicant-name">${escapeHTML(applicant.name)}</span>
              <span class="dash-applicant-email">${escapeHTML(applicant.email)}</span>
            </div>
          </div>
        </td>

        <td><span class="dash-role-cell">${escapeHTML(applicant.role)}</span></td>
        <td><span class="dash-experience-cell">${escapeHTML(applicant.experience)}</span></td>
        <td><span class="dash-date-cell">${escapeHTML(formatDate(applicant.appliedAt))}</span></td>
        <td>
          <label class="dash-sr-only" for="status-${escapeHTML(applicant.id)}">
            Status for ${escapeHTML(applicant.name)}
          </label>
          <select class="dash-status-select"
                  id="status-${escapeHTML(applicant.id)}"
                  data-action="change-status"
                  data-id="${escapeHTML(applicant.id)}"
                  aria-label="Change status for ${escapeHTML(applicant.name)}">
            ${STATUSES.map((status) => `
              <option value="${escapeHTML(status)}"
                ${applicant.status === status ? "selected" : ""}>
                ${escapeHTML(status)}
              </option>
            `).join("")}
          </select>
        </td>
        <td>
          <div class="dash-row-actions">
            <button type="button"
                    class="dash-row-action"
                    data-action="view"
                    data-id="${escapeHTML(applicant.id)}"
                    aria-label="View ${escapeHTML(applicant.name)}"
                    title="View details">↗</button>

            <button type="button"
                    class="dash-row-action"
                    data-action="edit"
                    data-id="${escapeHTML(applicant.id)}"
                    aria-label="Edit ${escapeHTML(applicant.name)}"
                    title="Edit applicant">✎</button>

            <button type="button"
                    class="dash-row-action dash-delete-action"
                    data-action="delete"
                    data-id="${escapeHTML(applicant.id)}"
                    aria-label="Delete ${escapeHTML(applicant.name)}"
                    title="Delete applicant">×</button>
          </div>
        </td>
      </tr>
    `).join("");

    elements.emptyState.hidden = filtered.length !== 0;

    const total = applicants.length;
    const visible = filtered.length;

    elements.tableSummary.textContent =
      `Showing ${visible} of ${total} applicant${total === 1 ? "" : "s"}`;

    $$(".dash-pipeline-stage").forEach((button) => {
      button.classList.toggle(
        "is-selected",
        button.dataset.pipelineStatus === activePipelineStatus
      );
    });
  }

  function renderAll() {
    updateRoleFilter();
    renderStats();
    renderTable();
  }

  function findApplicant(id) {
    return applicants.find((item) => item.id === id);
  }

  function resetForm() {
    elements.form.reset();
    $("#applicantId").value = "";
    $("#applicantStatus").value = "New";
  }

  function openAddModal() {
    resetForm();
    elements.modalTitle.textContent = "Add applicant";
    $("#saveApplicant").textContent = "Save applicant";
    openModal(elements.modal);
  }

  function openEditModal(id) {
    const applicant = findApplicant(id);

    if (!applicant) {
      showToast("Applicant not found.");
      return;
    }

    resetForm();
    elements.modalTitle.textContent = "Edit applicant";
    $("#saveApplicant").textContent = "Save changes";

    $("#applicantId").value = applicant.id;
    $("#applicantName").value = applicant.name;
    $("#applicantAge").value = applicant.age ?? "";
    $("#applicantEmail").value = applicant.email;
    $("#applicantPhone").value = applicant.phone || "";
    $("#applicantRole").value = applicant.role;
    $("#applicantExperience").value = applicant.experience;
    $("#applicantLocation").value = applicant.location || "";
    $("#applicantStatus").value = applicant.status;
    $("#applicantPortfolio").value = applicant.portfolio || "";
    $("#applicantNotes").value = applicant.notes || "";

    openModal(elements.modal);
  }

  function safeMailto(email) {
    return `mailto:${encodeURIComponent(email)}`;
  }

  function detailItem(label, value, full = false) {
    return `
      <div class="dash-detail-item${full ? " dash-detail-item-full" : ""}">
        <span class="dash-detail-label">${escapeHTML(label)}</span>
        <span class="dash-detail-value">${escapeHTML(value || "—")}</span>
      </div>
    `;
  }

  function renderDetails(id) {
    const applicant = findApplicant(id);

    if (!applicant) {
      showToast("Applicant not found.");
      return;
    }

    currentDetailId = id;
    $("#detailName").textContent = applicant.name;
    $("#detailSubtitle").textContent =
      `${applicant.role} · Applied ${formatDate(applicant.appliedAt)}`;

    const portfolioURL = safeExternalURL(applicant.portfolio);

    $("#detailContent").innerHTML = `
      <div class="dash-detail-item dash-detail-item-full">
        <span class="dash-detail-label">Application status</span>
        <div class="dash-detail-status">
          ${statusBadge(applicant.status)}
          <label class="dash-sr-only" for="detailStatus">Update status</label>
          <select id="detailStatus" aria-label="Update application status">
            ${STATUSES.map((status) => `
              <option value="${escapeHTML(status)}"
                ${applicant.status === status ? "selected" : ""}>
                ${escapeHTML(status)}
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      ${detailItem("Age", applicant.age ? `${applicant.age} years` : "—")}
      ${detailItem("Experience", applicant.experience)}
      ${detailItem("Email", applicant.email)}
      ${detailItem("Phone", applicant.phone)}
      ${detailItem("Location", applicant.location)}
      ${detailItem("Preferred role", applicant.role)}
      ${detailItem("Applied on", formatDateTime(applicant.appliedAt))}
      <div class="dash-detail-item dash-detail-item-full">
        <span class="dash-detail-label">Portfolio / showreel</span>
        <span class="dash-detail-value">
          ${portfolioURL
            ? `<a href="${escapeHTML(portfolioURL)}" target="_blank" rel="noopener noreferrer">Open portfolio ↗</a>`
            : "Not provided"}
        </span>
      </div>
      ${detailItem("Admin notes", applicant.notes || "No notes added.", true)}
      <div class="dash-detail-item dash-detail-item-full">
        <span class="dash-detail-label">Contact</span>
        <span class="dash-detail-value">
          <a href="${safeMailto(applicant.email)}">Open email application ↗</a>
        </span>
      </div>
    `;

    openModal(elements.detailModal);
  }

  function handleSaveApplicant(event) {
    event.preventDefault();

    if (!elements.form.reportValidity()) return;

    const id = $("#applicantId").value;
    const existing = id ? findApplicant(id) : null;
    const age = Number($("#applicantAge").value);

    if (!Number.isInteger(age) || age < 18 || age > 100) {
      showToast("Applicant age must be between 18 and 100.");
      $("#applicantAge").focus();
      return;
    }

    const email = $("#applicantEmail").value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.");
      $("#applicantEmail").focus();
      return;
    }

    const portfolio = $("#applicantPortfolio").value.trim();

    if (portfolio && !safeExternalURL(portfolio)) {
      showToast("Portfolio must be a valid HTTP or HTTPS URL.");
      $("#applicantPortfolio").focus();
      return;
    }

    const applicant = {
      id: existing ? existing.id : (
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      ),
      name: $("#applicantName").value.trim(),
      age,
      email,
      phone: $("#applicantPhone").value.trim(),
      location: $("#applicantLocation").value.trim(),
      role: $("#applicantRole").value,
      experience: $("#applicantExperience").value,
      portfolio,
      status: $("#applicantStatus").value,
      notes: $("#applicantNotes").value.trim(),
      appliedAt: existing ? existing.appliedAt : new Date().toISOString()
    };

    if (!applicant.name || !applicant.role || !applicant.experience) {
      showToast("Please complete the required fields.");
      return;
    }

    if (existing) {
      applicants = applicants.map((item) =>
        item.id === existing.id ? applicant : item
      );
    } else {
      applicants.unshift(applicant);
    }

    if (!saveApplicants()) return;

    closeModal(elements.modal);
    renderAll();
    showToast(existing ? "Applicant updated." : "Applicant added.");
  }

  function changeApplicantStatus(id, newStatus) {
    if (!STATUSES.includes(newStatus)) {
      showToast("Invalid application status.");
      renderAll();
      return;
    }

    const applicant = findApplicant(id);

    if (!applicant) {
      showToast("Applicant not found.");
      renderAll();
      return;
    }

    const previousStatus = applicant.status;
    applicant.status = newStatus;

    if (!saveApplicants()) {
      applicant.status = previousStatus;
      renderAll();
      return;
    }

    renderAll();
    showToast(`${applicant.name}: status updated to ${newStatus}.`);
  }

  function deleteApplicant(id) {
    const applicant = findApplicant(id);

    if (!applicant) return;

    const confirmed = window.confirm(
      `Delete the demo record for "${applicant.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const previous = applicants;
    applicants = applicants.filter((item) => item.id !== id);

    if (!saveApplicants()) {
      applicants = previous;
      renderAll();
      return;
    }

    if (currentDetailId === id) {
      closeModal(elements.detailModal);
    }

    renderAll();
    showToast("Applicant deleted.");
  }

  function csvCell(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formulas from executing when the CSV is opened.
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCSV() {
    const records = getFilteredApplicants();

    if (records.length === 0) {
      showToast("No applicants to export.");
      return;
    }

    const columns = [
      ["Name", "name"],
      ["Age", "age"],
      ["Email", "email"],
      ["Phone", "phone"],
      ["Location", "location"],
      ["Preferred Role", "role"],
      ["Experience", "experience"],
      ["Status", "status"],
      ["Applied At", "appliedAt"],
      ["Portfolio", "portfolio"],
      ["Admin Notes", "notes"]
    ];

    const rows = [
      columns.map(([label]) => csvCell(label)).join(","),
      ...records.map((applicant) =>
        columns.map(([, key]) => csvCell(applicant[key])).join(",")
      )
    ];

    const csv = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `7frame-auditions-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Exported ${records.length} applicant record(s).`);
  }

  function resetDemoData() {
    const confirmed = window.confirm(
      "Reset all local audition records to the original demo data? Your added and edited records will be lost."
    );

    if (!confirmed) return;

    applicants = cloneDemoApplicants();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
    } catch (error) {
      console.error("Could not reset local storage:", error);
      showToast("Browser storage is unavailable.");
      return;
    }

    activePipelineStatus = "All";

    if (elements.search) elements.search.value = "";
    if (elements.statusFilter) elements.statusFilter.value = "All";
    if (elements.roleFilter) elements.roleFilter.value = "All";

    renderAll();
    showToast("Demo records have been reset.");
  }

  function updateDashboardDate() {
    const dateElement = $("#dashboardDate");
    const yearElement = $("#footerYear");

    if (dateElement) {
      dateElement.textContent = new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(new Date());
    }

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  function setupEvents() {
    elements.addButton?.addEventListener("click", openAddModal);

    $("#closeModal")?.addEventListener("click", () => closeModal(elements.modal));
    $("#cancelModal")?.addEventListener("click", () => closeModal(elements.modal));
    $("#closeDetailModal")?.addEventListener("click", () => closeModal(elements.detailModal));
    $("#detailDone")?.addEventListener("click", () => closeModal(elements.detailModal));

    elements.form?.addEventListener("submit", handleSaveApplicant);

    elements.search?.addEventListener("input", renderTable);
    elements.statusFilter?.addEventListener("change", renderTable);
    elements.roleFilter?.addEventListener("change", renderTable);

    $("#exportCSV")?.addEventListener("click", exportCSV);
    $("#resetDemo")?.addEventListener("click", resetDemoData);

    $("#clearFilters")?.addEventListener("click", () => {
      elements.search.value = "";
      elements.statusFilter.value = "All";
      elements.roleFilter.value = "All";
      activePipelineStatus = "All";
      renderTable();
    });

    elements.tableBody?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");

      if (!button) return;

      const id = button.dataset.id;

      switch (button.dataset.action) {
        case "view":
          renderDetails(id);
          break;
        case "edit":
          openEditModal(id);
          break;
        case "delete":
          deleteApplicant(id);
          break;
      }
    });

    elements.tableBody?.addEventListener("change", (event) => {
      const select = event.target.closest('[data-action="change-status"]');

      if (!select) return;

      changeApplicantStatus(select.dataset.id, select.value);
    });

    $$(".dash-pipeline-stage").forEach((button) => {
      button.addEventListener("click", () => {
        const status = button.dataset.pipelineStatus;

        activePipelineStatus = activePipelineStatus === status ? "All" : status;

        if (elements.statusFilter) {
          elements.statusFilter.value = "All";
        }

        renderTable();

        $("#applicants")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start"
        });
      });
    });

    $("#detailEdit")?.addEventListener("click", () => {
      if (!currentDetailId) return;

      const id = currentDetailId;

      closeModal(elements.detailModal);
      openEditModal(id);
    });

    $("#detailContent")?.addEventListener("change", (event) => {
      if (event.target.id !== "detailStatus" || !currentDetailId) return;

      changeApplicantStatus(currentDetailId, event.target.value);
      renderDetails(currentDetailId);
    });

    elements.menuToggle?.addEventListener("click", () => {
      const isOpen = elements.sidebar.classList.contains("is-open");
      setMenuOpen(!isOpen);
    });

    elements.overlay?.addEventListener("click", () => setMenuOpen(false));

    $$(".dash-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        $$(".dash-nav-link").forEach((item) => {
          item.classList.remove("is-active");
        });

        if (link.dataset.section) {
          link.classList.add("is-active");
        }

        setMenuOpen(false);
      });
    });

    [elements.modal, elements.detailModal].forEach((modal) => {
      modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (!elements.detailModal.hidden) {
          closeModal(elements.detailModal);
        } else if (!elements.modal.hidden) {
          closeModal(elements.modal);
        } else {
          setMenuOpen(false);
        }
      }
    });
  }

  function init() {
    if (!elements.form || !elements.tableBody) {
      console.error("7FRAME dashboard: required HTML elements were not found.");
      return;
    }

    applicants = loadApplicants();

    // Seed demo data on first visit. Existing stored records are preserved.
    try {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
      }
    } catch (error) {
      console.warn("Browser storage is unavailable; changes may not persist.", error);
    }

    updateDashboardDate();
    setupEvents();
    renderAll();
  }

  init();
})();
