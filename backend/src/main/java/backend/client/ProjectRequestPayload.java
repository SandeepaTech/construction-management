package backend.client;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProjectRequestPayload {
	@NotBlank(message = "Project name is required")
	@Size(max = 120)
	private String projectName;

	@NotBlank(message = "Project type is required")
	@Size(max = 60)
	private String projectType;

	@Size(max = 60)
	private String propertyType;

	@NotBlank(message = "Project location is required")
	@Size(max = 240)
	private String location;

	@Size(max = 60)
	private String estimatedBudget;

	private LocalDate preferredStartDate;

	private LocalDate expectedCompletionDate;

	@Size(max = 60)
	private String approximateProjectSize;

	@Size(max = 30)
	private String numberOfFloors;

	@Size(max = 5000)
	private String projectDetails;

	@Size(max = 5000)
	private String description;

	@Size(max = 5000)
	private String specialRequirements;

	@Size(max = 40)
	private String preferredContactMethod;

	public ProjectRequestPayload() {
	}

	public ProjectRequestPayload(String projectName, String projectType, String location, String description) {
		this.projectName = projectName;
		this.projectType = projectType;
		this.location = location;
		this.description = description;
		this.projectDetails = description;
	}

	public ProjectRequestPayload(
			String projectName,
			String projectType,
			String propertyType,
			String location,
			String estimatedBudget,
			LocalDate preferredStartDate,
			LocalDate expectedCompletionDate,
			String approximateProjectSize,
			String numberOfFloors,
			String projectDetails,
			String specialRequirements,
			String preferredContactMethod) {
		this.projectName = projectName;
		this.projectType = projectType;
		this.propertyType = propertyType;
		this.location = location;
		this.estimatedBudget = estimatedBudget;
		this.preferredStartDate = preferredStartDate;
		this.expectedCompletionDate = expectedCompletionDate;
		this.approximateProjectSize = approximateProjectSize;
		this.numberOfFloors = numberOfFloors;
		this.projectDetails = projectDetails;
		this.description = projectDetails;
		this.specialRequirements = specialRequirements;
		this.preferredContactMethod = preferredContactMethod;
	}

	public String projectName() {
		return projectName;
	}

	public String projectType() {
		return projectType;
	}

	public String location() {
		return location;
	}

	public String description() {
		return getDescription();
	}

	public String getProjectName() {
		return projectName;
	}

	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	public String getProjectType() {
		return projectType;
	}

	public void setProjectType(String projectType) {
		this.projectType = projectType;
	}

	public String getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(String propertyType) {
		this.propertyType = propertyType;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getEstimatedBudget() {
		return estimatedBudget;
	}

	public void setEstimatedBudget(String estimatedBudget) {
		this.estimatedBudget = estimatedBudget;
	}

	public LocalDate getPreferredStartDate() {
		return preferredStartDate;
	}

	public void setPreferredStartDate(LocalDate preferredStartDate) {
		this.preferredStartDate = preferredStartDate;
	}

	public LocalDate getExpectedCompletionDate() {
		return expectedCompletionDate;
	}

	public void setExpectedCompletionDate(LocalDate expectedCompletionDate) {
		this.expectedCompletionDate = expectedCompletionDate;
	}

	public String getApproximateProjectSize() {
		return approximateProjectSize;
	}

	public void setApproximateProjectSize(String approximateProjectSize) {
		this.approximateProjectSize = approximateProjectSize;
	}

	public String getNumberOfFloors() {
		return numberOfFloors;
	}

	public void setNumberOfFloors(String numberOfFloors) {
		this.numberOfFloors = numberOfFloors;
	}

	public String getProjectDetails() {
		return projectDetails != null ? projectDetails : description;
	}

	public void setProjectDetails(String projectDetails) {
		this.projectDetails = projectDetails;
		if (this.description == null) {
			this.description = projectDetails;
		}
	}

	public String getDescription() {
		return description != null ? description : projectDetails;
	}

	public void setDescription(String description) {
		this.description = description;
		if (this.projectDetails == null) {
			this.projectDetails = description;
		}
	}

	public String getSpecialRequirements() {
		return specialRequirements;
	}

	public void setSpecialRequirements(String specialRequirements) {
		this.specialRequirements = specialRequirements;
	}

	public String getPreferredContactMethod() {
		return preferredContactMethod;
	}

	public void setPreferredContactMethod(String preferredContactMethod) {
		this.preferredContactMethod = preferredContactMethod;
	}
}
