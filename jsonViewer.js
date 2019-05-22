function jsonViewer(rootElement) {

	function getElement(tagName, content) {
		const divElement = document.createElement(tagName);
		divElement.textContent = content;
		return divElement;
	}

	function getDivElement(content) { return getElement("div", content); }

	function getSpanElement(content) { return getElement("span", content); }

	function getStringDisplayValue(value) { return "\"" + value + "\""; }

	function clickHandler(event) {
		event.stopPropagation();
		const record = valueMap.get(event.currentTarget);

		// Create the event.
		var jsonViewerClickEvent = new CustomEvent("json-viewer-click", { detail: record });
		rootElement.dispatchEvent(jsonViewerClickEvent);
	}

	const valueMap = new Map();

	function renderJson(value, parentElement, parentObject, parentObjectKeyName) {
		const valueType = typeof value;
		const isUndefined = (valueType === "undefined");
		const isNull = (value === null);

		let valueElement;
		let valueTypeClass;
		if (!isUndefined) {
			switch (valueType) {
				case "string":
				case "number":
				case "boolean":
					const displayValue = (valueType === "string") ? getStringDisplayValue(value): value;
					valueElement = getSpanElement(displayValue);
					valueTypeClass = valueType;
					break;
				case "object":
					if (isNull) {
						valueElement = getSpanElement("null");
					} else {
						valueElement = document.createElement("div");
						const isArray = Array.isArray(value);
						const openingChar = (isArray) ? "[" : "{";
						const closingChar = (isArray) ? "]" : "}";
						const childElements = [];
						childElements.push(getDivElement(openingChar));

						const objectKeys = Object.keys(value);
						const lastKeyIndex = objectKeys.length - 1;
						objectKeys.forEach(function createKey(keyName, keyIndex) {
							const keyValueElement = document.createElement("div");
							if (!isArray) {
								const keySpanElement = getSpanElement(getStringDisplayValue(keyName));
								keySpanElement.className = "key";
								keyValueElement.appendChild(keySpanElement);
								keyValueElement.appendChild(getSpanElement(":"));
							}
							keyValueElement.className = "key-value";

							renderJson(value[keyName], keyValueElement, value, keyName);

							if (keyIndex < lastKeyIndex) {
								keyValueElement.appendChild(getSpanElement(","));
							}

							childElements.push(keyValueElement);
						});

						childElements.push(getDivElement(closingChar));

						childElements.forEach(function append(childElement) {
							valueElement.appendChild(childElement);
						});
					}
					break;
			}
		} else {
			valueElement = getSpanElement("undefined");
		}

		valueMap.set(valueElement, {
			parent: parentObject,
			parentKey: parentObjectKeyName,
			value: value
		});

		valueElement.classList.add("value");
		if (valueTypeClass) {
			valueElement.classList.add(valueTypeClass);
		}
		valueElement.addEventListener("click", clickHandler);

		parentElement.appendChild(valueElement);
	}

	return {
		render: function(valueToRender) {
			renderJson(valueToRender, rootElement);
		},
		destroy: function() {
			valueMap.clear();
			while(rootElement.lastChild) {
				rootElement.removeChild(rootElement.lastChild);
			}
		}
	};
}
