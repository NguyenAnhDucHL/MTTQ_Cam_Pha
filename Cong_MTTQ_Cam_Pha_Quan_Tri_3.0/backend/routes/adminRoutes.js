const express = require('express');
const router = express.Router();

const adminPetitionController = require('../controllers/adminPetitionController');
const adminWardController = require('../controllers/adminWardController');
const adminAccountController = require('../controllers/adminAccountController');

// All routes in here are protected by the authenticateToken middleware in index.js

// Petitions
router.get('/petitions', adminPetitionController.getAdminPetitions);
router.get('/stats', adminPetitionController.getStats);
router.patch('/petitions/:id/status', adminPetitionController.updateStatus);
router.patch('/petitions/:id/notes', adminPetitionController.updateNotes);
router.delete('/petitions/:id', adminPetitionController.deletePetition);

// Wards
router.post('/wards', adminWardController.createWard);
router.get('/wards', adminWardController.getWards);
router.put('/wards/:id', adminWardController.updateWard);
router.delete('/wards/:id', adminWardController.deleteWard);

// Accounts
router.get('/accounts', adminAccountController.getAccounts);
router.post('/accounts', adminAccountController.createAccount);
router.put('/accounts/:id', adminAccountController.updateAccount);
router.delete('/accounts/:id', adminAccountController.deleteAccount);

module.exports = router;
