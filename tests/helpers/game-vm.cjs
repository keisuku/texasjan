'use strict';

// A deliberately small Node adapter for the real game's scripts and event handlers.
// It has NO CSS layout, asset loading, animation, browser security or rendering engine.
// Rendering defaults to explicit no-ops. A focused smoke can enable the real
// renderCore() DOM writer while the animation/layout wrapper remains disabled.
// Use browser tests for UI claims.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const decode = text => String(text).replace(/&(?:amp|lt|gt|quot|#39|#\d+);/g, entity => {
  const known = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
  return known[entity] || String.fromCodePoint(Number(entity.slice(2, -1)));
});
const dataAttribute = key => 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
class Element {
  constructor(tag, owner) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = owner;
    this.attributes = {}; this.children = []; this.parentElement = null;
    this.listeners = {}; this.disabled = false; this.hidden = false; this.open = false;
    this.style = { setProperty(key, value) { this[key] = String(value); }, removeProperty(key) { delete this[key]; } };
    this.dataset = new Proxy({}, {
      get: (_, key) => this.getAttribute(dataAttribute(key)),
      set: (_, key, value) => { this.setAttribute(dataAttribute(key), value); return true; }
    });
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = Array.from(new Set(this.className.split(/\s+/).filter(Boolean).concat(names))).join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const add = force === undefined ? !this.classList.contains(name) : force;
        this.classList[add ? 'add' : 'remove'](name); return add;
      }
    };
  }
  get id() { return this.attributes.id || ''; } set id(v) { this.setAttribute('id', v); }
  get className() { return this.attributes.class || ''; } set className(v) { this.setAttribute('class', v); }
  get childElementCount() { return this.children.length; }
  get textContent() { return this.children.map(node => node.textContent).join('') || this._text || ''; }
  set textContent(value) { this.children.forEach(child => { child.parentElement = null; }); this.children = []; this._text = String(value); }
  get innerText() { return this.textContent; }
  get innerHTML() { return this._html || this.textContent; }
  set innerHTML(value) {
    this.textContent = ''; this._html = String(value);
    parseFragment(this._html, this, this.ownerDocument);
  }
  get isConnected() { let node = this; while (node.parentElement) node = node.parentElement; return node === this.ownerDocument; }
  setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'disabled') this.disabled = true; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  removeAttribute(name) { delete this.attributes[name]; if (name === 'disabled') this.disabled = false; }
  appendChild(child) { child.remove(); child.parentElement = this; this.children.push(child); return child; }
  append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(node => node !== this); this.parentElement = null; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  removeEventListener(type, handler) { this.listeners[type] = (this.listeners[type] || []).filter(fn => fn !== handler); }
  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.preventDefault ||= function() { this.defaultPrevented = true; };
    event.stopPropagation ||= function() { this.stopped = true; };
    for (let node = this; node; node = event.bubbles === false ? null : node.parentElement) {
      event.currentTarget = node;
      if (typeof node['on' + event.type] === 'function') node['on' + event.type](event);
      for (const listener of node.listeners[event.type] || []) listener(event);
      if (event.stopped) break;
    }
    return !event.defaultPrevented;
  }
  click() { if (!this.disabled) this.dispatchEvent({ type: 'click' }); }
  focus() { this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent({ type: 'close', bubbles: false }); }
  getBoundingClientRect() { throw new Error('Node VM adapter cannot verify layout; run browser regression for geometry'); }
  querySelectorAll(selector) {
    const found = [];
    const visit = node => { for (const child of node.children) { if (matches(child, selector)) found.push(child); visit(child); } };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (matches(node, selector)) return node; return null; }
}
function matches(element, selectors) {
  return selectors.split(',').some(selector => {
    const parts = selector.trim().split(/\s+(?![^[]*\])/);
    if (!simpleMatch(element, parts.pop())) return false;
    let ancestor = element.parentElement;
    while (parts.length) {
      const part = parts.pop();
      while (ancestor && !simpleMatch(ancestor, part)) ancestor = ancestor.parentElement;
      if (!ancestor) return false;
      ancestor = ancestor.parentElement;
    }
    return true;
  });
}
function simpleMatch(element, selector) {
  if (!selector || element.tagName === '#TEXT') return false;
  let valid = true;
  selector = selector.replace(/:not\(([^)]+)\)/g, (_, excluded) => { if (simpleMatch(element, excluded)) valid = false; return ''; });
  selector = selector.replace(/\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]/g, (_, name, value) => {
    if (!element.hasAttribute(name) || (value !== undefined && element.getAttribute(name) !== value)) valid = false;
    return '';
  });
  selector = selector.replace(/#([\w-]+)/g, (_, id) => { if (element.id !== id) valid = false; return ''; });
  selector = selector.replace(/\.([\w-]+)/g, (_, cls) => { if (!element.classList.contains(cls)) valid = false; return ''; });
  if (selector && selector !== '*' && element.tagName !== selector.toUpperCase()) valid = false;
  return valid;
}
function parseFragment(source, parent, owner) {
  const stack = [parent];
  const tokens = source.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]*>|[^<]+/g) || [];
  const voidTags = new Set(['META', 'LINK', 'BR', 'HR', 'IMG', 'INPUT', 'SOURCE', 'WBR', 'AREA', 'BASE', 'EMBED']);
  for (const token of tokens) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.slice(2).match(/^[\w-]+/)[0].toUpperCase();
      let index = stack.length - 1; while (index > 0 && stack[index].tagName !== tag) index--;
      if (index > 0) stack.length = index;
    } else if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/); if (!tag) continue;
      const element = new Element(tag[1], owner);
      const attributes = token.slice(tag[0].length, -1);
      for (const match of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        element.setAttribute(match[1], decode(match[2] ?? match[3] ?? match[4] ?? ''));
      }
      stack[stack.length - 1].appendChild(element);
      if (!voidTags.has(element.tagName) && !token.endsWith('/>')) stack.push(element);
    } else {
      const node = new Element('#text', owner); node.textContent = decode(token);
      stack[stack.length - 1].appendChild(node);
    }
  }
}

