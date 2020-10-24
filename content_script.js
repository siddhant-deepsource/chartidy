// Put all the javascript code here, that you want to execute after page load.
let modal = `
<div id="modal-1" aria-hidden="true">
  <div tabindex="-1" data-micromodal-close>
    <div role="dialog" aria-modal="true" aria-labelledby="modal-1-title" >
      <header>
        <h2 id="modal-1-title">
          Modal Title
        </h2>
        <button aria-label="Close modal" data-micromodal-close></button>
      </header>
      <div id="modal-1-content">
        Modal Content
      </div>
    </div>
  </div>
</div>`;

const observer = new MutationObserver(mutation => {
    console.log('DOM mutation detected');
    renderVisualizationButtons();
});

observer.observe(document.getElementById('historicalData'), {
    attributes: true
});
window.addEventListener("load", () => {
    debugger;
    // document.body.innerHTML += modal;
});

function renderVisualizationButtons() {
    let tables = document.getElementsByTagName('table');
    
    for(let i = 0; i < tables.length; i++) {
        let button = document.createElement('button');
        button.innerText = 'VISUALIZE';
        button.setAttribute('data-micromodal-trigger', 'modal-1');
        let table = tables[i];
        table.parentElement.insertBefore(button, table);
        // MicroModal.init();
    }
}