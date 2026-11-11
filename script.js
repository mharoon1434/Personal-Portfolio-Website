const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const intro = $('#intro'), who = $('#who'), site = $('#site');
const LABEL = { hero: 'Story', explore: 'Explore', moments: 'Moments', skills: 'Skills', originals: 'Projects', about: 'About', end: 'Contact' };

/* Colour mode: used by the mode choice and the header Dark / Light switch */
function setTheme(mode) {
  document.documentElement.dataset.theme = mode;
  $$('.theme-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === mode)));
}

/* Section links in the header, in the order of the chosen profile */
function buildLinks(order) {
  $('#navLinks').innerHTML = order.split(' ').concat('end')
    .map(id => `<a href="#${id}">${LABEL[id]}</a>`).join('');
}

$$('.theme-btn').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.set)));
setTheme('dark');
buildLinks('hero explore moments skills originals about');

/* Intro: the name meets in the middle, moves up, then the photo, hook and Play appear */
setTimeout(() => intro.classList.add('up'), reduced ? 0 : 1900);

/* Show "Who's watching?" and force a reflow so the slide-up transition plays */
function showWho() {
  who.hidden = false;
  who.offsetHeight;
  who.classList.add('show');
}

/* Play: hook and button drop away, then Who's Watching rises from the bottom */
$('#playBtn').addEventListener('click', () => {
  intro.classList.add('leaving');
  setTimeout(() => { intro.hidden = true; showWho(); }, reduced ? 0 : 700);
});

/* Who's watching: choosing a profile orders the sections for that profile and opens the site.
   The Dark / Light choice is in the header. */
$$('.profile').forEach(btn => btn.addEventListener('click', () => {
  $$('.profile').forEach(b => b.classList.toggle('sel', b === btn));
  btn.dataset.order.split(' ').forEach((id, i) => { $('#' + id).style.order = i + 1; });
  buildLinks(btn.dataset.order);
  who.classList.remove('show');
  setTimeout(() => { who.hidden = true; site.hidden = false; scrollTo(0, 0); }, reduced ? 0 : 700);
}));

/* Play Intro (hero page): replay the opening animation from the top */
$('#heroPlay').addEventListener('click', () => {
  site.hidden = true;
  who.classList.remove('show');
  who.hidden = true;
  intro.classList.remove('up', 'leaving');
  intro.hidden = false;
  scrollTo(0, 0);
  setTimeout(() => intro.classList.add('up'), reduced ? 0 : 1900);
});

$('#switchBtn').addEventListener('click', () => {
  site.hidden = true;
  showWho();
});

/* Arrow buttons for horizontal tracks */
$$('.arrow').forEach(btn => btn.addEventListener('click', () => {
  const t = document.getElementById(btn.dataset.target);
  t.scrollBy({ left: +btn.dataset.dir * t.clientWidth * .8, behavior: reduced ? 'auto' : 'smooth' });
}));

/* Skill genres */
$$('.genre').forEach(btn => btn.addEventListener('click', () => {
  $$('.genre').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
  $$('.gpanel').forEach(p => p.hidden = true);
  document.getElementById(btn.dataset.g).hidden = false;
}));

/* Copy email */
$('#copyBtn').addEventListener('click', () => {
  const btn = $('#copyBtn');
  navigator.clipboard?.writeText($('#mail').textContent).catch(() => {});
  btn.textContent = 'Copied';
  setTimeout(() => btn.textContent = 'Copy', 1500);
});

/* Slides enter from the left and reset when they leave the view, so they replay
   whether you scroll down or back up */
const io = new IntersectionObserver(
  entries => entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting)),
  { threshold: .15 }
);
$$('.slide').forEach(el => io.observe(el));

/* Projects: the card rail scrolls sideways. Hover over it and use the mouse wheel, or drag with a mouse.
   At either end of the rail the wheel goes back to scrolling the page. */
const rail = $('#rail');
rail.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const max = rail.scrollWidth - rail.clientWidth;
  if ((e.deltaY < 0 && rail.scrollLeft <= 0) || (e.deltaY > 0 && rail.scrollLeft >= max - 1)) return;
  e.preventDefault();
  rail.scrollLeft += e.deltaY;
}, { passive: false });

let dragging = false, dragMoved = false, dragStartX = 0, dragStartLeft = 0;
rail.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;
  dragging = true;
  dragMoved = false;
  dragStartX = e.clientX;
  dragStartLeft = rail.scrollLeft;
  rail.classList.add('drag');
});
addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - dragStartX;
  if (Math.abs(dx) > 4) dragMoved = true;
  rail.scrollLeft = dragStartLeft - dx;
});
addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;
  rail.classList.remove('drag');
});
/* A drag should not also open a project link */
rail.addEventListener('click', e => {
  if (dragMoved) { e.preventDefault(); e.stopPropagation(); }
}, true);

/* Red cursor dot (mouse only) */
if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cur = $('#cur');
  let tx = -100, ty = -100, cx = -100, cy = -100;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
  (function follow() {
    cx += (tx - cx) * .25;
    cy += (ty - cy) * .25;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(follow);
  })();
}
