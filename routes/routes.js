const { Router } = require("express");
const controllers = require("../controllers/controllers");
const kyccontrollers = require("../controllers/kyccontrollers");
const coralcontrollers = require("../controllers/coralcontrollers");
const outboundcontrollers = require("../controllers/outboundcontrollers");
const smilecontrollers = require("../controllers/smilecontrollers");
const router = Router();

router.get("/api/get", controllers.get);
router.get("/api/encget", controllers.encget);
router.post("/api/encpost", controllers.encpost);
router.post("/api/login", controllers.login);
router.post("/api/post", controllers.post);
router.put("/api/put", controllers.put);
router.post("/api/upload", controllers.upload);
router.delete("/api/delete", controllers.delete);

router.get("/kyc/get", kyccontrollers.get);
router.post("/kyc/login", kyccontrollers.login);
router.post("/kyc/post", kyccontrollers.post);
router.post("/kyc/upload", kyccontrollers.upload);
router.delete("/kyc/delete", kyccontrollers.delete);

router.get("/coral/get", coralcontrollers.get);
router.post("/coral/login", coralcontrollers.login);
router.post("/coral/post", coralcontrollers.post);
router.post("/coral/upload", coralcontrollers.upload);
router.delete("/coral/delete", coralcontrollers.delete);

router.get("/outbound/get", outboundcontrollers.get);
router.post("/outbound/login", outboundcontrollers.login);
router.post("/outbound/post", outboundcontrollers.post);
router.post("/outbound/upload", outboundcontrollers.upload);
router.delete("/outbound/delete", outboundcontrollers.delete);

router.get("/smileid/get", smilecontrollers.get);
router.post("/smileid/login", smilecontrollers.login);
router.post("/smileid/post", smilecontrollers.post);
router.post("/smileid/upload", smilecontrollers.upload);
router.delete("/smileid/delete", smilecontrollers.delete);

module.exports = router;