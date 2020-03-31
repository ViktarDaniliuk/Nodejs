const express = require('express');
const router = express.Router();

const ctrlHome = require('../controllers/home');
const ctrlLogin = require('../controllers/login');
const ctrlAdmin = require('../controllers/admin');
const ctrlAdminSkills = require('../controllers/admin-skills');
const ctrlAdminUpload = require('../controllers/admin-upload');

router.get('/', ctrlHome.get);
router.post('/', ctrlHome.post);

router.get('/login', ctrlLogin.get);
router.post('/login', ctrlLogin.post);

router.get('/admin', ctrlAdmin.get);

router.post('/admin/skills', ctrlAdminSkills.post);
// router.post('/admin/upload', ctrlAdminUpload.post);

module.exports = router;