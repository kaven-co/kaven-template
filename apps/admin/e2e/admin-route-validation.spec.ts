import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ValidationRow = {
  route: string;
  menu_path: string;
  status: 'PASS' | 'FAIL';
  console_errors: string;
  network_errors: string;
  dropdown_ok: string;
  notification_icon_ok: string;
  a11y_keyboard_ok: string;
  theme_ok: string;
  notes: string;
  evidence_path: string;
};

type Defect = {
  id: string;
  severity: 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW';
  route: string;
  title: string;
  reproduction: string;
  evidence: string;
};

const LOCALE = process.env.ADMIN_LOCALE ?? 'pt';
const ADMIN_EMAIL = process.env.ADMIN_E2E_EMAIL ?? 'admin@kaven.dev';
const ADMIN_PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? 'ArchitectDev123!';

const DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/analytics',
  '/dashboard/banking',
  '/dashboard/booking',
  '/access-requests',
  '/approvals',
  '/audit-logs',
  '/contact',
  '/currencies',
  '/currencies/new',
  '/currencies/test',
  '/docs',
  '/faq',
  '/features',
  '/features/new',
  '/help',
  '/invites',
  '/observability',
  '/plans',
  '/plans/new',
  '/plans/plan_fake_id',
  '/policies',
  '/pricing',
  '/products',
  '/products/new',
  '/products/product_fake_id',
  '/roles',
  '/saas-settings',
  '/security/2fa-reset',
  '/security/masking',
  '/settings',
  '/settings/notifications',
  '/settings/profile',
  '/tenants',
  '/tenants/create',
  '/tenants/tenant-fake-slug',
  '/users',
  '/users/cards',
  '/users/create',
  '/users/new',
  '/users/user_fake_id',
];

const AUTH_AND_MISC_ROUTES = [
  '/login',
  '/logout',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/2fa-setup',
  '/coming-soon',
  '/maintenance',
  '/setup',
];

const EXTERNAL_LINKS = [
  { name: 'Grafana', url: 'http://localhost:3004' },
  { name: 'Prometheus', url: 'http://localhost:9090' },
  { name: 'Platform Wiki', url: 'http://localhost:3002/docs/platform' },
  { name: 'Design System', url: 'http://localhost:3002/docs/design-system' },
];

const OUTPUT_BASE = path.resolve(process.cwd(), '..', '..', 'docs', 'qa');
const SCREENSHOT_DIR = path.join(OUTPUT_BASE, 'screenshots', 'admin');
const MATRIX_CSV = path.join(OUTPUT_BASE, 'admin-route-matrix.csv');
const REPORT_MD = path.join(OUTPUT_BASE, 'admin-route-validation-report.md');
const DEFECT_LOG_MD = path.join(OUTPUT_BASE, 'admin-defect-log.md');

const rows: ValidationRow[] = [];
const defects: Defect[] = [];

