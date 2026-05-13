import { Router } from "express";
import { AddressesController } from "../controllers/AddressesController";

const router = Router();

router.post("/", AddressesController.create);
router.get("/", AddressesController.list);
router.get("/:id", AddressesController.getById);
router.put("/:id", AddressesController.update);
router.delete("/:id", AddressesController.delete);

export default router;
