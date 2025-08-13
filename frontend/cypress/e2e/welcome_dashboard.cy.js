describe("Finance Tracker Authentication Flow", () => {
  const baseUrl = "http://localhost:5173";

  it("navigates from Welcome → /app → /account → logs in → adds a transaction", () => {
    // Step 1: Visit Welcome Page
    cy.visit(baseUrl);
    cy.contains("Welcome to Our Dashboard").should("be.visible");
    cy.get("button").contains("Log In").click();
    cy.url().should("include", "/app");

    // Step 2: Check login prompt and go to /account
    cy.contains("Please log in to access your transactions").should("be.visible");
    cy.get("button").contains("Log In").click();

    // Step 3: Log in
    cy.contains("Sign In").should("be.visible").click();
    cy.get('input[name="email"]').type("testuser7@example.com");
    cy.get('input[name="password"]').type("abcdef");
    cy.get('button[type="submit"]').contains("Sign In").click();

    cy.contains("Welcome, testuser7!").should("be.visible");

    // Step 4: Navigate to Dashboard
    cy.contains("Dashboard").should("be.visible").click();
    cy.contains("Balance").should("exist");
    cy.contains("Income").should("exist");
    cy.contains("Expenses").should("exist");

   
 cy.contains("Add Payment").click(); // Assumes button says 'Add Payment'

    cy.get('input[name="title"]').type("Test Payment");
    cy.get('input[name="amount"]').type("100000");
    cy.get('input[name="dueDate"]').type("2025-05-26"); // Ensure the field is of type="date"
    cy.get('select[name="category"]').select("rent"); // Adjust category name accordingly

    cy.get('button[type="submit"]').contains("Add Payment").click(); // Assumes button label is "Save" or similar
    cy.contains("Payment added successfully").should("be.visible");
    cy.get('button[type="close"]').click(); // Close the modal if it appears
    cy.contains("Payment added successfully").should("be.visible");
    cy.get('[aria-label="close"]').first().click();

    // Step 5: Add a transaction
    cy.contains("Add Transaction").click(); // Assumes button says 'Add'

    cy.get('input[name="title"]').type("Test Transaction");
    cy.get('input[name="amount"]').type("200000");
    cy.get('select[name="type"]').select("income");
    cy.get('input[name="date"]').type("2025-05-26"); // Ensure the field is of type="date"
    cy.get('select[name="category"]').select("Work"); // Adjust category name accordingly
    
    cy.get('button[type="submit"]').contains("Add Transaction").click(); // Assumes button label is "Save" or similar
    cy.contains("Transaction added successfully").should("be.visible");
    cy.get('button[type="close"]').click(); // Close the modal if it appears


    // Step 6: Verify the transaction was added
    cy.contains('Transactions').should("be.visible").click(); // Adjust selector if needed
    // Step 6: Check if the new transaction appears
    cy.contains("Test Transaction", { timeout: 10000 }).should("be.visible");
    cy.contains("Rp 200.000").should("be.visible");
  });
});
