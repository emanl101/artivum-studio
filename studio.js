const projects = [
  { name: 'Studio Nord', domain: 'studio-nord.example', stage: 'Live', health: 'Erreichbar', payment: 'Überfällig', owner: 'Artivum', renewal: '7. Dez.', deadline: '4. Dez.' },
  { name: 'Atelier West', domain: 'atelier-west.example', stage: 'Live', health: 'Erreichbar', payment: 'In Bearbeitung', owner: 'Artivum' },
  { name: 'Haus am Park', domain: 'haus-am-park.example', stage: 'In Arbeit', health: 'Prüfung ausstehend', payment: 'Bezahlt', owner: 'Kunde' },
  { name: 'Morgenform', domain: 'morgenform.example', stage: 'Live', health: 'Störung', payment: 'Kein Abo', owner: 'Kunde' },
];

const views = {
  websites: ['Websites', 'Projektstand und Erreichbarkeit', () => true],
  live: ['Live-Websites', 'Veröffentlichte Websites und ihre Erreichbarkeit', project => project.stage === 'Live'],
  arbeit: ['In Arbeit', 'Websites in Entwicklung', project => project.stage === 'In Arbeit'],
  zahlungen: ['Zahlungen', 'Zahlungsstatus der Stripe-Abos', project => project.owner === 'Artivum'],
  ueberfaellig: ['Überfällige Zahlungen', 'Projekte mit abgelaufener Zahlungsfrist', project => project.payment === 'Überfällig'],
  domains: ['Domains', 'Inhaberverwaltung und Verlängerungsfristen', () => true],
  verlaengerungen: ['Domainverlängerungen', 'Bevorstehende Verlängerungen bei IONOS', project => Boolean(project.renewal)],
};

const metrics = [
  ['Live', 'live'],
  ['In Arbeit', 'arbeit'],
  ['Überfällige Zahlungen', 'ueberfaellig'],
  ['Anstehende Domainverlängerungen', 'verlaengerungen'],
];
const search = document.querySelector('#search');

document.querySelector('#metrics').innerHTML = metrics.map(([label, key]) => {
  const count = projects.filter(views[key][2]).length;
  return `<a class="metric" href="#${key}"><span>${label}</span><strong>${count}</strong></a>`;
}).join('');

function render() {
  const route = location.hash.slice(1);
  const [title, description, filter] = Object.hasOwn(views, route) ? views[route] : views.websites;
  const query = search.value.trim().toLocaleLowerCase('de');
  const results = projects.filter(filter).filter(({ name, domain }) =>
    `${name} ${domain}`.toLocaleLowerCase('de').includes(query)
  );
  document.querySelector('#section-title').textContent = title;
  document.querySelector('#section-description').textContent = description;
  document.querySelector('#empty').hidden = Boolean(results.length);
  document.querySelector('#result-count').textContent = `${results.length} Projekte gefunden`;
  document.querySelector('#records').innerHTML = results.length ? `
    <div class="record labels" aria-hidden="true"><span>Projekt</span><span>Technik</span><span>Zahlung</span><span>Domain</span></div>
    ${results.map(project => `
      <article class="record" aria-label="${project.name}">
        <div><strong>${project.name}</strong><small>${project.domain}</small></div>
        <div><span class="tag ${project.health === 'Störung' ? 'bad' : ''}">${project.stage}</span><small>${project.health}</small></div>
        <div><span class="tag ${project.payment === 'Überfällig' ? 'bad' : project.payment === 'In Bearbeitung' ? 'warn' : project.payment === 'Bezahlt' ? 'good' : ''}">${project.payment}</span></div>
        <div><span>${project.owner}</span><small>${project.renewal ? `Verlängerung am ${project.renewal} · Stopp bis ${project.deadline}` : project.owner === 'Artivum' ? 'IONOS' : 'Verwaltet der Kunde'} </small></div>
      </article>`).join('')}` : '';
  const current = { live: 'websites', arbeit: 'websites', ueberfaellig: 'zahlungen', verlaengerungen: 'domains' }[route] || route || 'uebersicht';
  for (const link of document.querySelectorAll('nav a')) {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function navigate() {
  search.value = '';
  render();
  if (Object.hasOwn(views, location.hash.slice(1))) {
    document.querySelector('#section-title').focus();
  }
}

search.addEventListener('input', render);
window.addEventListener('hashchange', navigate);
navigate();
