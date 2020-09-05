var appData = {
  etherscanGastracker: {}
};

chrome.alarms.create('fetch_gas_price',{
  "periodInMinutes": 3
});

chrome.alarms.onAlarm.addListener(alarm => {
  fetchGasPrice();
});

function updateBadge() {
  chrome.storage.sync.get({
    gasPriceOption: "ProposeGasPrice",
  }, function(items) {
    const gasPrice = appData.etherscanGastracker[items.gasPriceOption];
    console.log(gasPrice);
    chrome.browserAction.setBadgeText({text: String(parseInt(gasPrice))});
  });
}

function fetchGasPrice() {
  return fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle")
    .then((res) => {return res.json()})
    .then(data => {
      // Store the current data for the popup page
      appData.etherscanGastracker = data.result;
      // Update badge
      updateBadge();
    });
}

fetchGasPrice(); // Initial fetch