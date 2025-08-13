describe("Finance Tracker Dashboard", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    // Visit login and perform login
    cy.visit(`${baseUrl}/login`);
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Ensure dashboard is loaded
    cy.url().should("include", "/dashboard");
  });

  it("displays the welcome message", () => {
    cy.contains("Welcome back").should("be.visible");
  });

  it("displays overview cards (balance, income, expenses)", () => {
    cy.contains("Balance").should("exist");
    cy.contains("Income").should("exist");
    cy.contains("Expenses").should("exist");
  });

  it("opens Add Transaction modal and closes it", () => {
    cy.contains("+ Add Transaction").click();
    cy.contains("Add Transaction").should("be.visible");

    // Close it (depends on how you handle close - adjust selector if needed)
    cy.get('button[aria-label="Close"]').click();
    cy.contains("Add Transaction").should("not.exist");
  });

  it("opens Add Upcoming Payment modal and closes it", () => {
    cy.contains("+ Add Payment").click();
    cy.contains("Add Payment").should("be.visible");

    cy.get('button[aria-label="Close"]').click();
    cy.contains("Add Payment").should("not.exist");
  });

  it("displays Upcoming Bills section", () => {
    cy.contains("Upcoming Bills").should("be.visible");
  });
});
