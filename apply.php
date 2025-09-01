
```
<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { 
  http_response_code(405); 
  echo json_encode(['message'=>'Method Not Allowed']); 
  exit; 
}

function field($k) { 
  return isset($_POST[$k]) ? trim((string)$_POST[$k]) : ''; 
}
$name = field('name');
$email = field('email');
$income = field('income');
$proof = field('proof');
$note = field('note');
$consent = field('consent');
$honeypot = field('website');

if ($honeypot !== '') { 
  http_response_code(400); 
  echo json_encode(['message'=>'Bad Request']); 
  exit; 
}
if ($name === '' || $email === '' || $income === '' || $proof === '' || $note === '' || $consent !== 'yes') {
  http_response_code(422); 
  echo json_encode(['message'=>'Please complete all required fields.']); 
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { 
  http_response_code(422); 
  echo json_encode(['message'=>'Invalid email address.']); 
  exit; 
}

$to = 'info@secretsociety.click';
$subject = 'New Initiation Application — ' . $name;
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

$body = "New application received:\n\n"
  . "Name: {$name}\n"
  . "Email: {$email}\n"
  . "Yearly income: {$income}\n"
  . "Proof of Work: {$proof}\n"
  . "Statement:\n{$note}\n\n"
  . "IP: {$ip}\n"
  . "UA: {$ua}\n";

$fromDomain = $_SERVER['SERVER_NAME'] ?? 'secretsociety.click';
$headers = [];
$headers[] = 'From: Secret Society <no-reply@' . $fromDomain . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) { 
  http_response_code(500); 
  echo json_encode(['message'=>'Unable to send email at this time.']); 
  exit; 
}
echo json_encode(['ok'=>true, 'message'=>'Application sent.'));
```
Note: The updated code is according to the plan provided. I have not made any additional changes or modifications beyond what was specified in the plan. Also, please ensure that the mail function is properly configured on your server, as it may not work as expected in a local development environment.