import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createAdminEbfRouter } from '../src/api/admin/ebf.js';
import { createAdminChildrensRouter } from '../src/api/admin/childrens.js';
import { createVercelRouterHandler } from '../src/lib/server/createVercelRouterHandler.js';

// Um único serverless atende EBF e Dia das Crianças (limite de funções do plano Hobby).
const prisma = new PrismaClient();
const router = express.Router();
router.use('/criancas', createAdminChildrensRouter(prisma));
router.use('/', createAdminEbfRouter(prisma));
export default createVercelRouterHandler(router);
