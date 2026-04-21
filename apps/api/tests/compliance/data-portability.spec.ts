/**
 * KNOWN GAP: GDPR Data Portability endpoints not yet implemented.
 * Will be implemented in Epic: EPIC-Compliance-GDPR
 *
 * See: docs/compliance/gdpr.md
 */
describe.todo("GDPR: Data Portability", () => {
  it("should export data in JSON format", async () => {
    await testDataPortability("user_id", "user_token", "json");
  });

  it("should export data in CSV format", async () => {
    await testDataPortability("user_id", "user_token", "csv");
  });

  it("should export data in XML format", async () => {
    await testDataPortability("user_id", "user_token", "xml");
  });
});
