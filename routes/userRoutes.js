const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
//require session
const session = require('express-session')
require('dotenv').config();
var SESSION_SECRET =process.env.SESSION_SECRET
router.use(methodOverride('_method'));
const user =express()
const path =require('path')
const userController =require('../controllers/userController')
const multer = require('multer')
const{upload} = require('../middleware/upload');
const uploads = multer({ storage: multer.memoryStorage() });
const auth = require('../middleware/adminAuth')
router.get('/signup',userController.getSignupForm);
router.post('/signup',userController.userSignup);
router.get('/login',auth.isLogout ,userController.getLoginForm);
router.get('/userList',auth.isLogin,auth.isAdmin,userController.getUserList)
router.post('/login', userController.userLogin);
router.get('/logout',auth.isLogin,userController.getLogout)
// router.post('/sendEmail', uploads.array("attachments"), userController.sendEmail);
router.post('/sendEmail',uploads.single("attachment") ,userController.sendEmail)
router.get('/search',userController.getSearchByName)
router.get('/userDashboard',auth.isLogin ,userController.getUserDashboard)
router.post('/userData',userController.getUserData)
router.get('/table-view',auth.isLogin , auth.isAdmin,userController.getTableView) //endpoints for rendering table.
router.post('/pagination', userController.getPagination)//pagination endpoints
router.post('/userPagination',userController.getUserPagination)
router.delete('/delete/:id',userController.deleteData)
router.delete('/deleteUser/:id',userController.deleteUser)
router.put('/update/:id', userController.updateData)
router.get('/dataView/:id',auth.isLogin, userController.dataView)
router.get('/userViews/:id',auth.isLogin,auth.isAdmin,userController.userViews)
router.put('/updateUser/:id',userController.updateUser)
router.get('/views/:id',auth.isLogin, userController.getViews)

 router.post('/importuser',upload.single('file'), userController.importUser);
 router.get('/',auth.isLogin,(req,res)=>{
  res.render('login');
});



module.exports = router;


