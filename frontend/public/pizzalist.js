const rootElement = document.getElementById("root");
const allergensDiv = document.querySelector(".allergens");
const cards = document.querySelector(".cards");

let localPizzaData = [];
let checkedAllergens = [];
let pizzaOrders = [];
let date = new Date();
let orderObject = {
  pizzas: [],
  date: {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  },
  customer: {
    name: "",
    email: "",
    address: {
      city: "",
      street: "",
    },
  },
};

const addElement = function (tag, innerText, id) {
  if (tag === "input") {
    return `<${tag} type="checkbox" id=${id} value="${innerText}">`;
  } else if (tag === "label") {
    return `<${tag} for=${id}>${innerText}</${tag}>`;
  }
};

function inputEvent(event) {
  if (event.target.checked) {
    checkedAllergens.push(event.target.value);
  } else {
    checkedAllergens = checkedAllergens.filter(
      (checkedAll) => checkedAll !== event.target.value
    );
  }

  console.log("localPizzaData", localPizzaData);
  //insert pizza by allergens
  for (const pizza of localPizzaData) {
    let hasAllergens = false;
    for (const checkedAllergen of checkedAllergens) {
      if (pizza.allergens.includes(checkedAllergen)) {
        hasAllergens = true;
      }
    }

    if (hasAllergens) {
      document.querySelector(`#pizza-${pizza.id}`).setAttribute("hidden", true);
    } else {
      document.querySelector(`#pizza-${pizza.id}`).removeAttribute("hidden");
    }
  }
}

function pizzaDiv({ id, image, name, ingredients, price, allergens }) {
  const ingredientsDD = ingredients
    .map((ingredient) => `<dd>${ingredient}</dd>`)
    .join("");
  const allergensDD = allergens
    .map((allergen) => `<dd>${allergen}</dd>`)
    .join("");

  return `<div class="pizzaDetails" id=pizza-${id}>
                <div class="card-header">
                    <img src="${image}" class="card-image"/>
                    ${name}
                </div>
                <div class="card-body">
                    <p>Ingredients: </p>
                    ${ingredientsDD}
                    <p>Price:  ${price}</p>
                    <p>Allergens: </p>
                    ${allergensDD}
                </div>
                <div class="card-footer">
                    <input type="number" placeholder="amount" id=amount-${id}>
                    <button class="add-button" id=${id}>Add to order</button>
                    <button class="remove-button" id=${id}>Remove from order</button>
                </div>
            </div>`;
}

async function fetchPizza() {
  const pizzaFile = await fetch("/api/pizza");
  const pizzaData = await pizzaFile.json();
  return pizzaData;
}

async function fetchAllergens() {
  const allergensFile = await fetch("/api/allergen");
  const allergensData = await allergensFile.json();
  return allergensData;
}

function removeFromOrder(event) {
  for (let i = 0; i < pizzaOrders.length; i++) {
    if (pizzaOrders[i].id === Number(event.target.id)) {
      pizzaOrders.splice(i, 1);
      break;
    }
  }

  for (let i = 0; i < orderObject.pizzas.length; i++) {
    if (orderObject.pizzas[i].id === Number(event.target.id)) {
      if (orderObject.pizzas[i].amount <= 1) {
        orderObject.pizzas.splice(i, 1);
      } else {
        orderObject.pizzas[i].amount--;
      }
    }
  }

  document.querySelector("form")?.remove();
  rootElement.insertAdjacentHTML("afterbegin", createForm());
  if (orderObject.pizzas.length === 0) {
    document.querySelector("form").setAttribute("hidden", true);
  }
}

