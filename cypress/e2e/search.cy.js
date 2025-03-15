/// <reference types="cypress" />

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display search input', () => {
    cy.get('input[placeholder="Search..."]').should('be.visible');
  });

  it('should search for users when typing in the search box', () => {
    cy.get('input[placeholder="Search..."]').type('john');
    // Wait for results to appear
    cy.contains('John Smith').should('be.visible');
  });

  it('should add to search history when pressing Enter', () => {
    const searchQuery = 'developer';
    // Type and press enter
    cy.get('input[placeholder="Search..."]')
      .type(searchQuery)
      .type('{enter}');

    // Clear the search input
    cy.get('input[placeholder="Search..."]')
      .clear();

    // Click on history button (only visible when history exists and input is empty)
    cy.get('button[aria-label="Show search history"]')
      .should('be.visible')
      .click();
    
    // Check if search history dropdown is visible and contains our query
    cy.contains('Recent Searches').should('be.visible');
    cy.contains(searchQuery).should('be.visible');
  });

  it('should highlight matching text in search results', () => {
    cy.get('input[placeholder="Search..."]').type('dev');
    
    // Wait for results to be visible
    cy.contains('Software Developer').should('be.visible');
    
    // The matching part should be in a highlighted element
    cy.contains('Software Developer')
      .find('span[class*="highlight"]')
      .should('contain', 'Dev');
  });

  it('should allow users to select items from search history', () => {
    // First add a search to history
    cy.get('input[placeholder="Search..."]')
      .type('marketing')
      .type('{enter}');
    
    // Clear the search input
    cy.get('input[placeholder="Search..."]')
      .clear();
    
    // Open history
    cy.get('button[aria-label="Show search history"]')
      .click();
    
    // Click on the history item
    cy.contains('marketing').click();
    
    // The search input should now have the value from history
    cy.get('input[placeholder="Search..."]')
      .should('have.value', 'marketing');
    
    // And results should show marketing-related items
    cy.contains('Marketing Specialist').should('be.visible');
  });

  it('should allow removing items from search history', () => {
    // First add a search to history
    const searchQuery = 'unique query';
    cy.get('input[placeholder="Search..."]')
      .type(searchQuery)
      .type('{enter}');
    
    // Clear the search input
    cy.get('input[placeholder="Search..."]')
      .clear();
    
    // Open history
    cy.get('button[aria-label="Show search history"]')
      .click();
    
    // Find the history item and click the remove button
    cy.contains(searchQuery)
      .parent()
      .parent()
      .find('button[aria-label*="Remove"]')
      .click();
    
    // The item should be removed from history
    cy.contains(searchQuery).should('not.exist');
  });
}); 