<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact-us/');
    exit;
}

function clean_line($value) {
    $value = trim((string)$value);
    return str_replace(["\r", "\n"], '', $value);
}

// Honeypot — bots fill every field, real users never see this one
if (!empty($_POST['hp_field'])) {
    header('Location: /contact-us/?sent=1');
    exit;
}

$fname    = clean_line($_POST['fname'] ?? '');
$lname    = clean_line($_POST['lname'] ?? '');
$email    = trim((string)($_POST['email'] ?? ''));
$phone    = clean_line($_POST['phone'] ?? '');
$firm     = clean_line($_POST['firm'] ?? '');
$city     = clean_line($_POST['city'] ?? '');
$practice = clean_line($_POST['practice'] ?? '');
$website  = clean_line($_POST['website'] ?? '');
$message  = trim((string)($_POST['message'] ?? ''));

if ($fname === '' || $lname === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /contact-us/?error=1');
    exit;
}

$to = 'olaabimbola83@gmail.com';
$subject = 'New Audit Request from ' . $fname . ' ' . $lname;

$body  = "New free audit request from the Everscribn website:\n\n";
$body .= "Name: $fname $lname\n";
$body .= "Email: $email\n";
$body .= "Phone: $phone\n";
$body .= "Law firm: $firm\n";
$body .= "City: $city\n";
$body .= "Practice area: $practice\n";
$body .= "Website: $website\n\n";
$body .= "Message:\n" . substr($message, 0, 5000) . "\n";

$headers   = [];
$headers[] = 'From: Everscribn Website <noreply@everscribn.com>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

header('Location: /contact-us/?' . ($sent ? 'sent=1' : 'error=1'));
exit;
