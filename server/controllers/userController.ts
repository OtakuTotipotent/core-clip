import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";

// User Credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.json({
      credits: user?.credits,
    });
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
    const { userId } = req.auth;
    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ projects });
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
    const { userId } = req.auth;
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ projects: project });

    res.json({ projects: project });
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
