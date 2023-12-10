/**
 * @name 				main.js
 * @description 		Initializes script
 * @author 				Domenic Polsoni
 * @version 			0.1
*/

import
{
	isAVIFSupported,
	validateImage
} from './modules/image-functions.js';
import
{
	hideMessage,
	getExtension,
	fileSize,
	toggleOverlay,
	openSubmitMsg,
	displayLoader,
	hideLoader,
} from './modules/utils.js';
import
{
	readImageFile,
	attachToForm
} from './modules/image-functions.js';
import 
{
	convert
} from './modules/convert.js';

'use strict';


// Initialize script
(function ()
{
	let fileInputs = document.querySelectorAll('[data-image-file-input]')

	// Check for AVIF support
	isAVIFSupported(fileInputs, () =>
	{
		Array.from(fileInputs).forEach(fileInput =>
		{
			let formSection = fileInput.closest('.form-section'),
				imageContainers = formSection.querySelectorAll('.image-container'),
				outputImagesList = formSection.querySelector('.output-images-list'),
				convertedFormatSelect = formSection.querySelector('.converted-format'),
				qualityInput = formSection.querySelector('.quality');

			// Set default quality on load (none for lossless)
			if (!convertedFormatSelect[convertedFormatSelect.selectedIndex].dataset.lossless)
			{
				qualityInput.disabled = false;
				qualityInput.value = 50;
			}
			// Set quality on format change (lossless formats do not require quality)
			convertedFormatSelect.addEventListener('change', (e) =>
			{
				let sIndex = e.target.selectedIndex;
				convertedFormatSelect[sIndex].dataset.lossless === "1" ? qualityInput.disabled = true : qualityInput.disabled = false;
				qualityInput.value = 50;
			});

			// Reset the file input and form state to default
			fileInput.addEventListener('click', function (e)
			{
				let fileInput = e.target;

				// Clear out the old values
				fileInput.value = null;

				// Hide the image preview
				outputImagesList.classList.remove('d-block');

				// Clear out image containers and file size
				Array.from(imageContainers).forEach(imageContainer =>
				{
					let fileSizeContainer = imageContainer.nextElementSibling;
					fileSizeContainer.querySelector('span').innerHTML = '';

					imageContainer.innerHTML = '';
				});

				// Disable submit button
				document.getElementById('submit-form').disabled = true;

				// Hide any errors
				hideMessage(fileInput);
			});

			// What happens after the image is selected
			fileInput.addEventListener('change', function (e)
			{
				let fileInput = e.target,
					file = fileInput.files[0],
					orginalImageContainers = formSection.querySelectorAll('.original'),
					convertedImageContainers = formSection.querySelectorAll('.converted');

				// Validate size and file type
				validateImage(fileInput, file, (isValidImage) =>
				{
					if (isValidImage)
					{
						// Display the image preview
						outputImagesList.classList.add('d-block');

						// ORIGINAL: Preview the original selected image
						Array.from(orginalImageContainers).forEach(imageContainer =>
						{
							let prevImgElem = document.createElement('img'),
								fileSizeContainer = imageContainer.nextElementSibling,
								fSize = '';

							imageContainer.appendChild(prevImgElem);

							readImageFile(file, result =>
							{
								prevImgElem.src = result;

								// Insert file size
								fSize = fileSize(file.size);
								fileSizeContainer.querySelector('span').innerHTML = fSize;

								// add file format to original image container
								imageContainer.previousElementSibling.innerHTML = "Original: <strong>" + getExtension(file.name).toUpperCase() + "</strong>";
							});
						});

						// CONVERTED: Preview the converted image
						Array.from(convertedImageContainers).forEach(imageContainer =>
						{
							let formSection = fileInput.closest('.form-section'),
								prevImgElem = document.createElement('img'),
								fileSizeContainer = imageContainer.nextElementSibling,
								convertedFormat = formSection.getElementsByClassName('converted-format')[0].value,
								quality = parseFloat(formSection.getElementsByClassName('quality')[0].value) / 100,
								loader = displayLoader(imageContainer.closest('.image-preview-container')); // Display loader

							imageContainer.appendChild(prevImgElem);

							let options =
							{
								quality: quality,
								convertedFormat: convertedFormat,	
								file: file
							};
							convert({ options }, ({ blob, canvas }) =>
							{
								// Insert file size
								let fSize = fileSize(blob.size);
								fileSizeContainer.querySelector('span').innerHTML = fSize;

								// Load the converted preview
								prevImgElem.src = canvas.toDataURL(`image/${convertedFormat}`, quality);

								// add file format to original image container
								imageContainer.previousElementSibling.innerHTML = `Converted: <strong>${convertedFormat.toUpperCase()}</strong>`;
								
								// Clear out current value from file input
								fileInput.value = null;

								// Attach the converted file
								fileInput.files = attachToForm(file, blob, convertedFormat);

								// Hide the loader
								hideLoader(loader);

								// Enable submit button
								document.getElementById('submit-form').disabled = false;
							});

						});
					}
				});
			});
		});
	});

	// Save the files to the server
	document.getElementById('submit-form').addEventListener('click', e => 
	{
		e.preventDefault();

		let fd = new FormData(document.getElementsByTagName('form')[0]),
			fileInputs = document.querySelectorAll('[data-image-file-input]');

		const options =
		{
			method: "POST",
			body: fd
		};

		// Upload the image(s) to the server
		fetch('upload.php', options)
			.then(response => 
			{
				if (response.ok)
				{
					return response.json();
				}
				else
				{
					throw new Error('File upload(s) failed!');
				}
			})
			.then(json =>
			{
				// Show overlay
				toggleOverlay(false);

				// Restore file inputs to default
				Array.from(fileInputs).forEach((fileInput) =>
				{
					let formSection = fileInput.closest('.form-section'),
						imageContainers = formSection.querySelectorAll('.image-container'),
						outputImagesList = formSection.querySelector('.output-images-list');

					// Clear out the old values
					fileInput.value = null;

					// Hide the image preview
					outputImagesList.classList.remove('d-block');

					// Clear out image containers and file size
					Array.from(imageContainers).forEach(imageContainer =>
					{
						let fileSizeContainer = imageContainer.nextElementSibling;
						fileSizeContainer.querySelector('span').innerHTML = '';

						imageContainer.innerHTML = '';
					});

					// Disable submit button
					document.getElementById('submit-form').disabled = true;
				});

				// Output submit messages
				document.body.appendChild(openSubmitMsg(json));
			})
			.catch(error =>
			{
				console.error('Error uploading file: ', error);
			});
	});

	// Reset the form
	document.getElementById('reset-form').addEventListener('click', e => 
	{
		location.replace(location.origin + location.pathname);
	});
}());