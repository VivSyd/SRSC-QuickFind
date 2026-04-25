const STORAGE_KEY = "budget-tracker-v1";
const FIXED_EXPENSES = 718;
const LIMITS = { groceries: 100, taxi: 100 };
const WEEKDAY_PAYDAY = "Wednesday";

const accountSeed = [
  { id: "westpac", name: "Westpac", balance: 0, role: "Income", isDefault: false },
  { id: "ing", name: "ING", balance: 0, role: "Rent + Utilities", isDefault: false },
  { id: "commonwealth", name: "Commonwealth", balance: 0, role: "Bills", isDefault: false },
  { id: "up", name: "Up", balance: 0, role: "Spending", isDefault: true },
  { id: "anz", name: "ANZ+", balance: 0, role: "Pet", isDefault: false },
  { id: "upSavers", name: "Up Savers", balance: 0, role: "Savers", isDefault: false },
  { id: "anoushka", name: "Anoushka", balance: 0, role: "Transfer", isDefault: false }
];

const splitRuleSeed = [
  { id: "split-rent", accountId: "ing", amount: 380, label: "Rent", priority: 1 },
  { id: "split-anoushka", accountId: "anoushka", amount: 100, label: "Anoushka", priority: 2 },
  { id: "split-groceries", accountId: "up", amount: 100, label: "Groceries", priority: 3 },
  { id: "split-savers", accountId: "upSavers", amount: 53, label: "Savers", priority: 4 },
  { id: "split-pet", accountId: "anz", amount: 25, label: "Pet", priority: 5 },
  { id: "split-bills", accountId: "commonwealth", amount: 60, label: "Bills", priority: 6 }
];

const billSeed = [
  { id: "bill-optus", name: "Optus", amount: 44, dueDate: "2026-05-05", frequency: "monthly", accountId: "commonwealth", isPaid: false, isFunded: false },
  { id: "bill-nbn", name: "NBN", amount: 55, dueDate: "2026-04-30", frequency: "monthly", accountId: "ing", isPaid: false, isFunded: false },
  { id: "bill-electricity", name: "Electricity", amount: 58.75, dueDate: "2026-05-17", frequency: "monthly", accountId: "ing", isPaid: false, isFunded: false },
  { id: "bill-water", name: "Water", amount: 190, dueDate: "2026-06-01", frequency: "quarterly", accountId: "ing", isPaid: false, isFunded: false },
  { id: "bill-health", name: "Health Insurance", amount: 150, dueDate: "2026-05-12", frequency: "monthly", accountId: "commonwealth", isPaid: false, isFunded: false }
];

const saverSeed = [
  { id: "pet-fund", name: "Pet Fund", balance: 0, goal: null },
  { id: "bills-buffer", name: "Bills Buffer", balance: 0, goal: null },
  { id: "health-buffer", name: "Health Buffer", balance: 0, goal: null },
  { id: "emergency", name: "Emergency", balance: 0, goal: null },
  { id: "splurge", name: "Splurge", balance: 0, goal: null }
];

const state = loadState();

const refs = {
  root: document.getElementById("screenRoot"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  themeToggle: document.getElementById("themeToggle")
};

refs.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.ui.screen = tab.dataset.screen;
    render();
  });
});

refs.themeToggle.addEventListener("click", () => {
  state.ui.theme = state.ui.theme === "dark" ? "light" : "dark";
  applyTheme();
  persist();
});

