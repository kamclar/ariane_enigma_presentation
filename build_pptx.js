// Build ARIANE_for_ENIGMA.pptx from the HTML deck content (ariane_content_en.js).
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const DECK_DIR = "F:/UOCHB/Enigma/ARIANE_presentation ready/presentation-ENIGMA";
const OUT = path.join(DECK_DIR, "ARIANE_for_ENIGMA.pptx");

// ---------- content ----------
const sb = {}; sb.window = sb;
vm.runInContext(fs.readFileSync(path.join(DECK_DIR, "ariane_content_en.js"), "utf8"), vm.createContext(sb));
const content = sb.ARIANE_CONTENTS.en;
const script = fs.readFileSync(path.join(DECK_DIR, "speaker_script_en.md"), "utf8");
const scriptBySlide = {};
script.split(/^## Slide (\d+)\s*$/m).slice(1).forEach((chunk, i, arr) => { if (i % 2 === 0) scriptBySlide[Number(chunk)] = (arr[i + 1] || "").trim(); });

// ---------- theme ----------
const THEME = {
  name: "ARIANE",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B0B0B", lt1: "FFFFFF", dk2: "1F3A4D", lt2: "F3F5F7",
    accent1: "15697A", accent2: "E25A1C", accent3: "5B8DEF", accent4: "52514E", accent5: "9AA5B1", accent6: "DCE3E8",
    hlink: "15697A", folHlink: "52514E",
  },
};
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Kamila Clarová"; pres.title = "ARIANE for ENIGMA"; pres.subject = "Implementation of ENIGMA BRCA1/2 VCEP v1.2";
const C = pres.SchemeColor;
const W = 13.33, H = 7.5, M = 0.55;
const LOGO = path.join(DECK_DIR, "images/uochb-iocb-prague-logo.png");

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE", background: { color: "FFFFFF" },
  objects: [
    { image: { x: W - M - 2.3, y: M, w: 2.3, h: 0.825, path: LOGO } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: "FFFFFF" },
  objects: [
    { image: { x: W - M - 1.75, y: 0.42, w: 1.75, h: 0.628, path: LOGO } },
    { text: { text: "Kamila Clarová", options: { x: W - M - 3.9, y: 1.2, w: 3.9, h: 0.26, fontSize: 10, bold: true, color: C.text1, align: "right", margin: 0 } } },
    { text: { text: "Jiří Vondrášek Group, IOCB Prague", options: { x: W - M - 3.9, y: 1.44, w: 3.9, h: 0.24, fontSize: 9, color: C.accent4, align: "right", margin: 0 } } },
    { text: { text: "ARIANE for ENIGMA", options: { x: M, y: H - 0.42, w: 4, h: 0.26, fontSize: 9, color: C.accent5, margin: 0 } } },
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.42, w: 6, h: 0.26, fontSize: 9, color: C.accent1, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.66, w: 8.6, h: 0.95, fontSize: 30, bold: false, color: C.text2, margin: 0, valign: "top", align: "left" }, text: "" } },
  ],
  slideNumber: { x: W - M - 0.6, y: H - 0.42, w: 0.6, h: 0.26, fontSize: 9, color: C.accent5, align: "right" },
});

// ---------- helpers ----------
const CPI = (pt) => 138 / pt;                 // chars per inch, Calibri, conservative
const LH = (pt) => (pt * 1.26) / 72;          // line height in inches
function estLines(text, widthIn, pt) { return Math.max(1, Math.ceil(String(text).length / (widthIn * CPI(pt)))); }
function estTextH(text, widthIn, pt) { return estLines(text, widthIn, pt) * LH(pt); }
function estHeadH(text, widthIn, pt) { return Math.max(1, Math.ceil(String(text).length / (widthIn * (165 / pt)))) * LH(pt); }
function stripHtml(s) { return String(s).replace(/<br\s*\/?>/gi, "\n").replace(/<small>(.*?)<\/small>/g, " ($1)").replace(/<[^>]+>/g, ""); }
function splitSmall(s) { const t = String(s).replace(/<br\s*\/?>/gi, "\n"); const m = t.match(/^(.*?)<small>(.*?)<\/small>$/s); return m ? { main: m[1], small: m[2] } : { main: stripHtml(t), small: null }; }

