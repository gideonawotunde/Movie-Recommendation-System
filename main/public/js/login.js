// login.js
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      const data = await response.json();
      localStorage.setItem("token", data.token); // Store the token in the local storage
      window.location.href = "/html/mvs.html"; // Redirect to mvs.html page
    } else {
      const error = await response.json();
      showError(error.message);
    }
  } catch (error) {
    console.error("Error during user login:", error);
    showError("Server error");
  }
});

function showError(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.innerText = message;
  errorElement.style.display = "block";
}