function routeToSlug(route: string): string {
  return route.replace(/^\//, '').replace(/\//g, '__') || 'root';
}

function toCsvCell(input: string): string {
  const escaped = input.replaceAll('"', '""');
  return `"${escaped}"`;
}

async function login(page: Page): Promise<void> {
  const loginResponse = await page.request.post('http://localhost:8000/api/auth/login', {
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (loginResponse.status() >= 400) {
    throw new Error(`Admin API login failed with ${loginResponse.status()}`);
  }

  const payload = await loginResponse.json();
  const accessToken: string = payload.accessToken;
  const refreshToken: string = payload.refreshToken;
  const user = payload.user;

  await page.addInitScript(
    ({ at, rt, u }) => {
      window.localStorage.setItem('access_token', at);
      window.localStorage.setItem('refresh_token', rt);
      window.localStorage.setItem(
        'kaven-auth',
        JSON.stringify({
          state: { user: u },
          version: 0,
        })
      );
    },
    { at: accessToken, rt: refreshToken, u: user }
  );

  await page.goto(`/${LOCALE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(new RegExp(`/${LOCALE}/dashboard`), { timeout: 20000 });
  await page.waitForTimeout(600);
}

function pushDefect(defect: Omit<Defect, 'id'>): void {
  defects.push({ id: `DEF-${String(defects.length + 1).padStart(3, '0')}`, ...defect });
}

function recordRow(row: ValidationRow): void {
  rows.push(row);
}

function ensureOutputDirs(): void {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function validateRoute(page: Page, route: string, menuPath = 'direct'): Promise<void> {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  const notes: string[] = [];

  const onConsole = (msg: { type: () => string; text: () => string }): void => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const ignore404Noise =
        text.includes('Failed to load resource: the server responded with a status of 404') &&
        (text.includes('fake_id') || text.includes('tenant-fake-slug') || text.includes('user_fake_id'));
      if (!ignore404Noise) {
        consoleErrors.push(text);
      }
    }
  };

  const onResponse = (response: { status: () => number; url: () => string }): void => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      const isExpectedFakeDataNotFound =
        status === 404 &&
        (url.includes('fake_id') || url.includes('tenant-fake-slug') || url.includes('user_fake_id'));
      const ignorable =
        (url.includes('/api/tenant') && status === 401 && route.startsWith('/login')) ||
        isExpectedFakeDataNotFound;
      if (!ignorable) {
        networkErrors.push(`${status} ${url}`);
      }
    }
  };

  page.on('console', onConsole);
  page.on('response', onResponse);

  const slug = routeToSlug(route);
  const fullPath = `/${LOCALE}${route}`;
  const evidencePath = path.join('docs', 'qa', 'screenshots', 'admin', `${slug}.png`);

  let status: 'PASS' | 'FAIL' = 'PASS';

  try {
    await page.goto(fullPath, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toBeVisible();

    const hasFatalText = await page
      .locator('text=Application error, text=Unhandled Runtime Error, text=Something went wrong')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasFatalText) {
      status = 'FAIL';
      notes.push('fatal runtime overlay detected');
      pushDefect({
        severity: 'BLOCKER',
        route,
        title: 'Runtime fatal error on route render',
        reproduction: `Open ${fullPath}`,
        evidence: evidencePath,
      });
    }

    if (consoleErrors.length > 0) {
      status = 'FAIL';
      notes.push(`console errors: ${consoleErrors.length}`);
      pushDefect({
        severity: 'HIGH',
        route,
        title: 'Console errors present on route',
        reproduction: `Open ${fullPath} and inspect browser console`,
        evidence: evidencePath,
      });
    }

    if (networkErrors.length > 0) {
      status = 'FAIL';
      notes.push(`network errors: ${networkErrors.length}`);
      pushDefect({
        severity: 'HIGH',
        route,
        title: 'Unhandled network errors on route',
        reproduction: `Open ${fullPath} and inspect network requests`,
        evidence: evidencePath,
      });
    }

  } catch (error) {
    status = 'FAIL';
    const message = error instanceof Error ? error.message : String(error);
    notes.push(`route validation exception: ${message}`);
    pushDefect({
      severity: 'BLOCKER',
      route,
      title: 'Route validation crashed',
      reproduction: `Open ${fullPath}`,
      evidence: evidencePath,
    });
  } finally {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${slug}.png`), fullPage: true }).catch(() => undefined);
    recordRow({
      route,
      menu_path: menuPath,
      status,
      console_errors: consoleErrors.join(' | ') || 'none',
      network_errors: networkErrors.join(' | ') || 'none',
      dropdown_ok: 'n/a',
      notification_icon_ok: 'n/a',
      a11y_keyboard_ok: 'n/a',
      theme_ok: 'n/a',
      notes: notes.join('; ') || 'ok',
      evidence_path: evidencePath,
    });
    page.off('console', onConsole);
    page.off('response', onResponse);
  }
}