// Height of a block at a given body font size (inches), width in inches.
function blockHeight(b, w, pt) {
  const headH = b.heading ? 0.32 : 0;
  switch (b.type) {
    case "paragraphs": return b.items.reduce((a, t) => a + estTextH(t, w, pt) + 0.08, 0) + 0.05;
    case "list": return headH + b.items.reduce((a, t) => a + estTextH(t, w - 0.3, pt) + 0.06, 0) + 0.08;
    case "numbered": return headH + b.items.reduce((a, t) => a + estTextH(t, w - 0.35, pt) + 0.08, 0) + 0.08;
    case "keyValues": return headH + b.items.reduce((a, it) => { const v = splitSmall(it.valueHtml || it.value || ""); return a + 0.22 + estTextH(v.main, w, pt) + (v.small ? estTextH(v.small, w, pt - 2) : 0) + 0.14; }, 0);
    case "callout": return 0.3 + estTextH(b.text, w - 0.4, pt - 0.5) + 0.3;
    case "flow": return headH + b.items.reduce((a, t) => a + estTextH(t, w - 0.6, pt - 0.5) + 0.26, 0) + 0.05;
    case "table": {
      const cols = b.columns.length; const wFirst = Math.min(w * 0.36, 2.3); const wRest = (w - wFirst) / (cols - 1);
      const rowH = (row) => Math.max(...row.map((cell, i) => estTextH(cell, (i === 0 ? wFirst : wRest) - 0.16, pt - 1))) + 0.14;
      return headH + rowH(b.columns) + b.rows.reduce((a, r) => a + rowH(r), 0) + 0.05;
    }
    default: return 0.4;
  }
}

function addHeading(slide, text, x, y, w) {
  slide.addText(text.toUpperCase(), { x, y, w, h: 0.26, fontSize: 9, color: C.accent1, charSpacing: 1.5, margin: 0, isTextBox: true });
  slide.addShape(pres.ShapeType.line, { x, y: y + 0.28, w, h: 0, line: { color: THEME.colors.accent6, width: 0.75 } });
  return 0.34;
}

