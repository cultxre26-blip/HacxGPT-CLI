#!/usr/bin/env node
/**
 * Home Base driver — interactive automation for the family command center
 *
 * Usage: node driver.mjs <command> [args...]
 *
 * Commands:
 *   launch <port>              Start local dev server and open in chromium-cli
 *   screenshot <path>          Take a screenshot and save to path
 *   click <selector>           Click an element
 *   type <selector> <text>     Type text into an input
 *   fill-form <field> <value>  Fill a form field (supports nested selectors)
 *   switch-tab <tab>           Switch to a tab (home|children|money)
 *   add-child <name> <year>    Add a child to the app
 *   add-transaction <type> <amount> <category> <desc>  Add a transaction
 *   add-routine <childName> <task>                      Add a routine
 *   get-state                  Print the current app state from localStorage
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const HOME_BASE_FILE = path.join(PROJECT_ROOT, 'home-base.html');

let browser, page, context;

async function launchApp(port = 8765) {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      executablePath: '/opt/pw-browsers/chromium',
      args: ['--disable-blink-features=AutomationControlled']
    });
    context = await browser.newContext();
    page = await context.newPage();
  }

  const fileUrl = `file://${HOME_BASE_FILE}`;
  console.log(`Opening Home Base from: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  console.log('Home Base loaded successfully');

  return { browser, page, context };
}

async function screenshot(filePath) {
  if (!page) throw new Error('App not launched. Call launch first.');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`Screenshot saved to: ${filePath}`);
}

async function clickElement(selector) {
  if (!page) throw new Error('App not launched');
  await page.click(selector);
  await page.waitForLoadState('networkidle');
  console.log(`Clicked: ${selector}`);
}

async function typeText(selector, text) {
  if (!page) throw new Error('App not launched');
  await page.focus(selector);
  await page.keyboard.type(text);
  console.log(`Typed into ${selector}: ${text}`);
}

async function switchTab(tabName) {
  if (!page) throw new Error('App not launched');
  const validTabs = ['home', 'children', 'money'];
  if (!validTabs.includes(tabName)) throw new Error(`Invalid tab: ${tabName}`);

  await page.click(`[data-tab="${tabName}"]`);
  await page.waitForLoadState('networkidle');
  console.log(`Switched to tab: ${tabName}`);
}

async function addChild(name, year) {
  if (!page) throw new Error('App not launched');

  await clickElement('button[onclick="openModal(\'child\')"]');
  await page.fill('#childName', name);
  await page.fill('#childYear', year.toString());
  await clickElement('button[onclick="saveChild()"]');
  await page.waitForLoadState('networkidle');
  console.log(`Added child: ${name} (born ${year})`);
}

async function addTransaction(type, amount, category, description) {
  if (!page) throw new Error('App not launched');

  // Switch to money tab if not there
  const currentTab = await page.getAttribute('[aria-current="page"]', 'data-tab');
  if (currentTab !== 'money') {
    await switchTab('money');
  }

  await clickElement('button[onclick="openModal(\'transaction\')"]');
  await page.waitForSelector(`button[id="type${type.charAt(0).toUpperCase() + type.slice(1)}"]`);

  if (type === 'income') {
    await clickElement('#typeIncome');
  } else {
    await clickElement('#typeExpense');
  }

  await page.fill('#txDesc', description);
  await page.fill('#txAmount', amount.toString());
  await page.selectOption('#txCat', category);
  // Date is auto-filled to today

  await clickElement('button[onclick="saveTransaction()"]');
  await page.waitForLoadState('networkidle');
  console.log(`Added ${type}: $${amount} in ${category} - ${description}`);
}

async function addRoutine(childName, task) {
  if (!page) throw new Error('App not launched');

  // Switch to children tab if not there
  const currentTab = await page.getAttribute('[aria-current="page"]', 'data-tab');
  if (currentTab !== 'children') {
    await switchTab('children');
  }

  await clickElement('button[onclick="openModal(\'routine\')"]');

  // Get the child ID by finding the child in state
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('homeBase.v1')));
  const child = Object.values(state.children).find(c => c.name === childName);
  if (!child) throw new Error(`Child not found: ${childName}`);

  await page.selectOption('#routineChild', child.id);
  await page.fill('#routineTask', task);

  await clickElement('button[onclick="saveRoutine()"]');
  await page.waitForLoadState('networkidle');
  console.log(`Added routine for ${childName}: ${task}`);
}

async function getState() {
  if (!page) throw new Error('App not launched');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('homeBase.v1')));
  return state;
}

async function cleanup() {
  if (context) await context.close();
  if (browser) await browser.close();
  console.log('Browser closed');
}

// CLI handler
async function main() {
  const [, , command, ...args] = process.argv;

  try {
    switch (command) {
      case 'launch':
        const port = args[0] || 8765;
        await launchApp(port);
        console.log('Press Ctrl+C to exit');
        await new Promise(() => {}); // Keep running
        break;

      case 'screenshot':
        const filePath = args[0];
        if (!filePath) throw new Error('screenshot requires a file path');
        await launchApp();
        await screenshot(filePath);
        await cleanup();
        break;

      case 'click':
        const selector = args[0];
        if (!selector) throw new Error('click requires a selector');
        await launchApp();
        await clickElement(selector);
        await cleanup();
        break;

      case 'type':
        const typeSelector = args[0];
        const text = args.slice(1).join(' ');
        if (!typeSelector || !text) throw new Error('type requires selector and text');
        await launchApp();
        await typeText(typeSelector, text);
        await cleanup();
        break;

      case 'switch-tab':
        const tab = args[0];
        if (!tab) throw new Error('switch-tab requires a tab name');
        await launchApp();
        await switchTab(tab);
        await cleanup();
        break;

      case 'add-child':
        const childName = args[0];
        const birthYear = args[1];
        if (!childName || !birthYear) throw new Error('add-child requires name and birth year');
        await launchApp();
        await addChild(childName, parseInt(birthYear));
        await cleanup();
        break;

      case 'add-transaction':
        const txType = args[0];
        const amount = args[1];
        const category = args[2];
        const desc = args.slice(3).join(' ');
        if (!txType || !amount || !category || !desc) {
          throw new Error('add-transaction requires: type amount category description');
        }
        await launchApp();
        await addTransaction(txType, parseFloat(amount), category, desc);
        await cleanup();
        break;

      case 'add-routine':
        const rChildName = args[0];
        const rTask = args.slice(1).join(' ');
        if (!rChildName || !rTask) throw new Error('add-routine requires child name and task');
        await launchApp();
        await addRoutine(rChildName, rTask);
        await cleanup();
        break;

      case 'get-state':
        await launchApp();
        const state = await getState();
        console.log(JSON.stringify(state, null, 2));
        await cleanup();
        break;

      default:
        console.log(`
Home Base Driver

Usage: node driver.mjs <command> [args...]

Commands:
  launch                           Start interactive browser
  screenshot <path>                Take screenshot
  click <selector>                 Click element
  type <selector> <text>           Type into input
  switch-tab <home|children|money> Switch tab
  add-child <name> <year>          Add child
  add-transaction <type> <amt> <cat> <desc>   Add transaction
  add-routine <childName> <task>   Add routine
  get-state                        Print localStorage state

Examples:
  node driver.mjs add-child Emma 2018
  node driver.mjs add-transaction income 2500 salary Monthly salary
  node driver.mjs add-routine Emma Brush teeth
        `);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await cleanup().catch(() => {});
    process.exit(1);
  }
}

main().catch(console.error);
