// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs')

var websitesJSON = require("./websites.json")
console.log(websitesJSON)

var favicon = require('favicon')
var dialogs = require('dialogs')()

var rootElement = document.getElementById("main")
let activeIndex = 1

initApplication()

function initApplication()
{
	var windowTopBar = document.getElementById('topbar')
	windowTopBar.style.webkitAppRegion = "drag"
	//windowTopBar.classList.add('topbar')
	//document.body.appendChild(windowTopBar)

	generateTabbedFrames()
}


function generateTabbedFrames()
{
	rootElement.innerHTML = ""

	websitesJSON.websites.forEach((site, index) =>
	{
		console.log(site)

		let tabInput  	 = document.createElement('input')
		tabInput.id      = `tab${index+1}`
		tabInput.type 	 = "radio"
		tabInput.name 	 = "tabs"
		tabInput.checked = (index == activeIndex)

		tabInput.onclick = () => { activeIndex = index }

		let tabLabel = document.createElement('label')
		tabLabel.id = `label${index+1}`
		tabLabel.setAttribute('for', `tab${index+1}`)
		tabLabel.innerHTML = site.name

		rootElement.appendChild(tabInput)
		rootElement.appendChild(tabLabel)
	})

	websitesJSON.websites.forEach((site, index) =>
	{
		let contentDiv = document.createElement('section')
		contentDiv.id  = `content${index+1}`

		let webView 	  = document.createElement('webview')
		webView.id 		  = site.name
		webView.src 	  = site.url

		favicon(site.url, function(err, favicon_url)
		{
	  		let iconImage = new Image()
	  		let labelTarget = document.getElementById(`label${index+1}`)
	  		labelTarget.appendChild(iconImage)
	  		iconImage.src = favicon_url
	  		//iconImage.onload = (event) => {}; 
		})

		webView.setAttribute('autosize', 'on')
		webView.partition = 'electron'

		webView.style.width  = "100%"
		webView.style.height = "100%"

		contentDiv.appendChild(webView)
		rootElement.appendChild(contentDiv)
	})
}

function findActiveIndex(callBack) 
{
	var children = Array.from(rootElement.getElementsByTagName('input'))
	if(children.length > 0) 
	{
		callBack(children.findIndex(child => { return child.checked }))	
	} else {
		callBack(-1)
	}
}

// Add item

let addItemButton = document.getElementById("js__addItem")
addItemButton.addEventListener('click', function()
{
	dialogs.prompt('Name', response => 
	{
		if(response)
		{
			let itemName = response;
			dialogs.prompt('URL', 'http://', response => 
			{
				if(response) 
				{
					let itemURL = response
					let newItem = {name: itemName, url: itemURL}
					websitesJSON.websites.push(newItem)
					let data = JSON.stringify(websitesJSON, null, 2) 
        			fs.writeFileSync("./websites_new.json", data, 'utf-8')
        			generateTabbedFrames()
		    	}
		    })
	    }
	})
})

// Delete item

let deleteItemButton = document.getElementById("js__deleteItem")
deleteItemButton.addEventListener('click', function()
{
	dialogs.confirm('Delete Tab?', ok =>
	{
		if(ok) 
		{
			findActiveIndex( index => 
			{
				websitesJSON.websites.splice(index, 1)
	    		let data = JSON.stringify(websitesJSON, null, 2) 
        		fs.writeFileSync("./websites_new.json", data, 'utf-8')
        		generateTabbedFrames()
	  		})
  		}
	})
})

// Navigate

let navBackButton = document.getElementById("js__navBack")
navBackButton.addEventListener('click', function()
{
	let webview = document.getElementById(`content${activeIndex + 1}`).firstChild
	webview.goBack()
})

let navFowardButton = document.getElementById("js__navFoward")
navFowardButton.addEventListener('click', function()
{
	let webview = document.getElementById(`content${activeIndex + 1}`).firstChild
	webview.goForward()
})

setInterval(() =>
{
	let activeWebview = document.getElementById(`content${activeIndex + 1}`).firstChild

	let webViewIndex   = activeWebview.getWebContents().getActiveIndex()
	let webViewHistory = activeWebview.getWebContents().history

	if(webViewHistory.length > 1 && webViewIndex != 0)
		navBackButton.classList.add("topbar__button--active")
	else
		navBackButton.classList.remove("topbar__button--active")

	if(webViewIndex < (webViewHistory.length - 1))
		navFowardButton.classList.add("topbar__button--active")
	else
		navFowardButton.classList.remove("topbar__button--active")

}, 1000)