function defaultState() {
  return {
    user: {
      id: "user-1",
      name: "You",
      payday: WEEKDAY_PAYDAY,
      fixedExpenses: FIXED_EXPENSES,
      createdAt: nowIso()
    },
    accounts: deepCopy(accountSeed),
    splitRules: deepCopy(splitRuleSeed),
    bills: deepCopy(billSeed),
    savers: deepCopy(saverSeed),
    transactions: [],
    paydayRuns: [],
    weeklyIncomeByWeek: {},
    alertsDismissed: {},
    ui: {
      screen: "home",
      theme: "light",
      selectedWeek: weekKeyFromDate(new Date())
    }
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    const merged = defaultState();
    return {
      ...merged,
      ...parsed,
      user: { ...merged.user, ...(parsed.user || {}) },
      accounts: parsed.accounts || merged.accounts,
      splitRules: parsed.splitRules || merged.splitRules,
      bills: parsed.bills || merged.bills,
      savers: parsed.savers || merged.savers,
      transactions: parsed.transactions || merged.transactions,
      paydayRuns: parsed.paydayRuns || merged.paydayRuns,
      weeklyIncomeByWeek: parsed.weeklyIncomeByWeek || merged.weeklyIncomeByWeek,
      alertsDismissed: parsed.alertsDismissed || merged.alertsDismissed,
      ui: { ...merged.ui, ...(parsed.ui || {}) }
    };
  } catch (_err) {
    return defaultState();
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function formatAud(value) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value || 0);
}

function parseMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function ymd(dateLike) {
  const date = new Date(dateLike);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(dateLike) {
  const date = new Date(dateLike);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + mondayOffset);
  return date;
}

function weekKeyFromDate(dateLike) {
  return ymd(getWeekStart(dateLike));
}

function weekLabel(weekKey) {
  const start = new Date(`${weekKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-AU", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("en-AU", { day: "2-digit", month: "short" })}`;
}

function getAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId);
}

function getCurrentWeekKey() {
  return weekKeyFromDate(new Date());
}

function getWeekTransactions(weekKey) {
  return state.transactions.filter((tx) => tx.weekKey === weekKey);
}

function getWeekSpending(weekKey) {
  const totals = {
    total: 0,
    groceries: 0,
    taxi: 0,
    eatingOut: 0,
    other: 0
  };
  for (const tx of getWeekTransactions(weekKey)) {
    totals.total += tx.amount;
    if (tx.category === "Groceries") totals.groceries += tx.amount;
    else if (tx.category === "Taxi") totals.taxi += tx.amount;
    else if (tx.category === "Eating out") totals.eatingOut += tx.amount;
    else totals.other += tx.amount;
  }
  return totals;
}

function calculateStatus(income, spent) {
  if (income < FIXED_EXPENSES) return "shortfall";
  const remaining = income - FIXED_EXPENSES - spent.total;
  if (remaining < 0) return "shortfall";
  if (remaining < 50 || spent.groceries > LIMITS.groceries * 0.8 || spent.taxi > LIMITS.taxi * 0.8) return "tight";
  return "covered";
}

function statusMeta(status) {
  if (status === "covered") return { icon: "🟢", label: "Covered" };
  if (status === "tight") return { icon: "🟡", label: "Tight" };
  return { icon: "🔴", label: "Shortfall" };
}

function getWeekIncome(weekKey) {
  return parseMoney(state.weeklyIncomeByWeek[weekKey] || 0);
}

