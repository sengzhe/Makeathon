export function mountScene({root}) {
  const card = document.createElement('div'); card.className = 'film-slate';
  card.textContent = 'This short depicts war and death. It contains no graphic gore.';
  root.append(card);
  return {render() {}, dispose() {card.remove();}};
}
