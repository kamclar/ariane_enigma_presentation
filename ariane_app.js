(function(){
  "use strict";

  const contents = window.ARIANE_CONTENTS || {};
  const languages = [
    { code: "en", label: "EN" },
    { code: "cs", label: "CZ" }
  ];

  const IDENTITY = {
    logoSrc: "images/uochb-iocb-prague-logo.png",
    logoAlt: "ÚOCHB IOCB Prague"
  };

  if (!contents.en && !contents.cs) {
    document.body.innerHTML = "<p>Missing ARIANE content files.</p>";
    return;
  }

  let currentLang = chooseInitialLanguage();
  let notesHidden = false;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  function chooseInitialLanguage() {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (contents[hash]) return hash;
    const saved = window.localStorage && localStorage.getItem("arianeEnigmaDeckLanguage");
    if (saved && contents[saved]) return saved;
    return contents.en ? "en" : Object.keys(contents)[0];
  }

  function setLanguage(lang) {
    if (!contents[lang] || lang === currentLang) return;
    currentLang = lang;
    if (window.localStorage) localStorage.setItem("arianeEnigmaDeckLanguage", lang);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", `#${lang}`);
    } else {
      window.location.hash = lang;
    }
    renderDeck();
  }

  function renderDeckMark(content) {
    const mark = el("div", "deck-mark");

    const img = document.createElement("img");
    img.src = content.deck.logoSrc || IDENTITY.logoSrc;
    img.alt = content.deck.logoAlt || IDENTITY.logoAlt;
    mark.appendChild(img);

    if (content.deck.authorName) {
      mark.appendChild(el("div", "author-name", content.deck.authorName));
    }
    if (content.deck.authorGroup) {
      mark.appendChild(el("div", "author-group", content.deck.authorGroup));
    }

    return mark;
  }

  function renderNotes(slide, content) {
    if (!slide.notes || !slide.notes.length) return null;
    const notes = el("div", "notes");
    notes.appendChild(el("div", "lab", content.deck.notesLabel || "Presenter notes"));
    slide.notes.forEach(note => notes.appendChild(el("p", "", note)));
    return notes;
  }

  function renderBlock(block) {
    const wrap = el("div");

    if (block.type === "paragraphs") {
      block.items.forEach(text => wrap.appendChild(el("p", "", text)));
      return wrap;
    }

    if (block.heading) wrap.appendChild(el("h3", "", block.heading));

    if (block.type === "list") {
      const ul = el("ul");
      block.items.forEach(item => ul.appendChild(el("li", "", item)));
      wrap.appendChild(ul);
      return wrap;
    }

    if (block.type === "numbered") {
      const ol = el("ol", "numbered");
      block.items.forEach(item => ol.appendChild(el("li", "", item)));
      wrap.appendChild(ol);
      return wrap;
    }

    if (block.type === "table") {
      const table = el("table", "tbl");
      if (block.columns && block.columns.length) {
        const thead = el("thead");
        const tr = el("tr");
        block.columns.forEach(col => tr.appendChild(el("th", "", col)));
        thead.appendChild(tr);
        table.appendChild(thead);
      }
      const tbody = el("tbody");
      block.rows.forEach(row => {
        const tr = el("tr");
        row.forEach(cell => tr.appendChild(el("td", "", cell)));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      return wrap;
    }

    if (block.type === "cards") {
      const grid = el("div", "cards");
      block.items.forEach(item => {
        const card = el("article", "card");
        if (item.label) card.appendChild(el("div", "card-label", item.label));
        if (item.title) card.appendChild(el("h4", "", item.title));
        if (item.variant) card.appendChild(el("div", "card-variant", item.variant));
        if (item.items && item.items.length) {
          const ul = el("ul");
          item.items.forEach(text => ul.appendChild(el("li", "", text)));
          card.appendChild(ul);
        }
        if (item.result) card.appendChild(el("div", "card-result", item.result));
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      return wrap;
    }

    if (block.type === "scale") {
      const scale = el("div", "scale");
      block.items.forEach((item, index) => {
        const cell = el("div", `s${index + 1}`);
        cell.appendChild(el("div", "bar5"));
        cell.appendChild(el("div", "t", item));
        scale.appendChild(cell);
      });
      wrap.appendChild(scale);
      return wrap;
    }

    if (block.type === "callout") {
      wrap.className = "callout";
      wrap.appendChild(el("p", "", block.text));
      return wrap;
    }

    if (block.type === "flow") {
      const flow = el("div", "flow");
      block.items.forEach((item, index) => {
        const nodeClass = ["n"];
        if (index === 0) nodeClass.push("first");
        if (index === block.items.length - 1) nodeClass.push("last");
        flow.appendChild(el("div", nodeClass.join(" "), item));
        if (index < block.items.length - 1) flow.appendChild(el("div", "a"));
      });
      wrap.appendChild(flow);
      return wrap;
    }

    if (block.type === "keyValues") {
      const kv = el("div", "kv");
      block.items.forEach(item => {
        const row = el("div");
        row.appendChild(el("div", "k", item.key));
        const value = el("div", "v");
        if (item.href) {
          const a = el("a", "", item.value);
          a.href = item.href;
          value.appendChild(a);
        } else if (item.valueHtml) {
          value.innerHTML = item.valueHtml;
        } else {
          value.textContent = item.value;
        }
        row.appendChild(value);
        kv.appendChild(row);
      });
      wrap.appendChild(kv);
      return wrap;
    }

    if (block.type === "media") {
      const media = el("div", "media");
      if (block.src) {
        media.classList.add("has-image");
        const img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt || "";
        media.appendChild(img);
      } else {
        const placeholder = el("div", "media-placeholder");
        placeholder.appendChild(el("div", "t", block.label || "Screenshot"));
        placeholder.appendChild(el("div", "d", block.description || ""));
        media.appendChild(placeholder);
      }
      return media;
    }

    if (block.type === "scope") {
      const scope = el("div", "scope");
      const current = el("div");
      current.appendChild(el("div", "k", block.currentLabel));
      current.appendChild(el("div", "v", block.current));
      const future = el("div");
      future.appendChild(el("div", "k", block.futureLabel));
      future.appendChild(el("div", "v", block.future));
      scope.append(current, future);
      return scope;
    }

    return wrap;
  }

  function renderTitleSlide(slide, content) {
    const fragment = document.createDocumentFragment();
    const section = el("section", "slide title-slide");

    const head = el("div", "head");
    head.appendChild(el("div"));
    head.appendChild(renderDeckMark(content));
    section.appendChild(head);

    if (slide.kicker) section.appendChild(el("div", "kicker", slide.kicker));
    section.appendChild(el("h1", "", slide.title));
    if (slide.subtitle) section.appendChild(el("p", "subtitle", slide.subtitle));

    if (slide.meta && slide.meta.length) {
      const meta = el("div", "meta");
      slide.meta.forEach(item => {
        const cell = el("div");
        cell.appendChild(el("div", "k", item.key));
        const value = el("div", "v");
        if (item.href) {
          const a = el("a", "", item.value);
          a.href = item.href;
          value.appendChild(a);
        } else if (item.valueHtml) {
          value.innerHTML = item.valueHtml;
        } else {
          value.textContent = item.value;
        }
        cell.appendChild(value);
        meta.appendChild(cell);
      });
      section.appendChild(meta);
    }

    fragment.appendChild(section);
    const notes = renderNotes(slide, content);
    if (notes) fragment.appendChild(notes);
    return fragment;
  }

  function renderSlide(slide, content) {
    const fragment = document.createDocumentFragment();

    if (slide.layout === "title") {
      return renderTitleSlide(slide, content);
    }

    if (slide.layout === "image-only") {
      const section = el("section", "slide image-only");
      const img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.alt || slide.title || "";
      section.appendChild(img);
      fragment.appendChild(section);
      const notes = renderNotes(slide, content);
      if (notes) fragment.appendChild(notes);
      return fragment;
    }

    const section = el("section", `slide ${slide.layout || "standard"}`);

    const head = el("div", "head");
    const titleBlock = el("div", "title-block");
    titleBlock.appendChild(el("div", "kicker", slide.kicker));
    titleBlock.appendChild(el("h2", "", slide.title));
    head.appendChild(titleBlock);
    head.appendChild(renderDeckMark(content));
    section.appendChild(head);

    if (slide.layout === "wide") {
      const stack = el("div", "stack");
      (slide.blocks || []).forEach(block => stack.appendChild(renderBlock(block)));
      section.appendChild(stack);
    } else {
      const cols = el("div", "cols");
      [slide.left, slide.right].forEach(column => {
        const stack = el("div", "stack");
        (column || []).forEach(block => stack.appendChild(renderBlock(block)));
        cols.appendChild(stack);
      });
      section.appendChild(cols);
    }

    fragment.appendChild(section);
    const notes = renderNotes(slide, content);
    if (notes) fragment.appendChild(notes);
    return fragment;
  }

  function renderDeck() {
    const content = contents[currentLang];
    document.documentElement.lang = currentLang;
    document.title = content.deck.title || "ARIANE";
    document.body.classList.toggle("hide-notes", notesHidden);

    const root = document.getElementById("deck-root");
    root.innerHTML = "";

    const bar = el("div", "bar");
    const who = el("div", "who");
    const authorParts = [content.deck.authorName, content.deck.authorGroup].filter(Boolean).join(" · ");
    const byline = authorParts ? ` <span class="bar-author">${authorParts}</span>` : "";
    who.innerHTML = `<b>${content.deck.headerTitle}</b> &nbsp;&middot;&nbsp; ${content.deck.headerSubtitle}${byline}`;

    const controls = el("div", "controls");
    const available = languages.filter(lang => contents[lang.code]);
    if (available.length > 1) {
      const langGroup = el("div", "lang-switch");
      available.forEach(lang => {
        const btn = el("button", "btn lang-btn", lang.label);
        btn.type = "button";
        btn.setAttribute("aria-pressed", String(lang.code === currentLang));
        btn.classList.toggle("active", lang.code === currentLang);
        btn.addEventListener("click", () => setLanguage(lang.code));
        langGroup.appendChild(btn);
      });
      controls.appendChild(langGroup);
    }

    const toggle = el("button", "btn", notesHidden ? (content.deck.notesShow || "Show notes") : (content.deck.notesHide || "Hide notes"));
    toggle.id = "toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", String(notesHidden));
    toggle.addEventListener("click", function(){
      notesHidden = !notesHidden;
      document.body.classList.toggle("hide-notes", notesHidden);
      toggle.setAttribute("aria-pressed", String(notesHidden));
      toggle.textContent = notesHidden ? (content.deck.notesShow || "Show notes") : (content.deck.notesHide || "Hide notes");
    });

    controls.appendChild(toggle);
    bar.append(who, controls);
    root.appendChild(bar);

    content.slides.forEach(slide => root.appendChild(renderSlide(slide, content)));
    if (content.deck.footer) root.appendChild(el("div", "foot", content.deck.footer));
  }

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (contents[hash] && hash !== currentLang) {
      currentLang = hash;
      renderDeck();
    }
  });

  renderDeck();
})();
