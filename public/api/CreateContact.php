<?php
	require_once '../../app/includes/db.php';
	
	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$userId = $inData["userId"];

	if (empty($firstName) || empty($lastName) || empty($phone) || empty($email)) {
        returnWithError("missing required fields.");
        exit();
    }

	$conn = getDBConnection();
	if (!$conn) 
	{
		returnWithError( "Database connection failed" );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserId) VALUES(?,?,?,?,?)");
		$stmt->bind_param("sssss", $firstName, $lastName, $phone, $email, $userId);
		
		if ($stmt->execute())
		{
        	$id = $conn->insert_id;
        	returnWithInfo($firstName, $lastName, $id);
    	} 
		else 
		{
        	returnWithError("error inserting contact: " . $stmt->error);
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
		$retValue = '{"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>