function getBillStatus(bill) {
  const account = getAccount(bill.accountId);
  const isFunded = !!account && account.balance >= bill.amount;
  const due = new Date(`${bill.dueDate}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - now) / 86400000);
  return { isFunded, diffDays };
}

function orderSplitRulesForIncome(income) {
  if (income >= FIXED_EXPENSES) {
    return [...state.splitRules].sort((a, b) => a.priority - b.priority);
  }
  const shortfallPriority = {
    Rent: 1,
    Anoushka: 2,
    Groceries: 3,
    Bills: 4,
    Pet: 5
  };
  return state.splitRules
    .filter((rule) => rule.label !== "Savers" && rule.label !== "Splurge")
    .sort((a, b) => (shortfallPriority[a.label] || 99) - (shortfallPriority[b.label] || 99));
}

function runPayday(incomeRaw) {
  const income = parseMoney(incomeRaw);
  if (income <= 0) {
    return { ok: false, message: "Enter a valid income amount." };
  }

  const weekKey = getCurrentWeekKey();
  state.weeklyIncomeByWeek[weekKey] = getWeekIncome(weekKey) + income;
  const rules = orderSplitRulesForIncome(income);

  let remaining = income;
  const allocations = [];

  for (const rule of rules) {
    if (remaining <= 0) break;
    const amount = Math.min(remaining, rule.amount);
    const account = getAccount(rule.accountId);
    if (account) account.balance += amount;
    allocations.push({ ...rule, transferred: amount });
    remaining -= amount;
  }

  const allocated = allocations.reduce((sum, item) => sum + item.transferred, 0);
  const shortfallNeeded = Math.max(FIXED_EXPENSES - income, 0);

  state.paydayRuns.unshift({
    id: `payday-${Date.now()}`,
    date: nowIso(),
    income,
    weekKey,
    allocated,
    surplus: remaining,
    shortfall: shortfallNeeded,
    allocations
  });

  persist();
  return {
    ok: true,
    income,
    surplus: remaining,
    shortfall: shortfallNeeded,
    allocations,
    warning: income < FIXED_EXPENSES ? "Income below $718. Adjust Savers or pause Splurge." : ""
  };
}

function addTransaction(payload) {
  const amount = parseMoney(payload.amount);
  if (amount <= 0) return { ok: false, message: "Amount must be greater than zero." };

  const account = getAccount(payload.accountId);
  if (!account) return { ok: false, message: "Account not found." };

  account.balance -= amount;

  const dateIso = nowIso();
  state.transactions.unshift({
    id: `tx-${Date.now()}`,
    amount,
    merchant: payload.merchant || "",
    accountId: payload.accountId,
    category: payload.category,
    date: dateIso,
    weekKey: weekKeyFromDate(dateIso)
  });

  persist();
  return { ok: true };
}

function payBill(billId) {
  const bill = state.bills.find((entry) => entry.id === billId);
  if (!bill) return;
  const account = getAccount(bill.accountId);
  if (!account) return;
  account.balance -= bill.amount;
  bill.isPaid = true;
  bill.lastPaidAt = nowIso();

  if (bill.frequency === "monthly") {
    const next = new Date(`${bill.dueDate}T00:00:00`);
    next.setMonth(next.getMonth() + 1);
    bill.dueDate = ymd(next);
    bill.isPaid = false;
  } else if (bill.frequency === "quarterly") {
    const next = new Date(`${bill.dueDate}T00:00:00`);
    next.setMonth(next.getMonth() + 3);
    bill.dueDate = ymd(next);
    bill.isPaid = false;
  } else if (bill.frequency === "yearly") {
    const next = new Date(`${bill.dueDate}T00:00:00`);
    next.setFullYear(next.getFullYear() + 1);
    bill.dueDate = ymd(next);
    bill.isPaid = false;
  }

  persist();
}

function allocateToSavers(totalRaw) {
  const total = parseMoney(totalRaw);
  if (total <= 0) return { ok: false, message: "Enter a valid amount." };

  const upSavers = getAccount("upSavers");
  if (!upSavers || upSavers.balance < total) {
    return { ok: false, message: "Not enough funds in Up Savers." };
  }

  const equal = total / state.savers.length;
  for (const saver of state.savers) {
    saver.balance += equal;
  }
  upSavers.balance -= total;

  persist();
  return { ok: true };
}

function deleteTransaction(id) {
  const idx = state.transactions.findIndex((tx) => tx.id === id);
  if (idx < 0) return;
  const tx = state.transactions[idx];
  const account = getAccount(tx.accountId);
  if (account) account.balance += tx.amount;
  state.transactions.splice(idx, 1);
  persist();
}

function getDailySummary() {
  const today = ymd(new Date());
  const todayTx = state.transactions.filter((tx) => ymd(tx.date) === today);
  const totals = { total: 0, groceries: 0, taxi: 0, eatingOut: 0, other: 0 };
  for (const tx of todayTx) {
    totals.total += tx.amount;
    if (tx.category === "Groceries") totals.groceries += tx.amount;
    else if (tx.category === "Taxi") totals.taxi += tx.amount;
    else if (tx.category === "Eating out") totals.eatingOut += tx.amount;
    else totals.other += tx.amount;
  }

  const week = getWeekSpending(getCurrentWeekKey());
  const dailyAverage = week.total / 7;

  let status = "covered";
  if (totals.total > dailyAverage * 1.15) status = "shortfall";
  else if (totals.total >= dailyAverage * 0.9) status = "tight";

  return { todayTx, totals, dailyAverage, status };
}

function getWeeklySummary(weekKey) {
  const spent = getWeekSpending(weekKey);
  const income = getWeekIncome(weekKey);
  const billsPaid = state.bills
    .filter((bill) => bill.lastPaidAt && weekKeyFromDate(bill.lastPaidAt) === weekKey)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const saved = state.paydayRuns
    .filter((run) => run.weekKey === weekKey)
    .flatMap((run) => run.allocations)
    .filter((allocation) => allocation.label === "Savers")
    .reduce((sum, allocation) => sum + allocation.transferred, 0);

  const surplus = income - FIXED_EXPENSES - spent.total;
  const status = calculateStatus(income, spent);

  return {
    weekKey,
    income,
    spent,
    billsPaid,
    saved,
    surplus,
    status
  };
}

function buildAlerts() {
  const alerts = [];
  const weekKey = getCurrentWeekKey();
  const income = getWeekIncome(weekKey);
  const spent = getWeekSpending(weekKey);

  if (income < FIXED_EXPENSES) {
    alerts.push({ id: "income-short", level: "critical", text: "Income is below $718 for this week.", screen: "payday" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const bill of state.bills) {
    const due = new Date(`${bill.dueDate}T00:00:00`);
    const diffDays = Math.ceil((due - today) / 86400000);
    const { isFunded } = getBillStatus(bill);

    if (diffDays < 0 && !bill.isPaid) {
      alerts.push({ id: `past-${bill.id}`, level: "critical", text: `${bill.name} is past due and unpaid.`, screen: "bills" });
    }
    if (diffDays <= 3 && diffDays >= 0) {
      alerts.push({ id: `soon-${bill.id}`, level: "warning", text: `${bill.name} (${formatAud(bill.amount)}) is due in ${diffDays} day(s).`, screen: "bills" });
    }
    if (!isFunded) {
      alerts.push({ id: `fund-${bill.id}`, level: "warning", text: `${bill.name} is not funded in linked account.`, screen: "bills" });
    }
  }

  if (spent.groceries >= LIMITS.groceries) {
    alerts.push({ id: "groceries-limit", level: "warning", text: "Groceries limit has been reached.", screen: "home" });
  }

  if (spent.taxi >= LIMITS.taxi) {
    alerts.push({ id: "taxi-limit", level: "warning", text: "Taxi limit has been reached.", screen: "home" });
  }

  if (spent.total > income && income > 0) {
    alerts.push({ id: "spend-over-income", level: "critical", text: "Weekly spending is above income.", screen: "weekly" });
  }

  return alerts;
}

function availableWeeks() {
  const set = new Set([getCurrentWeekKey()]);
  Object.keys(state.weeklyIncomeByWeek).forEach((week) => set.add(week));
  state.transactions.forEach((tx) => set.add(tx.weekKey));
  return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
}

function render() {
  refs.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.screen === state.ui.screen);
  });

  const screen = state.ui.screen;
  if (screen === "home") renderHome();
  else if (screen === "payday") renderPayday();
  else if (screen === "accounts") renderAccounts();
  else if (screen === "bills") renderBills();
  else if (screen === "logSpend") renderLogSpend();
  else if (screen === "today") renderToday();
  else if (screen === "savers") renderSavers();
  else if (screen === "weekly") renderWeekly();
  else if (screen === "alerts") renderAlerts();
}

function renderHome() {
  const weekKey = getCurrentWeekKey();
  const income = getWeekIncome(weekKey);
  const spent = getWeekSpending(weekKey);
  const left = income - FIXED_EXPENSES - spent.total;
  const status = calculateStatus(income, spent);
  const meta = statusMeta(status);

  refs.root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2>Weekly Status (${weekLabel(weekKey)})</h2>
        <span class="status ${status}">${meta.icon} ${meta.label}</span>
      </div>
      <div class="grid-3" style="margin-top:10px">
        <div>
          <p class="muted">Income this week</p>
          <strong>${formatAud(income)}</strong>
        </div>
        <div>
          <p class="muted">Fixed expenses</p>
          <strong>${formatAud(FIXED_EXPENSES)}</strong>
        </div>
        <div>
          <p class="muted">Left</p>
          <strong>${formatAud(left)}</strong>
        </div>
      </div>
      <div class="actions">
        <button class="primary-btn" data-go="logSpend">+ Log Spend</button>
        <button class="primary-btn" data-go="payday">Run Payday</button>
        <button class="ghost-btn" data-go="bills">View Bills</button>
      </div>
    </section>

    <section class="card">
      <h2>Category Budgets</h2>
      <div class="grid-2" style="margin-top:10px">
        ${renderBudgetProgress("Groceries", spent.groceries, LIMITS.groceries)}
        ${renderBudgetProgress("Taxi", spent.taxi, LIMITS.taxi)}
      </div>
    </section>
  `;

  refs.root.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ui.screen = btn.dataset.go;
      render();
    });
  });
}

