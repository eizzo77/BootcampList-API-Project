const tableContainer = document.querySelector(".table-container");
const searchInput = document.querySelector("#search-input");
const searchDropDown = document.querySelector("#search-dropdown");
const categoriesButtonsSort = document.querySelectorAll("button[data-name]");

const fetchStudents = async () => {
  const response = await fetch("https://apple-seeds.herokuapp.com/api/users/");
  const studentsData = await response.json();
  const allStudentsData = await Promise.all(
    studentsData.map(async (student, index) => {
      const response = await fetch(
        `https://apple-seeds.herokuapp.com/api/users/${index}`
      );
      const extraStudentData = await response.json();
      return { ...student, ...extraStudentData };
    })
  );
  return allStudentsData;
};
// row Creation
function createRow(rowData, rowIndex) {
  const row = document.createElement("div");
  row.className = "table-row";
  createColumns(row, rowData, rowIndex);
  tableContainer.appendChild(row);
}
// create the columns.
function createColumns(row, rowDataObj, rowIndex) {
  row.setAttribute("data-num-of-row", rowDataObj.id);
  Object.keys(rowDataObj).forEach((property) => {
    const element = document.createElement("textarea");
    element.setAttribute("data-name", property);
    element.textContent = rowDataObj[property];
    property.toString() !== "id" && element.setAttribute("data-editable", "");
    element.disabled = true;
    row.appendChild(element);
  });
  createButtonFlipper(row, ["Edit", "Cancel"], rowIndex, [
    editRow,
    cancelOrConfirm,
  ]);
  createButtonFlipper(row, ["Delete", "Confirm"], rowIndex, [
    deleteRow,
    cancelOrConfirm,
  ]);
}

// button flipper div creation
function createButtonFlipper(row, names, rowIndex, callbacks) {
  const buttonFlipperElement = document.createElement("div");
  buttonFlipperElement.className = "button-flipper";
  names.forEach((buttonName, index) => {
    createButton(buttonFlipperElement, buttonName, rowIndex, callbacks[index]);
  });
  row.appendChild(buttonFlipperElement);
}

// creating the buttons for a row
function createButton(parent, buttonText, rowIndex, callBack) {
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.classList.add(buttonText.toLowerCase(), "btn");
  button.addEventListener("click", (e) => callBack(rowIndex, e));
  parent.appendChild(button);
}
// forming the table.
function formTable(list) {
  removeRowsNodes();
  list.forEach((rowData, index) => rowData && createRow(rowData, index));
}
// handling the cancel or confirm button clicks which have a lot of same logic so one func for both.
function cancelOrConfirm(index, e) {
  const currentRow = e.target.parentNode.parentNode;
  currentRow.querySelectorAll("[data-editable").forEach((element) => {
    (element.disabled = true) && element.classList.remove("edit-mode");
    element.value =
      e.target.textContent === "Cancel"
        ? element.textContent
        : (element.textContent = element.value);
  });
  e.target.textContent === "Confirm" && updateData(currentRow); // to continue
  currentRow
    .querySelectorAll(".button-flipper")
    .forEach((flipper) => flipper.classList.remove("flipped"));
}
// updating the current row with the new data
function updateData(row) {
  const studentsList = JSON.parse(localStorage.getItem("students"));
  row
    .querySelectorAll("[data-editable]")
    .forEach(
      (element) =>
        (studentsList[row.getAttribute("data-num-of-row")][
          element.getAttribute("data-name")
        ] = element.value)
    );
  localStorage.setItem("students", JSON.stringify(studentsList));
}

// I had a great Dilemma how to implement the delete function. everything was fine with splice till we had to take into consideration the cases where
// we remove a row after a search and we have to deal with the rows that comes after in the original studentList, because each one of them moves one index back
// and once splicing again, we won't splice the currect row because everything is messed up from that point.
// one option was to run over the next siblings (rows) that comes after the row which is being deleted and decrease their index by 1, which makes every
// delete operation O(n).
// I went with the other Option I could think of - instead of splicing, changing the value of the object which represents the row to null. so the remaining
// rows still  have the same index and operation is still O(1). Not sure how good practice it is though.
function deleteRow(index, e) {
  const currentRow = e.target.parentNode.parentNode;
  const studentsList = JSON.parse(localStorage.getItem("students"));
  studentsList[currentRow.getAttribute("data-num-of-row")] = null;
  localStorage.setItem("students", JSON.stringify(studentsList));
  currentRow.classList.add("on-delete-animation");
  setTimeout(() => (currentRow.outerHTML = ""), 1000);
}
// editing row Mode , when cancel and confirm buttons appear
function editRow(rowIndex, e) {
  setTimeout(() => {
    const flipper = e.target.parentNode;
    flipper.classList.add("flipped");
    flipper.nextSibling.classList.add("flipped");
    flipper.parentNode
      .querySelectorAll("[data-editable")
      .forEach(
        (element) =>
          (element.disabled = false || element.classList.add("edit-mode"))
      );
  }, 300);
}
//clearing table
function removeRowsNodes() {
  tableContainer.querySelectorAll(".table-row").forEach((row) => row.remove());
}
// search func
function searchByCategory() {
  formTable(
    JSON.parse(localStorage.getItem("students")).filter(
      (s) =>
        s &&
        new RegExp("^" + searchInput.value, "gi").test(s[searchDropDown.value])
    )
  );
}
// sorting funcs
function sortByCategory(category, callBack, mode) {
  formTable(
    JSON.parse(localStorage.getItem("students"))
      .filter((s) => s)
      .sort((a, b) =>
        mode === "asc"
          ? callBack(a[category], b[category])
          : callBack(b[category], a[category])
      )
  );
}

sortNumeric = (a, b) => a - b;
sortAlphabet = (a, b) => a.localeCompare(b);
// event handlers
searchInput.addEventListener("keyup", () => searchByCategory());
searchDropDown.addEventListener("change", () => searchByCategory());
categoriesButtonsSort.forEach((button) =>
  button.addEventListener("click", () => {
    sortByCategory(
      button.getAttribute("data-name"),
      button.getAttribute("data-type") === "numeric"
        ? sortNumeric
        : sortAlphabet,
      button.getAttribute("data-state") === "dsc"
        ? button.setAttribute("data-state", "asc") || "asc"
        : button.setAttribute("data-state", "dsc") || "dsc"
    );
    const logo = button.querySelector("i");
    logo.className =
      button.getAttribute("data-state") === "dsc"
        ? logo.className.replace("down", "up")
        : logo.className.replace("up", "down");
  })
);
// ~~~~~~~~~~~START POINT~~~~~~~~~`
async function start() {
  localStorage.getItem("students") ||
    localStorage.setItem("students", JSON.stringify(await fetchStudents()));
  formTable(JSON.parse(localStorage.getItem("students")));
}
start();
