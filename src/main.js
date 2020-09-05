function escapeHtml(html){
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

function selectOption(option) {
	// Curry function with option
	return function(e){
		chrome.storage.sync.set({
			'gasPriceOption': option
		});

		chrome.runtime.getBackgroundPage(backgroundPage=>{
			backgroundPage.updateBadge();
			updateDom();
			addClickListeners();
		});	
	};
}

function updateDom() {
	function renderDom(data) {
		let html = 
		`<div class="gasprice js-gasprice" data-option="SafeGasPrice">
			<span class="gasprice-number" >${escapeHtml(data.etherscanGastracker.SafeGasPrice)}</span>
			<span class="gasprice-label">Safe Low</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="ProposeGasPrice">
			<span class="gasprice-number data-option="average">${escapeHtml(data.etherscanGastracker.ProposeGasPrice)}</span>
			<span class="gasprice-label">Proposed</span>
		</div>`+
		`<div class="gasprice js-gasprice" data-option="FastGasPrice">
			<span class="gasprice-number">${escapeHtml(data.etherscanGastracker.FastGasPrice)}</span>
			<span class="gasprice-label">Fast</span>
		</div>`;

		// Update dom
		document.getElementsByClassName('js-popup')[0].innerHTML = html;
		addClickListeners();

		// Show selected option
		chrome.storage.sync.get({
			'gasPriceOption': 'ProposeGasPrice'
		}, (items)=>{
			let element = document.querySelectorAll(`div[data-option='${items.gasPriceOption}']`)[0];
			element.className += ' selected';
		});
	}

	chrome.runtime.getBackgroundPage(backgroundPage => {
		const data = backgroundPage.appData;
		if(typeof data.etherscanGastracker.SafeGasPrice !== 'undefined') {
			renderDom(data);
		}
		else {
			backgroundPage.fetchGasPrice().then(()=>{
				updateDom(); // Let's try again after data has been fetched
			});
		}
	});
	
}

function addClickListeners() {
	// Add click listeners
	let elements = document.getElementsByClassName('js-gasprice');
	for(let i=0; i<elements.length; i++) {
		const element = elements[i];
		// Select option when clicked
		element.addEventListener('click', selectOption(element.dataset.option));
	}
}

function start() {
	updateDom();
}

start();