/** Convert clipboard typography to the two semantic styles supported by Baros.
 * Runs only on pasted HTML; Tiptap still owns parsing, marks and insertion.
 */
export function normalizeOperationPastedHTML(html: string): string {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const apple = /Apple-(?:converted-space|interchange-newline|style-span)|-apple-system|-apple-text|HelveticaNeue|UICTFontTextStyle|com\.apple\.Notes/i.test(html);

  // Notes on macOS can put typography in p.p1 / span.s1 stylesheet rules.
  // Read only presentation declarations. Never attach clipboard CSS to the app.
  const rules: Array<{ selector: string; style: CSSStyleDeclaration }> = [];
  for (const sheet of doc.querySelectorAll("style")) {
    for (const match of sheet.textContent?.matchAll(/([^{}]+)\{([^{}]*)\}/g) || []) {
      const declaration = doc.createElement("span");
      declaration.setAttribute("style", match[2]);
      rules.push({ selector: match[1].trim(), style: declaration.style });
    }
  }
  function property(element: HTMLElement, name: string): string {
    let current: HTMLElement | null = element;
    while (current) {
      const inline = current.style.getPropertyValue(name);
      if (inline) return inline;
      for (let index = rules.length - 1; index >= 0; index--) {
        try {
          if (current.matches(rules[index].selector)) {
            const value = rules[index].style.getPropertyValue(name);
            if (value) return value;
          }
        } catch { /* Unsupported external selectors do not block paste. */ }
      }
      if (name === "font-weight" && /^(B|STRONG)$/.test(current.tagName)) return "bold";
      current = current.parentElement;
    }
    return "";
  }
  function size(element: HTMLElement): number {
    const value = property(element, "font-size");
    const match = /^(\d+(?:\.\d+)?)(px|pt)$/i.exec(value.trim());
    return match ? Number(match[1]) * (match[2].toLowerCase() === "pt" ? 4 / 3 : 1) : 0;
  }
  function replaceTag(element: HTMLElement, tag: string) {
    if (element.tagName.toLowerCase() === tag) return;
    const replacement = doc.createElement(tag);
    for (const attribute of Array.from(element.attributes)) replacement.setAttribute(attribute.name, attribute.value);
    replacement.append(...Array.from(element.childNodes));
    element.replaceWith(replacement);
  }

  // Native Notes Title/Heading/Subheading HTML maps to Baros Heading/Subheading.
  for (const heading of doc.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")) {
    replaceTag(heading, /^H[12]$/.test(heading.tagName) ? "h2" : "h3");
  }
  if (apple) {
    for (const block of doc.querySelectorAll<HTMLElement>("p,div")) {
      // Only classify complete text blocks. Lists and mixed wrappers keep structure.
      if (block.closest("li,h2,h3") || block.querySelector("p,div,h1,h2,h3,h4,h5,h6,ul,ol,li,table,img")) continue;
      const walker = doc.createTreeWalker(block, 4 /* SHOW_TEXT */);
      const runs: HTMLElement[] = [];
      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.trim() && walker.currentNode.parentElement) runs.push(walker.currentNode.parentElement);
      }
      if (!runs.length) continue;
      const hints = runs.map(run => `${property(run, "font")} ${property(run, "font-family")}`);
      if (hints.every(hint => /-apple-system-(?:title\d*|headline)|UICTFontTextStyle(?:Title\d*|Headline)/i.test(hint))) {
        replaceTag(block, "h2");
      } else if (hints.every(hint => /-apple-system-subheadline|UICTFontTextStyleSubhead/i.test(hint))) {
        replaceTag(block, "h3");
      } else {
        const sizes = runs.map(size);
        const bold = runs.every(run => /^(bold|bolder|[6-9]00)$/i.test(property(run, "font-weight")));
        // Typical iOS sizes: 28/22/17 px; macOS exports 26/22/15 pt.
        // Require whole-block typography, so a bold word cannot change its paragraph.
        if (bold && sizes.every(value => value >= 21)) replaceTag(block, "h2");
        else if (bold && sizes.every(value => value >= 16 && value < 21)) replaceTag(block, "h3");
      }
    }
  }

  // Keep supported inline marks even when Notes expresses them as CSS classes.
  for (const element of Array.from(doc.body.querySelectorAll<HTMLElement>("span,p,div,h2,h3,a"))) {
    const weight = property(element, "font-weight");
    const italic = property(element, "font-style");
    const decoration = property(element, "text-decoration") || property(element, "text-decoration-line");
    const marks = [
      /^(bold|bolder|[6-9]00)$/i.test(weight) ? "strong" : "",
      /^(italic|oblique)$/i.test(italic) ? "em" : "",
      /underline/i.test(decoration) ? "u" : "",
    ].filter(Boolean);
    for (const tag of marks) {
      if (!element.childNodes.length) continue;
      const mark = doc.createElement(tag);
      mark.append(...Array.from(element.childNodes));
      element.append(mark);
    }
  }
  doc.querySelectorAll("style,meta,script,link").forEach(element => element.remove());
  return doc.body.innerHTML;
}
