<?php
	require_once '../../app/includes/db.php';
	
	$inData = getRequestInfo();

	$id = $inData["id"];          // contact ID to delete
	$userId = $inData["userId"];  // user making the request

	$conn = getDBConnection();
	if (!$conn) 
	{
		returnWithError("Database connection failed");
	} 
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
		$stmt->bind_param("ss", $id, $userId);

		if ($stmt->execute())
		{
        	if ($stmt->affected_rows > 0)
			{
            	returnWithError("");
        	}
			else
			{
            	returnWithError("No matching contact found to delete.");
        	}
    	}
		else
		{
        	returnWithError("Delete failed: " . $stmt->error);
    	}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
?>
