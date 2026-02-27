/**
 * @deprecated GDPR endpoints not yet implemented
 * TODO: Uncomment when implementing STORY-GDPR-001
 *
 * See: docs/compliance/gdpr.md
 */
describe.skip("GDPR: Right to Access (Data Export)", () => {
  let tenantA: any;
  let tenantB: any;
  let userA: any;
  let userB: any;
  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    // Create test tenants and users
    tenantA = await createTestTenant("Tenant A GDPR");
    tenantB = await createTestTenant("Tenant B GDPR");

    userA = await createTestUser({
      tenantId: tenantA.id,
      email: "user-a-gdpr@test.com",
      name: "User A GDPR",
    });

    userB = await createTestUser({
      tenantId: tenantB.id,
      email: "user-b-gdpr@test.com",
      name: "User B GDPR",
    });

    userAToken = userA.accessToken;
    userBToken = userB.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe("JSON Export", () => {
    it("should export user data in JSON format", async () => {
      const data = await testDataExport(userA.id, userAToken, "json", [
        "user_id",
        "email",
        "name",
        "created_at",
        "export_metadata",
      ]);

      expect(data.user_id).toBe(userA.id);
      expect(data.email).toBe("user-a-gdpr@test.com");
      expect(data.export_metadata.format).toBe("json");
    });

    it("should include all user-related data in export", async () => {
      const data = await testDataExport(userA.id, userAToken, "json");

      // Personal data
      expect(data).toHaveProperty("profile");
      expect(data.profile).toHaveProperty("email");
      expect(data.profile).toHaveProperty("name");

      // Transactional data
      expect(data).toHaveProperty("invoices");
      expect(data).toHaveProperty("payments");
      expect(data).toHaveProperty("subscriptions");

      // Project data
      expect(data).toHaveProperty("projects");
      expect(data).toHaveProperty("tasks");

      // Audit logs
      expect(data).toHaveProperty("audit_logs");
    });

    it("should include export metadata", async () => {
      const data = await testDataExport(userA.id, userAToken, "json");

      expect(data.export_metadata).toHaveProperty("export_date");
      expect(data.export_metadata).toHaveProperty("data_version");
      expect(data.export_metadata).toHaveProperty("user_id", userA.id);
      expect(data.export_metadata).toHaveProperty("format", "json");
    });
  });

  describe("CSV Export", () => {
    it("should export user data in CSV format", async () => {
      await testDataPortability(userA.id, userAToken, "csv");
    });

    it("should have valid CSV headers", async () => {
      const response = await testDataPortability(userA.id, userAToken, "csv");

      const csvText = response.text;
      const lines = csvText.split("\n");
      const headers = lines[0].split(",");

      expect(headers).toContain("user_id");
      expect(headers).toContain("email");
      expect(headers).toContain("name");
    });
  });

  describe("XML Export", () => {
    it("should export user data in XML format", async () => {
      await testDataPortability(userA.id, userAToken, "xml");
    });

    it("should have valid XML structure", async () => {
      const response = await testDataPortability(userA.id, userAToken, "xml");

      const xmlText = response.text;

      expect(xmlText).toMatch(/^<\?xml version="1\.0"/);
      expect(xmlText).toMatch(/<user_data>/);
      expect(xmlText).toMatch(/<\/user_data>/);
      expect(xmlText).toMatch(/<user_id>/);
      expect(xmlText).toMatch(/<email>/);
    });
  });

  describe("Performance", () => {
    it("should complete export in less than 30 seconds", async () => {
      const startTime = Date.now();

      await testDataExport(userA.id, userAToken, "json");

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000);
    });
  });

  describe("IDOR Protection", () => {
    it("should prevent cross-tenant data export", async () => {
      await testGDPRIDOR(userA.id, userAToken, userB.id);
    });

    it("should return 403 when user A tries to export user B data", async () => {
      await expect(
        testDataExport(userB.id, userAToken, "json"),
      ).rejects.toThrow();
    });
  });
});
