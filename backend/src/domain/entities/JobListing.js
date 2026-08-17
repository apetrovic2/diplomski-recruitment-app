export class JobListing {
  constructor(title, company) {
    if (!title || title.trim() === "") {
      throw new Error("Naslov oglasa je obavezan");
    }
    this.title = title;
    this.company = company;
    this.status = "active";
  }
}