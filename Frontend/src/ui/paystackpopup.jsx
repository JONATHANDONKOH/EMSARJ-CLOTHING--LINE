document.getElementById("payButton").addEventListener("click", () => {
  const customerEmail = document.getElementById("customerEmail").value;
  const totalAmount = document.getElementById("amount").value;

  const handler = PaystackPop.setup({
    key: process.env.PAYSTACK_PUBLIC_KEY, // your public key
    email: customerEmail,                 // pass client’s email here
    amount: totalAmount * 100,            // Paystack expects pesewas
    currency: "GHS",
    ref: "order_" + Date.now(),           // unique reference
    callback: function(response) {
      // Send reference + orderId to backend for verification
      fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: response.reference, orderId })
      });
    },
    onClose: function() {
      alert("Payment window closed.");
    }
  });

  handler.openIframe();
});
