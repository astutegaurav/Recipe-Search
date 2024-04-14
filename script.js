const search = document.getElementById("search"),
  submit = document.getElementById("submit"),
  random = document.getElementById("random"),
  mealsEl = document.getElementById("meals"),
  resultHeading = document.getElementById("result-heading"),
  single_mealEl = document.getElementById("single-meal"),
  favList = document.querySelector(".fav-list");

// Search meal and fetch from API
function searchMeal(e) {
  // Clear single meal
  single_mealEl.innerHTML = "";
  mealsEl.innerHTML = "";

  // Get search term
  const term = search.value;

  // Check for empty
  if (term.trim()) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        resultHeading.innerHTML = `<p>Search results for '${term}':</p>`;

        if (data.meals === null) {
          resultHeading.innerHTML = `<p>There are no search results. Try again!<p>`;
        } else {
          mealsEl.innerHTML = data.meals
            .map(
              (meal) => `
            <div class="meal">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
              <div class="meal-info" data-mealID="${meal.idMeal}">
                <h4>${meal.strMeal}</h4>
                <button class="add" onclick="addList(${meal.idMeal})">
                <i class="fas fa-heart" href="list.html"></i>
                <span>Add To Favourite</span>
                </button>
              </div>
            </div>
          `
            )
            .join("");
        }
      });
    // Clear search text
    search.value = "";
  } else {
    alert("Please enter a search term");
  }
  e.preventDefault();
}

// Fetch meal by ID
function getMealById(mealID) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`)
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];

      addMealToDOM(meal);
    });
}

// Fetch random meal from API
function getRandomMeal() {
  // Clear meals and heading
  mealsEl.innerHTML = "";
  resultHeading.innerHTML = "";

  fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
    .then((res) => res.json())
    .then((data) => {
      const meal = data.meals[0];

      addMealToDOM(meal);
    });
}

// Add meal to DOM
function addMealToDOM(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }

  // single meal display with all details
  single_mealEl.innerHTML = `
    <div class="single-meal">
      <h1>${meal.strMeal}</h1>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <div class="single-meal-info">
        ${meal.strCategory ? `<p>Category: ${meal.strCategory}</p>` : ""}
        ${meal.strArea ? `<p>Area: ${meal.strArea}</p>` : ""}
      </div>
      <div class="main">
        <p>${meal.strInstructions}</p>
        <h2>Ingredients</h2>
        <ul>
          ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
      </div>
        <button class="single-add" onclick="addList(${meal.idMeal})">
            <i class="fas fa-heart"></i>
            <span>Add To Favourite</span>
        </button>
    </div>
  `;
}

// Add meal to Favourite list

function addList(meal) {
  // console.log(meal);

  // here this meal is the id of the meal

  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal}`)
    .then((res) => res.json())
    .then((data) => {
      
      // using local storage for shorting array
      let mealData = JSON.parse(localStorage.getItem("mealDetails")) ?? [];

      // check for dublicate meal
      let checkStatus = 0;
      for (let v of mealData) {
        if (v.mealID == data.meals[0].idMeal) {
          checkStatus = 1;
          break;
        }
      }

      if (checkStatus == 1) {
        alert("Already Exist");
      } else {
        mealData.push({
          mealID: data.meals[0].idMeal,
          mealImg: data.meals[0].strMealThumb,
          mealName: data.meals[0].strMeal,
        });

        localStorage.setItem("mealDetails", JSON.stringify(mealData));
      }

      // reference to show meal in live mode
      displayData();
    });
}

// display sigle meal in aside section

let displayData = () => {
  let mealData = JSON.parse(localStorage.getItem("mealDetails")) ?? [];
  console.log(mealData);
  let html = "";
  mealData.forEach((element, i) => {
    html += `

        <div class="fav-lists">
        
          <div class="meal" data-id="${element.mealID}">
              <img src ="${element.mealImg}" alt="food">
            <div class="meal-info" id="back">
              <h4>${element.mealName}</h4>
              <button class="delete" onclick="deleteList(${i})">
                Delete
              </button>
            </div>
          </div>
        </div>
        
        `;
  });

  favList.innerHTML = html;
};

// delete meal from fav cart

let deleteList = (index) => {
  let mealData = JSON.parse(localStorage.getItem("mealDetails")) ?? [];
  mealData.splice(index, 1);
  localStorage.setItem("mealDetails", JSON.stringify(mealData));
  displayData();
};

displayData();

// Event listeners
submit.addEventListener("submit", searchMeal);
random.addEventListener("click", getRandomMeal);

mealsEl.addEventListener("click", (e) => {
  const mealInfo = e.target.closest(".meal-info");

  if (mealInfo) {
    const mealID = mealInfo.getAttribute("data-mealid");
    getMealById(mealID);
  }
});
