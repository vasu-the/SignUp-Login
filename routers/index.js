const router = require('express').Router();

const userRoutes = require('../controllers/userController')
const profileRouter = require('../controllers/getProfile')
const verifyToken = require('../middleware/verifyToken');
const sendOTP = require('../controllers/emailVerifyOTP')
const changePassword = require('../controllers/verifyPassword')
//user routes
router.post('/user-signup',userRoutes.SignUpUser);
router.post('/user-signupotp',sendOTP.verifyEmail);
router.post('/user-resendotp',userRoutes.SignUpUser);
router.post('/user-login/:email/:password',userRoutes.LoginUser);
router.post('/user-forgetpassword',userRoutes.ForgotPassword);
router.post('/user-forget-resend-link',userRoutes.ResendForgotPasswordLink)
router.post('/user-resetpassword',changePassword.resetPassword);


router.get('/dashboard', verifyToken, profileRouter);
router.post('/dashboard-profile', profileRouter.getProfileDetails);





module.exports = router;