function renderBudgetProgress(label, spent, limit) {
  const pct = Math.min((spent / limit) * 100, 100);
  return `
    <div class="progress-wrap">
      <div class="row"><strong>${label}</strong><span class="badge">${formatAud(spent)} / ${formatAud(limit)}</span></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
    </div>
  `;
}

function renderPayday() {
  const ordered = orderSplitRulesForIncome(getWeekIncome(getCurrentWeekKey()) || FIXED_EXPENSES);

  refs.root.innerHTML = `
    <section class="card">
      <h2>Payday (${WEEKDAY_PAYDAY})</h2>
      <div class="grid-2" style="margin-top:10px">
        <div class="field">
          <label>Income received</label>
          <input id="incomeInput" type="number" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="field">
          <label>Fixed split target</label>
          <input type="text" value="${formatAud(FIXED_EXPENSES)}" disabled>
        </div>
      </div>
      <div class="actions">
        <button id="runPaydayBtn" class="primary-btn">AUTO SPLIT</button>
      </div>
      <p id="paydayOutput" class="muted" style="margin-top:10px"></p>
    </section>

    <section class="card">
      <h2>Split Rules</h2>
      <div class="list" style="margin-top:10px">
        ${ordered.map((rule) => `<div class="list-item"><div class="row"><strong>${rule.priority}. ${rule.label}</strong><span>${formatAud(rule.amount)}</span></div></div>`).join("")}
      </div>
    </section>
  `;

  refs.root.querySelector("#runPaydayBtn").addEventListener("click", () => {
    const income = refs.root.querySelector("#incomeInput").value;
    const result = runPayday(income);
    const output = refs.root.querySelector("#paydayOutput");
    if (!result.ok) {
      output.textContent = result.message;
      return;
    }

    const shortfallText = result.shortfall > 0 ? ` | Deficit: ${formatAud(result.shortfall)}` : "";
    const warning = result.warning ? ` ${result.warning}` : "";
    output.textContent = `Surplus: ${formatAud(result.surplus)}${shortfallText}.${warning}`;
    render();
  });
}

