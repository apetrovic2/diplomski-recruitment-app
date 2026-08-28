import { CreateJobListing } from "../../../application/use-cases/CreateJobListing.js";
import { GetAllJobs } from "../../../application/use-cases/GetAllJobs.js";
import { GetJobById } from "../../../application/use-cases/GetJobById.js";
import { MongoJobRepository } from "../../database/mongoose/repositories/MongoJobRepository.js";

const jobRepository = new MongoJobRepository();
const createJobUseCase = new CreateJobListing(jobRepository);
const getAllJobsUseCase = new GetAllJobs(jobRepository);
const getJobByIdUseCase = new GetJobById(jobRepository);

export async function createJob(req, res) {
  try {
    const {
      title, company, workArrangement, field, city,
      educationLevel, employmentType, workHours, experienceLevel, applicationDeadline
    } = req.body;
    const newJob = await createJobUseCase.execute(
      title, company, workArrangement, field, city,
      educationLevel, employmentType, workHours, experienceLevel, applicationDeadline
    );
    res.status(201).json(newJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getAllJobs(req, res) {
  try {
    const jobs = await getAllJobsUseCase.execute();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const job = await getJobByIdUseCase.execute(id);
    res.status(200).json(job);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}