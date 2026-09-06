const express = require('express');
const router = express.Router();

const adminPetitionController = require('../controllers/adminPetitionController');
const adminWardController = require('../controllers/adminWardController');
const adminAccountController = require('../controllers/adminAccountController');
const documentController = require('../controllers/documentController');
const backupController = require('../controllers/backupController');
const upload = require('../config/upload');
const { virusScanMiddleware } = require('../middlewares/virusScan');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  updatePetitionStatusValidator,
  updatePetitionNotesValidator,
  wardValidator,
  accountValidator,
  documentValidator
} = require('../validators/adminValidator');

// All routes in here are protected by the authenticateToken middleware in index.js

// Petitions
router.get('/petitions', adminPetitionController.getAdminPetitions);
router.get('/stats', adminPetitionController.getStats);
router.patch('/petitions/:id/status', updatePetitionStatusValidator, validateRequest, adminPetitionController.updateStatus);
router.patch('/petitions/:id/notes', updatePetitionNotesValidator, validateRequest, adminPetitionController.updateNotes);
router.delete('/petitions/:id', adminPetitionController.deletePetition);

// Wards
router.post('/wards', wardValidator, validateRequest, adminWardController.createWard);
router.get('/wards', adminWardController.getWards);
router.put('/wards/:id', wardValidator, validateRequest, adminWardController.updateWard);
router.delete('/wards/:id', adminWardController.deleteWard);

// Accounts
router.get('/accounts', adminAccountController.getAccounts);
router.post('/accounts', accountValidator, validateRequest, adminAccountController.createAccount);
router.put('/accounts/:id', accountValidator, validateRequest, adminAccountController.updateAccount);
router.delete('/accounts/:id', adminAccountController.deleteAccount);

// Documents
router.get('/documents', documentController.getAdminDocuments);
router.post('/documents', upload.array('files', 10), virusScanMiddleware, documentValidator, validateRequest, documentController.createDocument);
router.put('/documents/:id', upload.array('files', 10), virusScanMiddleware, documentValidator, validateRequest, documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

// Backups
router.get('/backups', backupController.getBackups);
router.get('/backups/download/:filename', backupController.downloadBackup);
router.post('/backups', backupController.createManualBackup);
router.delete('/backups/:filename', backupController.deleteBackup);

module.exports = router;
