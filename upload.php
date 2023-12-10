<?php

$json = [];

foreach ($_FILES as $file)
{
	$filename = $file['name'];
	$save_location = "images/converted/$filename";
  
	if (is_uploaded_file($file['tmp_name']))
	{
		if (move_uploaded_file($file['tmp_name'], $save_location))
		{
			$json[]['success'] = "<strong>$filename</strong> uploaded successfully!";
		}
		else
		{
			$json[]['error'] = "Error uploading file(s).";
		}
	}
}

echo json_encode($json);
?>