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
        <p>Please enter the index number of the column from where the data has to be visualized</p>
        <form id="form">
          <label for="xAxis">X Axis</label>
          <select name="xAxis" id="xAxis"></select>
          <label for="yAxis">Y Axis</label>
          <select name="yAxis" id="yAxis"></select>
          <label for="chartType">Type of Chart</label>
          <select name="chartType">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
          </select>
        </form>
      </main>
      <footer class="modal__footer">
        <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Cancel</button>
        <button class="modal__btn modal__btn-primary" type="submit" form="form">Done</button>
      </footer>
    </div>
  </div>
</div>
`;

const chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
let headerLabels = [];

const observer = new MutationObserver((mutation) => {
  console.log("DOM mutation detected");
  renderVisualizationButtons();
});

observer.observe(document.getElementById("historicalData"), {
  attributes: true
});
window.addEventListener('load', () => {
  document.body.innerHTML += modalsample;

  let button = document.createElement('button');
  button.innerText = 'VISUALIZE';
  button.setAttribute('data-micromodal-trigger', 'input-modal');
  
  
  document.getElementById('historicalData').parentNode.insertBefore(button, document.getElementById('historicalData'));
  MicroModal.init({
    onShow
  });
  document.getElementById('form').addEventListener('submit', onSubmitForm);
});

function onShow() {
  const table = document.getElementsByTagName('table')[0];
    tableParent = document.getElementById('historicalData'),
    headerLabels = getHeaderLabels(table);

    const xAxisList = document.getElementById('xAxis');
    const yAxisList = document.getElementById('yAxis');

    headerLabels.forEach((header, index) => {
      const optionElement = document.createElement('option');
      optionElement.setAttribute('value', index);
      optionElement.innerText = header;
      xAxisList.appendChild(optionElement);
      yAxisList.appendChild(optionElement.cloneNode(true));
    });

    let chartContainer = document.createElement('div');
    chartContainer.classList.add('chart-container');
    chartContainer.setAttribute('id', 'chart-container');
    tableParent.appendChild(chartContainer);
}

function onSubmitForm(ev) {
  ev.preventDefault();
  const xIndex = parseInt(ev.target.xAxis.value),
  yIndex = parseInt(ev.target.yAxis.value),
  chartType = ev.target.chartType.value;

  const table = document.getElementsByTagName('table')[0];
  const data = getColumnValues(table, xIndex, yIndex);

  let chartCanvas = document.createElement('canvas');
  chartCanvas.setAttribute('id', 'chart');

  document.getElementById('chart-container').appendChild(chartCanvas);

  drawChart(chartCanvas, chartType, `${headerLabels[xIndex]} vs ${headerLabels[yIndex]}`, data.xAxisLabels, data.yAxisValues);

  MicroModal.close("input-modal");
}

function renderVisualizationButtons() {
  let tables = document.getElementsByTagName("table");

  for (let i = 0; i < tables.length; i++) {
    let button = document.createElement("button");
    button.innerText = "VISUALIZE";
    button.setAttribute("data-micromodal-trigger", "input-modal");
    let table = tables[i];
    table.parentElement.insertBefore(button, table);
    // MicroModal.init();
  }
}

/*
// labels: Array<string> - X axis labels
// data: Array<number>
// chartType: string
// label: string
*/
function drawChart(container, chartType, label, xAxislabels, yAxisValues) {
  var chart = new Chart(container, {
    type: chartType,
    data: {
      labels: xAxislabels,
      datasets: [{
          label: label,
          data: yAxisValues,
          borderWidth: 1,
          fill: false,
					backgroundColor: chartColors.blue,
					borderColor: chartColors.blue
      }]
    },
    options: {
      responsive: true
    }
  });
  return chart;
}

function getHeaderLabels(table) {
  const headers = Array.from(table.getElementsByTagName('th'));
  const headerLabels = headers.map(header => header.innerText);
  return headerLabels;
}

function getColumnValues(table, xIndex, yIndex) {
  const rows = table.getElementsByTagName('tr');
  const xAxisLabels = [], yAxisValues = [];
  for(let i = 1; i < rows.length; i++ ) {
    const columnValues = Array.from(rows[i].getElementsByTagName('td'));
    xAxisLabels.push(columnValues[xIndex].innerText);
    yAxisValues.push(numeral(columnValues[yIndex].innerText).value());
  }
  const data = {
    xAxisLabels,
    yAxisValues
  }
  return data;
} 