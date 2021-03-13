let studentsList = [];
const tableContainer = document.querySelector(".table-container");

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

function createRow(rowData, rowIndex) {
  const row = document.createElement("div");
  row.className = "table-row";
  createColumns(row, rowData, rowIndex);
  tableContainer.appendChild(row);
}

function createColumns(row, rowDataObj, rowIndex) {
  Object.keys(rowDataObj).forEach((property) => {
    const element = document.createElement("textarea");
    element.textContent = rowDataObj[property];
    property.toString() !== "id" && element.setAttribute("data-editable", "");
    element.disabled = true;
    row.appendChild(element);
  });
  const buttonFlipperElement = document.createElement("div");
  buttonFlipperElement.className = "button-flipper";
  createButton(buttonFlipperElement, "Edit", rowIndex, editRow);
  createButton(buttonFlipperElement, "Cancel", rowIndex, cancelOrConfirm);
  row.appendChild(buttonFlipperElement);
  const buttonFlipperElement2 = document.createElement("div");
  buttonFlipperElement2.className = "button-flipper";
  createButton(buttonFlipperElement2, "Delete", rowIndex, deleteRow);
  createButton(buttonFlipperElement2, "Confirm", rowIndex, cancelOrConfirm);
  row.appendChild(buttonFlipperElement2);
}

function createButton(parent, buttonText, rowIndex, callBack) {
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.classList.add(buttonText.toLowerCase(), "btn");
  button.addEventListener("click", (e) => callBack(rowIndex, e));
  parent.appendChild(button);
}

function formTable() {
  removeRowsNodes();
  studentsList.forEach((rowData, index) => createRow(rowData, index));
}

function cancelOrConfirm(index, e) {
  e.target.parentNode.parentNode
    .querySelectorAll("[data-editable")
    .forEach((element) => {
      (element.disabled = true) && element.classList.remove("edit-mode");
      element.value =
        e.target.textContent === "Cancel"
          ? element.textContent
          : (element.textContent = element.value);
    });
  e.target.parentNode.parentNode
    .querySelectorAll(".button-flipper")
    .forEach((flipper) => flipper.classList.remove("flipped"));
}

function deleteRow(index, e) {
  studentsList.splice(index, 1);
  e.target.parentNode.parentNode.classList.add("on-delete-animation");
  setTimeout(() => (e.target.parentNode.parentNode.outerHTML = ""), 1000);
}

function editRow(rowIndex, e) {
  setTimeout(() => {
    e.target.parentNode.classList.add("flipped");
    e.target.parentNode.nextSibling.classList.add("flipped");
    e.target.parentNode.parentNode
      .querySelectorAll("[data-editable")
      .forEach(
        (element) =>
          (element.disabled = false || element.classList.add("edit-mode"))
      );
  }, 300);
}

async function start() {
  studentsList = await fetchStudents();
  formTable();
}
start();

//
function removeRowsNodes() {
  tableContainer.querySelectorAll(".table-row").forEach((row) => row.remove());
}
