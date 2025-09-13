<?php
	require_once '../../app/includes/db.php';
    
	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        returnWithError("Missing required fields.");
        exit();
    }

	$conn = getDBConnection(); 	
	
    if( !$conn )
	{
		returnWithError( "Database connection failed" );
	}
	else
	{
        $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
		$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
		
        if ($stmt->execute())
        {
			$id = $conn->insert_id;
			returnWithInfo($firstName, $lastName, $id);
		} 
        else 
        {
			returnWithError("Database error: " . $stmt->error);
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>