function addToOrder(event) {
  const amountValue = document.querySelector(
    `input#amount-${event.target.id}`
  ).value;
  console.log(amountValue);
  let idFunc = Number(event.target.id);
  let pizzasInObject = orderObject.pizzas;
  let isAlreadyInList = false;

  if (Number(amountValue) > 0) {
    for (let i = 0; i < amountValue; i++) {
      pizzaOrders.push(localPizzaData[idFunc - 1]);
    }
  } else {
    pizzaOrders.push(localPizzaData[idFunc - 1]);
  }

  for (let i = 0; i < pizzasInObject.length; i++) {
    if (pizzasInObject[i].id === idFunc) {
      isAlreadyInList = true;
      if (amountValue === "") {
        pizzasInObject[i].amount++;
        break;
      } else {
        pizzasInObject[i].amount += Number(amountValue);
        break;
      }
    }
  }

  if (!isAlreadyInList && amountValue === "") {
    pizzasInObject.push({
      id: idFunc,
      amount: 1,
    });
  } else if (!isAlreadyInList && amountValue !== "") {
    pizzasInObject.push({
      id: idFunc,
      amount: Number(amountValue),
    });
  }
  document.querySelector("form")?.remove();
  document
    .querySelector("nav.navbar")
    .insertAdjacentHTML("afterend", createForm());
  document.querySelector("form").addEventListener("submit", handleSubmit);
}

async function getBasket() {
  let orders = await fetch("http://localhost:5500/api/order");
  let ordersData = await orders.json();
}

function handleSubmit(event) {
  event.preventDefault();
  console.log("inside handleSubmit");
  const typedName = event.target[0].value;
  const typedEmail = event.target[1].value;
  const typedCity = event.target[2].value;
  const typedStreet = event.target[3].value;

  orderObject.customer.name = typedName;
  orderObject.customer.email = typedEmail;
  orderObject.customer.address.city = typedCity;
  orderObject.customer.address.street = typedStreet;

  fetch("http://localhost:5500/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderObject),
  })
    .then((res) => res.json())
    .then((data) => console.log("data", data))
    .catch((err) => console.log(err));
}

function createForm() {
  const orderedPizzas = orderObject.pizzas.map((pizza) => {
    const pizzaFound = pizzaOrders.find((pizzaObj) => pizzaObj.id === pizza.id);
    return {
      pizzaName: pizzaFound.name,
      pizzaAmount: pizza.amount,
    };
  });

  return `<form>
                <h2>Pizzas </h2>
                ${orderedPizzas
                  .map(
                    (pizza) =>
                      `<h3>~ ${pizza.pizzaName} x${pizza.pizzaAmount}</h3>`
                  )
                  .join("\n\n")}
                <label>Name:
                    <input type="text" id="nameInp" required>
                </label>
                <br><br>
                <label>Email:
                    <input type="email" id="emailInp" required>
                </label>
                <br><br>
                <label>City:
                    <input type="text" id="cityInp" required>
                </label>
                <br><br>
                <label>Street:
                    <input type="text" id="streetInp" required>
                </label>
                <br><br>
                <button>Submit</button>
            </form>`;
}

async function main() {
  let pizzaData = await fetchPizza();
  let allergensData = await fetchAllergens();

  document.getElementById("Basket").addEventListener("click", getBasket);

  for (let i = 0; i < allergensData.length; i++) {
    let input = addElement("input", allergensData[i].name, i + 1);
    let label = addElement("label", allergensData[i].name, i + 1);
    allergensDiv.insertAdjacentHTML("beforeend", input);
    allergensDiv.insertAdjacentHTML("beforeend", label);
  }

  const allergenInputs = document.querySelectorAll("input[type=checkbox]");
  allergenInputs.forEach((allergenInp) =>
    allergenInp.addEventListener("click", inputEvent)
  );

  // get the name of the allergens from their number
  for (let i = 0; i < pizzaData.length; i++) {
    for (let j = 0; j < pizzaData[i].allergens.length; j++) {
      for (let k = 0; k < allergensData.length; k++) {
        if (pizzaData[i].allergens[j] === allergensData[k].id) {
          pizzaData[i].allergens[j] = allergensData[k].name;
        }
      }
    }
  }
  localPizzaData = pizzaData;
  pizzaData.map((pizza) => {
    cards.insertAdjacentHTML("beforeend", pizzaDiv(pizza));
  });

  const addToOrderButtons = document.getElementsByClassName("add-button");
  [...addToOrderButtons].forEach((button) =>
    button.addEventListener("click", addToOrder)
  );

  const removeFromOrderButtons =
    document.getElementsByClassName("remove-button");
  [...removeFromOrderButtons].forEach((button) =>
    button.addEventListener("click", removeFromOrder)
  );
}

main();
