import { expect, test } from 'vitest';

// Mock moderation function to simulate AI text analysis
function moderateComment(text: string) {
  // A simplistic and flawed keyword matching system
  const maliciousKeywords = ['killed', 'murder', 'attack'];
  
  const words = text.toLowerCase().split(/\W+/);
  const isFlagged = words.some(word => maliciousKeywords.includes(word));
  
  return {
    text,
    isFlagged,
    context: isFlagged ? 'Malicious' : 'Benign'
  };
}

test('test_moderation_accuracy', () => {
  // Case 1: Valid Context
  // Context is sufficient and benign.
  const result = moderateComment("This UI design looks great!");
  
  expect(result.isFlagged).toBe(false);
  expect(result.context).toBe('Benign');
  console.log(`[100%] Computed Context: ${result.context} | Expected: Benign`);
});

test('test_moderation_accuracy_zero_context', () => {
  // Case 2: Zero Context (Failure Case)
  // Both points of context contradicted each other (benign intent, malicious trigger word)
  console.log('   # Left and right contexts have same trigger word');
  console.log('   context_left = "You killed it bro" (Benign)');
  console.log('   context_right = "killed" (Malicious)');
  
  const result = moderateComment("You killed it bro");
  
  // This will intentionally fail because the flawed logic flags "killed"
  // but we *expect* it to be false (Benign context)
  expect(result.isFlagged).toBe(false);
});
