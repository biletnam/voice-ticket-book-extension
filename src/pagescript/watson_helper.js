function callWatsonAPI(options, successCallback, errorCallback) {
	fetch(options.uri, {
		method: options.method,
		headers: {
			"Authorization": "Basic " + options.cred,
			"Content-Type" : options.reqType,
			"Accept": options.respType
		},
		body: options.body
	}).then(function (response) {
		if (response.status === 200 || response.status === 206) {
			if (options.respType === "application/json") {
				response.json().then(successCallback);
			}
			else {
				response.text().then(successCallback);
			}
		}
		else if (response.status === 403) {
			errorCallback("FORBIDDEN");
		}
		else if (response.status === 404) {
			errorCallback("NOT_FOUND");
		}
		else {
			errorCallback("FAILED");
		}
	});
}