var express = require("express");
var router = express.Router()
const userController = require("../controller/userController");
const financeController = require("../controller/financeController");
const user = require("../modal/user");
var cors = require('cors');
const {isAdmin, isExist} = require("../common/common")
router.use(cors());

router.get("/",(req,res)=>{
    try{
        res.send({message:"Hello from server"})
    } catch(e){
        console.log('12-->',e);
        
    }
})
router.post("/addUser", userController.createUser);
router.post("/signin",userController.signin);
router.post("/users", isAdmin, (req, res, next) => {
  next();
}, userController.getUser);
router.post("/addExpense", isAdmin, (req, res, next) => {
  next();
}, financeController.addExpense);
router.post("/getExpense", isAdmin, (req, res, next) => {
  next();
}, financeController.getExpenses);
router.post("/deleteExpense", isAdmin, (req, res, next) => {
  next();
}, financeController.deleteExpense);
router.post("/updateExpense", isAdmin, (req, res, next) => {
  next();
}, financeController.updateExpense);
router.post("/getCategory", isAdmin, (req, res, next) => {
  next();
}, financeController.category);
router.post("/dashboard", isExist,(req, res, next) => {
  next();
}, financeController.dashboard);
router.post("/deleteUser", isAdmin,(req, res, next) => {
  next();
}, userController.deleteUser);
router.post("/updateUser", isAdmin,(req, res, next) => {
  next();
}, userController.updateUser);
module.exports = router;