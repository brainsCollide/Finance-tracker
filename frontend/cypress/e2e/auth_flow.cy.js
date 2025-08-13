describe("Full Auth Flow (Sign up if new, login if exists)", () => {
  const baseUrl = "http://localhost:5173"; // Change if needed

  const testUser = {
    username: "testuser7",
    email: "testuser7@example.com",
    password: "abcdef" // all lowercase and ≥ 6 characters
  };

  it("Signs up or logs in depending on user existence, then logs out", () => {
    cy.visit(baseUrl);

    cy.contains("Welcome to Our Dashboard").should("exist");
    cy.contains("Log In").click();

    cy.url().should("include", "/app");
    cy.contains("Please log in to access your transactions").should("exist");
    cy.contains("Log In").click(); // Show the auth form

    // Try to sign up
    cy.get('input[name="username"]').clear().type(testUser.username);
    cy.get('input[name="email"]').clear().type(testUser.email);
    cy.get('input[name="password"]').clear().type(testUser.password);
    cy.contains("Sign Up").click();

    cy.get("body").then(($body) => {
      const bodyText = $body.text().toLowerCase();

      if (bodyText.includes("user successfully created")) {
        cy.log("✅ Account created and logged in");
        cy.contains(`Welcome, ${testUser.username}!`).should("exist");
      } else if (cy.contains("User already exists")) {
        cy.log("⚠️ User already exists, logging in instead");

        cy.contains("Sign In").click();
        cy.get('input[name="email"]').clear().type(testUser.email);
        cy.get('input[name="password"]').clear().type(testUser.password);
        cy.contains("Sign In").click();

        cy.contains(`Welcome, ${testUser.username}!`).should("exist");
      } else {
        throw new Error(`❌ Unexpected message: ${bodyText}`);
      }
    });

    // Log out flow
    cy.contains("Logout").should("be.visible").click();

    // After logout, verify redirect or unauthenticated message
    cy.url().should("include", "/app");
    cy.contains("Welcome Back!").should("exist");
  });
});
