/**
 * @name 			convert.js
 * @description 	Image conversion and compression functionality
 * @author 			Domenic Polsoni
 * @version 		0.1
*/

import { readImageFile } from './image-functions.js';

'use strict';

/**
 * Function that gets called once the image conversion has completed
 * 
 * @callback ConvertCallback
 */

/**
 * Takes the image selected from the file input and converts it to the selected type
 * 
 * @function convert
 * @param {Object} options 
 * @param {number} options.quality - Number between 0 - 1 used for lossy images only
 * @param {String} options.convertedFormat - The image type/format to be converted to (jpg, png, webp)
 * @param {File} options.file - The selected file object.
 * @param {ConvertCallback} - The callback that handles the response
 */
export function convert({ options }, callback)
{
	readImageFile(options.file, result =>
	{
		let image = new Image();
		image.addEventListener('load', () =>
		{
			const canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);

			canvas.toBlob((blob) =>
			{
				callback({
					blob: blob,
					canvas: canvas
				});

			}, `image/${options.convertedFormat}`, options.quality);
		});

		// Load the canvas img src from the selected file. Canvas will be converted afterward.
		image.src = result;
	});
}