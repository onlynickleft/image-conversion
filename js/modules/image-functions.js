/**
 * @name 					image-functions.js
 * @description 	Handles image processing functions
 * @author 				Domenic Polsoni
 * @version				0.1
 */

import * as utils from './utils.js';

'use strict';

/**
 * Gets the mimetype of the file being uploaded
 * 
 * @function getMimeType
 * 
 * @param {string} firstHexCheck - The first hex value to determine the mimetype
 * @param {string} secondHexCheck - Along with the first value, this second value will assist in determining the mimetype (some cases require more specificity) 
 * @returns {string} - The file mimetype
 */
function getMimeType(firstHexCheck, secondHexCheck) 
{
	// AVIF
	if (firstHexCheck === '00000020' ||
		firstHexCheck === '0000001C')
	{
		return 'image/avif';
	}
	// PNG
	else if (firstHexCheck === '89504E47')
	{
		return 'image/png';
	}
	// GIF
	else if (firstHexCheck === '47494638')
	{
		return 'image/gif';
	}
	// PDF
	else if (firstHexCheck === '25504446')
	{
		return 'application/pdf';
	}
	// JPG
	else if (firstHexCheck === 'FFD8FFDB' ||
		firstHexCheck === 'FFD8FFE0' ||
		firstHexCheck === 'FFD8FFE1' ||
		firstHexCheck === 'FFD8FFEE')
	{
		return 'image/jpeg';
	}
	// WEBP
	else if (firstHexCheck === '52494646' && secondHexCheck === '57454250')
	{
		return 'image/webp';
	}
	return 'Unknown filetype';
}

/**
 * Loads the image blob into the file input as the specified converted format
 * 
 * @function attachToForm
 * @param {object} file - The selected file
 * @param {string} imgBlob The binary object to be converted to a file
 * @param {string} convertedFormat - The converted format 
 */
export function attachToForm(file, imgBlob, convertedFormat)
{
	// Load img blob to input
	let fileExt = convertedFormat === 'jpeg' ? 'jpg' : convertedFormat,
		fileName = `${utils.getImageFileName(file.name)}-${Date.now()}.${fileExt}`,
		newFile = new File([imgBlob], fileName, { type: imgBlob.type, lastModified: new Date().getTime() }, 'utf-8'),
		container = new DataTransfer();
	container.items.add(newFile);

	return container.files;
}

/**
 * Function that gets called once AVIF support has been determined.
 * 
 * @callback AVIFCallback
 */

/**
 * Checks to see if AVIF is supported. Responds accordingly.
 * 
 * @function isAVIFSupported
 * @param {HTMLLinkElement} fileInputs - The file inputs associated with the images to be selected
 * @param {AVIFCallback} callback - The callback that handles the response
 */
export function isAVIFSupported(fileInputs, callback)
{
	let avif = new Image();
	avif.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";

	// Supported, so add AVIF mimetype to the accept and format lists and enable the inputs and buttons
	avif.addEventListener('load', (e) =>
	{
		Array.from(fileInputs).forEach(fileInput =>
		{
			fileInput.setAttribute('accept', `${fileInput.getAttribute('accept')}, image/avif`);
		});
		callback();
	});

	// Not supported so just enable all buttons but don't allow AVIF mimetype
	avif.addEventListener('error', (e) =>
	{
		callback();
	});
}

/**
 * Callback that handles the whether to process the selected files or not based on their validation status
 * 
 * @callback validateImageCallback
 * @param {boolean} isValidImage - Whether the selected file is a valid image file format or not
 */

/**
 * Validate the selected image(s) to make sure that we're working with valid image formats.
 * 
 * @function validateImage
 * @param {HTMLInputElement} fileInput - Input associated with the selected file 
 * @param {File} imageFile - The image File Object
 * @param {validateImageCallback} callback - The callback that handles the response.
 */
export function validateImage(fileInput, imageFile, callback)
{
	let MAX_FILE_SIZE = parseInt(fileInput.dataset.maxFilesize),
		MAX_FILE_SIZE_ENG = `${Math.floor(MAX_FILE_SIZE / 1000000)} MB`,
		uint,
		bytes = [],
		hex,
		firstHex,
		secondHex,
		blob,
		mimetype,
		reader,
		extensionList;

	// Parse the list of acceptable image formats (default is listed)
	extensionList = !!utils.getAcceptedExtenstions(fileInput).join('|')
		? utils.getAcceptedExtenstions(fileInput).join('|')
		: 'gif|jpeg|png|webp';

	// Check for File API support
	if (typeof File !== 'undefined' && typeof FileReader !== 'undefined' && typeof FileList !== 'undefined')
	{
		// Instantiate a FileReader object to read the file's content into memory.
		reader = new FileReader();

		// Get file mimetype
		reader.addEventListener('load', function (e)
		{
			var result = e.target.result;
			uint = new Uint8Array(result);

			for (let i = 0, j = uint.length; i < j; i++) 
			{
				let thisByte = uint[i].toString(16);

				if (thisByte.length === 1)
				{
					thisByte = '0' + thisByte;
				}
				bytes.push(thisByte);
			}
			hex = bytes.join('').toUpperCase();

			// Get the first 4 bytes
			firstHex = hex.substring(0, 8);

			// Get bytes 8 - 11 (needed for some file types)
			secondHex = hex.substring(16);

			// Find out if we're working with the actual image mime type and not
			// just a missing or incorrect file extension.
			mimetype = getMimeType(firstHex, secondHex);

			// Is it an approved image
			if (!(new RegExp(`image\/(${extensionList})`)).test(mimetype))
			{
				utils.displayError(fileInput, `This is not a correct image file type. Please choose from either a ${utils.errorFileExts(fileInput)}`);
				callback(false);
			}
			else
			{
				// File size too large
				if (imageFile.size > MAX_FILE_SIZE)
				{
					utils.displayError(fileInput, 'The file size too large. Please choose another (' + MAX_FILE_SIZE_ENG + ' or less).');
					callback(false);
				}
				else
				{
					callback(true);
				}
			}
		});
		blob = imageFile.slice(0, 12);
		reader.readAsArrayBuffer(blob);
	}
	else
	{
		utils.displayError(fileInput, 'Unfortunately this functionality is not supported in your browser.');
		callback(false);
	}
}

export function readImageFile(file, callback)
{
	let reader = new FileReader();

	reader.addEventListener('load', (e) =>
	{
		callback(e.target.result);
	});
	reader.readAsDataURL(file);
}