async function validateHeaderCriticals(page: Page): Promise<void> {
  const route = '/dashboard';
  const fullPath = `/${LOCALE}${route}`;
  await page.goto(fullPath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const header = page.locator('header').first();
  await header.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);

  const bellIcon = page.locator('header .lucide-bell').first();
  const notificationTrigger = page.locator('header button').filter({ has: bellIcon }).first();

  let dropdownOk = true;
  let notificationIconOk = true;
  let keyboardOk = true;
  let themeOk = true;
  const notes: string[] = [];

  const bellFound = (await bellIcon.count()) > 0;
  const bellVisible = bellFound && (await bellIcon.isVisible().catch(() => false));
  if (!bellFound || !bellVisible) {
    notificationIconOk = false;
    notes.push('bell icon not visible');
    pushDefect({
      severity: 'BLOCKER',
      route,
      title: 'Notification bell icon not visible',
      reproduction: `Open ${fullPath} and inspect header notification trigger`,
      evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
    });
  }

  if (bellVisible) {
    const color = await bellIcon.evaluate((el) => getComputedStyle(el).color).catch(() => 'unknown');
    const bg = await bellIcon.evaluate((el) => {
      const h = el.closest('header');
      return h ? getComputedStyle(h).backgroundColor : 'unknown';
    }).catch(() => 'unknown');
    if (color === bg) {
      notificationIconOk = false;
      notes.push('bell icon low contrast against header background');
      pushDefect({
        severity: 'HIGH',
        route,
        title: 'Notification bell low contrast',
        reproduction: `Open ${fullPath}, compare bell color with header background`,
        evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
      });
    }
  }

  const notificationPanel = page.locator('text=Notificações').first();
  if (bellFound) {
    await notificationTrigger.click({ force: true, timeout: 3000 }).catch(() => undefined);
    if (!(await notificationPanel.isVisible().catch(() => false))) {
      dropdownOk = false;
      notes.push('notification dropdown did not open on click');
      pushDefect({
        severity: 'BLOCKER',
        route,
        title: 'Notification dropdown fails to open',
        reproduction: `Open ${fullPath} and click bell trigger`,
        evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
      });
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    if (await notificationPanel.isVisible().catch(() => false)) {
      keyboardOk = false;
      dropdownOk = false;
      notes.push('notification dropdown did not close on Escape');
      pushDefect({
        severity: 'HIGH',
        route,
        title: 'Notification dropdown does not close with Escape',
        reproduction: `Open notification dropdown then press Escape`,
        evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
      });
    }
  } else {
    dropdownOk = false;
    notes.push('notification trigger unavailable');
  }

  const userAvatarTrigger = page
    .locator('header button')
    .filter({ has: page.locator('.ring-primary') })
    .first();
  const avatarCount = await userAvatarTrigger.count();
  const themeToggle = page.locator('text=Theme').first();
  if (avatarCount === 0) {
    dropdownOk = false;
    notes.push('user avatar trigger not found');
    pushDefect({
      severity: 'BLOCKER',
      route,
      title: 'User menu trigger not found',
      reproduction: `Open ${fullPath} and inspect topbar avatar trigger`,
      evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
    });
  } else {
    await userAvatarTrigger.click({ force: true, timeout: 3000 }).catch(() => undefined);
    if (!(await themeToggle.isVisible().catch(() => false))) {
      dropdownOk = false;
      notes.push('user menu did not open correctly');
      pushDefect({
        severity: 'BLOCKER',
        route,
        title: 'User menu dropdown fails to open',
        reproduction: `Open ${fullPath} and click avatar trigger`,
        evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
      });
    }

    const htmlBefore = await page.locator('html').getAttribute('class');
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click({ force: true });
      await page.waitForTimeout(200);
      const htmlAfter = await page.locator('html').getAttribute('class');
      if (htmlBefore === htmlAfter) {
        themeOk = false;
        notes.push('theme toggle did not change html class state');
        pushDefect({
          severity: 'HIGH',
          route,
          title: 'Theme toggle does not change runtime theme state',
          reproduction: `Open user menu, click Theme toggle`,
          evidence: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
        });
      }
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'dashboard__header-criticals.png'),
    fullPage: true,
  });

  recordRow({
    route,
    menu_path: 'header/topbar',
    status: dropdownOk && notificationIconOk && keyboardOk && themeOk ? 'PASS' : 'FAIL',
    console_errors: 'n/a',
    network_errors: 'n/a',
    dropdown_ok: dropdownOk ? 'PASS' : 'FAIL',
    notification_icon_ok: notificationIconOk ? 'PASS' : 'FAIL',
    a11y_keyboard_ok: keyboardOk ? 'PASS' : 'FAIL',
    theme_ok: themeOk ? 'PASS' : 'FAIL',
    notes: notes.join('; ') || 'ok',
    evidence_path: path.join('docs', 'qa', 'screenshots', 'admin', 'dashboard__header-criticals.png'),
  });
}

