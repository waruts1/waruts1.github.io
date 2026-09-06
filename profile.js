(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  if (!data) {
    console.error('PORTFOLIO_DATA is not available. profile.data.js must load first.');
    return;
  }

  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const arr = (value) => Array.isArray(value) ? value : [];

  function renderHero() {
    $('name').textContent = data.name || '';
    $('tagline').textContent = data.tagline || '';
    $('hero-summary').textContent = data.about || '';
    $('location').textContent = data.location || '';
    $('about-text').textContent = data.about || '';
    $('contact-intro').textContent = 'For software engineering, cybersecurity, architecture, assurance, or delivery-focused work, get in touch.';
    $('footer-text').textContent = `© ${new Date().getFullYear()} ${data.name || ''}`;

    const highlights = arr(data.highlights);
    $('hero-stats').innerHTML = highlights.slice(0, 3).map((item) => `<div class="stat-card rounded-2xl p-4"><p class="text-sm leading-6 text-white/85">${esc(item)}</p></div>`).join('');

    const tracks = arr(data.careerTracks);
    $('focus-areas').innerHTML = tracks.map((track) => `<span class="focus-chip text-sm font-semibold text-white">${esc(track.label || track.title)}</span>`).join('');
    $('hero-certifications').innerHTML = arr(data.certifications).slice(0, 3).map((item) => `<div class="rounded-xl bg-white/10 p-3">${esc(item)}</div>`).join('');

    $('value-points').innerHTML = highlights.slice(0, 6).map((item) => `<div class="rounded-2xl border border-border bg-white/50 p-4 dark:bg-slate-900/40"><p class="font-semibold">${esc(item)}</p></div>`).join('');

    $('contact-links').innerHTML = [
      data.contact?.email ? `<a class="block rounded-xl border border-border p-4 font-semibold hover:border-primary" href="mailto:${esc(data.contact.email)}">${esc(data.contact.email)}</a>` : '',
      data.contact?.linkedin ? `<a class="block rounded-xl border border-border p-4 font-semibold hover:border-primary" target="_blank" rel="noopener" href="${esc(data.contact.linkedin)}">LinkedIn</a>` : '',
      data.contact?.github ? `<a class="block rounded-xl border border-border p-4 font-semibold hover:border-primary" target="_blank" rel="noopener" href="${esc(data.contact.github)}">GitHub</a>` : ''
    ].join('');

    $('footer-links').innerHTML = [
      data.contact?.linkedin ? `<a href="${esc(data.contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : '',
      data.contact?.github ? `<a href="${esc(data.contact.github)}" target="_blank" rel="noopener">GitHub</a>` : ''
    ].join('');
  }

  function renderExperience(filter = 'all') {
    const jobs = arr(data.experience).filter((job) => filter === 'all' || String(job.category || 'software').toLowerCase() === filter);
    $('experience-container').innerHTML = jobs.map((job) => `
      <article class="surface-card rounded-[1.75rem] p-6 shadow-card">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div><p class="section-kicker">${esc(job.category === 'cyber' ? 'Cybersecurity' : 'Software Engineering')}</p><h3 class="mt-2 font-display text-2xl font-semibold">${esc(job.title)}</h3><p class="mt-1 font-semibold text-primary">${esc(job.company)}</p></div>
          <div class="text-sm text-muted-foreground sm:text-right"><p>${esc(job.dates)}</p><p>${esc(job.location)}</p></div>
        </div>
        <ul class="mt-5 space-y-2 text-muted-foreground">${arr(job.responsibilities).map((x) => `<li class="flex gap-2"><span class="text-primary">•</span><span>${esc(x)}</span></li>`).join('')}</ul>
        ${arr(job.achievements).length ? `<div class="mt-5"><p class="font-semibold">Selected achievements</p><ul class="mt-2 space-y-2 text-muted-foreground">${arr(job.achievements).map((x) => `<li class="flex gap-2"><span class="text-accent">✓</span><span>${esc(x)}</span></li>`).join('')}</ul></div>` : ''}
        <div class="mt-5 flex flex-wrap gap-2">${arr(job.skills).map((x) => `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">${esc(x)}</span>`).join('')}</div>
      </article>`).join('');
  }

  function renderProjects(filter = 'all') {
    const projects = arr(data.projects).filter((project) => filter === 'all' || String(project.category || 'software').toLowerCase() === filter);
    $('projects-container').innerHTML = projects.map((project) => {
      const links = [project.url, project.github].filter(Boolean);
      return `<article role="listitem" class="surface-card rounded-[1.75rem] p-6 shadow-card hover:shadow-card-hover transition-all">
        <p class="section-kicker">${esc(project.category === 'cyber' ? 'Cybersecurity' : 'Software')}</p>
        <h3 class="mt-3 font-display text-2xl font-semibold">${esc(project.name)}</h3>
        <p class="mt-3 leading-7 text-muted-foreground">${esc(project.description)}</p>
        <div class="mt-5 flex flex-wrap gap-2">${arr(project.tech).map((x) => `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">${esc(x)}</span>`).join('')}</div>
        ${links.length ? `<div class="mt-5 flex flex-wrap gap-3">${links.map((url, index) => `<a class="text-sm font-bold text-primary hover:underline" target="_blank" rel="noopener" href="${esc(url)}">${index === 0 && project.url ? 'View project' : 'GitHub'}</a>`).join('')}</div>` : ''}
      </article>`;
    }).join('');
  }

  function renderSkills() {
    const groups = [
      ['Security & Assurance', ['security','cyber','audit','risk','compliance','penetration','forensics','owasp','iam','zero trust','nist','iso','pci','siem','burp','nmap','nessus']],
      ['Engineering & APIs', ['java','python','javascript','typescript','php','api','microservices','distributed','spring','temporal','kafka','redis','sql','laravel']],
      ['Cloud & Platform', ['aws','gcp','kubernetes','docker','openshift','gitops','flux','helm','jenkins','sonarqube','apigee','linux']],
      ['Product & Frontend', ['vue','node','vite','pusher','streamlit','figma','sap']]
    ];
    const skills = arr(data.skills);
    $('skills-container').innerHTML = groups.map(([title, keywords]) => {
      const items = skills.filter((skill) => keywords.some((keyword) => skill.toLowerCase().includes(keyword)));
      if (!items.length) return '';
      return `<div class="rounded-2xl border border-border p-5"><h3 class="font-display text-xl font-semibold">${esc(title)}</h3><div class="mt-4 flex flex-wrap gap-2">${items.map((x) => `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">${esc(x)}</span>`).join('')}</div></div>`;
    }).join('');
  }

  function renderCredentials() {
    $('certifications-container').innerHTML = arr(data.certifications).map((x) => `<div class="surface-card rounded-[1.25rem] p-4 shadow-card"><p class="section-kicker">Credential</p><p class="mt-2 font-semibold">${esc(x)}</p></div>`).join('');
    const education = arr(data.education);
    $('education-container').innerHTML = education.length ? education.map((item) => `<div class="surface-card rounded-[1.25rem] p-4 shadow-card"><p class="section-kicker">${esc(item.institution || item.school || '')}</p><p class="mt-2 font-semibold">${esc(item.degree || item.title || item.program || item)}</p></div>`).join('') : '<p class="text-muted-foreground">Education details available on request.</p>';
  }

  function setupFilters() {
    $('profileFilter')?.addEventListener('change', (event) => renderExperience(event.target.value));
    $('projectFilter')?.addEventListener('change', (event) => renderProjects(event.target.value));
  }

  function setupTheme() {
    const button = $('themeToggle');
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    button?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('portfolio-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  function setupContact() {
    const form = $('contact-form');
    const status = $('contact-status');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = 'Sending…';
      const payload = {
        name: $('contact-name').value.trim(),
        email: $('contact-email').value.trim(),
        message: $('contact-message').value.trim()
      };
      try {
        const response = await fetch('https://smilescafe.co.ke/api/v1/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        status.textContent = 'Message sent successfully.';
        form.reset();
      } catch (error) {
        console.error(error);
        status.textContent = 'Unable to send the message right now. Please try email instead.';
      }
    });
  }

  function init() {
    renderHero();
    renderExperience('all');
    renderProjects('all');
    renderSkills();
    renderCredentials();
    setupFilters();
    setupTheme();
    setupContact();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
