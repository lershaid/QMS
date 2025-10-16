const express = require('express');
const policyService = require('../services/policy.service');

const router = express.Router();

/**
 * @swagger
 * /api/v1/policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - ownerId
 *             properties:
 *               title:
 *                 type: string
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *               scope:
 *                 type: string
 *               applicableStandards:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableClauses:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Policy created successfully
 */
router.post(
  '/',
  validate({
    body: Joi.object({
      title: Joi.string().required(),
      ownerId: Joi.string().uuid().required(),
      scope: Joi.string().allow(''),
      applicableStandards: Joi.array().items(Joi.string()),
      applicableClauses: Joi.array().items(Joi.string()),
      reviewDate: Joi.date(),
    }),
  }),
  catchAsync(async (req, res) => {
    // TODO: Extract tenantId from JWT
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-id';
    
    const policy = await policyService.createPolicy(tenantId, req.body);

    res.status(201).json({
      message: 'Policy created successfully',
      data: policy,
    });
  })
);

/**
 * @swagger
 * /api/v1/policies:
 *   get:
 *     summary: List all policies
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  catchAsync(async (req, res) => {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-id';
    
    const result = await policyService.listPolicies(tenantId, req.query);

    res.status(200).json({
      message: 'Policies retrieved successfully',
      ...result,
    });
  })
);

/**
 * @swagger
 * /api/v1/policies/{id}:
 *   get:
 *     summary: Get policy by ID
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-id';
    
    const policy = await policyService.getPolicyById(req.params.id, tenantId);

    res.status(200).json({
      message: 'Policy retrieved successfully',
      data: policy,
    });
  })
);

/**
 * @swagger
 * /api/v1/policies/{id}:
 *   put:
 *     summary: Update policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  catchAsync(async (req, res) => {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-id';
    
    const policy = await policyService.updatePolicy(
      req.params.id,
      tenantId,
      req.body
    );

    res.status(200).json({
      message: 'Policy updated successfully',
      data: policy,
    });
  })
);

/**
 * @swagger
 * /api/v1/policies/{id}:
 *   delete:
 *     summary: Delete (archive) policy
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant-id';
    
    await policyService.deletePolicy(req.params.id, tenantId);

    res.status(200).json({
      message: 'Policy archived successfully',
    });
  })
);

module.exports = router;
