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
          <label for="xAxis">X Axis</label>
          <select name="xAxis" id="xAxis" class="select-dropdown"></select>
          <label for="yAxis">Y Axis</label>
          <select name="yAxis" id="yAxis" class="select-dropdown"></select>
          <label for="chartType">Type of Chart</label>
          <select name="chartType" class="select-dropdown">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
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
let headerLabels = [];

const observer = new MutationObserver(() => {
  console.log("MutationObserver");
  renderVisualizationButtons();
});

if (document.getElementById("historicalData") !== null) {
  observer.observe(document.getElementById("historicalData"), {
    attributes: true,
    subtree: true,
    characterData: true,
  });
}

window.addEventListener("load", () => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = modalsample;
  document.body.appendChild(wrapper);
  document.getElementById("form").addEventListener("submit", onSubmitForm);
  renderVisualizationButtons();
});

function onShow() {
  const table = document.getElementsByTagName("table")[0];
  headerLabels = getHeaderLabels(table);

  const xAxisList = document.getElementById("xAxis");
  const yAxisList = document.getElementById("yAxis");
  xAxisList.innerHTML = "";
  yAxisList.innerHTML = "";

  headerLabels.forEach((header, index) => {
    const optionElement = document.createElement("option");
    optionElement.setAttribute("value", index);
    optionElement.innerText = header;
    xAxisList.appendChild(optionElement);
    yAxisList.appendChild(optionElement.cloneNode(true));
  });

  let chartContainer = document.createElement("div");
  chartContainer.classList.add("chart-container");
  chartContainer.setAttribute("id", "chart-container");
  table.parentElement.appendChild(chartContainer);
}

function onSubmitForm(ev) {
  ev.preventDefault();
  const xIndex = parseInt(ev.target.xAxis.value),
    yIndex = parseInt(ev.target.yAxis.value),
    chartType = ev.target.chartType.value;

  const table = document.getElementsByTagName("table")[0];
  const data = getColumnValues(table, xIndex, yIndex);
  const isValidData = validateData(data.yAxisValues);
  if (isValidData) {
    let chartCanvas = document.createElement("canvas");
    chartCanvas.setAttribute("id", "chart");

    document.getElementById("chart-container").appendChild(chartCanvas);
    drawChart(
      chartCanvas,
      chartType,
      `${headerLabels[xIndex]} vs ${headerLabels[yIndex]}`,
      data.xAxisLabels,
      data.yAxisValues
    );

    MicroModal.close("input-modal");
  } else {
    document.getElementById("error-msg").innerText =
      "Please select valid numbers-only Y-axis column";
  }
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

// Add Visualize button to the top right of the table
function renderVisualizationButtons() {
  const tableElements =
    Array.from(document.getElementsByTagName("table")) || [];

  tableElements.forEach((table) => {
    let button = document.createElement("button");
    button.innerText = "VISUALIZE";
    button.setAttribute("data-micromodal-trigger", "input-modal");
    button.classList.add("visualize-button");

    table.parentElement.insertBefore(button, table);

    MicroModal.init({
      onShow,
    });
  });
}

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
          label: label,
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

// table: DOMElement
function getHeaderLabels(table) {
  const headers = Array.from(table.getElementsByTagName("th")) || [];
  const headerLabels = headers.map((header) => header.innerText);
  return headerLabels;
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
      if (columnValues[yIndex] !== undefined)
        yAxisValues.push(
          Number(columnValues[yIndex].innerText.replace(/,/gi, ""))
        );
      else {
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
