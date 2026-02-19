import { describe, it, expect } from 'vitest';
import { validateReplyQuality } from './llm-oracle';

describe('AI Reply Generation - LLM Validated', () => {
  it('should generate professional reply to meeting request', async () => {
    const email = {
      subject: 'Meeting Request: Project Discussion',
      snippet: 'Hi, I would like to schedule a meeting to discuss the new project timeline. Are you available next week?',
      from: 'colleague@company.com',
      tone: 'professional',
    };

    const response = await fetch('http://localhost:3000/api/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const reply = data.reply;

    const validation = await validateReplyQuality(
      { subject: email.subject, body: email.snippet },
      reply,
      email.tone
    );

    console.log(`✉️ Reply Quality, LLM Validation:`, validation);
    console.log(`Generated Reply: ${reply.substring(0, 100)}...`);

    expect(validation.isValid).toBe(true);
    expect(validation.confidence).toBeGreaterThan(60);
    expect(reply.length).toBeGreaterThan(50);
  }, 30000);

  it('should generate friendly reply to casual email', async () => {
    const email = {
      subject: 'Quick Question',
      snippet: 'Hey! Quick question - do you have the slides from last weeks presentation?',
      from: 'teammate@company.com',
      tone: 'friendly',
    };

    const response = await fetch('http://localhost:3000/api/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });

    const data = await response.json();
    const reply = data.reply;

    const validation = await validateReplyQuality(
      { subject: email.subject, body: email.snippet },
      reply,
      email.tone
    );

    console.log(`✉️ Reply Quality, LLM Validation:`, validation);

    expect(validation.isValid).toBe(true);
    expect(reply).toBeTruthy();
  }, 30000);
});
