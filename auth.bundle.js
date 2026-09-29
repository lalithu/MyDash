(() => {
  "use strict";

  const config = window.CANVAS_DASH_SUPABASE;
  const status = document.getElementById("status");

  document
    .getElementById("signup-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      status.textContent = "Creating account...";

      const displayName =
        document.getElementById("display-name").value.trim();

      const username =
        document
          .getElementById("username")
          .value
          .trim()
          .replace(/^@/, "")
          .toLowerCase();

      const school =
        document.getElementById("school").value.trim();

      const email =
        document.getElementById("email").value.trim();

      const password =
        document.getElementById("password").value;

      try {
        const response = await fetch(
          `${config.url}/auth/v1/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: config.publishableKey
            },
            body: JSON.stringify({
              email,
              password,
              data: {
                username,
                display_name: displayName,
                school
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.msg ||
            data.message ||
            data.error_description ||
            "Signup failed"
          );
        }

        await chrome.storage.local.set({
          canvas_dash_session: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            user: data.user
          }
        });

        status.textContent =
          `Account created! Welcome @${username}`;
      } catch (error) {
        console.error(error);
        status.textContent = error.message;
      }
    });
})();