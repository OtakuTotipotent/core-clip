import { Request, Response } from "express";
import * as Sentry from "@sentry/node";

export async function createProject(req: Request, res: Response) {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function createVideo(req: Request, res: Response) {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllPublishedProjects(req: Request, res: Response) {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({
      message: error.message,
    });
  }
}
