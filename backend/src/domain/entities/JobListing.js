export class JobListing {
  constructor(title, company, workArrangement, field, city, educationLevel, employmentType, workHours, experienceLevel, applicationDeadline, createdBy, description) {
    if (!title || title.trim() === "") {
      throw new Error("Naslov oglasa je obavezan");
    }
    this.title = title;
    this.company = company;
    this.workArrangement = workArrangement;
    this.field = field;
    this.city = city;
    this.educationLevel = educationLevel;
    this.employmentType = employmentType;
    this.workHours = workHours;
    this.experienceLevel = experienceLevel;
    this.applicationDeadline = applicationDeadline;
    this.createdBy = createdBy;
    this.description = description;
    this.status = "active";
  }
}