<?php
	$inData = getRequestInfo();
	
    $id = $inData["id"];
	$firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$userId = $inData["userId"];

	if (empty($firstName) || empty($lastName) || empty($phone) || empty($email)) {
        returnWithError("missing required fields.");
        exit();
    }

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ? AND UserID = ?");
		$stmt->bind_param("ssssss", $firstName, $lastName, $phone, $email, $id, $userId);

		if ($stmt->execute()) 
		{
        	returnWithError("");
    	}
		else
		{
        	returnWithError("update failed: " . $stmt->error);
    	}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>