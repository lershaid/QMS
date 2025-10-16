const { PrismaClient } = require('@prisma/client');
const minioClient = require('../utils/minio.client');
const pdfGenerator = require('../utils/pdf.generator');
const marked = require('marked');

const prisma = new PrismaClient();

/**
 * Create a new policy draft
 */
const createPolicy = async (tenantId, data) => {
  const { title, ownerId, scope, applicableStandards, applicableClauses, reviewDate } = data;

  // Generate slug from title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const policy = await prisma.policy.create({
    data: {
      tenantId,
      title,
      slug,
      ownerId,
      scope,
      applicableStandards: applicableStandards || [],
      applicableClauses: applicableClauses || [],
      reviewDate,
      status: 'DRAFT',
    },
  });

  return policy;
};

/**
 * Get policy by ID
 */
const getPolicyById = async (policyId, tenantId) => {
  const policy = await prisma.policy.findFirst({
    where: {
      id: policyId,
      tenantId,
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }

  return policy;
};

/**
 * List all policies for a tenant
 */
const listPolicies = async (tenantId, filters = {}) => {
  const { status, ownerId, page = 1, limit = 10 } = filters;

  const where = {
    tenantId,
    ...(status && { status }),
    ...(ownerId && { ownerId }),
  };

  const policies = await prisma.policy.findMany({
    where,
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const total = await prisma.policy.count({ where });

  return {
    data: policies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update policy metadata
 */
const updatePolicy = async (policyId, tenantId, data) => {
  const policy = await prisma.policy.findFirst({
    where: {
      id: policyId,
      tenantId,
    },
  });

  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }

  const updated = await prisma.policy.update({
    where: { id: policyId },
    data,
  });

  return updated;
};

/**
 * Delete policy (soft delete by archiving)
 */
const deletePolicy = async (policyId, tenantId) => {
  const policy = await prisma.policy.findFirst({
    where: {
      id: policyId,
      tenantId,
    },
  });

  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }

  await prisma.policy.update({
    where: { id: policyId },
    data: { status: 'ARCHIVED' },
  });
};

/**
 * Create a new policy version
 */
const createPolicyVersion = async (policyId, tenantId, data) => {
  const { content, changeReason, createdBy } = data;

  const policy = await prisma.policy.findFirst({
    where: {
      id: policyId,
      tenantId,
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }

  const nextVersionNumber = policy.versions.length > 0 
    ? policy.versions[0].versionNumber + 1 
    : 1;

  const version = await prisma.policyVersion.create({
    data: {
      policyId,
      versionNumber: nextVersionNumber,
      content,
      changeReason,
      createdBy,
      status: 'DRAFT',
    },
  });

  return version;
};

/**
 * Publish a policy version
 */
const publishPolicyVersion = async (versionId, tenantId) => {
  const version = await prisma.policyVersion.findFirst({
    where: {
      id: versionId,
    },
    include: {
      policy: true,
    },
  });

  if (!version || version.policy.tenantId !== tenantId) {
    throw new ApiError(404, 'Policy version not found');
  }

  if (version.status !== 'APPROVED') {
    throw new ApiError(400, 'Only approved versions can be published');
  }

  // Generate PDF
  const htmlContent = marked.parse(version.content);
  const pdfBuffer = await pdfGenerator.generatePDF(
    htmlContent,
    version.policy.title,
    version.versionNumber
  );

  // Upload to MinIO
  const pdfKey = `policies/${tenantId}/${version.policyId}/v${version.versionNumber}.pdf`;
  await minioClient.uploadFile('qms-policies', pdfKey, pdfBuffer);

  // Update version status
  const published = await prisma.policyVersion.update({
    where: { id: versionId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // Update policy status
  await prisma.policy.update({
    where: { id: version.policyId },
    data: { status: 'PUBLISHED' },
  });

  return {
    ...published,
    pdfUrl: `/api/v1/policies/${version.policyId}/versions/${versionId}/pdf`,
  };
};

module.exports = {
  createPolicy,
  getPolicyById,
  listPolicies,
  updatePolicy,
  deletePolicy,
  createPolicyVersion,
  publishPolicyVersion,
};
