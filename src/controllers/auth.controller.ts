import { Request, Response } from "express";

export const testAuth = (req: Request, res: Response) => {
  res.send("auth is oky");
};
