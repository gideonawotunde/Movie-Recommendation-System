document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
  
    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, firstName, lastName })
      });
  
      if (response.status === 201) {
        alert("User registered successfully.");
        window.location.href = "/login"; // Redirect to login page
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error during user registration:", error);
    }
  });
  