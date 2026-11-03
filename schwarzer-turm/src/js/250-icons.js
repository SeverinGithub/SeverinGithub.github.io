/* ---------- icons ---------- */
const ICON={
sword:'<path d="M19 2l3 1-1 3L9 17l-2-2z"/><path d="M4 14l6 6-1.5 1.5-6-6z"/><path d="M5 18l-3 4" stroke="currentColor" stroke-width="2.4"/>',
great:'<path d="M20 1l3 0 0 3L10 18l-4-4z"/><path d="M3 13l8 8-1.6 1.6-8-8z"/><path d="M5 19l-3.5 3.5" stroke="currentColor" stroke-width="2.6"/>',
dagger:'<path d="M17 4l3 0 0 3-7 7-3-3z"/><path d="M8 11l5 5-1.4 1.4-5-5z"/><path d="M8 16l-4 4" stroke="currentColor" stroke-width="2.2"/>',
axe:'<path d="M4 21L16 7" stroke="currentColor" stroke-width="2.2"/><path d="M13 3c4-1 8 2 8 7l-3 1-6-6z"/>',
mace:'<path d="M4 21L15 9" stroke="currentColor" stroke-width="2.2"/><circle cx="17" cy="7" r="4.5"/><path d="M17 1v2M23 7h-2M21.5 2.5l-1.5 1.5"/>',
spear:'<path d="M3 21L18 6" stroke="currentColor" stroke-width="1.8"/><path d="M22 2l-1 7-3-3-3-3z"/>',
staff:'<path d="M5 22L17 6" stroke="currentColor" stroke-width="2"/><circle cx="18.5" cy="4.5" r="3.2"/>',
helm:'<path d="M4 15c0-6 3.5-10 8-10s8 4 8 10v4h-5v-4h-6v4H4z"/><path d="M11.5 3v3" stroke="currentColor" stroke-width="2"/>',
armor:'<path d="M7 3l5 2 5-2 4 4-3 3v11H6V10L3 7z"/>',
gloves:'<path d="M7 22v-8L5 9l2-1 2 3V4h2v7-8h2v8-7h2v8l2-3 2 1-3 7v6z"/>',
boots:'<path d="M7 3h6v11l7 3v4H5v-3l2-1z"/>',
belt:'<rect x="2" y="9" width="20" height="6" rx="1"/><rect x="9" y="7.5" width="6" height="9" fill="none" stroke="currentColor" stroke-width="1.6"/>',
ring:'<circle cx="12" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M9 6l3-4 3 4-3 3z"/>',
amulet:'<path d="M5 3c0 6 3 9 7 10 4-1 7-4 7-10" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M12 12l4 5-4 5-4-5z"/>',
shield:'<path d="M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5z"/>',
potL:'<path d="M9 2h6v2h-1v4c3 1 5 3.5 5 7a7 7 0 01-14 0c0-3.5 2-6 5-7V4H9z" style="fill:#c42a1c"/>',
potM:'<path d="M9 2h6v2h-1v4c3 1 5 3.5 5 7a7 7 0 01-14 0c0-3.5 2-6 5-7V4H9z" style="fill:#2a64e0"/>',
whirl:'<path d="M12 3a9 9 0 019 9h-3a6 6 0 00-6-6zM12 21a9 9 0 01-9-9h3a6 6 0 006 6z"/><path d="M8 8l8 8" stroke="currentColor" stroke-width="2.2"/>',
fire:'<path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4 2-7 2 1 3 3 3 5 1-3 1-6 1-10z" style="fill:#ff8a2a"/>',
nova:'<circle cx="12" cy="12" r="8" fill="none" stroke="#bfe2ff" stroke-width="2.4"/><path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="#bfe2ff" stroke-width="1.2"/>',
charge:'<path d="M2 12h12M4 7h9M4 17h9" stroke="currentColor" stroke-width="2"/><path d="M14 5l8 7-8 7z"/>',
ward:'<path d="M12 2l8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5z" fill="none" stroke="#e8e2d0" stroke-width="2"/><path d="M8 11h8M12 7v9" stroke="#e8e2d0" stroke-width="2"/>',
chain:'<path d="M14 1L5 13h6l-2 10 10-13h-6z" style="fill:#cfe0ff"/>',
flask:'<path d="M9 2h6v3l-1 1v3c3 1 5 3.5 5 7a7 7 0 01-14 0c0-3.5 2-6 5-7V6L9 5z" style="fill:#ffb347"/>'};
const icon=(k,col)=>`<svg viewBox="0 0 24 24" fill="currentColor" style="color:${col||'currentColor'}" aria-hidden="true">${ICON[k]||''}</svg>`;

