/**
 * GDPR Compliance Test Helpers
 *
 * Reusable functions for testing GDPR compliance:
 * - Right to Access (data export)
 * - Right to Erasure (account deletion)
 * - Consent Management
 * - Data Portability
 *
 * @module gdpr.helpers
 */

import { expect } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

/**
 * Test Right to Access - User data export
 */
export async function testDataExport(
  userId: string,
  userToken: string,
  format: "json" | "csv" | "xml" = "json",
  expectedFields: string[] = [],
) {
  const response = await app.inject({
    method: "GET",
    url: `/api/users/${userId}/export`,
    query: { format },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  expect(response.statusCode).toBe(200);

  if (format === "json") {
    const data = JSON.parse(response.payload);

    // Verify expected fields exist
    expectedFields.forEach((field) => {
      expect(data).toHaveProperty(field);
    });

    // Verify export metadata
    expect(data.export_metadata).toHaveProperty("export_date");
    expect(data.export_metadata).toHaveProperty("data_version");
    expect(data.export_metadata).toHaveProperty("user_id", userId);
  } else if (format === "csv") {
    expect(response.payload).toMatch(/^user_id,/); // CSV header
  } else if (format === "xml") {
    expect(response.payload).toMatch(/^<\?xml version/); // XML declaration
  }

  return JSON.parse(response.payload);
}

/**
 * Test Right to Erasure - Permanent account deletion
 */
export async function testDataErasure(
  userId: string,
  userToken: string,
  email: string,
  adminToken?: string,
) {
  // Request erasure
  const erasureResponse = await app.inject({
    method: "DELETE",
    url: `/api/users/${userId}/gdpr-erase`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  expect(erasureResponse.statusCode).toBe(202); // Accepted (async job)

  const erasureBody = JSON.parse(erasureResponse.payload);
  expect(erasureBody).toHaveProperty("message");
  expect(erasureBody).toHaveProperty("job_id");

  // Wait for async job to complete
  await waitForJobCompletion(`gdpr-erase-${userId}`, 30000);

  // Verify user deleted (needs admin token or different auth)
  if (adminToken) {
    const getResponse = await app.inject({
      method: "GET",
      url: `/api/users/${userId}`,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(getResponse.statusCode).toBe(404);
  }

  // Verify login fails
  const loginResponse = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password: "test-password" },
  });
  expect(loginResponse.statusCode).toBe(404); // User not found

  return erasureBody;
}

/**
 * Test Consent Management - Opt-in/opt-out tracking
 */
export async function testConsentManagement(
  userId: string,
  userToken: string,
  consentType:
    | "marketing_emails"
    | "analytics_tracking"
    | "third_party_sharing",
  policyVersion: string = "2.1.0",
) {
  // Grant consent
  const grantResponse = await app.inject({
    method: "POST",
    url: `/api/users/${userId}/consent`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      type: consentType,
      granted: true,
      policy_version: policyVersion,
    },
  });
  expect(grantResponse.statusCode).toBe(201);

  const grantBody = JSON.parse(grantResponse.payload);
  expect(grantBody).toHaveProperty("consent_id");
  expect(grantBody.granted).toBe(true);
  expect(grantBody.type).toBe(consentType);

  // Revoke consent
  const revokeResponse = await app.inject({
    method: "PUT",
    url: `/api/users/${userId}/consent/${consentType}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: { granted: false },
  });
  expect(revokeResponse.statusCode).toBe(200);

  const revokeBody = JSON.parse(revokeResponse.payload);
  expect(revokeBody.granted).toBe(false);

  // Verify audit trail
  const auditResponse = await app.inject({
    method: "GET",
    url: `/api/users/${userId}/consent`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  expect(auditResponse.statusCode).toBe(200);

  const auditBody = JSON.parse(auditResponse.payload);
  expect(auditBody.consents).toHaveLength(2); // Grant + Revoke
  expect(auditBody.consents[0].type).toBe(consentType);
  expect(auditBody.consents[1].type).toBe(consentType);

  return auditBody;
}

/**
 * Test Data Portability - Export in standard formats
 */
export async function testDataPortability(
  userId: string,
  userToken: string,
  targetFormat: "json" | "csv" | "xml",
) {
  const response = await app.inject({
    method: "GET",
    url: `/api/users/${userId}/export`,
    query: { format: targetFormat },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  expect(response.statusCode).toBe(200);

  switch (targetFormat) {
    case "csv":
      expect(response.payload).toMatch(/^user_id,email,name/);
      expect(response.headers["content-type"]).toMatch(/text\/csv/);
      break;

    case "xml":
      expect(response.payload).toMatch(/^<\?xml version/);
      expect(response.headers["content-type"]).toMatch(/application\/xml/);
      break;

    case "json":
      const jsonBody = JSON.parse(response.payload);
      expect(jsonBody).toHaveProperty("user_id", userId);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
      break;
  }

  return response;
}

/**
 * Test IDOR protection for GDPR endpoints
 */
export async function testGDPRIDOR(
  tenantAUserId: string,
  tenantAUserToken: string,
  tenantBUserId: string,
) {
  // User from tenant A tries to export data from tenant B user
  const exportResponse = await app.inject({
    method: "GET",
    url: `/api/users/${tenantBUserId}/export`,
    headers: {
      Authorization: `Bearer ${tenantAUserToken}`,
    },
  });
  expect(exportResponse.statusCode).toBe(403);

  // User from tenant A tries to delete tenant B user
  const deleteResponse = await app.inject({
    method: "DELETE",
    url: `/api/users/${tenantBUserId}/gdpr-erase`,
    headers: {
      Authorization: `Bearer ${tenantAUserToken}`,
    },
  });
  expect(deleteResponse.statusCode).toBe(403);

  // User from tenant A tries to access tenant B consent
  const consentResponse = await app.inject({
    method: "GET",
    url: `/api/users/${tenantBUserId}/consent`,
    headers: {
      Authorization: `Bearer ${tenantAUserToken}`,
    },
  });
  expect(consentResponse.statusCode).toBe(403);
}

/**
 * Utility: Wait for background job completion
 */
async function waitForJobCompletion(
  jobId: string,
  timeout: number = 30000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const job = await prisma.backgroundJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === "completed") {
      return;
    }

    if (job.status === "failed") {
      throw new Error(`Job ${jobId} failed: ${job.error}`);
    }

    // Wait 500ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Job ${jobId} timed out after ${timeout}ms`);
}

/**
 * Utility: Convert data to CSV format
 */
export function convertToCSV(data: Record<string, any>): string {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data for CSV conversion");
  }

  const headers = Object.keys(data).join(",");
  const values = Object.values(data)
    .map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
    .join(",");

  return `${headers}\n${values}`;
}

/**
 * Utility: Convert data to XML format
 */
export function convertToXML(data: Record<string, any>): string {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data for XML conversion");
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<user_data>\n';

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object") {
      xml += `  <${key}>${JSON.stringify(value)}</${key}>\n`;
    } else {
      xml += `  <${key}>${value}</${key}>\n`;
    }
  }

  xml += "</user_data>";

  return xml;
}
