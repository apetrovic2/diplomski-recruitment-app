import { ApplyToJob } from "../../../application/use-cases/ApplyToJob.js";
import { GetApplicationsByJob } from "../../../application/use-cases/GetApplicationsByJob.js";
import { GetApplicationsByCandidate } from "../../../application/use-cases/GetApplicationsByCandidate.js";
import { ChangeApplicationStatus } from "../../../application/use-cases/ChangeApplicationStatus.js";
import { MongoApplicationRepository } from "../../database/mongoose/repositories/MongoApplicationRepository.js";

const applicationRepository = new MongoApplicationRepository();
const applyToJobUseCase = new ApplyToJob(applicationRepository);
const getApplicationsByJobUseCase = new GetApplicationsByJob(applicationRepository);
const getApplicationsByCandidateUseCase = new GetApplicationsByCandidate(applicationRepository);
const changeApplicationStatusUseCase = new ChangeApplicationStatus(applicationRepository);

export async function applyToJob(req, res) {
  try {
    const { candidateId, jobId } = req.body;
    const application = await applyToJobUseCase.execute(candidateId, jobId);
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getApplicationsByJob(req, res) {
  try {
    const { jobId } = req.params;
    const applications = await getApplicationsByJobUseCase.execute(jobId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getApplicationsByCandidate(req, res) {
  try {
    const { candidateId } = req.params;
    const applications = await getApplicationsByCandidateUseCase.execute(candidateId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function changeApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const updated = await changeApplicationStatusUseCase.execute(applicationId, status);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}