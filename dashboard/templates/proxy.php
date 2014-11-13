<?php

// get METHOD
$request_method = $_SERVER['REQUEST_METHOD'];

//$request_url = urldecode('http://127.0.0.1:8000/api/throughputs/');
$request_url = urldecode('http://datalib-analytics-api-dev.crowdx.co/api/throughputs/');


/**'http://datalib-analytics-api-dev.crowdx.co/api/throughputs/'
 * Set debugging to true to receive additional messages - really helpful on development
 */
define( 'CSAJAX_DEBUG', true );


// identify request headers
$request_headers = array( );
foreach ( $_SERVER as $key => $value ) {
	if ( substr( $key, 0, 5 ) == 'HTTP_' ) {
		$headername = str_replace( '_', ' ', substr( $key, 5 ) );
		$headername = str_replace( ' ', '-', ucwords( strtolower( $headername ) ) );
		if ( !in_array( $headername, array( 'Host', 'X-Proxy-Url' ) ) ) {
			$request_headers[] = "$headername: $value";
		}
	}
}

// append query string for GET requests   --> filters
if ( $request_method == 'GET') {
	//var_dump($_GET);
	// get PARAMS
	$request_url .= '?';
	foreach ( $_GET as $key => $value ) {
		$request_url .= $key.'='.$value.'&';
    };
//	$request_params = json_decode($myData, true);          // --> array
//		echo " • params: ".json_encode($request_params)." \n\n";
}

// let the request begin
$ch = curl_init( $request_url );
curl_setopt( $ch, CURLOPT_HTTPHEADER, $request_headers );   // (re-)send headers
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );	 // return response
curl_setopt( $ch, CURLOPT_HEADER, true );	   // enabled response headers
/*
// add data for POST requests
if ( 'POST' == $request_method ) {
	if(is_array( $request_params ) ) {
		$post_data = array();
   		foreach($request_params as $k => $v){ 
    	  $post_data[$k] = $v; 
   		}
	}
	//echo " • params: ".json_encode($post_data)." \n\n";
	curl_setopt( $ch, CURLOPT_POST, true );
	curl_setopt( $ch, CURLOPT_POSTFIELDS,  json_encode($post_data) );
} 
*/
// retrieve response (headers and content)
$response = curl_exec( $ch );
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
//echo  ( " • status code: ".$http_status."\n\n");

// split response to header and content
list($response_headers, $response_content) = preg_split( '/(\r\n){2}/', $response, 2 );

// (re-)send the headers
$response_headers = preg_split( '/(\r\n){1}/', $response_headers );
foreach ( $response_headers as $key => $response_header ) {
	// Rewrite the `Location` header, so clients will also use the proxy for redirects.
	if ( preg_match( '/^Location:/', $response_header ) ) {
		list($header, $value) = preg_split( '/: /', $response_header, 2 );
		$response_header = 'Location: ' . $_SERVER['REQUEST_URI'] . '?csurl=' . $value;
	}
	if ( !preg_match( '/^(Transfer-Encoding):/', $response_header ) ) {
		header( $response_header, false );
	}
}

// finally, output the content
echo($response_content);

function csajax_debug_message( $message )
{
	if ( true == CSAJAX_DEBUG ) {
		print $message . PHP_EOL;
	}
}
?>
