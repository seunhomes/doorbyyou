/* ============================================================
   PANES — Homepage render (preview products + reviews)
   ============================================================ */
(function () {
  const P = window.PANES;
  const { DOORS, PATIO, WINDOWS, doorSceneHTML, patioSVG, windowSVG } = P;

  const pick = (arr, name) => arr.find(x => x.name === name) || arr[0];

  // hero door — bold chevron in matte black
  const hero = pick(DOORS, 'Chevron');
  const heroDoor = document.getElementById('heroDoor');
  if (heroDoor) heroDoor.innerHTML = doorSceneHTML(hero);

  const catDoor = document.getElementById('catDoor');
  if (catDoor) catDoor.innerHTML = doorSceneHTML(pick(DOORS, 'Quattro'));

  const catPatio = document.getElementById('catPatio');
  if (catPatio) catPatio.innerHTML = patioSVG(pick(PATIO, 'Three Panel Slider'));

  const catWindow = document.getElementById('catWindow');
  if (catWindow) catWindow.innerHTML = windowSVG(pick(WINDOWS, 'Casement'));

  const teaserDoor = document.getElementById('teaserDoor');
  if (teaserDoor) teaserDoor.innerHTML = doorSceneHTML(pick(DOORS, 'Versailles'));

  /* reviews */
  const REVIEWS = [
    { t: 'The configurator made it painless — I picked my size, finish and glass and saw the price instantly. The door arrived perfectly crated and dropped right in.', n: 'Marcus T.', l: 'Fiberglass Chevron · Austin, TX' },
    { t: 'Half the price of the local showroom quote for a better-built door. The matte black finish is flawless inside and out and the multi-point lock feels like a vault.', n: 'Priya R.', l: 'Steel Uno Flush · Denver, CO' },
    { t: 'We added sidelites and a transom and the whole entry feels custom. Being able to preview it on a photo of our actual house sealed the decision.', n: 'Dana &amp; Will', l: 'Versailles + surrounds · Raleigh, NC' },
  ];
  const star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>';
  const revs = document.getElementById('reviews');
  if (revs) revs.innerHTML = REVIEWS.map(r => `
    <div class="rev">
      <div class="stars">${star.repeat(5)}</div>
      <p>“${r.t}”</p>
      <div class="who"><div class="av">${r.n.trim()[0]}</div><div><b>${r.n}</b><span>${r.l}</span></div></div>
    </div>`).join('');
})();
