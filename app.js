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

let transactions = [];

// Get Firebase reference from window
const { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } = window.fb;
const transRef = collection(window.db, "transactions");

// Listen for updates from Firestore
function loadTransactions() {
    // Query: order by date descending then by created time
    const q = query(transRef, orderBy("date", "desc"));

    // Real-time listener
    onSnapshot(q, (snapshot) => {
        transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        
        renderList();
        updateValues();
    });
}

// Add transaction to DOM
function renderList() {
    listEl.innerHTML = '';
    
    if (transactions.length === 0) {
        emptyState.style.display = 'flex';
        listEl.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    listEl.style.display = 'block';

    transactions.forEach(transaction => {
        const sign = transaction.type === 'income' ? '+' : '-';
        const item = document.createElement('li');

        item.classList.add('list-item');
        item.classList.add(transaction.type);
        item.classList.add('list-enter');

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
                <button class="delete-btn" onclick="removeTransaction('${transaction.id}')"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;

        listEl.appendChild(item);
    });
}

// Update totals
function updateValues() {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    balanceEl.innerText = `$${total.toLocaleString()}`;
    totalIncomeEl.innerText = `+$${income.toLocaleString()}`;
    totalExpenseEl.innerText = `-$${expense.toLocaleString()}`;
    
    balanceEl.style.color = (total < 0) ? 'var(--accent-expense)' : 'var(--text-primary)';
}

// Remove transaction from Firestore
async function removeTransaction(id) {
    try {
        await deleteDoc(doc(window.db, "transactions", id));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

// Form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('請填寫項目名稱與金額！');
        return;
    }

    const type = document.querySelector('input[name="type"]:checked').value;

    const newTransaction = {
        type: type,
        date: dateInput.value,
        text: textInput.value,
        category: categoryInput.value,
        amount: +Math.abs(amountInput.value),
        createdAt: new Date().getTime()
    };

    try {
        await addDoc(transRef, newTransaction);
        textInput.value = '';
        amountInput.value = '';
        textInput.focus();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

// Initialize
loadTransactions();

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

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
