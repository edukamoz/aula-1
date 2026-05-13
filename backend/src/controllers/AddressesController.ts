import type { Request, Response } from "express";
import { DatabaseFactory } from "../factories/DatabaseFactory";
import { ViaCepService } from "../services/ViaCepService";

export class AddressesController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, cep } = req.body;
      if (!nome || !email || !cep) {
        res.status(400).json({ error: "Nome, email e CEP são obrigatórios." });
        return;
      }

      const addressData = await ViaCepService.getAddressByCep(cep);
      if (!addressData) {
        res.status(404).json({ error: "CEP não encontrado ou inválido." });
        return;
      }

      const clientData = {
        nome,
        email,
        ...addressData
      };

      const repo = DatabaseFactory.getRepository(req);
      const savedAddress = await repo.create(clientData);

      res.status(201).json(savedAddress);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const repo = DatabaseFactory.getRepository(req);
      const addresses = await repo.findAll();
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const repo = DatabaseFactory.getRepository(req);
      const address = await repo.findById(id);

      if (!address) {
        res.status(404).json({ error: "Endereço não encontrado." });
        return;
      }

      res.json(address);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const repo = DatabaseFactory.getRepository(req);
      const updatedAddress = await repo.update(id, req.body);

      if (!updatedAddress) {
        res.status(404).json({ error: "Endereço não encontrado para atualização." });
        return;
      }

      res.json(updatedAddress);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const repo = DatabaseFactory.getRepository(req);
      const success = await repo.delete(id);

      if (!success) {
        res.status(404).json({ error: "Endereço não encontrado para exclusão." });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}
