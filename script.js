// =============================================
// 🎪 CASHFLOW CARNIVAL - EXPENSE TRACKER
// =============================================

// ======================
// 🎛️ INITIAL SETUP
// ======================
const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmountEl = document.getElementById("total-amount");
const emptyMessage = document.getElementById("empty-message");
const filterSelect = document.getElementById("filter");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const progressBar = document.getElementById("budget-progress");

// Initialize expenses from localStorage or empty array
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let activeFilter = "All";

// Audio elements
const cashSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-cash-register-788.mp3");
const deleteSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3");

// ======================
// 🎨 CATEGORY THEMING
// ======================
const categoryStyles = {
    Food: {
        icon: "🍔",
        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    },
    Transport: {
        icon: "🚗",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    },
    Shopping: {
        icon: "🛍️",
        color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
    },
    Bills: {
        icon: "📄",
        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    },
    Fun: {
        icon: "🎉",
        color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
    }
};

// ======================
// 🎢 EVENT LISTENERS
// ======================
form.addEventListener("submit", handleSubmit);
filterSelect.addEventListener("change", handleFilterChange);
darkModeToggle.addEventListener("click", toggleDarkMode);

// Initialize the app when the script loads
initializeApp();

// ======================
// ⚙️ CORE FUNCTIONS
// ======================

/**
 * Initialize the application
 */
function initializeApp() {
    renderExpenses();
    checkDarkMode();
    initializeTiltEffect();
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("expense-name").value.trim();
    const amount = parseFloat(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;

    if (!validateInput(name, amount, category)) return;

    // Play cash sound with error handling
    cashSound.play().catch(e => console.log("Audio playback prevented:", e));

    const expense = createExpense(name, amount, category);
    expenses.push(expense);

    saveToLocalStorage();
    form.reset();
    renderExpenses();

    if (calculateTotal() > 100) triggerConfetti();
}

/**
 * Handle filter change
 */
function handleFilterChange() {
    activeFilter = filterSelect.value;
    renderExpenses();
}

/**
 * Render all expenses to the DOM
 */
function renderExpenses() {
    expenseList.innerHTML = "";
    const filteredExpenses = getFilteredExpenses();

    toggleEmptyMessage(filteredExpenses.length === 0);
    updateTotalDisplay();
    renderExpenseItems(filteredExpenses);
}

/**
 * Create expense object
 * @param {string} name - Expense name
 * @param {number} amount - Expense amount
 * @param {string} category - Expense category
 * @returns {Object} Expense object
 */
function createExpense(name, amount, category) {
    return {
        id: Date.now(),
        name,
        amount,
        category,
        date: new Date().toLocaleDateString()
    };
}

// ======================
// 🛠️ UTILITY FUNCTIONS
// ======================

/**
 * Validate form input
 * @param {string} name - Expense name
 * @param {number} amount - Expense amount
 * @param {string} category - Expense category
 * @returns {boolean} True if input is valid
 */
function validateInput(name, amount, category) {
    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert("🚨 Please enter valid details!\n- Name required\n- Positive amount\n- Category selected");
        return false;
    }
    return true;
}

/**
 * Get filtered expenses based on active filter
 * @returns {Array} Filtered expenses
 */
function getFilteredExpenses() {
    return activeFilter === "All"
        ? expenses
        : expenses.filter(exp => exp.category === activeFilter);
}

/**
 * Calculate total expenses
 * @returns {number} Total amount
 */
function calculateTotal() {
    return expenses.reduce((total, exp) => total + exp.amount, 0);
}

/**
 * Update progress bar based on total expenses
 * @param {number} total - Total expense amount
 */
function updateProgressBar(total) {
    const progressPercent = Math.min((total / 500) * 100, 100);
    progressBar.style.width = `${progressPercent}%`;
    progressBar.classList.toggle("bg-red-500", progressPercent >= 100);
}

/**
 * Save expenses to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// ======================
// ✨ INTERACTIVE FEATURES
// ======================

/**
 * Trigger confetti animation
 */
function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#f59e0b"]
    });
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"));
}

/**
 * Check and apply dark mode preference
 */
function checkDarkMode() {
    if (localStorage.getItem("darkMode") === "true") {
        document.documentElement.classList.add("dark");
    }
}

/**
 * Initialize 3D tilt effect
 */
function initializeTiltEffect() {
    if (typeof VanillaTilt !== "undefined") {
        VanillaTilt.init(document.querySelector(".card-hover"), {
            max: 8,
            speed: 300,
            glare: true,
            "max-glare": 0.2,
        });
    }
}

/**
 * Toggle empty message visibility
 * @param {boolean} show - Whether to show the empty message
 */
function toggleEmptyMessage(show) {
    emptyMessage.classList.toggle("hidden", !show);
}

/**
 * Update total amount display
 */
function updateTotalDisplay() {
    const total = calculateTotal();
    totalAmountEl.textContent = `$${total.toFixed(2)}`;
    updateProgressBar(total);
}

/**
 * Render expense items to the DOM
 * @param {Array} expenses - Array of expense objects
 */
function renderExpenseItems(expenses) {
    expenses.forEach(expense => {
        const { icon, color } = categoryStyles[expense.category] || categoryStyles["Fun"];

        const li = document.createElement("li");
        li.className = `flex justify-between items-center p-4 rounded-lg shadow-sm transition-all 
                        ${color} bg-opacity-50 dark:bg-opacity-20 animate__animated animate__fadeIn`;

        li.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-2xl">${icon}</span>
                <div>
                    <p class="font-semibold">${expense.name}</p>
                    <p class="text-sm opacity-75">${expense.date} • $${expense.amount.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editExpense(${expense.id})" class="p-2 text-blue-500 hover:text-blue-700 
                    transition-transform hover:scale-110" title="Edit">
                    ✏️
                </button>
                <button onclick="deleteExpense(${expense.id})" class="p-2 text-red-500 hover:text-red-700 
                    transition-transform hover:scale-110" title="Delete">
                    🗑️
                </button>
            </div>
        `;
        expenseList.appendChild(li);
    });
}

// ======================
// 🗑️ DELETE/EDIT FUNCTIONS
// ======================

/**
 * Delete an expense
 * @param {number} id - Expense ID
 */
function deleteExpense(id) {
    deleteSound.play().catch(e => console.log("Audio playback prevented:", e));
    expenses = expenses.filter(expense => expense.id !== id);
    saveToLocalStorage();
    renderExpenses();
}

/**
 * Edit an expense
 * @param {number} id - Expense ID
 */
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    // Fill form with expense data
    document.getElementById("expense-name").value = expense.name;
    document.getElementById("expense-amount").value = expense.amount;
    document.getElementById("expense-category").value = expense.category;

    // Remove old entry and focus
    deleteExpense(id);
    document.getElementById("expense-name").focus();
}