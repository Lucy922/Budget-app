// SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value")
const incomeTotalEl = document.querySelector(".income-total")
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

// SELECT BUTTONS
const expenseBtn = document.querySelector(".tab1");
const incomeBtn = document.querySelector(".tab2");
const allBtn = document.querySelector(".tab3");

// INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

// VARIABLES
let ENTRY_LIST = {
  income: [],
  expense: []
};
let balance = 0, income = 0, expenses = 0;

const DELETE = "delete", EDIT = "edit"

// EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});

incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});

allBtn.addEventListener("click", function () {
  show(allEl);
  hide([expenseEl, incomeEl]);
  active(allBtn);
  inactive([expenseBtn, incomeBtn]);
});

addExpense.addEventListener("click", function () {
  //IF ONE OF THE INPUTS IS EMPTY => EXIT
  if (!expenseTitle.value || !expenseAmount.value) return;

  // SAVE THE ENTRY TO ENTRY_LIST
  const expense = {
    type: "expense",
    title: expenseTitle.value,
    amount: parseInt(expenseAmount.value)
  }
  const token = localStorage.getItem("auth_token")

  fetch("http://localhost:5000/expense", {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      "x-access-token": token
    },
    body: JSON.stringify(expense)
  })
    .then((response) => {
      return response.json()
    }).then((data) => {
      console.log(data)
    }).catch(error => {
      console.log(error)
    })
  getExpenses()
  clearInput([expenseTitle, expenseAmount])
})


addIncome.addEventListener("click", function () {
  // IF ONE OF THE INPUTS IS EMPTY => EXIT
  if (!incomeTitle.value || !incomeAmount.value) return;

  // SAVE THE ENTRY TO ENTRY_LIST
  const income = {
    type: "income",
    title: incomeTitle.value,
    amount: parseInt(incomeAmount.value)
  }

  const token = localStorage.getItem("auth_token")

  fetch("http://localhost:5000/income", {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      "x-access-token": token
    },
    body: JSON.stringify(income)
  })
  .then((response) =>{
    return response.json()
  })
  .then((data) =>{
    console.log(data)
  })
  .catch((error) =>{
    console.log(error)
  })
 getIncome()
  clearInput([incomeTitle, incomeAmount])
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

// HELPERS
function deleteOrEdit(event) {
  const targetBtn = event.target
  const entry = targetBtn.parentNode
  if (targetBtn.id == DELETE) {
    deleteExpenses(entry)
    deleteIncome(entry)
  } else if (targetBtn.id == EDIT) {
    editEntry(entry)
  }
};

function deleteExpenses(entry) {
 
    fetch(`http://localhost:5000/expense/${entry.id}`, {
      method: "DELETE",
      headers: {
        "content-Type": "application/json"
      }
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.log(error)
  
      })
      ENTRY_LIST.expense.splice(entry.id,1)
      getExpenses()
    }

   function deleteIncome(entry) {
    fetch(`http://localhost:5000/income/${entry.id}`, {
      method: "DELETE",
      headers: {
        "content-Type": "application/json"
      },
      // body: JSON.stringify(income)
    })
    .then((response) =>{
      return response.json()
    })
    .then((data) =>{
      console.log(data)
    })
    .catch((error) =>{
      console.log(error)
    })
   ENTRY_LIST.income.splice(entry.id, 1)
  getIncome()
   }
     

function editEntry(entry) {
  const selectedEntry = [...ENTRY_LIST.expense, ...ENTRY_LIST.income].find(item => {
    return Number(item.id) === Number(entry.id)
  })

  if (selectedEntry.type == "income") {
    incomeAmount.value = selectedEntry.amount;
    incomeTitle.value = selectedEntry.title;
  } else if (selectedEntry.type == "expense") {
    expenseAmount.value = selectedEntry.amount;
    expenseTitle.value = selectedEntry.title;
  }
  if(selectedEntry.type == "income") {
    deleteIncome(entry)
  }
  if(selectedEntry.type == "expense") {
    deleteExpenses(entry)
  }
  getExpenses()
  getIncome()
};

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  expenses = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, expenses));

  //UPDATE UI
  clearElement([expenseList, incomeList, allList])

  //DETERMINE SIGN OF BALANCE
  let sign = (income >= expenses) ? "$" : "-$"

  // UPDATE UI
  balanceEl.innerHTML = `<small>${sign}</small>${balance}`
  outcomeTotalEl.innerHTML = `<small>$</small>${expenses}`
  incomeTotalEl.innerHTML = `<small>$</small>${income}`

  clearElement([incomeList, expenseList, allList]);

  ENTRY_LIST.expense.forEach((entry) => {
    showEntry(expenseList, entry.type, entry.title, entry.amount, entry.id);
  })

  ENTRY_LIST.income.forEach((entry) => {
    showEntry(incomeList, entry.type, entry.title, entry.amount, entry.id);
  })

  const all = [...ENTRY_LIST.expense, ...ENTRY_LIST.income]

  all.forEach(entry => {
    showEntry(allList, entry.type, entry.title, entry.amount, entry.id);
  })
}

function showEntry(list, type, title, amount, id) {
  const entry = `<li id = "${id}" class="${type}">
      <div class="entry">${title}: $${amount}</div>
      <div id="edit"></div>
      <div id="delete"></div>
    </li>`

  const position = "afterbegin"
  list.insertAdjacentHTML(position, entry);
};

function clearElement(elements) {
  elements.forEach(element => {
    element.innerHTML = "";
  })
};

function calculateTotal(type,ENTRY_LIST) {
 let sum = 0;
 
  [...ENTRY_LIST.expense, ...ENTRY_LIST.income].forEach(entry => {
    if (entry.type == type) {
      sum += parseInt(entry.amount)
    }
  })
  return sum
};

function calculateBalance(income, expenses) {
  return income - expenses;

};

function clearInput(inputs) {
  inputs.forEach(input => {
    input.value = "";
  })
};

function show(element) {
  element.classList.remove("hide")

};

function hide(elements) {
  elements.forEach(element => {
    element.classList.add("hide")

  })
};

function active(element) {
  element.classList.add("active")
};

function inactive(elements) {
  elements.forEach(element => {
    element.classList.remove("active")

  })
};

window.onload = async () => {
  const token = localStorage.getItem("auth_token");

  if(token == 'undefined') {
    window.location.href = "index.html"
  }
  getExpenses()
  getIncome() 
}

async function getExpenses() {
  const token = localStorage.getItem("auth_token")

  //LOOK IF THERE IS SAVED DATA IN THE DATABASE
  const response = await fetch('http://localhost:5000/expense/expense', {
    method: "GET",
    headers: {
      "content-Type": "application/json",
      "x-access-token": token
    } 
  })

  const data = await response.json()
  ENTRY_LIST.expense = data
  updateUI();
}

async function getIncome() {
  const token = localStorage.getItem("auth_token")

  const response = await fetch("http://localhost:5000/income/income", {
    method: "GET",
    headers: {
      "content-Type": "application/json",
      "x-access-token": token
    }
  })

const data =  await response.json()
ENTRY_LIST.income = data
  updateUI()
}

