import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";

// User Credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// All User Projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// Specific Project
export const getProjectById = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};

// Publish Toggler
export const toggleProjectPublic = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.code || error.message,
    });
  }
};
