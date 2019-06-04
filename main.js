document.addEventListener("DOMContentLoaded", function(event) {
	// Load navigation items
	loadNavigationItems();

	// Refresh pahe when there is a routing/history action
	window.onpopstate = function(e) {
	  refreshPage();
	};

	// Forms
	setFormActions();
});

function refreshPage(){
	let urlArr = window.location.href.split("/");
	let currentLocation = urlArr[urlArr.length-1];
	if(currentLocation === ""){
		document.getElementById("other-page").style.display = "none";
		document.getElementById("main-page").style.display = "flex";
	}else{
		document.getElementById("main-page").style.display = "none";
		document.getElementById("other-page").style.display = "block";
		let children = document.getElementById("other-page").childNodes;
		// h1
		children[1].textContent = currentLocation;
	}

	// Set active mobile nav
	let mobileNavItems = document.body.querySelectorAll(".nav-item");
	for(var i = 0; i < mobileNavItems.length; i++){
		mobileNavItems[i].setAttribute("class", "nav-item");
	}

	let mobileLocations = ["rankings", "tournaments", "settings"];
	if(mobileLocations.includes(currentLocation)){
		let activeMobileNavItem = document.body.querySelector("."+currentLocation+"-icon");
		activeMobileNavItem.parentElement.setAttribute("class", "nav-item nav-item-active");
	}
}

function setFormActions(){
	let forms = document.forms;
	for(var i = 0; i < forms.length; i++){
		forms[i].onsubmit = function(e){
			let formNameArr = e.target.name.split("-");
			guessNumber(e.target, formNameArr[1], e.target[0].value);
			return false;
		}
	}
}

function guessNumber(form, player, number){
	let status = validateParams(player, number);
	var messageElem = form.querySelector("p.message");
	if(status.valid){
		messageElem.textContent = "";
		let url = "https://www.drukzo.nl.joao.hlop.nl/challenge.php?player=" + player + "&guess=" + number;
		getRequest(url, function(response){
			let responseObj = JSON.parse(response);
			if(responseObj.guess == "Bingo!!!"){
				messageElem.textContent = "Winner!";
				// Disable buttons
				let submitButtons = document.body.querySelectorAll("input[type='submit']");
				for(var i = 0; i < submitButtons.length; i++){
					submitButtons[i].disabled = true;
					submitButtons[i].setAttribute("class", "disabled");
				}
			}else{
				messageElem.setAttribute("class", "message");
				messageElem.textContent = "Go " + responseObj.guess + "!";
			}

		}, function(error){
			let errorObj = JSON.parse(error);
			messageElem.setAttribute("class", "message error");
			messageElem.textContent = errorObj.error;
		});
	}else{
		messageElem.setAttribute("class", "message error");
		messageElem.textContent = status.reason;
	}
}

function validateParams(player, number){
	let playerWhitelist = ["1", "2", "3"];
	if(player == "") { return { valid: false, reason: "Player cannot be empty!" }; }
	if(number == "") { return { valid: false, reason: "Number cannot be empty!" }; }
	if(number < 0) { return { valid: false, reason: "Number cannot be lower than 0!" }; }
	if(number > 100) { return { valid: false, reason: "Number cannot be higher than 100!" }; }
	if(!playerWhitelist.includes(player)) { return { valid: false, reason: "There can only be player 1, 2, or 3!" }; }
	return { valid: true, reason: "" };
}

/* 
	Dom Manipulation
*/
function loadNavigationItems(){
	getRequest("navigation_items.json", function(response){
		let navigationItems = JSON.parse(response);
		
		// Generate Desktop navigation
		let desktopItems = navigationItems.desktop;
		let desktopNavContainer = document.getElementById("navigation");
		for(var i = 0; i < desktopItems.length; i++){
			let lastCategory = i === (desktopItems.length -1);
			let categoryNode = createNavigationCatgeory(desktopItems[i], lastCategory);
			desktopNavContainer.append(categoryNode);
		}

		// Generate Mobile navigation
		let mobileItems = navigationItems.mobile;
		let mobileNavContainer = document.getElementById("navigation-mobile");
		for(var i = 0; i < mobileItems.length; i++){
			let mobileNavNode = createMobileNavigationNode(mobileItems[i]);
			mobileNavContainer.append(mobileNavNode);
		}

		// Make special link a singlepage anchor
		document.getElementById("special-link").onclick = function(e){
			navigateSinlePage(e);
			return false;
		};

	}, function(error){
		console.log("Something went wrong with loading the Json Navigation");
		console.log(error);
	});
}

function createMobileNavigationNode(navItem){
	let containerNode = createDomElement("DIV", "", [
		{
			name: "class",
			value: "nav-item"
		}
	]);

	containerNode.onclick = function(){
		window.history.pushState(null, null, navItem.slug);
		refreshPage();
	}

	let iconNode = createDomElement("DIV", "", [
		{
			name: "class",
			value: "nav-icon " + navItem.iconClass
		}
	]);

	let paragraphNode = createDomElement("P", navItem.title, []);

	containerNode.append(iconNode);
	containerNode.append(paragraphNode);
	return containerNode;
}

function createNavigationCatgeory(navItem, lastCategory){
	let listNode = createDomElement("UL", "", []);

	// Category
	let categoryNode = createDomElement("LI", navItem.category, [
		{
			name: "class",
			value: "nav-subtitle"
		}
	]);
	listNode.appendChild(categoryNode);

	// Links
	for(var i = 0; i < navItem.links.length; i++){
		let listItemNode = createDomElement("LI", "", []);
		let linkNode = createDomElement("A-singlepage", navItem.links[i].title, [
			{
				name: "href",
				value: navItem.links[i].slug
			}
		]);
		listItemNode.appendChild(linkNode);
		listNode.appendChild(listItemNode);
	}

	if(!lastCategory){
		let separatorNode = createDomElement("div", "", [{ name: "class", value: "separator" }]);
		listNode.append(separatorNode);
	}
	
	return listNode;
}

function createDomElement(type, text, attributes){
	let singlePage = false;
	if(type === "A-singlepage"){ 
		type = "A";
		singlePage = true;
	}

	let node = document.createElement(type);
	// Add attributes
	for(var i = 0; i < attributes.length; i++){
		let nodeAttr = document.createAttribute(attributes[i].name);
		nodeAttr.value = attributes[i].value;
		node.setAttributeNode(nodeAttr);
	}
	// Add text
	if(text != ""){
		let textNode = document.createTextNode(text);
		node.appendChild(textNode);
	}

	if(singlePage){ 
		node.onclick = function(e){
			navigateSinlePage(e);
			return false;
		};
	}

	return node;
}

function navigateSinlePage(e){
	window.history.pushState(null, null, e.target.href);
	refreshPage();
}

/* 
	Helpers
*/
function getRequest(url, callback, errorCallback){
	let xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', url, true);
	xobj.onload = function () {
		callback(xobj.responseText);
	};
	xobj.onerror = function () {
		errorCallback(xobj.responseText);
	};
	xobj.send(null);  
}