function renderBlock(slide, b, x, y, w, pt) {
  let cy = y;
  if (b.heading && b.type !== "callout") cy += addHeading(slide, b.heading, x, cy, w);
  switch (b.type) {
    case "paragraphs": {
      const h = blockHeight(b, w, pt);
      slide.addText(b.items.map((t, i) => ({ text: t, options: { breakLine: i < b.items.length - 1, paraSpaceAfter: 6 } })),
        { x, y: cy, w, h, fontSize: pt, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      return cy + h - y;
    }
    case "list": case "numbered": {
      const h = blockHeight({ ...b, heading: null }, w, pt);
      const items = b.items.map((t, i) => ({ text: t, options: { bullet: b.type === "numbered" ? { type: "number" } : { code: "2013" }, breakLine: i < b.items.length - 1, paraSpaceAfter: 5, indentLevel: 0 } }));
      slide.addText(items, { x, y: cy, w, h, fontSize: pt, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      return cy + h - y;
    }
    case "keyValues": {
      const runs = [];
      b.items.forEach((it, i) => {
        const v = splitSmall(it.valueHtml || it.value || "");
        runs.push({ text: String(it.key).toUpperCase(), options: { fontSize: 8.5, color: C.accent4, charSpacing: 1.5, breakLine: true, paraSpaceBefore: i ? 7 : 0 } });
        const mains = v.main.split("\n");
        mains.forEach((line, k) => {
          const last = k === mains.length - 1;
          if (it.href) runs.push({ text: line, options: { fontSize: pt, color: C.accent1, hyperlink: { url: it.href }, breakLine: !last || !!v.small || i < b.items.length - 1 } });
          else runs.push({ text: line, options: { fontSize: pt, color: C.text1, breakLine: !last || !!v.small || i < b.items.length - 1 } });
        });
        if (v.small) runs.push({ text: v.small, options: { fontSize: pt - 2, color: C.accent4, breakLine: i < b.items.length - 1 } });
      });
      const h = blockHeight({ ...b, heading: null }, w, pt);
      slide.addText(runs, { x, y: cy, w, h, valign: "top", margin: 0, isTextBox: true });
      return cy + h - y;
    }
    case "callout": {
      const h = blockHeight(b, w, pt);
      slide.addShape(pres.ShapeType.roundRect, { x, y: cy, w, h, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.06 });
      const runs = [];
      if (b.heading) runs.push({ text: b.heading.toUpperCase(), options: { fontSize: 8.5, color: C.accent1, charSpacing: 1.5, breakLine: true, paraSpaceAfter: 4 } });
      runs.push({ text: b.text, options: { fontSize: pt - 0.5, color: C.accent4 } });
      slide.addText(runs, { x: x + 0.2, y: cy + 0.12, w: w - 0.4, h: h - 0.24, valign: "top", margin: 0, isTextBox: true });
      return cy + h - y;
    }
    case "flow": {
      let fy = cy;
      b.items.forEach((t, i) => {
        const th = estTextH(t, w - 0.6, pt - 0.5) + 0.16;
        slide.addShape(pres.ShapeType.roundRect, { x, y: fy, w, h: th, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.05 });
        slide.addText(String(i + 1), { x: x + 0.1, y: fy, w: 0.35, h: th, fontSize: pt, bold: true, color: C.accent1, valign: "middle", margin: 0, isTextBox: true });
        slide.addText(t, { x: x + 0.45, y: fy + 0.06, w: w - 0.55, h: th - 0.12, fontSize: pt - 0.5, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
        fy += th + 0.1;
      });
      return fy - y;
    }
    case "table": {
      const cols = b.columns.length; const wFirst = Math.min(w * 0.36, 2.3); const wRest = (w - wFirst) / (cols - 1);
      const colW = [wFirst, ...Array(cols - 1).fill(wRest)];
      const head = b.columns.map((c) => ({ text: c, options: { bold: true, fontSize: pt - 1, color: C.text2, fill: { color: C.background2 } } }));
      const rows = b.rows.map((r) => r.map((cell, i) => ({ text: cell, options: { fontSize: pt - 1, color: i === 0 ? C.accent1 : C.text1, fontFace: i === 0 ? "Consolas" : undefined } })));
      const h = blockHeight({ ...b, heading: null }, w, pt);
      slide.addTable([head, ...rows], { x, y: cy, w, colW, fontSize: pt - 1, border: { type: "solid", pt: 0.5, color: THEME.colors.accent6 }, margin: 0.05, valign: "middle", autoPage: false });
      return cy + h - y;
    }
  }
  return 0.3;
}

function fitFont(blocks, w, availH, start = 13) {
  for (let pt = start; pt >= 10; pt -= 0.5) {
    const total = blocks.reduce((a, b) => a + blockHeight(b, w, pt) + 0.22, 0);
    if (total <= availH) return pt;
  }
  return 10;
}
function renderColumn(slide, blocks, x, y, w, availH, pt) {
  let cy = y;
  blocks.forEach((b) => { cy += renderBlock(slide, b, x, cy, w, pt) + 0.22; });
  return cy;
}

function notesFor(s, n) {
  const parts = [];
  if (scriptBySlide[n]) parts.push(scriptBySlide[n]);
  if (s.notes && s.notes.length) parts.push("Notes:\n" + s.notes.map((t) => "- " + t).join("\n"));
  return parts.join("\n\n");
}

// ---------- sections ----------
const SECTIONS = [["What ARIANE is", 1], ["Criteria and automation", 4], ["Provenance, updates, architecture", 7], ["Validation and Phase 2", 11]];
SECTIONS.forEach(([t]) => pres.addSection({ title: t }));
const sectionOf = (n) => SECTIONS.filter(([, start]) => n >= start).pop()[0];

// ---------- slides ----------
const TOP = 1.95, BOTTOM = H - 0.6;
content.slides.forEach((s, idx) => {
  const n = idx + 1;
  if (s.layout === "title") {
    const slide = pres.addSlide({ masterName: "TITLE", sectionTitle: sectionOf(n) });
    slide.addText("ARIANE", { x: M, y: 2.0, w: 9, h: 1.3, fontSize: 60, fontFace: THEME.headFontFace, color: C.text2, margin: 0, isTextBox: true });
    slide.addText(s.subtitle, { x: M, y: 3.35, w: 9.5, h: 0.9, fontSize: 18, color: C.accent4, margin: 0, isTextBox: true });
    slide.addShape(pres.ShapeType.line, { x: M, y: 4.5, w: W - 2 * M, h: 0, line: { color: THEME.colors.accent6, width: 0.75 } });
    const colW = (W - 2 * M) / s.meta.length;
    s.meta.forEach((m, i) => {
      const v = splitSmall(m.valueHtml || m.value || "");
      const runs = [{ text: m.key.toUpperCase(), options: { fontSize: 8.5, color: C.accent4, charSpacing: 1.5, breakLine: true, paraSpaceAfter: 3 } }];
      if (m.href) runs.push({ text: v.main, options: { fontSize: 13, color: C.accent1, hyperlink: { url: m.href }, breakLine: !!v.small } });
      else runs.push({ text: v.main, options: { fontSize: 13, color: C.text1, breakLine: !!v.small } });
      if (v.small) runs.push({ text: v.small, options: { fontSize: 10.5, color: C.accent4 } });
      slide.addText(runs, { x: M + i * colW, y: 4.7, w: colW - 0.3, h: 1.4, valign: "top", margin: 0, isTextBox: true });
    });
    slide.addNotes(notesFor(s, n));
    return;
  }
  const slide = pres.addSlide({ masterName: "CONTENT", sectionTitle: sectionOf(n) });
  slide.addText(s.kicker.toUpperCase(), { placeholder: "kicker" });
  slide.addText(s.title, { placeholder: "title", fontSize: s.title.length > 44 ? 26 : 30 });
  slide.addNotes(notesFor(s, n));

  if (s.layout === "image-only") {
    const imgW = 865, imgH = 1167; const availH = BOTTOM - TOP + 0.3; const h = availH; const w = (h * imgW) / imgH;
    slide.addImage({ path: path.join(DECK_DIR, s.src), x: (W - w) / 2, y: TOP - 0.3, w, h });
    return;
  }
  if (s.layout === "wide") {
    const wFull = W - 2 * M;
    const cards = s.blocks.find((b) => b.type === "cards");
    const others = s.blocks.filter((b) => b.type !== "cards");
    let cy = TOP;
    // paragraphs above the cards
    const before = s.blocks.slice(0, s.blocks.indexOf(cards));
    const after = s.blocks.slice(s.blocks.indexOf(cards) + 1);
    before.forEach((b) => { cy += renderBlock(slide, b, M, cy, wFull, 13) + 0.18; });
    const afterH = after.reduce((a, b) => a + blockHeight(b, wFull, 12) + 0.15, 0);
    const cardsH = BOTTOM - cy - afterH - 0.1;
    const gap = 0.3; const n = cards.items.length; const cw = (wFull - gap * (n - 1)) / n;
    cards.items.forEach((card, i) => {
      const cx = M + i * (cw + gap);
      slide.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: cardsH, fill: { color: "FFFFFF" }, line: { color: THEME.colors.accent6, width: 0.75 }, rectRadius: 0.05 });
      const inner = cw - 0.5; let ky = cy + 0.2;
      slide.addText((card.label || "").toUpperCase(), { x: cx + 0.25, y: ky, w: inner, h: 0.24, fontSize: 8.5, color: C.accent1, charSpacing: 1.5, margin: 0, isTextBox: true }); ky += 0.26;
      const titleH = estHeadH(card.title, inner, 18) + 0.05;
      slide.addText(card.title, { x: cx + 0.25, y: ky, w: inner, h: titleH, fontSize: 18, fontFace: THEME.headFontFace, color: C.text2, margin: 0, valign: "top", isTextBox: true }); ky += titleH + 0.05;
      if (card.variant) { const vh = estTextH(card.variant, inner, 10) + 0.04; slide.addText(card.variant, { x: cx + 0.25, y: ky, w: inner, h: vh, fontSize: 10, fontFace: "Consolas", color: C.accent4, margin: 0, isTextBox: true }); ky += vh + 0.08; }
      const resultH = card.result ? estTextH(card.result, inner, 11.5) + 0.1 : 0;
      const listAvail = cy + cardsH - 0.2 - resultH - ky - 0.15;
      let pt = 12; while (pt > 9 && blockHeight({ type: "list", items: card.items }, inner, pt) > listAvail) pt -= 0.5;
      const items = card.items.map((t, j) => ({ text: t, options: { bullet: { code: "2013" }, breakLine: j < card.items.length - 1, paraSpaceAfter: 4 } }));
      slide.addText(items, { x: cx + 0.25, y: ky, w: inner, h: listAvail, fontSize: pt, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      if (card.result) {
        slide.addShape(pres.ShapeType.line, { x: cx + 0.25, y: cy + cardsH - 0.2 - resultH - 0.08, w: inner, h: 0, line: { color: THEME.colors.accent6, width: 0.75 } });
        slide.addText(card.result, { x: cx + 0.25, y: cy + cardsH - 0.2 - resultH, w: inner, h: resultH, fontSize: 11.5, bold: true, color: C.text1, valign: "top", margin: 0, isTextBox: true });
      }
    });
    cy += cardsH + 0.15;
    after.forEach((b) => { cy += renderBlock(slide, b, M, cy, wFull, 12) + 0.15; });
    return;
  }
  // two columns
  const gap = 0.5; const total = W - 2 * M;
  const split = s.layout === "literature" ? 0.5 : 0.5;
  const wL = (total - gap) * split, wR = total - gap - wL;
  const availH = BOTTOM - TOP;
  const ptL = fitFont(s.left || [], wL, availH), ptR = fitFont(s.right || [], wR, availH);
  const pt = Math.min(ptL, ptR);
  renderColumn(slide, s.left || [], M, TOP, wL, availH, pt);
  renderColumn(slide, s.right || [], M + wL + gap, TOP, wR, availH, pt);
});

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("written", OUT);
})();