function createGame(root, seed = 20260907) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const document = new Element('#document', null); document.ownerDocument = document;
  parseFragment(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''), document, document);
  document.documentElement = document.querySelector('html'); document.body = document.querySelector('body');
  document.createElement = tag => new Element(tag, document);
  document.getElementById = id => document.querySelector('#' + id);
  document.readyState = 'complete'; document.activeElement = document.body;
  const storage = new Map(), timers = new Map(); let timerId = 0, randomSeed = seed >>> 0;
  const math = Object.create(Math);
  math.random = () => { randomSeed += 0x6D2B79F5; let t = randomSeed; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sandbox = {
    document, console, URLSearchParams, URL, Math: math, Date,
    location: { search: '?still=1&screen=title&deal=vm-' + seed, href: 'https://vm-test.invalid/?still=1&screen=title&deal=vm-' + seed },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
    Image: class { set src(value) { this._src = value; } },
    matchMedia: () => ({ matches: true }),
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: fn => { timers.set(++timerId, fn); return timerId; },
    cancelAnimationFrame: id => timers.delete(id),
    performance: { now: () => 0 },
    navigator: { language: 'ja-JP' },
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = (type, fn) => document.addEventListener(type, fn);
  const context = vm.createContext(sandbox);
  let scriptIndex = 0;
  const execute = (source, filename) => vm.runInContext(source, context, { filename, timeout: 60000 });
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = match[1].match(/\bsrc=["']([^"']+)["']/);
    let source = src ? fs.readFileSync(path.resolve(root, src[1]), 'utf8') : match[2];
    const filename = src ? src[1] : `index.html:inline-${++scriptIndex}`;
    if (/function renderCore\(/.test(source)) {
      source = source.replace('function renderCore(', 'function __productionRenderCore(');
      source += '\nfunction render(){if(window.__renderCoreEnabled)__productionRenderCore();}\n' +
        'function renderCore(){if(window.__renderCoreEnabled)__productionRenderCore();}\n';
    }
    execute(source, filename);
  }
  assert(document.getElementById('bRec').onclick, 'Actual recommendation button handler is installed');
  return {
    document, context, evaluate: source => execute(source, 'game-integration'),
    enableCoreRendering() { execute('window.__renderCoreEnabled=true;__productionRenderCore()', 'game-integration:render-core'); },
    state: source => JSON.parse(execute(`JSON.stringify(${source})`, 'game-integration')),
    click(id) { const el = document.getElementById(id); assert(el, `Real DOM id exists: ${id}`); el.click(); },
    flushTimers(limit = 100) { let count = 0; while (timers.size && count++ < limit) { const [id, fn] = timers.entries().next().value; timers.delete(id); fn(); } return count; }
  };
}
module.exports = { createGame };