function renderAccounts() {
  refs.root.innerHTML = `
    <section class="card">
      <h2>Accounts</h2>
      <div class="list" style="margin-top:10px">
        ${state.accounts.map((account) => `
          <article class="list-item">
            <h3>${account.name}</h3>
            <p class="muted">Role: ${account.role}</p>
            <div class="row" style="margin-top:8px">
              <strong>${formatAud(account.balance)}</strong>
              <button class="ghost-btn" data-edit-balance="${account.id}">Edit Balance</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;

  refs.root.querySelectorAll("[data-edit-balance]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const account = getAccount(btn.dataset.editBalance);
      const next = window.prompt(`Set balance for ${account.name}`, String(account.balance));
      if (next == null) return;
      const parsed = parseMoney(next);
      account.balance = parsed;
      persist();
      render();
    });
  });
}

function renderBills() {
  const bills = [...state.bills].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  refs.root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2>Upcoming Bills</h2>
        <button id="addBillBtn" class="ghost-btn">Add Bill</button>
      </div>
      <div class="list" style="margin-top:10px">
        ${bills.map((bill) => {
          const account = getAccount(bill.accountId);
          const info = getBillStatus(bill);
          return `
            <article class="list-item">
              <h3>${bill.name}</h3>
              <p class="muted">${formatAud(bill.amount)} | Due: ${new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}</p>
              <p class="muted">Account: ${account ? account.name : "Unassigned"}</p>
              <p class="status ${info.isFunded ? "covered" : "shortfall"}">${info.isFunded ? "🟢 Covered" : "🔴 Not funded"}</p>
              <div class="inline-buttons" style="margin-top:8px">
                <button class="primary-btn" data-pay-bill="${bill.id}">Mark Paid</button>
                <button class="ghost-btn" data-edit-bill="${bill.id}">Edit</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;

  refs.root.querySelector("#addBillBtn").addEventListener("click", () => {
    const name = window.prompt("Bill name");
    if (!name) return;
    const amount = parseMoney(window.prompt("Amount (AUD)", "0"));
    const dueDate = window.prompt("Due date (YYYY-MM-DD)", ymd(new Date()));
    const accountId = window.prompt("Account id (e.g. commonwealth, ing)", "commonwealth");
    const frequency = window.prompt("Frequency: monthly, quarterly, yearly", "monthly");
    state.bills.push({
      id: `bill-${Date.now()}`,
      name,
      amount,
      dueDate,
      frequency,
      accountId,
      isPaid: false,
      isFunded: false
    });
    persist();
    render();
  });

  refs.root.querySelectorAll("[data-pay-bill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      payBill(btn.dataset.payBill);
      render();
    });
  });

  refs.root.querySelectorAll("[data-edit-bill]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bill = state.bills.find((entry) => entry.id === btn.dataset.editBill);
      if (!bill) return;
      const amount = parseMoney(window.prompt("New amount", String(bill.amount)));
      const dueDate = window.prompt("New due date (YYYY-MM-DD)", bill.dueDate) || bill.dueDate;
      bill.amount = amount;
      bill.dueDate = dueDate;
      persist();
      render();
    });
  });
}

function renderLogSpend() {
  const defaultAccount = state.accounts.find((acc) => acc.isDefault)?.id || "up";

  refs.root.innerHTML = `
    <section class="card">
      <h2>Log Spend</h2>
      <div class="grid-2" style="margin-top:10px">
        <div class="field">
          <label>Amount</label>
          <input id="spendAmount" type="number" min="0" step="0.01" required>
        </div>
        <div class="field">
          <label>Merchant</label>
          <input id="spendMerchant" type="text" placeholder="Merchant">
        </div>
        <div class="field">
          <label>Account</label>
          <select id="spendAccount">
            ${state.accounts.map((account) => `<option value="${account.id}" ${account.id === defaultAccount ? "selected" : ""}>${account.name}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Category</label>
          <select id="spendCategory">
            <option>Groceries</option>
            <option>Taxi</option>
            <option>Eating out</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button id="submitSpendBtn" class="primary-btn">Submit</button>
      </div>
      <p id="spendOutput" class="muted" style="margin-top:10px"></p>
    </section>
  `;

  refs.root.querySelector("#submitSpendBtn").addEventListener("click", () => {
    const result = addTransaction({
      amount: refs.root.querySelector("#spendAmount").value,
      merchant: refs.root.querySelector("#spendMerchant").value,
      accountId: refs.root.querySelector("#spendAccount").value,
      category: refs.root.querySelector("#spendCategory").value
    });

    const output = refs.root.querySelector("#spendOutput");
    if (!result.ok) {
      output.textContent = result.message;
      return;
    }

    const week = getWeekSpending(getCurrentWeekKey());
    const warnings = [];
    if (week.groceries > LIMITS.groceries) warnings.push("Groceries over limit.");
    if (week.taxi > LIMITS.taxi) warnings.push("Taxi over limit.");

    output.textContent = warnings.length ? warnings.join(" ") : "Spend logged.";
    render();
  });
}

function renderToday() {
  const summary = getDailySummary();
  const meta = statusMeta(summary.status);

  refs.root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2>Today</h2>
        <span class="status ${summary.status}">${meta.icon} ${meta.label}</span>
      </div>
      <div class="grid-3" style="margin-top:10px">
        <div><p class="muted">Spent today</p><strong>${formatAud(summary.totals.total)}</strong></div>
        <div><p class="muted">Daily average target</p><strong>${formatAud(summary.dailyAverage)}</strong></div>
        <div><p class="muted">Transactions</p><strong>${summary.todayTx.length}</strong></div>
      </div>
      <div class="list" style="margin-top:10px">
        <div class="list-item">Groceries: ${formatAud(summary.totals.groceries)}</div>
        <div class="list-item">Taxi: ${formatAud(summary.totals.taxi)}</div>
        <div class="list-item">Eating out: ${formatAud(summary.totals.eatingOut)}</div>
        <div class="list-item">Other: ${formatAud(summary.totals.other)}</div>
      </div>
    </section>

    <section class="card">
      <h2>Transactions Today</h2>
      <div class="list" style="margin-top:10px">
        ${summary.todayTx.length ? summary.todayTx.map((tx) => `
          <article class="list-item">
            <div class="row">
              <strong>${formatAud(tx.amount)}</strong>
              <span class="badge">${tx.category}</span>
            </div>
            <p class="muted">${tx.merchant || "No merchant"} | ${getAccount(tx.accountId)?.name || tx.accountId}</p>
            <div class="inline-buttons" style="margin-top:8px">
              <button class="danger-btn" data-delete-tx="${tx.id}">Delete</button>
            </div>
          </article>
        `).join("") : "<div class='empty'>No transactions today.</div>"}
      </div>
    </section>
  `;

  refs.root.querySelectorAll("[data-delete-tx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteTransaction(btn.dataset.deleteTx);
      render();
    });
  });
}

function renderSavers() {
  const totalSaved = state.savers.reduce((sum, saver) => sum + saver.balance, 0);
  const upSavers = getAccount("upSavers");

  refs.root.innerHTML = `
    <section class="card">
      <h2>Savers</h2>
      <div class="list" style="margin-top:10px">
        ${state.savers.map((saver) => `
          <article class="list-item row">
            <strong>${saver.name}</strong>
            <span>${formatAud(saver.balance)}</span>
          </article>
        `).join("")}
      </div>
      <div class="row" style="margin-top:12px">
        <strong>TOTAL SAVED</strong>
        <strong>${formatAud(totalSaved)}</strong>
      </div>
      <p class="muted" style="margin-top:6px">Up Savers balance: ${formatAud(upSavers?.balance || 0)}</p>
      <div class="actions">
        <button id="allocateBtn" class="primary-btn">Allocate Leftover</button>
      </div>
      <p id="allocateOutput" class="muted" style="margin-top:8px"></p>
    </section>
  `;

  refs.root.querySelector("#allocateBtn").addEventListener("click", () => {
    const amount = window.prompt("How much to allocate from Up Savers?", "53");
    if (amount == null) return;
    const result = allocateToSavers(amount);
    refs.root.querySelector("#allocateOutput").textContent = result.ok ? "Allocation complete." : result.message;
    render();
  });
}

function renderWeekly() {
  const weeks = availableWeeks();
  const activeWeek = state.ui.selectedWeek && weeks.includes(state.ui.selectedWeek) ? state.ui.selectedWeek : weeks[0];
  state.ui.selectedWeek = activeWeek;
  const summary = getWeeklySummary(activeWeek);
  const meta = statusMeta(summary.status);

  refs.root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2>Weekly Summary</h2>
        <span class="status ${summary.status}">${meta.icon} ${meta.label}</span>
      </div>
      <div class="field" style="margin-top:10px">
        <label>Week</label>
        <select id="weekSelect">
          ${weeks.map((week) => `<option value="${week}" ${week === activeWeek ? "selected" : ""}>${weekLabel(week)}</option>`).join("")}
        </select>
      </div>
      <div class="grid-2" style="margin-top:10px">
        <div class="list-item">Income: ${formatAud(summary.income)}</div>
        <div class="list-item">Bills Paid: ${formatAud(summary.billsPaid)}</div>
        <div class="list-item">Groceries: ${formatAud(summary.spent.groceries)}</div>
        <div class="list-item">Taxi: ${formatAud(summary.spent.taxi)}</div>
        <div class="list-item">Eating out: ${formatAud(summary.spent.eatingOut)}</div>
        <div class="list-item">Other: ${formatAud(summary.spent.other)}</div>
        <div class="list-item">Saved: ${formatAud(summary.saved)}</div>
        <div class="list-item">Surplus / Deficit: ${formatAud(summary.surplus)}</div>
      </div>
      <div class="actions">
        <button id="csvBtn" class="primary-btn">Export CSV</button>
      </div>
    </section>
  `;

  refs.root.querySelector("#weekSelect").addEventListener("change", (event) => {
    state.ui.selectedWeek = event.target.value;
    persist();
    render();
  });

  refs.root.querySelector("#csvBtn").addEventListener("click", () => {
    const csv = [
      "Week Start,Income,Groceries,Taxi,Eating out,Other,Bills Paid,Saved,Surplus,Status",
      `${summary.weekKey},${summary.income.toFixed(2)},${summary.spent.groceries.toFixed(2)},${summary.spent.taxi.toFixed(2)},${summary.spent.eatingOut.toFixed(2)},${summary.spent.other.toFixed(2)},${summary.billsPaid.toFixed(2)},${summary.saved.toFixed(2)},${summary.surplus.toFixed(2)},${summary.status}`
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-summary-${summary.weekKey}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

function renderAlerts() {
  const alerts = buildAlerts();

  refs.root.innerHTML = `
    <section class="card">
      <h2>Alerts</h2>
      <div class="list" style="margin-top:10px">
        ${alerts.length ? alerts.map((alert) => `
          <article class="list-item ${alert.level === "critical" ? "alert-critical" : "alert-warning"}">
            <p><strong>${alert.level === "critical" ? "🔴 CRITICAL" : "🟡 WARNING"}</strong></p>
            <p style="margin-top:6px">${alert.text}</p>
            <div class="actions">
              <button class="primary-btn" data-fix-now="${alert.screen}">Fix Now</button>
            </div>
          </article>
        `).join("") : "<div class='empty'>No alerts right now.</div>"}
      </div>
    </section>

    <section class="card">
      <h2>Shortfall Protocol</h2>
      <p class="muted" style="margin-top:8px">If income is below ${formatAud(FIXED_EXPENSES)}, priority is Rent, Anoushka, Groceries, Bills, Pet. Cut Savers and Splurge until covered.</p>
    </section>
  `;

  refs.root.querySelectorAll("[data-fix-now]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ui.screen = btn.dataset.fixNow;
      render();
    });
  });
}

function applyTheme() {
  document.body.dataset.theme = state.ui.theme;
}

applyTheme();
render();
persist();