async function validateExternalLinks(page: Page): Promise<void> {
  for (const link of EXTERNAL_LINKS) {
    let status = 0;
    let statusLabel = '';
    try {
      const response = await page.request.get(link.url, { timeout: 5000, failOnStatusCode: false });
      status = response.status();
      statusLabel = String(status);
    } catch (error) {
      statusLabel = `REQUEST_ERROR ${error instanceof Error ? error.message : String(error)}`;
    }
    const pass = status > 0 && status < 400;

    const route = `external:${link.name}`;
    const evidence = path.join('docs', 'qa', 'screenshots', 'admin', `external__${routeToSlug(link.name)}.txt`);
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, `external__${routeToSlug(link.name)}.txt`),
      `${link.url} -> ${statusLabel}\n`,
      'utf-8'
    );

    if (!pass) {
      pushDefect({
        severity: 'HIGH',
        route,
        title: `External link unavailable: ${link.name}`,
        reproduction: `Request ${link.url}`,
        evidence,
      });
    }

    recordRow({
      route,
      menu_path: 'navigation/external',
      status: pass ? 'PASS' : 'FAIL',
      console_errors: 'n/a',
      network_errors: `${statusLabel} ${link.url}`,
      dropdown_ok: 'n/a',
      notification_icon_ok: 'n/a',
      a11y_keyboard_ok: 'n/a',
      theme_ok: 'n/a',
      notes: pass ? 'ok' : 'external service unavailable',
      evidence_path: evidence,
    });
  }
}

function writeArtifacts(): void {
  const header = [
    'route',
    'menu_path',
    'status',
    'console_errors',
    'network_errors',
    'dropdown_ok',
    'notification_icon_ok',
    'a11y_keyboard_ok',
    'theme_ok',
    'notes',
    'evidence_path',
  ];

  const csv = [
    header.map(toCsvCell).join(','),
    ...rows.map((row) =>
      [
        row.route,
        row.menu_path,
        row.status,
        row.console_errors,
        row.network_errors,
        row.dropdown_ok,
        row.notification_icon_ok,
        row.a11y_keyboard_ok,
        row.theme_ok,
        row.notes,
        row.evidence_path,
      ]
        .map(toCsvCell)
        .join(',')
    ),
  ].join('\n');
  fs.writeFileSync(MATRIX_CSV, `${csv}\n`, 'utf-8');

  const passCount = rows.filter((r) => r.status === 'PASS').length;
  const failCount = rows.filter((r) => r.status === 'FAIL').length;
  const blockerCount = defects.filter((d) => d.severity === 'BLOCKER').length;
  const highCount = defects.filter((d) => d.severity === 'HIGH').length;

  const report = [
    '# Admin Route Validation Report',
    '',
    `- Timestamp: ${new Date().toISOString()}`,
    `- Total checks: ${rows.length}`,
    `- PASS: ${passCount}`,
    `- FAIL: ${failCount}`,
    `- Blockers: ${blockerCount}`,
    `- High: ${highCount}`,
    '',
    '## Gate',
    '',
    failCount === 0 ? 'PASS' : 'FAIL',
    '',
    '## Notes',
    '',
    '- Artifacts generated from Playwright route sweep and header critical checks.',
    '- See matrix and defect log for detailed evidence.',
    '',
  ].join('\n');
  fs.writeFileSync(REPORT_MD, report, 'utf-8');

  const defectLogLines = [
    '# Admin Defect Log',
    '',
    `- Timestamp: ${new Date().toISOString()}`,
    '',
  ];

  if (defects.length === 0) {
    defectLogLines.push('No defects found.');
  } else {
    for (const defect of defects) {
      defectLogLines.push(`## ${defect.id} - ${defect.severity}`);
      defectLogLines.push(`- Route: ${defect.route}`);
      defectLogLines.push(`- Title: ${defect.title}`);
      defectLogLines.push(`- Reproduction: ${defect.reproduction}`);
      defectLogLines.push(`- Evidence: ${defect.evidence}`);
      defectLogLines.push('');
    }
  }

  fs.writeFileSync(DEFECT_LOG_MD, `${defectLogLines.join('\n')}\n`, 'utf-8');
}

test.describe.configure({ mode: 'serial' });

test.describe('Admin Full Route Validation', () => {
  test.beforeAll(() => {
    ensureOutputDirs();
  });

  test('validate all admin routes, header criticals, and external links', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    try {
      await login(page);

      await validateHeaderCriticals(page);

      for (const route of DASHBOARD_ROUTES) {
        await validateRoute(page, route, 'dashboard');
      }

      for (const route of AUTH_AND_MISC_ROUTES) {
        await validateRoute(page, route, 'auth/misc');
      }

      await validateExternalLinks(page);
    } finally {
      writeArtifacts();
    }

    const hasFails = rows.some((r) => r.status === 'FAIL');
    expect(hasFails, 'Route validation gate failed. See docs/qa/*.').toBeFalsy();
  });
});
