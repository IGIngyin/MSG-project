// Create a styled Edit button
export function createEditButton(onClick) {
  const button = document.createElement("button");
  button.className = "custom-edit-btn";
  button.innerHTML = `<i class="bi bi-pencil"></i> Edit`;
  button.onclick = onClick;
  button.setAttribute("aria-label", "Edit");
  return button;
}

// Create a styled Delete button
export function createDeleteButton(onClick) {
  const button = document.createElement("button");
  button.className = "custom-delete-btn";
  button.innerHTML = `<i class="bi bi-trash"></i> Delete`;
  button.onclick = onClick;
  button.setAttribute("aria-label", "Delete");
  return button;
}
