const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const dateInput = document.getElementById('date');
const textInput = document.getElementById('text');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const emptyState = document.getElementById('empty-state');

// Set default date to today
dateInput.valueAsDate = new Date();

// Load transactions from localStorage or initialize empty array
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const item = document.createElement('li');

    item.classList.add('list-item');
    item.classList.add(transaction.type);
    item.classList.add('list-enter'); // entry animation

    // icon based on category mapping
    const categoryIcons = {
        food: 'fa-utensils',
        transport: 'fa-bus',
        shopping: 'fa-cart-shopping',
        entertainment: 'fa-film',
        salary: 'fa-sack-dollar',
        other: 'fa-box'
    };
    
    const categoryNames = {
        food: '餐飲',
        transport: '交通',
        shopping: '購物',
        entertainment: '娛樂',
        salary: '薪水',
        other: '其他'
    };

    const iconClass = categoryIcons[transaction.category] || 'fa-tag';
    const catName = categoryNames[transaction.category] || '其他';

    item.innerHTML = `
        <div class="item-info">
            <span class="item-title">${transaction.text}</span>
            <div class="item-meta">
                <span><i class="fa-solid ${iconClass}"></i> ${catName}</span>
                <span><i class="fa-regular fa-calendar"></i> ${transaction.date}</span>
            </div>
        </div>
        <div class="item-amount-wrap">
            <span class="item-amount ${transaction.type}">${sign}$${Math.abs(transaction.amount).toLocaleString()}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;

    listEl.prepend(item);
}

// Update total balance, income, expense
function updateValues() {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0);
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0);

    const expense = amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1;

    balanceEl.innerText = `$${total.toLocaleString()}`;
    totalIncomeEl.innerText = `+$${income.toLocaleString()}`;
    totalExpenseEl.innerText = `-$${expense.toLocaleString()}`;
    
    if (total < 0) {
        balanceEl.style.color = 'var(--accent-expense)';
    } else {
        balanceEl.style.color = 'var(--text-primary)';
    }

    if (transactions.length === 0) {
        emptyState.style.display = 'flex';
        listEl.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        listEl.style.display = 'block';
    }
}

// Remove transaction
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init App
function init() {
    listEl.innerHTML = '';
    // Sort transactions by date descending then id descending
    transactions.sort((a, b) => {
        if(a.date !== b.date) return new Date(b.date) - new Date(a.date);
        return b.id - a.id;
    });
    
    transactions.forEach(addTransactionDOM);
    updateValues();
}

// Form submit event listener
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('請填寫項目名稱與金額！');
        return;
    }

    const type = document.querySelector('input[name="type"]:checked').value;

    const transaction = {
        id: generateID(),
        type: type,
        date: dateInput.value,
        text: textInput.value,
        category: categoryInput.value,
        amount: +Math.abs(amountInput.value)
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    // Reset some inputs but keep the date
    textInput.value = '';
    amountInput.value = '';
    textInput.focus();
});

// Initialize
init();

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Set initial theme
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
} else {
    document.documentElement.removeAttribute('data-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});
