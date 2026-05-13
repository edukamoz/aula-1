import { IAddressRepository } from "../interfaces/IAddressRepository";
import { AddressMongoRepository } from "../repositories/AddressMongoRepository";
import { AddressSQLiteRepository } from "../repositories/AddressSQLiteRepository";
import { Request } from "express";

export class DatabaseFactory {
  private static mongoRepo = new AddressMongoRepository();
  private static sqliteRepo = new AddressSQLiteRepository();

  public static getRepository(req: Request): IAddressRepository {
    const dbHeader = req.headers["x-database-type"] as string | undefined;
    const defaultDb = process.env.DEFAULT_DB || "sqlite";

    const selectedDb = dbHeader ? dbHeader.toLowerCase() : defaultDb.toLowerCase();

    if (selectedDb === "mongo" || selectedDb === "mongodb") {
      return this.mongoRepo;
    }

    return this.sqliteRepo;
  }
}
