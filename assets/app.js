(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // Year
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Theme
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;

  const applyTheme = (t) => {
    root.dataset.theme = t;
    localStorage.setItem("theme", t);
  };

  if (savedTheme) applyTheme(savedTheme);
  else applyTheme(systemPrefersLight ? "light" : "dark");

  const toggleBtn = $("#themeToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
    });
  }

  // Copy contacts (edit to your real values)
  const copyBtn = $("#copyContacts");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = [
        "Антон Шишикин — Junior Backend (Golang)",
        "Москва",
        "GitHub: https://github.com/AntonShishikin",
        "Telegram: @zxc666hopeless",
        "Email: antonsh154@gmail.com",
      ].join("\n");

      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Скопировано ✓";
        setTimeout(() => (copyBtn.textContent = "Скопировать контакты"), 1400);
      } catch {
        copyBtn.textContent = "Не получилось :(";
        setTimeout(() => (copyBtn.textContent = "Скопировать контакты"), 1400);
      }
    });
  }

  // Projects search
  const search = $("#projectSearch");
  const grid = $("#projectsGrid");

  const filterProjects = (q) => {
    const query = (q || "").trim().toLowerCase();
    const cards = $$(".project");
    cards.forEach((card) => {
      const text = (card.innerText || "").toLowerCase();
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const ok = !query || text.includes(query) || tags.includes(query);
      card.style.display = ok ? "" : "none";
    });
  };

  if (search) {
    search.addEventListener("input", (e) => filterProjects(e.target.value));
  }

  // Load repos from GitHub
  const loadBtn = $("#loadGithub");
  const GH_USER = "AntonShishikin";

  const repoCard = (repo) => {
    const el = document.createElement("article");
    el.className = "card project";
    el.setAttribute("data-tags", [
      repo.language || "",
      ...(repo.topics || []),
      "github",
      "repo"
    ].join(" ").toLowerCase());

    const desc = repo.description ? repo.description : "Описание не указано.";
    const lang = repo.language ? repo.language : "—";
    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;

    el.innerHTML = `
      <h3>
        <a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name} ↗</a>
      </h3>
      <p>${escapeHtml(desc)}</p>
      <div class="pillrow">
        <span class="pill">${escapeHtml(lang)}</span>
        <span class="pill">★ ${stars}</span>
        ${repo.fork ? `<span class="pill">fork</span>` : ``}
      </div>
    `;
    return el;
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  async function loadGithubRepos() {
    if (!grid) return;

    loadBtn.disabled = true;
    loadBtn.textContent = "Загрузка…";

    try {
      // topics требуют preview заголовок; GitHub сейчас часто отдает topics без него,
      // но на всякий случай ставим Accept.
      const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=12&sort=updated`, {
        headers: { "Accept": "application/vnd.github+json" }
      });

      if (!res.ok) throw new Error("GitHub API error");
      const repos = await res.json();

      // Очищаем стартовые карточки и рендерим новые
      grid.innerHTML = "";
      repos
        .filter(r => !r.archived)
        .slice(0, 12)
        .forEach((repo) => grid.appendChild(repoCard(repo)));

      loadBtn.textContent = "Обновлено ✓";
      setTimeout(() => (loadBtn.textContent = "Подгрузить с GitHub"), 1400);
    } catch (e) {
      loadBtn.textContent = "Ошибка загрузки";
      setTimeout(() => (loadBtn.textContent = "Подгрузить с GitHub"), 1400);
    } finally {
      loadBtn.disabled = false;
    }
  }

  if (loadBtn) loadBtn.addEventListener("click", loadGithubRepos);
})();
