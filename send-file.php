<?php
// Basic security & validation
$name = htmlspecialchars($_POST['name'] ?? '');
$email = htmlspecialchars($_POST['email'] ?? '');
$service = htmlspecialchars($_POST['service'] ?? '');
$message = htmlspecialchars($_POST['message'] ?? '');

if (!$name || !$email || !$service || !$message) {
  die("Please fill out all fields.");
}

// Email details
$to = "leads@assistkingonline.com";
$subject = "New Lead Request - $service";
$body = "
Name: $name\n
Email: $email\n
Service: $service\n
Message:\n$message
";
$headers = "From: $email\r\nReply-To: $email\r\n";

// Send using PHP mail()
if (mail($to, $subject, $body, $headers)) {
  echo "<h2>✅ Thank you, $name!</h2><p>Your message has been sent to AssistKingOnline.</p><p><a href='index.html'>← Back to Home</a></p>";
} else {
  echo "<h2>❌ Error</h2><p>Sorry, your message could not be sent. Please try again later.</p><p><a href='lead.html'>Back to Form</a></p>";
}
?>
