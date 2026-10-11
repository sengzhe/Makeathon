// Visible production slate. Replace through the owning scene module.
export function placeholder(root, title, description) {
  const slate = document.createElement('div'); slate.className = 'film-slate';
  const heading = document.createElement('h1'); heading.textContent = title;
  const copy = document.createElement('p'); copy.textContent = description;
  const status = document.createElement('small'); status.textContent = 'Animation pending';
  slate.append(heading, copy, status); root.append(slate);
  return {render() {}, dispose() {slate.remove();}};
}
