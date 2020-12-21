// Put all the javascript code here, that you want to execute after page load.
const modalsample = `
<div class="modal micromodal-slide" id="input-modal" aria-hidden="true">
  <div class="modal__overlay" tabindex="-1" data-micromodal-close>
    <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="input-modal-title">
      <header class="modal__header">
        <h2 class="modal__title" id="input-modal-title">
          Chartify
        </h2>
        <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
      </header>
      <main class="modal__content" id="input-modal-content">
        <p>Please select the columns that has to be visualized</p>
        <form id="form">
          <div>
            <label for="xAxis">X Axis</label>
            <select name="xAxis" id="xAxis" class="select-dropdown"></select>
            <label for="yAxis">Y Axis</label>
            <select name="yAxis" id="yAxis" class="select-dropdown"></select>
          </div>
          <div>
            <label for="chartType">Type of Chart</label>
            <select name="chartType" class="select-dropdown">
              <option value="bar">Bar</option>
              <option value="line">Line</option>
            </select>
          </div>
        </form>
        <p id="error-msg"></p>
      </main>
      <footer class="modal__footer">
        <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Cancel</button>
        <button class="modal__btn modal__btn-primary" type="submit" form="form">Done</button>
      </footer>
    </div>
  </div>
</div>
`;

const chartColors = [
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(54, 162, 235)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)",
];
let headerLabels = [],
  formElement;

/*
// container: DOMElement
// chartType: string
// label: string
// xAxislabels: Array<string> - X axis labels
// yAxisValues: Array<number>
*/
function drawChart(container, chartType, label, xAxislabels, yAxisValues) {
  const chartColor = chartColors[Math.round(Math.random() * 6)];
  const chart = new Chart(container, {
    type: chartType,
    data: {
      labels: xAxislabels,
      datasets: [
        {
          label,
          data: yAxisValues,
          borderWidth: 1,
          fill: false,
          backgroundColor: chartColor,
          borderColor: chartColor,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
  return chart;
}

// return true if valid data
function validateData(dataValues) {
  return !dataValues.some(
    (val) =>
      val === null ||
      val === undefined ||
      Number.isNaN(val) ||
      typeof val === "string"
  );
}

/*
// table: DOMElement
// xIndex: number
// yIndex: number 
*/
function getColumnValues(table, xIndex, yIndex) {
  const rows = table.getElementsByTagName("tr");
  const xAxisLabels = [],
    yAxisValues = [];
  for (let i = 1; i < rows.length; i++) {
    const columnValues = Array.from(rows[i].getElementsByTagName("td")) || [];
    if (columnValues[xIndex] !== undefined) {
      xAxisLabels.push(columnValues[xIndex].innerText);
      if (columnValues[yIndex] !== undefined) {
        yAxisValues.push(
          Number(columnValues[yIndex].innerText.replace(/,/gi, ""))
        );
      } else {
        // if yAxis value is not valid then remove the corresponding x axis element
        xAxisLabels.pop();
      }
    }
  }
  const data = {
    xAxisLabels,
    yAxisValues,
  };
  return data;
}

// table: DOMElement
function getHeaderLabels(table) {
  const headers = Array.from(table.getElementsByTagName("th")) || [];
  const hLabels = headers.map((header) => header.innerText);
  return hLabels;
}

// Add Visualize button to the top right of the table
function renderVisualizationButtons() {
  const tableElements =
    Array.from(document.getElementsByTagName("table")) || [];

  tableElements.forEach((table, index) => {
    // Add button if the table doesn't already have the visualize button
    if (
      table.parentElement.getElementsByClassName("visualize-button").length ===
      0
    ) {
      const tableId = table.getAttribute("id") || `chartidy_table-${index}`;
      table.setAttribute("id", tableId);

      const button = document.createElement("button");
      button.innerText = "VISUALIZE";
      button.setAttribute("data-micromodal-trigger", "input-modal");
      button.classList.add("visualize-button");
      button.setAttribute("id", `visualize-button-${index}`);
      button.setAttribute("data-id", tableId);

      table.parentElement.insertBefore(button, table);

      const chartContainer = document.createElement("div");
      chartContainer.classList.add("chart-container");
      chartContainer.setAttribute("id", `${tableId}-chart`);
      table.parentElement.appendChild(chartContainer);

      MicroModal.init({ // skipcq: JS-0125
        onShow: (modal, trigger) => {
          if (trigger.type === "submit") {
            const triggeredTableId = trigger.dataset.id;
            formElement.setAttribute("data-id", triggeredTableId);

            const xAxisList = document.getElementById("xAxis");
            const yAxisList = document.getElementById("yAxis");
            xAxisList.innerHTML = "";
            yAxisList.innerHTML = "";

            headerLabels = getHeaderLabels(
              document.getElementById(triggeredTableId)
            );
            headerLabels.forEach((header, i) => {
              const optionElement = document.createElement("option");
              optionElement.setAttribute("value", i);
              optionElement.innerText = header;
              xAxisList.appendChild(optionElement);
              yAxisList.appendChild(optionElement.cloneNode(true));
            });
          }
        },
      });
    }
  });
}

// Event Handler for the form on the modal
function onSubmitForm(ev) {
  ev.preventDefault();
  const xIndex = parseInt(ev.target.xAxis.value, 10),
    yIndex = parseInt(ev.target.yAxis.value, 10),
    chartType = ev.target.chartType.value,
    formId = ev.target.dataset.id;

  const table = document.getElementById(formId);
  const data = getColumnValues(table, xIndex, yIndex);
  const isValidData = validateData(data.yAxisValues);
  if (isValidData) {
    const chartCanvas = document.createElement("canvas");

    document.getElementById(`${formId}-chart`).appendChild(chartCanvas);
    drawChart(
      chartCanvas,
      chartType,
      `${headerLabels[xIndex]} vs ${headerLabels[yIndex]}`,
      data.xAxisLabels,
      data.yAxisValues
    );

    MicroModal.close("input-modal"); // skipcq: JS-0125
  } else {
    document.getElementById("error-msg").innerText =
      "Please select valid numbers-only Y-axis column";
  }
}

window.addEventListener("load", () => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = modalsample;
  document.body.appendChild(wrapper);
  formElement = document.getElementById("form");
  formElement.addEventListener("submit", onSubmitForm);
  // render visualize buttons if there are any tables on screen
  renderVisualizationButtons();
});

// observe for the table changes and render the Visualize button
const observer = new MutationObserver(() => {
  renderVisualizationButtons();
});

if (document.getElementById("historicalData") !== null) {
  observer.observe(document.getElementById("historicalData"), {
    attributes: true,
    subtree: true,
    characterData: true,
  });
}
