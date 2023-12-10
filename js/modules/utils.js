/**
 * @name 					utils.js
 * @description 	Handles common ancillary functions 
 * @author 				Domenic Polsoni
 * @version 			0.1
*/

'use strict';

/**
 * Handles the displaying of image upload errors
 * 
 * @function displayError
 * 
 * @param {HTMLInputElement} fileInput - Input associated with the selected file
 * @param {string} message - The error message to display
 */
export function displayError(fileInput, message)
{
	let error = document.createElement('div'),
		formSection = fileInput.closest('.form-section');

	error.className = 'message error';
	error.innerHTML = message;

	formSection.appendChild(error);
}

/**
 * Handles the hiding of image upload errors
 * 
 * @function hideMessage
 * 
 * @param {HTMLInputElement} fileInput - Input associated with the selected file
 */
export function hideMessage(fileInput)
{
	let formSection = fileInput.closest('.form-section');
	if (!!formSection.querySelector('.message'))
	{
		formSection.removeChild(formSection.querySelector('.message'));
	}
}

/**
 * Gets the name of the image and removes the extension
 * 
 * @function getImageFileName
 * 
 * @param {string} fileName - The name of the file with extension
 * @return {string} - The name of the file without the extension
 */
export function getImageFileName(fileName)
{
	return fileName.replace(/\.[^/.]+$/, '');
}

/**
 * Get the list of allowed file extensions from the "accept" attribute in the file input
 * 
 * @function getAcceptedExtenstions
 * @param {HTMLInputElement} fileInput - The file input containing the accept attribute
 * @returns {string[]} - An array of extensions
 */
export function getAcceptedExtenstions(fileInput)
{
	let exts = !!fileInput.accept
		? fileInput
			.accept
			.split(',')
		: [],
		extsArray = [];

	if (exts.length > 0)
	{
		exts.forEach(ext =>
		{
			let temp = ext.trim();
			extsArray.push(`${temp.match(/\/(.+)$/)[1]}`);
		});
	}
	return extsArray;
}

/**
 * Grab extensions and output them as an error string.
 * 
 * @function errorFileExts
 * @param {HTMLInputElement} fileInput - Input associated with the selected file
 */
export function errorFileExts(fileInput)
{
	let extsArray = getAcceptedExtenstions(fileInput),
		output = '';

	for (let i = 0; i < extsArray.length; i++)
	{
		if (i === extsArray.length - 1)
		{
			output += `or <strong>${extsArray[i]}</strong>.`;
			return output;
		}
		else
		{
			output += `<strong>${extsArray[i]}</strong>, `;
		}
	};
}

/**
 * Display loader
 * 
 * @function displayLoader
 * @param {HTMLElement} loaderParent The parent that we're going to append the loader to
 * @returns {HTMLElement} the loader
 */
export function displayLoader(loaderParent)
{
	let loader = document.createElement('div');
	loader.classList.add('loader');
	loaderParent.appendChild(loader);

	return loader;
}

/**
 * Hide loader
 * 
 * @function hideLoader
 * @param {HTMLElement} loader The loader to be removed
 */
export function hideLoader(loader)
{
	loader.parentNode.removeChild(loader);
}

/**
 * Return file size in readable sizes (https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript)
 * 
 * @function fileSize
 * @param {number} fsBytes - The file size in bytes
 * @returns {string} - The file size in either megabytes or kilobytes along with its conversion type
 */
export function fileSize(fsBytes)
{
	if (!+fsBytes) 
	{
		return '0 B';
	}

	const k = 1024;
	const decimals = 2;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(fsBytes) / Math.log(k));

	return `${parseFloat((fsBytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Get image file extension
 * 
 * @function getExtension 
 * @param {string} filename - The name of the file
 */
export function getExtension(filename) 
{
	let extension = filename.split('.').pop();
	return extension;
}

/**
 * Creates a translucent overlay
 * 
 * @function createOverlay
 * @returns {HTMLDivElement} - The overlay to be displayed.
 */
function createOverlay()
{
	const overlay = document.createElement('div');
	overlay.id = 'overlay';
	return overlay;
}

/**
 * Toggles the displaying and hiding of the overlay once created
 *
 * @function toggleOverlay
 * @param {boolean} hide - Whether to hide the overlay not
 */
export function toggleOverlay(hide)
{
	let overlay = !!document.getElementById('overlay') ? document.getElementById('overlay') : createOverlay();
	if (hide)
	{
		overlay.parentNode.removeChild(overlay);
	}
	else
	{
		document.body.appendChild(overlay);
	}
}

/**
 * Define JSON
 * 
 * @typedef {string} JSON
 */

/**
 * Open modal popup with list of files successfully uploaded or errors
 * 
 * @function openSubmitMsg 
 * @param {JSON} json - JSON returned upon the uploading of the file featuring the message and type of message (error or file successfully uploaded)
 * @returns {HTMLUListElement} - The container featuring the message
 */
export function openSubmitMsg(json)
{
	let submitMessageContainer = document.createElement('div'),
		ul = document.createElement('ul'),
		closeButton = document.createElement('button');

	closeButton.id = 'close';
	closeButton.innerText = '✖';
	submitMessageContainer.id = 'submit-message-container';
	
	json.forEach(json =>
	{
		let li = document.createElement('li'),
			key = Object.keys(json);
		li.innerHTML = json[key];
		li.className = key;
		ul.appendChild(li);
	});
	submitMessageContainer.appendChild(ul);
	submitMessageContainer.appendChild(closeButton);

	// Close popup
	closeButton.addEventListener('click', (e) => 
	{
		closeSubmitMsg(submitMessageContainer);
		toggleOverlay(true);
	});

	return submitMessageContainer;
}

function closeSubmitMsg(submitMessageContainer)
{
	submitMessageContainer.parentNode.removeChild(submitMessageContainer);
}