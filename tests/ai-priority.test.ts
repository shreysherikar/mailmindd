import { describe, it, expect } from 'vitest';
import { validatePriorityScore } from './llm-oracle';

describe('AI Priority Scoring - LLM Validated', () => {
  it('should assign high priority to urgent deadline emails', async () => {
    const email = {
      subject: 'URGENT: Payment Due Today - Action Required',
      snippet: 'Your invoice #12345 is due today. Please make payment immediately to avoid late fees and service interruption.',
    };

    // Call the actual API
    const response = await fetch('http://localhost:3000/api/ai/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const score = data.result.score;

    // Use LLM as test oracle
    const validation = await validatePriorityScore(email, score);

    console.log(`📊 Score: ${score}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(validation.confidence).toBeGreaterThan(70);
    expect(score).toBeGreaterThan(75); // Should be high priority
  }, 30000);

  it('should assign medium priority to normal emails', async () => {
    const email = {
      subject: 'Team Update: New Process Starting Next Week',
      snippet: 'Starting next week, we will be implementing a new approval process. Please familiarize yourself with the attached guidelines.',
    };

    const response = await fetch('http://localhost:3000/api/ai/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const score = data.result.score;

    const validation = await validatePriorityScore(email, score);

    console.log(`📊 Score: ${score}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(validation.confidence).toBeGreaterThan(60);
  }, 30000);

  it('should assign low priority to newsletters', async () => {
    const email = {
      subject: 'Weekly Newsletter - Tech Updates',
      snippet: 'Check out this weeks top tech stories and updates. Unsubscribe anytime.',
    };

    const response = await fetch('http://localhost:3000/api/ai/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const score = data.result.score;

    const validation = await validatePriorityScore(email, score);

    console.log(`📊 Score: ${score}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(score).toBeLessThan(40);
  }, 30000);

  it('should handle meeting invitations appropriately', async () => {
    const email = {
      subject: 'Meeting Tomorrow: Q1 Planning',
      snippet: 'You are invited to our Q1 planning meeting tomorrow at 2 PM. Please confirm your attendance.',
    };

    const response = await fetch('http://localhost:3000/api/ai/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const score = data.result.score;

    const validation = await validatePriorityScore(email, score);

    console.log(`📊 Score: ${score}, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(validation.confidence).toBeGreaterThan(60);
    expect(score).toBeGreaterThan(60); // Meetings should be medium-high priority
  }, 30000);
});
