/**
 * @deprecated GDPR endpoints not yet implemented
 * TODO: Uncomment when implementing STORY-GDPR-001
 *
 * See: docs/compliance/gdpr.md
 */
describe.skip("GDPR: Data Portability", () => {
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
