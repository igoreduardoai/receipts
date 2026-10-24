// Entirely fictional sample data (no real organization).
export const SAMPLE_SOURCES = `# Riverbend Public Library — 2026 Annual Report
Riverbend Public Library operates 11 branches across the county, including the Eastside branch that opened in March. Total visits reached 1.2 million, up 8% from the previous year. The library added 14,000 items to its collection, most of them e-books and audiobooks.

Weekend hours were extended at four branches after a community survey. The Homework Help program served 3,400 students, with volunteers from two local colleges. The library did not raise late fees; instead, late fees were eliminated for children's materials.

The makerspace at the Central branch now offers 3D printing and a recording studio. Funding comes mainly from the county budget, with additional support from the Friends of the Library foundation.
---
# Board Meeting Notes, November 2026
The board approved a study of a possible twelfth location but has not chosen a site.`;

export const SAMPLE_ANSWER = `Riverbend Public Library now operates 12 branches across the county. The Eastside branch opened in March. Total visits reached 1.2 million, an 8% increase over the previous year. The library raised its late fees this year. Weekend hours were extended at four branches after a community survey. The Homework Help program served 3,400 students with volunteers from local colleges. The Central branch makerspace offers 3D printing, a recording studio and free laser cutting classes for teens. Riverbend also won the National Library Innovation Award in 2026. Funding comes mainly from the county budget.`;

// Bill samples: a fictional plumber's quote and two bills checked against it.
// All names and amounts are invented for the demo.
export const BILL_QUOTE = `# Quote Q-2041 from Maple Street Plumbing (fictional sample)
Replace kitchen faucet, parts and labor: $280.
Clear bathroom sink drain: $150.
Service call fee: $75.`;

export const BILLS = {
  ok: `Replace kitchen faucet, parts and labor: $280.
Clear bathroom sink drain: $150.
Service call fee: $75.`,
  amount: `Replace kitchen faucet, parts and labor: $380.
Clear bathroom sink drain: $150.
Service call fee: $75.`,
};

export const SAMPLES = {
  'bill-amount': { sources: BILL_QUOTE, answer: BILLS.amount, note: 'Sample bill with a changed amount, checked against the quote (fictional).' },
  'bill-ok': { sources: BILL_QUOTE, answer: BILLS.ok, note: 'Sample bill that matches the quote (fictional).' },
  library: { sources: SAMPLE_SOURCES, answer: SAMPLE_ANSWER, note: 'Sample AI summary of a fictional library report.' },
};
